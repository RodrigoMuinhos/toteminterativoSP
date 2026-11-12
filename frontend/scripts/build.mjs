import { cp, mkdir, copyFile } from 'node:fs/promises';

const project = new URL('../', import.meta.url);
const output = new URL('dist/', project);
await mkdir(output, { recursive: true });
await cp(new URL('public/', project), output, { recursive: true });
for (const [source, target] of [['index.html', 'index.html'], ['src/styles.css', 'styles.css'], ['src/app.js', 'app.js']]) {
  await copyFile(new URL(source, project), new URL(target, output));
}
console.log('Build concluído: frontend/dist');
