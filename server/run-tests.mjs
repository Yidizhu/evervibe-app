import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Explicit files keep this command portable across Windows and POSIX shells.
const directory = new URL('./tests/', import.meta.url);
const files = readdirSync(directory).filter(name => name.endsWith('.test.cjs')).sort()
  .map(name => fileURLToPath(new URL(name, directory)));
files.push(fileURLToPath(new URL('./check-cloudflare-runtime.mjs', import.meta.url)));
files.push(fileURLToPath(new URL('./check-workerd-runtime.mjs', import.meta.url)));
const result = spawnSync(process.execPath, ['--test', ...files], { stdio: 'inherit' });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
