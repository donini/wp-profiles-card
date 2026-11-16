import { readFile } from 'node:fs/promises';
export const github = JSON.parse(await readFile(new URL('../content/github.json', import.meta.url), 'utf8'));
export const social = JSON.parse(await readFile(new URL('../content/posts.json', import.meta.url), 'utf8'));
export const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const external = 'target="_blank" rel="noopener noreferrer"';
function inline(text) {
  // Deliberately render only the plain text and HTTPS links used in the upstream changelog.
  const pattern = /\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g;
  let html = '', position = 0;
  for (const match of text.matchAll(pattern)) {
    html += escape(text.slice(position, match.index));
    const url = new URL(match[2]);
    html += `<a href="${escape(url.href)}" ${external}>${escape(match[1])}</a>`;
    position = match.index + match[0].length;
  }
  return html + escape(text.slice(position));
}
export function renderChangelog(markdown, excludeVersions = []) {
  const releases = [...markdown.matchAll(/^\*\*([\d.]+)\*\*\s*\(([^)]+)\)([\s\S]*?)(?=^\*\*[\d.]+\*\*|$(?![\s\S]))/gm)];
  return releases.filter(([,version]) => !excludeVersions.includes(version)).map(([,version,date,body]) => {
    const items = body.split('\n').filter(line => /^-\s/.test(line)).map(line => `<li>${inline(line.replace(/^-\s*/, ''))}</li>`).join('');
    const [month, day, year] = date.split('/');
    const iso = `${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`;
    const label = new Intl.DateTimeFormat('en', { dateStyle:'long', timeZone:'UTC' }).format(new Date(`${iso}T12:00:00Z`));
    return `<section class="release"><div class="release-meta"><h2>${escape(version)}</h2><time datetime="${iso}">${label}</time></div><ul>${items}</ul></section>`;
  }).join('');
}
export function renderContributors() {
  return github.contributors.map(person => `<article class="contributor-card">${person.avatar ? `<img src="${escape(person.avatar)}" width="72" height="72" alt="" loading="lazy" decoding="async">` : '<span class="contributor-initial" aria-hidden="true">?</span>'}<div><h3>${escape(person.name)}</h3><p>${person.contributions} ${person.contributions === 1 ? 'commit' : 'commits'}</p>${person.url ? `<a href="${escape(person.url)}" ${external}>GitHub profile ↗</a>` : '<span>Anonymous contributor</span>'}</div></article>`).join('');
}
export const searchQuery = `from:${social.author} ${social.hashtags.map(tag => `#${tag}`).join(social.match === 'either' ? ' OR ' : ' ')}`;
export const searchUrl = `https://x.com/search?${new URLSearchParams({ q: social.match === 'either' ? `from:${social.author} (${social.hashtags.map(tag => `#${tag}`).join(' OR ')})` : searchQuery, f:'live' })}`;
export function renderPosts() {
  const posts = social.posts.map(value => typeof value === 'string' ? { url:value } : value).map(post => {
    const url = new URL(post.url);
    if (!['x.com','twitter.com'].includes(url.hostname) || url.protocol !== 'https:' || !new RegExp(`^/${social.author}/status/\\d+/?$`, 'i').test(url.pathname)) throw new Error('Each featured post must be a public status URL by the configured author.');
    return { ...post, url:`https://twitter.com${url.pathname}`, id: url.pathname.split('/')[3] };
  }).sort((a,b) => BigInt(a.id) > BigInt(b.id) ? -1 : 1).slice(0,3);
  return `<section class="social-section" aria-labelledby="social-title"><div class="social-heading"><div><h2 id="social-title">CardPress on X</h2><p>Posts from <a href="https://x.com/${escape(social.author)}" ${external}>@${escape(social.author)}</a> about <span>#CardPress</span> and <span>#WordPress</span>.</p></div><a href="${escape(searchUrl)}" class="text-link" ${external}>View latest posts ↗</a></div>${posts.length ? `<div class="post-grid">${posts.map(post => `<blockquote class="twitter-tweet post-fallback" data-dnt="true" data-theme="light" data-conversation="none">${post.text ? `<p>${escape(post.text).replace(/\n/g, '<br>')}</p><span class="post-author">${escape(post.authorName || social.author)} (@${escape(social.author)})</span><br>` : ''}<a href="${escape(post.url)}" ${external}>${post.createdAt ? new Intl.DateTimeFormat('en', { dateStyle:'long', timeZone:'UTC' }).format(new Date(post.createdAt)) : `Read this post by @${escape(social.author)} on X`}</a></blockquote>`).join('')}</div>` : `<div class="social-placeholder"><img src="/static/images/favicon/android-chrome-512x512.png" width="56" height="56" alt=""><p>Follow the project and join the conversation.<br><a href="${escape(searchUrl)}" ${external}>Read @${escape(social.author)}’s matching posts on X ↗</a></p></div>`}</section>`;
}
