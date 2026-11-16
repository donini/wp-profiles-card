import { readFile, writeFile } from 'node:fs/promises';
import { decodeHTML } from 'entities';
const path = new URL('../content/posts.json', import.meta.url);
const content = JSON.parse(await readFile(path, 'utf8'));
const posts = [];
for (const item of content.posts) {
  const post = typeof item === 'string' ? { url: item } : item;
  const url = new URL(post.url);
  if (url.protocol !== 'https:' || !['x.com', 'twitter.com'].includes(url.hostname) || !new RegExp(`^/${content.author}/status/\\d+/?$`, 'i').test(url.pathname)) throw new Error('Expected a public post by the configured author.');
  const embedUrl = new URL('https://publish.twitter.com/oembed');
  embedUrl.search = new URLSearchParams({ url: `https://twitter.com${url.pathname}`, omit_script:'true', dnt:'true' });
  const response = await fetch(embedUrl, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`X embed returned ${response.status}. Saved posts were not replaced.`);
  const data = await response.json();
  const paragraph = data.html?.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1];
  if (!paragraph) throw new Error('The official embed did not include post text.');
  // Save plain text, never raw HTML or scripts from the remote service.
  const text = decodeHTML(paragraph.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, ''));
  const id = url.pathname.split('/')[3];
  const createdAt = new Date(Number((BigInt(id) >> 22n) + 1288834974657n)).toISOString();
  posts.push({ url: `https://x.com${url.pathname}`, text, authorName:data.author_name || content.author, createdAt });
}
await writeFile(path, JSON.stringify({ ...content, posts }, null, 2) + '\n');
console.log(`Saved verified fallback text for ${posts.length} selected X posts. Run npm run build to regenerate pages.`);
