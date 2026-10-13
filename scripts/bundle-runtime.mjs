import { build } from 'esbuild';
import { readFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const source = new URL('../server/source/', import.meta.url);
const modules = ['eve-service.cjs', 'gemini-chat.cjs', 'eve-planner.cjs', 'eve-proactive.cjs', 'try-service.cjs', 'api-handler.cjs', 'qloo-support.cjs', 'vibe-profiles.cjs'];
for (const file of modules) {
  const text = await readFile(new URL(file, source), 'utf8');
  if (/process\.env|(?:require\(|from\s*)['"](?:node:|fs['"]|http['"])/.test(text)) {
    throw new Error(`Worker source must use injected dependencies: ${file}`);
  }
}
await mkdir(new URL('../server/generated/', import.meta.url), { recursive: true });
await build({
  absWorkingDir: fileURLToPath(root),
  entryPoints: ['server/runtime-entry.mjs'],
  outfile: 'server/generated/evervibe-runtime.mjs',
  bundle: true, platform: 'browser', format: 'esm', target: 'es2022',
  sourcemap: false, legalComments: 'none', logLevel: 'warning',
});
console.log('EverVibe Worker runtime bundled from explicit server sources.');
