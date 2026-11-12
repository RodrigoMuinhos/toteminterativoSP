import { readFile, access } from 'node:fs/promises';
import { Script } from 'node:vm';

const project = new URL('../', import.meta.url);
const html = await readFile(new URL('index.html', project), 'utf8');
const js = await readFile(new URL('src/app.js', project), 'utf8');
const css = await readFile(new URL('src/styles.css', project), 'utf8');
new Script(js);
const references = [
  ...[...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map(match => match[1]),
  ...[...css.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map(match => match[1])
];
for (const reference of new Set(references)) {
  if (/^(data:|https?:|#)/.test(reference)) continue;
  const location = ['styles.css', 'app.js'].includes(reference) ? `src/${reference}` : `public/${reference}`;
  await access(new URL(location, project));
}
console.log('JavaScript válido e assets do HTML/CSS presentes.');
