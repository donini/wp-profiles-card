import { handleRequest } from '../src/worker';
import type { Env, FetchSource } from '../src/types';
// esbuild bundles this fixture; test-only controls never enter the production Worker.
// @ts-expect-error esbuild text loader
import fixture from './fixtures/profile.html';
// @ts-expect-error esbuild text loader
import realFixture from './fixtures/wordpress-current.html';
let profileCalls = 0, avatarCalls = 0, fail = false;
const source: FetchSource = async (input, init) => {
  if (init?.redirect !== 'manual') throw new Error('Worker fetch must use manual redirects.');
  const url = new URL(input);
  if (url.hostname === 'profiles.wordpress.org') {
    profileCalls++;
    if (url.pathname.includes('notfound')) return new Response('', { status: 404 });
    if (fail || url.pathname.includes('unavailable')) return new Response('', { status: 503 });
    if (url.pathname.includes('broken')) return new Response('<h1>Markup changed</h1>');
    if (url.pathname.includes('realprofile')) return new Response(realFixture);
    if (url.pathname.includes('oldmarkup')) return new Response(fixture.replace('<h2>Alex', '<h2><a>Alex').replace('</span></h2>', '</span></a></h2>'));
    if (url.pathname.includes('noavatar')) return new Response(fixture.replace('secure.gravatar.com', 'internal.example'));
    return new Response(fixture, { headers: { 'Content-Type': 'text/html' } });
  }
  avatarCalls++;
  return new Response(Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQAAAABJRU5ErkJggg=='), c => c.charCodeAt(0)), { headers: { 'Content-Type': 'image/png' } });
};
export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    if (url.pathname === '/__test') {
      if (url.searchParams.has('reset')) { profileCalls = 0; avatarCalls = 0; fail = false; }
      if (url.searchParams.has('fail')) fail = url.searchParams.get('fail') === 'true';
      return Response.json({ profileCalls, avatarCalls });
    }
    return handleRequest(request, env, source);
  }
};
