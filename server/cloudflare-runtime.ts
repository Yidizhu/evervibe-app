import { env } from 'cloudflare:workers';
import { createEverVibeRuntime } from './generated/evervibe-runtime.mjs';
import { createD1CatalogStore } from './catalog-store.mjs';

type RuntimeBindings = {
  DB?: D1Database;
  QLOO_API_KEY?: string;
  QLOO_API_BASE_URL?: string;
  QLOO_BASE_URL?: string;
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
};

const allowedOrigins = [
  'https://evervibe.zesty-mesa-1831.chatgpt.site',
  'http://127.0.0.1:5173', 'http://localhost:5173',
  'http://127.0.0.1:8787', 'http://localhost:8787',
];
let boundEnvironment: RuntimeBindings | undefined;
let handle: ((request: Request) => Promise<Response>) | undefined;

export async function handleEverVibeRequest(request: Request): Promise<Response> {
  const bindings = env as RuntimeBindings;
  const url = new URL(request.url), origin = request.headers.get('origin');
  if (!allowedOrigins.includes(url.origin) || (origin && origin !== url.origin) || request.headers.get('sec-fetch-site') === 'cross-site') {
    return Response.json({ error: { code: 'ORIGIN_REJECTED' } }, {
      status: 403, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
    });
  }
  if (url.pathname.startsWith('/api/try/') && !bindings.DB) {
    return Response.json({ error: { code: 'TRY_CATALOG_UNAVAILABLE' } }, {
      status: 503, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
    });
  }
  if (!handle || boundEnvironment !== bindings) {
    boundEnvironment = bindings;
    handle = createEverVibeRuntime({
      env: bindings, fetch: globalThis.fetch,
      catalogStore: bindings.DB ? createD1CatalogStore(bindings.DB) : undefined,
      allowedOrigins,
    });
  }
  return handle!(request);
}
