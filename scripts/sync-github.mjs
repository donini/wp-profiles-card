import { mkdir, writeFile } from 'node:fs/promises';
const repository = 'donini/wp-profiles-card';
const api = `https://api.github.com/repos/${repository}`;
const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'CardPress-content-sync' };
async function get(url) {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`GitHub returned ${response.status} for ${url}. Existing content was not replaced.`);
  return response;
}
// Request every page, including anonymous contributors, rather than relying on the first 30 results.
const contributors = [];
for (let page = 1; ; page++) {
  const batch = await (await get(`${api}/contributors?per_page=100&anon=1&page=${page}`)).json();
  if (!Array.isArray(batch)) throw new Error('Unexpected GitHub contributor response.');
  for (const person of batch) {
    const key = person.id ?? `anonymous-${contributors.length}`;
    const name = person.login || person.name || 'Anonymous contributor';
    let avatar = '';
    if (person.avatar_url) {
      const avatarUrl = new URL(person.avatar_url);
      if (avatarUrl.protocol !== 'https:' || avatarUrl.hostname !== 'avatars.githubusercontent.com') throw new Error('Unexpected avatar host.');
      avatarUrl.searchParams.set('s', '160');
      const response = await get(avatarUrl.href);
      const type = (response.headers.get('content-type') || '').split(';')[0];
      const extension = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' }[type];
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (!extension || bytes.length > 1024 * 1024) throw new Error('Unexpected avatar format or size.');
      await mkdir('public/static/contributors', { recursive: true });
      avatar = `/static/contributors/${key}.${extension}`;
      await writeFile(`public${avatar}`, bytes);
    }
    // Do not copy public emails or unrelated account metadata into the website.
    contributors.push({ name, login: person.login || null, url: person.login ? `https://github.com/${encodeURIComponent(person.login)}` : null, avatar, contributions: person.contributions });
  }
  if (batch.length < 100) break;
}
const changelog = await (await get(`https://raw.githubusercontent.com/${repository}/main/changelog.md`)).text();
if (!/^\*\*\d+\.\d+/m.test(changelog)) throw new Error('Unrecognized changelog. Existing content was not replaced.');
await mkdir('content', { recursive: true });
await writeFile('content/github.json', JSON.stringify({ repository, fetchedAt: new Date().toISOString(), contributors, changelog }, null, 2) + '\n');
console.log(`Saved ${contributors.length} GitHub contributors, their photos, and the upstream changelog. Run npm run build to regenerate pages.`);
