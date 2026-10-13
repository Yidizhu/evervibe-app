// Offline runtime check: no real API keys and every outbound request is intercepted.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { Miniflare } from 'miniflare';

const origin = 'https://evervibe.zesty-mesa-1831.chatgpt.site';
const consent = { connected: true, share: { leo: true, julian: true }, receive: { leo: true, julian: true } };
const chat = { episode: 'date', actor: 'leo', scope: 'group', locale: 'en', consent, messages: [{ from: 'leo', text: 'Can we leave a little time to talk?' }] };
async function fixture({ redirect = false } = {}) {
  const fixtureBindings = `export const env = {
    QLOO_API_KEY: 'offline-fixture', GEMINI_API_KEY: 'offline-gemini-fixture',
    DB: { prepare() { return { bind() { return { run: async () => ({}), first: async () => null }; } }; } }
  };`;
  const bundle = await build({
    stdin: { contents: `import {POST} from './app/api/[...path]/route.ts'; export default {fetch: POST};`, resolveDir: fileURLToPath(new URL('../', import.meta.url)), loader: 'ts' },
    bundle: true, write: false, platform: 'browser', format: 'esm', target: 'es2022', logLevel: 'silent',
    plugins: [{ name: 'offline-cloudflare-binding', setup(builder) {
      builder.onResolve({ filter: /^cloudflare:workers$/ }, () => ({ path: 'binding', namespace: 'fixture' }));
      builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: fixtureBindings, loader: 'js' }));
    } }],
  });
  const calls = [];
  const worker = new Miniflare({
    modules: true, compatibilityDate: '2026-05-15', compatibilityFlags: ['nodejs_compat'],
    script: bundle.outputFiles[0].text,
    outboundService: async request => {
      const url = new URL(request.url);
      calls.push({ origin: url.origin, path: url.pathname });
      assert(['https://hackathon.api.qloo.com', 'https://generativelanguage.googleapis.com'].includes(url.origin), 'Provider redirect must never be followed.');
      if (redirect) return new Response(null, { status: 302, headers: { Location: 'https://never-follow.invalid/collect' } });
      if (url.origin === 'https://generativelanguage.googleapis.com') {
        assert.equal(request.headers.get('x-goog-api-key'), 'offline-gemini-fixture');
        assert.equal(url.pathname, '/v1beta/interactions');
        return Response.json({ status: 'completed', steps: [{ type: 'model_output', content: [{ type: 'text', text: 'Leave a little room for each other.' }] }] });
      }
      assert.equal(url.origin, 'https://hackathon.api.qloo.com');
      assert.equal(url.pathname, '/search');
      assert.equal(request.headers.get('X-Api-Key'), 'offline-fixture');
      return Response.json({ results: [{ entity_id: '11111111-1111-4111-8111-111111111111', name: 'Fixture film', type: 'urn:entity:movie', properties: { release_year: 2001 } }] });
    },
  });
  const post = (path, input) => worker.dispatchFetch(origin + path, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify(input) });
  return { worker, calls, post };
}

test('actual Workers globals support Qloo and Gemini through the cached cloud route across requests', async () => {
  const { worker, calls, post } = await fixture();
  try {
    assert.equal((await worker.dispatchFetch(origin + '/api/status')).status, 200);
    for (const query of ['One', 'Two']) {
      const response = await post('/api/try/search', { query, type: 'movie', locale: 'en' });
      assert.equal(response.status, 200, await response.clone().text());
      assert.equal((await response.json()).items[0].title, 'Fixture film');
    }
    const response = await post('/api/eve/chat', chat);
    assert.equal(response.status, 200, await response.clone().text());
    assert.equal((await response.json()).text, 'Leave a little room for each other.');
    assert.equal(calls.length, 3);
  } finally { await worker.dispose(); }
});

test('Workers rejects every provider redirect without following it or forwarding credentials', async () => {
  const { worker, calls, post } = await fixture({ redirect: true });
  try {
    for (const [path, input, code] of [
      ['/api/try/search', { query: 'A film', type: 'movie', locale: 'en' }, 'QLOO_UNAVAILABLE'],
      ['/api/recommend', { episode: 'date', mode: 'common', locale: 'en', consent }, 'QLOO_UNAVAILABLE'],
      ['/api/eve/chat', chat, 'GEMINI_UNAVAILABLE'],
    ]) {
      const response = await post(path, input);
      assert.equal(response.status, 502);
      assert.deepEqual(await response.json(), { error: { code } });
    }
    assert.equal(calls.length, 3, 'One initial provider request per operation, no redirect and no retry.');
    assert(calls.every(call => !call.origin.includes('never-follow')));
  } finally { await worker.dispose(); }
});
