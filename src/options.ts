import { AppError } from './types';
export const colorDefaults = { headerColor: '191E23', nameColor: '191E23', subHeaderColor: '82878C', badgeLabelColor: '23282D', foreground: 'FFFFFF' };
export function usernameFrom(params: URLSearchParams): string {
  const username = (params.get('username') || '').trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9._-]{0,59}$/.test(username)) throw new AppError(400, 'Enter a valid WordPress.org username (1–60 letters, numbers, dots, underscores, or hyphens).');
  return username;
}
export function flag(params: URLSearchParams, key: string, fallback: boolean): boolean {
  const value = params.get(key);
  if (value === null) return fallback;
  if (value !== 'true' && value !== 'false') throw new AppError(400, `${key} must be true or false.`);
  return value === 'true';
}
export function cardOptions(params: URLSearchParams) {
  const colors = { ...colorDefaults };
  for (const key of Object.keys(colors) as (keyof typeof colors)[]) {
    const value = (params.get(key) ?? colors[key]).replace(/^#/, '');
    if (!/^[a-f0-9]{6}$/i.test(value)) throw new AppError(400, `${key} must be a six-digit hexadecimal color.`);
    colors[key] = value.toUpperCase();
  }
  return { ...colors, badges: flag(params, 'badges', true), header: flag(params, 'header', true), avatar: flag(params, 'avatar', true), link: flag(params, 'link', false) };
}
export type CardOptions = ReturnType<typeof cardOptions>;
export function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!);
}
