// Production build: the site is plain HTML/CSS/JS, so copy it to dist as-is.
// (A Vite bundle only picks up index.html and drops the non-module scripts.)
import fs from 'node:fs';

fs.rmSync('dist', { recursive: true, force: true });
fs.mkdirSync('dist');
for (const f of fs.readdirSync('.')) {
  if (f.endsWith('.html')) fs.copyFileSync(f, `dist/${f}`);
}
fs.cpSync('assets', 'dist/assets', { recursive: true });
console.log('Copied site to dist/');
