import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdir } from 'node:fs/promises';
import { build } from 'esbuild';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
const localRuntime = options => new Miniflare(convertV4MiniflareOptions(options));
let mf, db;
const request = (path, init) => mf.dispatchFetch(`http://localhost${path}`, init);
const data = async path => (await request(path)).json();
before(async () => {
  await mkdir('dist/test', { recursive: true });
  await build({ entryPoints: ['tests/worker.ts'], bundle: true, format: 'esm', outfile: 'dist/test/worker.js', loader: { '.html': 'text' }, target: 'es2022' });
  mf = localRuntime({ modules: true, scriptPath: 'dist/test/worker.js', compatibilityDate: '2026-11-16', d1Databases: ['DB'], bindings: { DEMO_MODE: 'false', PROFILE_TTL_SECONDS: '86400' }, serviceBindings: { ASSETS: () => new Response('Static not found', { status: 404 }) } });
  db = await mf.getD1Database('DB');
  await db.exec((await readFile('migrations/0001_profiles.sql', 'utf8')).replace(/\n/g, ' '));
});
after(async () => { await mf?.dispose(); });

test('health checks local D1', async () => { assert.equal((await data('/health')).status, 'ok'); });
test('new markup, entities, custom badge icons and original JSON schema', async () => {
  const response = await request('/json?username=Alex');
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), '*');
  const profile = await response.json();
  assert.deepEqual(Object.keys(profile), ['userName', 'name', 'avatar', 'memberSince', 'badges']);
  assert.equal(profile.name, 'Alex & Taylor <Contributor>');
  assert.equal(profile.userName, 'alex');
  assert.equal(profile.memberSince, 'May 26th, 2025');
  assert.equal(profile.badges.length, 3);
  assert.equal(profile.badges[1].class, 'badge-core-ai-team dashicons-badge-core-ai-team');
  assert.equal(profile.badges[1].name, 'AI & Core Team');
});
test('current WordPress.org markup extracts all eight real badges', async () => {
  const profile = await data('/json?username=realprofile');
  assert.equal(profile.name, 'Rodrigo Donini');
  assert.equal(profile.badges.length, 8);
  assert.equal(profile.memberSince, 'December 18th, 2013');
  assert.match(profile.avatar, /s=224&d=mm&r=g$/);
});
test('legacy linked heading remains supported', async () => { assert.equal((await data('/json?username=oldmarkup')).name, 'Alex & Taylor <Contributor>'); });
test('cache is shared by JSON and card, and refresh has a cooldown', async () => {
  await request('/__test?reset=1');
  await request('/json?username=cache-user');
  await request('/card?username=cache-user');
  await request('/json?username=cache-user&refresh=true');
  const calls = await data('/__test');
  assert.deepEqual(calls, { profileCalls: 1, avatarCalls: 1 });
});
test('each customization renders independently; SVG escapes untrusted names', async () => {
  const one = await (await request('/card?username=alex&nameColor=FF0000&foreground=000000')).text();
  const two = await (await request('/card?username=alex&nameColor=00FF00&foreground=FFFFFF')).text();
  assert.match(one, /fill:#FF0000/); assert.match(two, /fill:#00FF00/);
  assert.match(one, /fill="#000000"/); assert.match(two, /fill="#FFFFFF"/);
  assert.match(one, /Alex &amp; Taylor &lt;Contributor&gt;/);
  assert.doesNotMatch(one, /<Contributor>/);
  assert.match(one, /data:image\/png;base64,/);
  assert.match(one, /badge-unknown/);
  assert.match(one, /Future Team/);
});
test('visibility, links, badge layout and intrinsic height', async () => {
  const full = await (await request('/card?username=alex&link=true')).text();
  assert.match(full, /height="228"/); // 142 + two rows * 34 + 18
  assert.match(full, /<a href="https:\/\/profiles.wordpress.org\/alex\//);
  const minimal = await (await request('/card?username=alex&header=false&badges=false')).text();
  assert.match(minimal, /height="50"/);
  assert.doesNotMatch(minimal, /WordPress Activity|<image|class="label"/);
  const noAvatar = await (await request('/card?username=alex&avatar=false')).text();
  assert.doesNotMatch(noAvatar, /<image/);
});
test('invalid parameters return errors before upstream fetch', async () => {
  await request('/__test?reset=1');
  for (const path of ['/json', '/json?username=../bad', '/card?username=alex&foreground=red', '/card?username=alex&header=maybe', '/json?username=alex&refresh=1']) assert.equal((await request(path)).status, 400, path);
  assert.equal((await data('/__test')).profileCalls, 0);
  const response = await request('/card');
  assert.match(response.headers.get('Content-Type'), /image\/svg\+xml/);
  assert.match(await response.text(), /CardPress error/);
});
test('unknown users and upstream problems have meaningful HTTP status', async () => {
  assert.equal((await request('/json?username=notfound')).status, 404);
  assert.equal((await request('/card?username=unavailable')).status, 502);
  assert.equal((await request('/json?username=broken')).status, 502);
});
test('transient upstream failure serves saved card; real 404 does not', async () => {
  await request('/json?username=outage-user');
  await db.prepare('UPDATE profiles SET fetched_at = 1 WHERE username = ?').bind('outage-user').run();
  await request('/__test?fail=true');
  const response = await request('/card?username=outage-user');
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('X-CardPress-Cache'), 'stale');
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  await request('/__test?fail=false');
  await db.prepare("INSERT INTO profiles VALUES (?, ?, '', 1, 1)").bind('notfound', JSON.stringify({ userName:'notfound',name:'Old Profile',avatar:'',memberSince:'',badges:[] })).run();
  assert.equal((await request('/json?username=notfound')).status, 404);
});
test('refresh updates timestamp while preserving first-seen', async () => {
  await request('/json?username=refresh-user');
  const firstSeen = await db.prepare('SELECT first_seen FROM profiles WHERE username = ?').bind('refresh-user').first('first_seen');
  await db.prepare('UPDATE profiles SET fetched_at = 1 WHERE username = ?').bind('refresh-user').run();
  await request('/json?username=refresh-user&refresh=true');
  const row = await db.prepare('SELECT first_seen, fetched_at FROM profiles WHERE username = ?').bind('refresh-user').first();
  assert.equal(row.first_seen, firstSeen); assert.ok(row.fetched_at > 1);
});
test('community pagination is stable, unique and validates page numbers', async () => {
  const users = await data('/api/users');
  assert.ok(users.total >= 6); assert.equal(users.users.filter(u => u.username === 'alex').length, 1);
  assert.equal((await request('/api/users?page=-1')).status, 400);
  assert.equal((await request('/api/users?page=0')).status, 400);
  assert.deepEqual((await data('/api/users?page=999999')).users, []);
});
test('untrusted avatar hosts are not fetched; initials still render', async () => {
  await request('/__test?reset=1');
  const response = await request('/card?username=noavatar');
  assert.equal(response.status, 200); assert.doesNotMatch(await response.text(), /<image/);
  assert.equal((await data('/__test')).avatarCalls, 0);
});
test('HEAD, OPTIONS and method restrictions', async () => {
  const head = await request('/card?username=alex', { method: 'HEAD' });
  assert.equal(head.status, 200); assert.equal(await head.text(), '');
  assert.equal((await request('/json', { method: 'OPTIONS' })).status, 204);
  const post = await request('/card?username=alex', { method: 'POST' });
  assert.equal(post.status, 405); assert.match(post.headers.get('Allow'), /GET/);
});
test('demo mode never calls external sources or persists sample profiles', async () => {
  const demo = localRuntime({ modules: true, scriptPath: 'dist/test/worker.js', compatibilityDate: '2026-11-16', d1Databases: ['DB'], bindings: { DEMO_MODE: 'true' }, serviceBindings: { ASSETS: () => new Response('Not found', { status:404 }) } });
  try {
    const response = await demo.dispatchFetch('http://localhost/card?username=sample');
    assert.equal(response.status, 200); assert.equal(response.headers.get('X-CardPress-Mode'), 'demo');
    assert.match(await response.text(), /WordPress Contributor/);
    const calls = await (await demo.dispatchFetch('http://localhost/__test')).json();
    assert.deepEqual(calls, { profileCalls:0, avatarCalls:0 });
  } finally { await demo.dispose(); }
});
