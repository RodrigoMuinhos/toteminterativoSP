import { readFile, access } from 'node:fs/promises';
import { Script } from 'node:vm';

const project = new URL('../', import.meta.url);
for (const name of ['', 'themes/my-little-pony/', 'themes/transformers/']) {
  const root = new URL(name, project);
  const html = await readFile(new URL('index.html', root), 'utf8');
  const css = await readFile(new URL('src/styles.css', root), 'utf8');
  if (name) new Script(await readFile(new URL('src/app.js', root), 'utf8'));
  const references = [
    ...[...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map(match => match[1]),
    ...[...css.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map(match => match[1])
  ];
  for (const reference of new Set(references)) {
    if (/^(data:|https?:|#)/.test(reference)) continue;
    if (!name && ['my-little-pony/', 'transformers/'].includes(reference)) {
      await access(new URL(`themes/${reference}index.html`, project));
      continue;
    }
    const location = ['styles.css', 'app.js'].includes(reference) ? `src/${reference}` : `public/${reference}`;
    await access(new URL(location, root));
  }
  console.log(`${name || 'Seletor'}: código e assets verificados.`);
}
for (const robot of ['optimus', 'bumblebee', 'ratchet', 'windblade', 'wheeljack']) {
  for (let frame = 0; frame < 9; frame++) {
    await access(new URL(`themes/transformers/public/frames/${robot}/${frame}.webp`, project));
  }
}
