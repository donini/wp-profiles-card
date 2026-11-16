import { icons } from './icons';
import { badgeStyles } from './badge-styles';
import { escapeXml as esc, type CardOptions } from './options';
import type { Profile } from './types';
const truncate = (text: string, length: number) => [...text].length > length ? [...text].slice(0, length - 1).join('') + '…' : text;

export function renderCard(profile: Profile, avatarData: string, options: CardOptions): string {
  const badges = options.badges ? profile.badges : [];
  const rows = Math.ceil(badges.length / 2);
  const top = options.header ? 142 : 24;
  const height = Math.max(options.header ? 145 : 50, top + rows * 34 + (rows ? 18 : 0));
  const initials = profile.name.split(/\s+/).filter(Boolean).filter((_, i, words) => i === 0 || i === words.length - 1).map(w => [...w][0]).join('').toUpperCase();
  const name = truncate(profile.name, options.avatar ? 25 : 36);
  const badgeMarkup = badges.map((badge, i) => {
    const classes = badge.class.split(/\s+/).filter(c => /^[\w-]+$/.test(c));
    const iconName = classes.filter(c => c.startsWith('dashicons-')).at(-1) || '';
    const known = icons[iconName];
    const icon = known || icons['dashicons-awards'] || '';
    return `<g transform="translate(${25 + (i % 2) * 240}, ${top + Math.floor(i / 2) * 34})"><title>${esc(badge.name)}</title>
      <g class="${classes.join(' ')} ${known ? '' : 'badge-unknown'}"><circle cx="12" cy="12" r="11"/><svg x="4" y="4" width="16" height="16" viewBox="0 0 24 24">${icon}</svg></g>
      <text class="label" x="34" y="16">${esc(truncate(badge.name, 27))}</text></g>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="${height}" viewBox="0 0 500 ${height}" role="img" aria-labelledby="title desc">
<title id="title">${esc(profile.name)} — WordPress profile</title><desc id="desc">@${esc(profile.userName)}, member since ${esc(profile.memberSince)}. ${esc(badges.map(b => b.name).join(', '))}</desc>
<style>
text{font-family:'Segoe UI',Ubuntu,sans-serif}.subtitle{font-size:14px;font-weight:700;fill:#${options.headerColor}}.name{font-size:20px;font-weight:700;fill:#${options.nameColor}}.subheader{font-size:14px;fill:#${options.subHeaderColor}}.initials{font-size:32px;font-weight:700;fill:#${options.nameColor}}.label{font-size:11px;font-weight:600;fill:#${options.badgeLabelColor}}circle{fill:white} ${badgeStyles}
</style>
<defs><clipPath id="avatar"><circle cx="75" cy="72" r="47"/></clipPath></defs>
${options.link ? `<a href="https://profiles.wordpress.org/${esc(profile.userName)}/" target="_blank">` : ''}
<rect x="0.5" y="0.5" width="499" height="${height - 1}" rx="7" fill="#${options.foreground}" stroke="#e4e2e2"/>
${options.header ? `${options.avatar ? `<circle cx="75" cy="72" r="48" fill="#f4f4f4" stroke="#e4e2e2"/><text x="75" y="83" text-anchor="middle" class="initials">${esc(initials)}</text>${avatarData ? `<image x="27" y="24" width="96" height="96" href="${esc(avatarData)}" clip-path="url(#avatar)"/>` : ''}` : ''}
<g transform="translate(${options.avatar ? 139 : 25}, 43)"><text class="subtitle">WordPress Activity</text><text class="name" y="27">${esc(name)}</text><text class="subheader" y="49">User: @${esc(profile.userName)}</text><text class="subheader" y="70">Member Since: ${esc(profile.memberSince || 'Not listed')}</text></g>` : ''}
${badgeMarkup}${options.link ? '</a>' : ''}</svg>`;
}
export function errorCard(message: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="100" viewBox="0 0 500 100" role="img"><title>CardPress error</title><rect x="1" y="1" width="498" height="98" rx="7" fill="#fff8f5" stroke="#e5b9a8"/><text x="24" y="35" font-family="sans-serif" font-size="16" fill="#8c3020">CardPress</text><text x="24" y="64" font-family="sans-serif" font-size="12" fill="#502d26">${esc(truncate(message, 68))}</text></svg>`;
}
