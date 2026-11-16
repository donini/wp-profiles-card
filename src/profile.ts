import { decodeHTML } from 'entities';
import { AppError, type Badge, type FetchSource, type Profile, type Snapshot, type Env } from './types';

const tidy = (value: string) => decodeHTML(value).replace(/\s+/g, ' ').trim();
export async function parseProfile(html: string, username: string): Promise<Profile> {
  let heading = '', linkedHeading = '', avatar = '', memberSince = '';
  const badges: Badge[] = [];
  const text = (append: (value: string) => void) => ({ text(chunk: Text) { append(chunk.text); } });
  const rewriter = new HTMLRewriter()
    .on('header.site-header h2', text(value => { heading += value; }))
    .on('header.site-header h2 a', text(value => { linkedHeading += value; }))
    .on('header.site-header img.avatar', { element(element) { avatar ||= element.getAttribute('src') || ''; } })
    .on('#user-member-since strong', text(value => { memberSince += value; }))
    .on('.wp-p2-badges-block .medal', { element(element) {
      const badge: Badge = { class: (element.getAttribute('class') || '').split(/\s+/).filter(c => c.startsWith('badge-')).join(' '), name: '' };
      badges.push(badge);
    } })
    .on('.wp-p2-badges-block .medal .mi', { element(element) {
      const badge = badges.at(-1);
      if (!badge) return;
      const dash = (element.getAttribute('class') || '').match(/\bdashicons-[\w-]+\b/)?.[0];
      badge.class += dash ? ` dashicons ${dash}` : ` dashicons-${badge.class.split(' ')[0]}`;
    } })
    .on('.wp-p2-badges-block .medal .mn', text(value => { if (badges.length) badges[badges.length - 1].name += value; }));
  await rewriter.transform(new Response(html)).text();
  const name = tidy(linkedHeading || heading);
  if (!name) throw new AppError(502, 'WordPress returned an unrecognized profile. Please try again later.');
  return { userName: username, name, avatar: decodeHTML(avatar), memberSince: tidy(memberSince), badges: badges.map(b => ({ ...b, name: tidy(b.name) })).filter(b => b.name) };
}

// Restrict avatar fetching to the provider used by WordPress.org. Never fetch arbitrary scraped URLs.
export function avatarUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.port || url.username || url.password || !(url.hostname === 'gravatar.com' || url.hostname.endsWith('.gravatar.com'))) return null;
    return url.href;
  } catch { return null; }
}

async function getAvatar(value: string, source: FetchSource): Promise<string> {
  const url = avatarUrl(value);
  if (!url) return '';
  try {
    const response = await source(url, { redirect: 'manual', signal: AbortSignal.timeout(6000) });
    const mime = (response.headers.get('content-type') || '').split(';')[0];
    if (!response.ok || !['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(mime)) return '';
    const bytes = new Uint8Array(await readLimited(response, 256 * 1024));
    let binary = '';
    for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
    return `data:${mime};base64,${btoa(binary)}`;
  } catch { return ''; } // Initials remain visible when avatar delivery fails.
}
export async function readLimited(response: Response, limit: number): Promise<ArrayBuffer> {
  if (Number(response.headers.get('content-length')) > limit) { await response.body?.cancel(); throw new AppError(502, 'Upstream response is too large.'); }
  const reader = response.body?.getReader();
  if (!reader) return new ArrayBuffer(0);
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > limit) { await reader.cancel(); throw new AppError(502, 'Upstream response is too large.'); }
    chunks.push(value);
  }
  const result = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; }
  return result.buffer;
}
export const demoProfile: Profile = {
  userName: 'cardpress-demo', name: 'WordPress Contributor', avatar: '', memberSince: 'May 26th, 2025',
  badges: [
    { class: 'badge-community-contributor dashicons dashicons-groups', name: 'Community Contributor' },
    { class: 'badge-plugins dashicons dashicons-admin-plugins', name: 'Plugin Developer' },
    { class: 'badge-translation-contributor dashicons dashicons-translation', name: 'Translation Contributor' },
    { class: 'badge-speaker dashicons dashicons-megaphone', name: 'WordCamp Speaker' }
  ]
};

export async function getProfile(username: string, env: Env, refresh: boolean, source: FetchSource): Promise<Snapshot> {
  const now = Math.floor(Date.now() / 1000);
  if (env.DEMO_MODE === 'true') return { profile: { ...demoProfile, userName: username }, avatarData: '', fetchedAt: now };
  const row = await env.DB.prepare('SELECT profile_json, avatar_data, fetched_at FROM profiles WHERE username = ?').bind(username).first<{ profile_json: string; avatar_data: string; fetched_at: number }>();
  const cached = row ? { profile: JSON.parse(row.profile_json) as Profile, avatarData: row.avatar_data, fetchedAt: row.fetched_at } : null;
  const ttl = Math.max(60, Number(env.PROFILE_TTL_SECONDS) || 86400);
  // Refreshes are coalesced for one minute to avoid writing on every image load.
  if (cached && now - cached.fetchedAt < (refresh ? 60 : ttl)) return cached;
  try {
    const response = await source(`https://profiles.wordpress.org/${encodeURIComponent(username)}/`, {
      redirect: 'manual', signal: AbortSignal.timeout(10000), headers: { 'Accept': 'text/html', 'User-Agent': 'CardPress/2.0 (WordPress.org profile cards)' }
    });
    if (response.status === 404) throw new AppError(404, 'WordPress.org profile not found. Check the username.');
    if (!response.ok) throw new AppError(502, 'WordPress.org is temporarily unavailable. Please try again later.');
    const html = new TextDecoder().decode(await readLimited(response, 2 * 1024 * 1024));
    const profile = await parseProfile(html, username);
    const avatarData = await getAvatar(profile.avatar, source);
    await env.DB.prepare(`INSERT INTO profiles (username, profile_json, avatar_data, fetched_at, first_seen)
      VALUES (?, ?, ?, ?, ?) ON CONFLICT(username) DO UPDATE SET
      profile_json = excluded.profile_json, avatar_data = excluded.avatar_data, fetched_at = excluded.fetched_at`)
      .bind(username, JSON.stringify(profile), avatarData, now, now).run();
    return { profile, avatarData, fetchedAt: now };
  } catch (error) {
    // Keep embedded cards working during transient outages; never hide a real 404.
    if (cached && !(error instanceof AppError && error.status === 404)) return { ...cached, stale: true };
    if (error instanceof AppError) throw error;
    console.warn('WordPress fetch failed:', error instanceof Error ? error.message : 'Network error');
    throw new AppError(502, 'Could not reach WordPress.org. Please try again later.');
  }
}
