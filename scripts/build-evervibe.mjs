// Keep the starter's build owner and Sites deployment integration intact.
import { fileURLToPath } from 'node:url';
await import('./bundle-runtime.mjs');
process.argv = [process.execPath, fileURLToPath(new URL('./run-framework.mjs', import.meta.url)), 'build', ...process.argv.slice(2)];
await import('./run-framework.mjs');
