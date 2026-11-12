import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const project = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const sourceMode = process.argv.includes('--source');
const root = path.join(project, 'dist');
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
const within = (base, target) => target.startsWith(base + path.sep);

http.createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }).end(); return; }
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let base = root;
    let name = pathname === '/' ? '/index.html' : pathname;
    if (sourceMode) {
      if (name === '/index.html') base = project;
      else if (['/styles.css', '/app.js'].includes(name)) base = path.join(project, 'src');
      else base = path.join(project, 'public');
    }
    const target = path.resolve(base, '.' + name);
    if (!within(base, target) || (sourceMode && base === project && target !== path.join(project, 'index.html'))) { res.writeHead(403).end(); return; }
    const data = await readFile(target);
    res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch { res.writeHead(404).end('Arquivo não encontrado'); }
}).listen(port, '127.0.0.1', () => console.log(`Totem pronto: http://127.0.0.1:${port}`));
