import { AppError, type Env, type FetchSource } from './types';
import { usernameFrom, cardOptions, flag } from './options';
import { getProfile, demoProfile } from './profile';
import { errorCard, renderCard } from './card';

const commonHeaders = { 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'Access-Control-Allow-Origin': '*' };
const json = (data: unknown, status = 200, headers = {}) => Response.json(data, { status, headers: { ...commonHeaders, 'Cache-Control': 'no-store', ...headers } });
const svg = (data: string, status = 200, headers = {}) => new Response(data, { status, headers: { ...commonHeaders, 'Content-Type': 'image/svg+xml; charset=utf-8', 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; img-src data:", ...headers } });

export async function handleRequest(request: Request, env: Env, source: FetchSource = (input, init) => fetch(input, init)): Promise<Response> {
  const url = new URL(request.url);
  const api = ['/card', '/json', '/api/users', '/health'].includes(url.pathname);
  if (api && request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...commonHeaders, 'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS' } });
  if (api && !['GET', 'HEAD'].includes(request.method)) return json({ error: 'Method not allowed.' }, 405, { Allow: 'GET, HEAD, OPTIONS' });
  try {
    let response: Response;
    if (url.pathname === '/health') {
      await env.DB.prepare('SELECT 1').first();
      response = json({ status: 'ok', mode: env.DEMO_MODE === 'true' ? 'demo' : 'live', version: '2.0.0' });
    } else if (url.pathname === '/card' || url.pathname === '/json') {
      const username = usernameFrom(url.searchParams);
      const refresh = flag(url.searchParams, 'refresh', false);
      // Validate every option before fetching or persisting a profile.
      const options = url.pathname === '/card' ? cardOptions(url.searchParams) : null;
      const snapshot = await getProfile(username, env, refresh, source);
      const headers = {
        'X-CardPress-Mode': env.DEMO_MODE === 'true' ? 'demo' : 'live',
        'X-CardPress-Cache': snapshot.stale ? 'stale' : 'fresh',
        'X-CardPress-Fetched-At': new Date(snapshot.fetchedAt * 1000).toISOString(),
        'Cache-Control': refresh || snapshot.stale ? 'no-store' : 'public, max-age=300'
      };
      response = options ? svg(renderCard(snapshot.profile, snapshot.avatarData, options), 200, headers) : json(snapshot.profile, 200, headers);
    } else if (url.pathname === '/api/users') {
      const pageValue = url.searchParams.get('page') || '1';
      if (!/^\d{1,6}$/.test(pageValue) || Number(pageValue) < 1) throw new AppError(400, 'page must be a positive integer.');
      const page = Number(pageValue); const pageSize = 24;
      if (env.DEMO_MODE === 'true') response = json({ users: page === 1 ? [{ username: demoProfile.userName, name: demoProfile.name, firstSeen: Math.floor(Date.now() / 1000) }] : [], page, pageSize, total: 1, demo: true });
      else {
        const total = await env.DB.prepare('SELECT COUNT(*) AS total FROM profiles').first<number>('total');
        const { results } = await env.DB.prepare("SELECT username, json_extract(profile_json, '$.name') AS name, first_seen AS firstSeen FROM profiles ORDER BY first_seen DESC, username LIMIT ? OFFSET ?").bind(pageSize, (page - 1) * pageSize).all();
        response = json({ users: results, page, pageSize, total: total || 0, demo: false });
      }
    } else response = await env.ASSETS.fetch(request);
    return request.method === 'HEAD' ? new Response(null, { status: response.status, headers: response.headers }) : response;
  } catch (error) {
    const status = error instanceof AppError ? error.status : 500;
    const message = error instanceof AppError ? error.message : 'CardPress encountered an unexpected error. Please try again later.';
    if (!(error instanceof AppError)) console.error('CardPress request failed', error instanceof Error ? error.message : 'Unknown error');
    const response = url.pathname === '/card' ? svg(errorCard(message), status, { 'Cache-Control': 'no-store' }) : json({ error: message }, status);
    return request.method === 'HEAD' ? new Response(null, { status: response.status, headers: response.headers }) : response;
  }
}
export default { fetch(request: Request, env: Env) { return handleRequest(request, env); } } satisfies ExportedHandler<Env>;
