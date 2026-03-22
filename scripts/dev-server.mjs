import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

import { buildIndexPages, defaultTitleForFile } from './site-indexes.mjs';
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

function resolvePublicPathToSource(publicPath, mounts) {
  const pathname = publicPath.startsWith('/') ? publicPath : `/${publicPath}`;
  const mount = findMountForPath(pathname, mounts);
  if (!mount) {
    return null;
  }
  const relativePath = stripMountPrefix(pathname, mount);
  return path.join(rootDir, mount.sourcePath, relativePath);
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const mounts = getNormalizedMounts();
  const manifestRules = await loadManifestRules(rootDir);
  const isExcluded = createExclusionChecker(rootDir, manifestRules);

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${host}:${port}`);
    let pathname = decodePathname(url.pathname);

    const htmlFiles = await collectHtmlFiles(rootDir, manifestRules);
    const indexPages = await buildIndexPages(htmlFiles, async (publicPath) => {
      const sourcePath = resolvePublicPathToSource(publicPath, mounts);
      if (!sourcePath) {
        return publicPath;
      }
      return defaultTitleForFile(sourcePath);
    });

    const indexKey =
      pathname === '/'
        ? 'index.html'
        : pathname.endsWith('/')
          ? `${pathname.slice(1)}index.html`
          : pathname.startsWith('/') ? pathname.slice(1) : pathname;

    if (indexPages.has(indexKey)) {
      res.writeHead(200, {
        'cache-control': 'no-store',
        'content-type': 'text/html; charset=utf-8',
      });
      res.end(indexPages.get(indexKey));
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
      const generatedIndexPath = path.posix.join(pathname, 'index.html').replace(/^\/+/, '');
      if (indexPages.has(generatedIndexPath)) {
        res.writeHead(200, {
          'cache-control': 'no-store',
          'content-type': 'text/html; charset=utf-8',
        });
        res.end(indexPages.get(generatedIndexPath));
        return;
      }
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
