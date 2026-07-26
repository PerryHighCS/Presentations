import fs from 'node:fs/promises';
import path from 'node:path';

export const manifestRelativePath = 'config/permalinks.json';

const PERMALINK_META_NAME = 'syncdeck-permalink';
const PERMALINK_META_RE = new RegExp(
  `<meta\\s+name=["']${PERMALINK_META_NAME}["']\\s+content=["']([0-9a-z]+)["']\\s*/?>`,
  'i'
);
const HEAD_OPEN_RE = /<head[^>]*>/i;
const TITLE_RE = /<title>(.*?)<\/title>/is;

export function fnv1aHash(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

// Seeded from the deck's filename stem, incrementing the seed on collision
// against the manifest until a free hash is found. `excludePath` lets a
// deck that already owns a hash re-derive the same hash without tripping
// over its own manifest entry.
export function computeUniqueHash(stem, manifest, { excludePath } = {}) {
  let attempt = 1;
  let seed = stem;
  for (;;) {
    const hash = fnv1aHash(seed);
    const existing = manifest[hash];
    if (!existing || existing.path === excludePath) {
      return hash;
    }
    attempt += 1;
    seed = `${stem}#${attempt}`;
  }
}

export function extractPermalinkHash(html) {
  const match = html.match(PERMALINK_META_RE);
  return match ? match[1] : null;
}

export function insertPermalinkTag(html, hash) {
  if (!HEAD_OPEN_RE.test(html)) {
    throw new Error('No <head> tag found');
  }
  const tag = `<meta name="${PERMALINK_META_NAME}" content="${hash}">`;
  return html.replace(HEAD_OPEN_RE, (match) => `${match}\n${tag}`);
}

export function extractTitle(html) {
  const match = html.match(TITLE_RE);
  if (!match) {
    return null;
  }
  const value = match[1].replace(/\s+/g, ' ').trim();
  return value || null;
}

export async function loadManifest(rootDir) {
  const manifestPath = path.join(rootDir, manifestRelativePath);
  try {
    const raw = await fs.readFile(manifestPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return {};
    }
    throw err;
  }
}

export async function saveManifest(rootDir, manifest) {
  const manifestPath = path.join(rootDir, manifestRelativePath);
  const sorted = {};
  for (const key of Object.keys(manifest).sort()) {
    sorted[key] = manifest[key];
  }
  await fs.writeFile(manifestPath, JSON.stringify(sorted, null, 2) + '\n', 'utf8');
}

// Walks Decks/ directly (source files, not the staged/published site) since
// the generator needs to edit the actual deck HTML in place.
// Percent-encode each path segment so the target is safe to embed in both
// a JS string literal and an HTML attribute, and resolve it relative to
// p/<hash>.html so it works unmodified under the GitHub Pages project
// prefix and the local dev server alike.
export function toRedirectTarget(publicPath) {
  return '../' + publicPath.split('/').map(encodeURIComponent).join('/');
}

export function redirectHtml(target) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Redirecting...</title>
<script>location.replace(${JSON.stringify(target)});</script>
<meta http-equiv="refresh" content="0; url=${target}">
</head>
<body>
<p>Redirecting to <a href="${target}">the presentation</a>...</p>
</body>
</html>
`;
}

export async function collectDeckFiles(rootDir) {
  const decksRoot = path.join(rootDir, 'Decks');
  const results = [];

  async function walk(relDir) {
    const absDir = path.join(decksRoot, relDir);
    const entries = await fs.readdir(absDir, { withFileTypes: true });
    for (const entry of entries) {
      const rel = relDir ? path.posix.join(relDir, entry.name) : entry.name;
      if (entry.isDirectory()) {
        await walk(rel);
        continue;
      }
      if (
        entry.isFile() &&
        rel.toLowerCase().endsWith('.html') &&
        path.posix.basename(rel) !== 'index.html'
      ) {
        results.push({
          publicPath: rel,
          absolutePath: path.join(decksRoot, rel),
        });
      }
    }
  }

  await walk('');
  results.sort((a, b) => a.publicPath.localeCompare(b.publicPath));
  return results;
}
