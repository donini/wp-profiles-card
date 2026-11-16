import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { github, social, renderChangelog, renderPosts } from '../scripts/content.mjs';

test('GitHub change log preserves every release and issue/pull request link', () => {
  const html = renderChangelog(github.changelog);
  const versions = [...github.changelog.matchAll(/^\*\*([\d.]+)\*\*/gm)].map(match => match[1]);
  const rendered = [...html.matchAll(/<h2>([\d.]+)<\/h2>/g)].map(match => match[1]);
  assert.deepEqual(rendered, versions);
  const links = [...github.changelog.matchAll(/\]\((https:\/\/[^)]+)\)/g)].map(match => match[1]);
  for (const link of links) assert.ok(html.includes(`href="${link}"`), link);
  assert.match(html, /datetime="2025-08-27"/);
});
test('GitHub content is escaped rather than interpreted as HTML', () => {
  const html = renderChangelog('**1.0.0** (5/26/2025)\n- <img src=x onerror=alert(1)>\n- [Unsafe](javascript:alert)\n- [Safe](https://github.com/a/b)');
  assert.doesNotMatch(html, /<img|href="javascript:/);
  assert.match(html, /&lt;img/);
  assert.match(html, /href="https:\/\/github.com\/a\/b"/);
});
test('featured posts are author-checked, limited to three and ordered newest first', () => {
  const original = social.posts;
  try {
    social.posts = ['100', '300', '200', '400'].map(id => `https://x.com/donini/status/${id}`);
    const html = renderPosts();
    assert.deepEqual([...html.matchAll(/https:\/\/twitter.com\/donini\/status\/(\d+)/g)].map(m=>m[1]), ['400','300','200']);
    social.posts = ['https://x.com/another-author/status/123'];
    assert.throws(() => renderPosts(), /configured author/);
    social.posts = ['https://malicious.example/donini/status/123'];
    assert.throws(() => renderPosts(), /configured author/);
  } finally { social.posts = original; }
});
test('generated site keeps the new release first and credits every GitHub contributor', async () => {
  const changelog = await readFile('public/changelog.html', 'utf8');
  assert.ok(changelog.indexOf('2.0.0') < changelog.indexOf('1.0.8'));
  assert.match(changelog, />Change Log<\/a>/);
  const community = await readFile('public/users.html', 'utf8');
  for (const person of github.contributors) {
    assert.ok(community.includes(person.name));
    if (person.avatar) assert.ok(community.includes(person.avatar));
  }
  assert.match(community, /href="https:\/\/donini.me\/"/);
});

test('selected posts render with verified fallback text and the official embed script', async () => {
  const html = await readFile('public/index.html', 'utf8');
  assert.equal((html.match(/class="twitter-tweet post-fallback"/g) || []).length, 3);
  assert.match(html, /src="https:\/\/platform.twitter.com\/widgets.js"/);
  const ids = ['2051368463885582655', '2025981020730802321', '1962305012542976238'];
  const positions = ids.map(id => html.indexOf(`/status/${id}`));
  assert.ok(positions.every(position => position > 0));
  assert.ok(positions[0] < positions[1] && positions[1] < positions[2]);
  assert.match(html, /99% of the requests/);
});


test('GitHub refresh does not duplicate the locally maintained 2.0.0 release after merge', () => {
  const futureSource = '**2.0.0** (11/16/2026)\n- Cloudflare rebuild\n\n' + github.changelog;
  const html = renderChangelog(futureSource, ['2.0.0']);
  assert.doesNotMatch(html, /<h2>2\.0\.0<\/h2>/);
  assert.match(html, /<h2>1\.0\.8<\/h2>/);
});
