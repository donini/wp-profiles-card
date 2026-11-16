import './pages.mjs';
import { build } from 'esbuild';
import { mkdir, cp } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
await build({ entryPoints: ['src/worker.ts'], bundle: true, format: 'esm', target: 'es2022', outfile: 'dist/worker.js', minify: true, sourcemap: true });
await cp('public', 'dist/public', { recursive: true });
console.log('Built Worker and static assets in dist/. No deployment performed.');
