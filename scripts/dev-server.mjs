import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
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
const liveReloadPath = '/__dev__/live-reload';

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

const liveReloadClientScript = `<script>
(() => {
  if (!window.EventSource) {
    return;
  }

  const source = new EventSource(${JSON.stringify(liveReloadPath)});
  source.addEventListener('message', (event) => {
    if (event.data === 'reload') {
      window.location.reload();
    }
  });
})();
</script>`;

function injectLiveReload(html) {
  const bodyCloseTag = '</body>';
  if (html.includes(liveReloadClientScript)) {
    return html;
  }
  if (html.includes(bodyCloseTag)) {
    return html.replace(bodyCloseTag, `${liveReloadClientScript}\n${bodyCloseTag}`);
  }
  return `${html}\n${liveReloadClientScript}`;
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
    if (mount.publicPath === '/') {
      if (pathname.startsWith('/')) {
        return mount;
      }
      continue;
    }
    if (pathname === mount.publicPath || pathname.startsWith(mount.publicPath + '/')) {
      return mount;
    }
  }
  return null;
}

function stripMountPrefix(pathname, mount) {
  if (mount.publicPath === '/') {
    return pathname.replace(/^\/+/, '');
  }
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
    await fsPromises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function listWatchDirectories(mounts, isExcluded) {
  const directories = new Set();

  async function walk(absoluteDir, repoRelativeDir) {
    if (isExcluded(repoRelativeDir, true)) {
      return;
    }

    directories.add(absoluteDir);

    let entries = [];
    try {
      entries = await fsPromises.readdir(absoluteDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }
      const childAbsoluteDir = path.join(absoluteDir, entry.name);
      const childRepoRelativeDir = path.posix.join(repoRelativeDir, entry.name);
      await walk(childAbsoluteDir, childRepoRelativeDir);
    }
  }

  for (const mount of mounts) {
    await walk(path.join(rootDir, mount.sourcePath), mount.sourcePath);
  }

  return directories;
}

async function main() {
  const mounts = getNormalizedMounts();
  const manifestRules = await loadManifestRules(rootDir, { mode: 'dev' });
  const isExcluded = createExclusionChecker(rootDir, manifestRules);
  const liveReloadClients = new Set();
  const directoryWatchers = new Map();

  let watcherRefreshPromise = null;
  let reloadTimer = null;

  const broadcastReload = () => {
    for (const client of liveReloadClients) {
      try {
        client.write('data: reload\n\n');
      } catch {
        liveReloadClients.delete(client);
      }
    }
  };

  const refreshWatchers = async () => {
    if (watcherRefreshPromise) {
      return watcherRefreshPromise;
    }

    watcherRefreshPromise = (async () => {
      const nextDirectories = await listWatchDirectories(mounts, isExcluded);

      for (const watchedDir of directoryWatchers.keys()) {
        if (!nextDirectories.has(watchedDir)) {
          directoryWatchers.get(watchedDir)?.close();
          directoryWatchers.delete(watchedDir);
        }
      }

      for (const absoluteDir of nextDirectories) {
        if (directoryWatchers.has(absoluteDir)) {
          continue;
        }

        try {
          const watcher = fs.watch(absoluteDir, () => {
            if (reloadTimer) {
              clearTimeout(reloadTimer);
            }
            reloadTimer = setTimeout(async () => {
              reloadTimer = null;
              await refreshWatchers();
              broadcastReload();
            }, 100);
          });

          watcher.on('error', () => {
            watcher.close();
            directoryWatchers.delete(absoluteDir);
          });

          directoryWatchers.set(absoluteDir, watcher);
        } catch {
          // Ignore directories that cannot be watched.
        }
      }
    })();

    try {
      await watcherRefreshPromise;
    } finally {
      watcherRefreshPromise = null;
    }
  };

  await refreshWatchers();

  const keepAliveInterval = setInterval(() => {
    for (const client of liveReloadClients) {
      try {
        client.write(': keepalive\n\n');
      } catch {
        liveReloadClients.delete(client);
      }
    }
  }, 15000);

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${host}:${port}`);
    let pathname = decodePathname(url.pathname);

    if (pathname === liveReloadPath) {
      res.writeHead(200, {
        'cache-control': 'no-store',
        connection: 'keep-alive',
        'content-type': 'text/event-stream; charset=utf-8',
      });
      res.write(': connected\n\n');
      liveReloadClients.add(res);

      req.on('close', () => {
        liveReloadClients.delete(res);
      });
      return;
    }

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
      res.end(injectLiveReload(indexPages.get(indexKey)));
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
      stat = await fsPromises.stat(sourcePath);
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
        res.end(injectLiveReload(indexPages.get(generatedIndexPath)));
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
      const ext = path.extname(finalSourcePath).toLowerCase();

      if (ext === '.html') {
        const content = await fsPromises.readFile(finalSourcePath, 'utf8');
        res.writeHead(200, {
          'cache-control': 'no-store',
          'content-type': 'text/html; charset=utf-8',
        });
        res.end(injectLiveReload(content));
        return;
      }

      const content = await fsPromises.readFile(finalSourcePath);
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

  server.on('close', () => {
    clearInterval(keepAliveInterval);
    if (reloadTimer) {
      clearTimeout(reloadTimer);
      reloadTimer = null;
    }
    for (const watcher of directoryWatchers.values()) {
      watcher.close();
    }
    directoryWatchers.clear();
    liveReloadClients.clear();
  });
}

await main();
