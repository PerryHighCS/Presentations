import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

import {
  collectHtmlFiles,
  createExclusionChecker,
  getNormalizedMounts,
  loadManifestRules,
} from './site-utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const port = Number.parseInt(process.env.PORT || '4173', 10);
const host = process.env.HOST || '127.0.0.1';

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webm': 'video/webm',
  '.webp': 'image/webp',
};

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function decodePathname(urlPath) {
  try {
    return decodeURIComponent(urlPath);
  } catch {
    return urlPath;
  }
}

function findMountForPath(pathname, mounts) {
  for (const mount of mounts) {
    if (pathname === mount.publicPath || pathname.startsWith(mount.publicPath + '/')) {
      return mount;
    }
  }
  return null;
}

function stripMountPrefix(pathname, mount) {
  if (pathname === mount.publicPath) {
    return '';
  }
  return pathname.slice(mount.publicPath.length + 1);
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function buildIndexHtml(htmlFiles) {
  const items = htmlFiles
    .map((file) => `<li><a href="/${escapeHtml(file)}">${escapeHtml(file)}</a></li>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Presentations Preview</title>
  <style>
    body {
      margin: 0;
      font-family: system-ui, sans-serif;
      background: #0b1220;
      color: #e5ecff;
    }
    main {
      max-width: 920px;
      margin: 0 auto;
      padding: 32px 20px 48px;
    }
    a {
      color: #9fd4ff;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    ul {
      line-height: 1.8;
      padding-left: 20px;
    }
    code {
      color: #9bb0d8;
    }
  </style>
</head>
<body>
  <main>
    <h1>Presentations Preview</h1>
    <p>Serving the deployed site layout directly from source folders. Refresh the browser after edits.</p>
    <p><code>classes/*</code> mounts at site root and <code>vendor/SyncDeck-Reveal</code> mounts at <code>/runtime/syncdeck-reveal</code>.</p>
    <ul>
      ${items}
    </ul>
  </main>
</body>
</html>`;
}

async function main() {
  const mounts = getNormalizedMounts();
  const manifestRules = await loadManifestRules(rootDir);
  const isExcluded = createExclusionChecker(rootDir, manifestRules);
  const htmlFiles = await collectHtmlFiles(rootDir, manifestRules);
  const indexHtml = buildIndexHtml(htmlFiles);

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${host}:${port}`);
    let pathname = decodePathname(url.pathname);

    if (pathname === '/') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      res.end(indexHtml);
      return;
    }

    const mount = findMountForPath(pathname, mounts);
    if (!mount) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end(`Not found: ${pathname}`);
      return;
    }

    const relativePath = stripMountPrefix(pathname, mount);
    const sourceRepoRelative = relativePath
      ? path.posix.join(mount.sourcePath, relativePath)
      : mount.sourcePath;
    if (isExcluded(sourceRepoRelative, pathname.endsWith('/'))) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end(`Not found: ${pathname}`);
      return;
    }
    const sourcePath = relativePath
      ? path.join(rootDir, mount.sourcePath, relativePath)
      : path.join(rootDir, mount.sourcePath);

    let stat = null;
    try {
      stat = await fs.stat(sourcePath);
    } catch {
      stat = null;
    }

    if (stat && stat.isDirectory()) {
      const htmlIndexPath = path.join(sourcePath, 'index.html');
      if (await exists(htmlIndexPath)) {
        pathname = path.posix.join(pathname, 'index.html');
      } else {
        res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
        res.end(`Directory listing is not available for ${pathname}`);
        return;
      }
    }

    const finalRelativePath = stripMountPrefix(pathname, mount);
    const finalRepoRelative = finalRelativePath
      ? path.posix.join(mount.sourcePath, finalRelativePath)
      : mount.sourcePath;
    if (isExcluded(finalRepoRelative, false)) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end(`Not found: ${pathname}`);
      return;
    }
    const finalSourcePath = path.join(rootDir, mount.sourcePath, finalRelativePath);

    try {
      const content = await fs.readFile(finalSourcePath);
      const ext = path.extname(finalSourcePath).toLowerCase();
      res.writeHead(200, {
        'cache-control': 'no-store',
        'content-type': contentTypes[ext] || 'application/octet-stream',
      });
      res.end(content);
    } catch {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end(`Not found: ${pathname}`);
    }
  });

  server.listen(port, host, () => {
    console.log(`Serving preview at http://${host}:${port}`);
  });
}

await main();
