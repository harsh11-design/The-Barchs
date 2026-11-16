const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function resolveFile(rawPath) {
  let candidates = [];

  // Try inside The-Barchs first (the primary target project)
  let p0 = path.join(__dirname, 'The-Barchs', rawPath);
  candidates.push(p0);
  candidates.push(path.join(p0, 'index.html'));

  // Try inside barchs-site
  let p2 = path.join(__dirname, 'barchs-site', rawPath);
  candidates.push(p2);
  candidates.push(path.join(p2, 'index.html'));

  // Try direct path in root as fallback
  let p1 = path.join(__dirname, rawPath);
  candidates.push(p1);
  candidates.push(path.join(p1, 'index.html'));

  for (let c of candidates) {
    try {
      if (fs.existsSync(c)) {
        const stat = fs.statSync(c);
        if (stat.isFile()) return c;
      }
    } catch (e) {}
  }
  return null;
}

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';

  const targetFile = resolveFile(reqPath);

  if (!targetFile || !targetFile.startsWith(__dirname)) {
    // 404
    const notFound = resolveFile('/404.html') || resolveFile('/barchs-site/404.html');
    if (notFound) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(notFound).pipe(res);
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
    return;
  }

  const ext = path.extname(targetFile).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': 'no-cache',
    'Access-Control-Allow-Origin': '*'
  });
  fs.createReadStream(targetFile).pipe(res);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
