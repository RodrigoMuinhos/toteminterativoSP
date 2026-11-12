import { cp, mkdir, copyFile, rm, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const project = new URL('../', import.meta.url);
const output = new URL('dist/', project);
const projectPath = path.resolve(fileURLToPath(project));
const outputPath = path.resolve(fileURLToPath(output));
if (path.dirname(outputPath) !== projectPath || path.basename(outputPath) !== 'dist') throw Error('Destino de build inválido');
await rm(outputPath, { recursive: true, force: true });

async function buildPage(source, target) {
  await mkdir(target, { recursive: true });
  await cp(new URL('public/', source), target, { recursive: true });
  await copyFile(new URL('index.html', source), new URL('index.html', target));
  await copyFile(new URL('src/styles.css', source), new URL('styles.css', target));
  const script = new URL('src/app.js', source);
  try { await access(script); } catch { return; }
  await copyFile(script, new URL('app.js', target));
}

await buildPage(project, output);
for (const theme of ['my-little-pony', 'transformers']) {
  await buildPage(new URL(`themes/${theme}/`, project), new URL(`${theme}/`, output));
}
console.log('Build concluído: seletor e dois totens independentes em frontend/dist');
