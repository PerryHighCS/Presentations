import fs from 'node:fs/promises';
import path from 'node:path';

import { syncDeckHosting } from '../config/site-map.mjs';
import { extractPermalinkHash } from './permalink-utils.mjs';

const NATURAL_COLLATOR = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function decodeHtmlEntities(value) {
  return String(value).replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]+);/g, (match, entity) => {
    const named = {
      amp: '&',
      apos: "'",
      gt: '>',
      lt: '<',
      nbsp: ' ',
      quot: '"',
    };

    if (entity[0] === '#') {
      const isHex = entity[1]?.toLowerCase() === 'x';
      const raw = isHex ? entity.slice(2) : entity.slice(1);
      const codePoint = Number.parseInt(raw, isHex ? 16 : 10);
      if (Number.isFinite(codePoint)) {
        try {
          return String.fromCodePoint(codePoint);
        } catch {
          return match;
        }
      }
      return match;
    }

    return Object.hasOwn(named, entity) ? named[entity] : match;
  });
}

export const PAGE_STYLE = `
  :root {
    color-scheme: dark;
    --bg: #0b1220;
    --card: #111a2e;
    --text: #e5ecff;
    --muted: #9bb0d8;
    --accent: #8bd3ff;
    --border: #22304f;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: linear-gradient(180deg, #08101d 0%, var(--bg) 100%);
    color: var(--text);
    font: 16px/1.55 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .wrap {
    max-width: 920px;
    margin: 0 auto;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 24px;
  }
  h1 { margin: 0 0 8px; font-size: 1.7rem; }
  p { margin: 0 0 18px; color: var(--muted); }
  .generated { margin: 18px 0 0; color: var(--muted); font-size: 0.92rem; }
  .back { margin: 0 0 18px; font-size: 0.92rem; }
  .back a { color: var(--muted); }
  ul { margin: 0; }
  .tree, .tree ul { list-style: none; padding-left: 18px; }
  .tree > li { margin: 8px 0; }
  .tree ul { margin-top: 6px; border-left: 1px solid var(--border); }
  li { line-height: 1.45; }
  a { color: var(--accent); text-decoration: none; }
  a:hover { text-decoration: underline; }
  .folder-name { color: var(--muted); font-weight: 600; }
  .tree li.folder > details > summary {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    list-style: none;
  }
  .tree li.folder > details > summary::-webkit-details-marker { display: none; }
  .tree li.folder > details > summary::marker { content: ""; }
  .tree li.folder > details > summary:focus-visible {
    outline: 1px solid var(--accent);
    outline-offset: 2px;
  }
  .tree .disclosure {
    display: inline-block;
    width: 0.8em;
    font-size: 1.15rem;
    font-weight: 600;
    text-align: center;
    color: var(--muted);
  }
  .tree .disclosure::before { content: "+"; }
  .tree li.folder > details[open] > summary .disclosure::before { content: "−"; }
  .tree li.file {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    column-gap: 16px;
    row-gap: 2px;
    padding: 4px 8px;
    margin: -4px -8px;
    border-radius: 8px;
    transition: background-color 120ms ease;
  }
  .tree li.file:hover {
    background: rgba(139, 211, 255, 0.08);
  }
  .file-actions {
    display: inline-flex;
    align-items: baseline;
    gap: 6px;
    margin-left: auto;
    font-size: 0.8rem;
    color: var(--muted);
    white-space: nowrap;
  }
  .file-actions a { color: inherit; }
  .file-actions a:hover { color: var(--accent); text-decoration: underline; }
  .file-actions .sep { color: #3d537e; }
  .tree button.copy-url {
    display: inline-flex;
    align-items: center;
    color: var(--muted);
    background: none;
    border: none;
    padding: 2px;
    margin: 0;
    line-height: 0;
    border-radius: 4px;
    cursor: pointer;
  }
  .tree button.copy-url svg { width: 14px; height: 14px; display: block; }
  .tree button.copy-url:hover { color: var(--accent); }
  .tree button.copy-url:focus-visible { outline: 1px solid var(--accent); outline-offset: 2px; }
  .tree button.copy-url.copied { color: #7cd992; }
  .tree button.copy-url.failed { color: #ff8a80; }
  .tree button.copy-url:disabled { cursor: default; }
  .tree button.copy-url-labeled { gap: 4px; }
  @media (max-width: 640px) {
    .tree li.file {
      flex-direction: column;
      align-items: flex-start;
    }
    .file-actions { margin-left: 0; }
  }
`;

const ICON_COPY =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
const ICON_CHECK =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>';

export const PAGE_SCRIPT = `
  (() => {
    const el = document.getElementById('generated-time');
    if (!el) return;
    const iso = el.getAttribute('data-generated-utc');
    if (!iso) return;
    const dt = new Date(iso);
    if (Number.isNaN(dt.getTime())) return;
    const local = dt.toLocaleString();
    el.textContent += ' (' + local + ' local)';
  })();

  (() => {
    // Resolve every presentation URL against the origin that is actually
    // serving this index page, not a hardcoded production URL. That way
    // "Copy URL", "Start as instructor", and "Get permalink" all point at
    // the real deployed site when this page is served from GitHub Pages,
    // and at the local dev server (or a forwarded dev URL) when it isn't.
    function resolveUrl(relPath) {
      return new URL(relPath, window.location.href).toString();
    }

    const activeBitsOrigin = ${JSON.stringify(syncDeckHosting.activeBitsOrigin)};
    const launchPath = ${JSON.stringify(syncDeckHosting.launchPath)};
    const permalinkPath = ${JSON.stringify(syncDeckHosting.permalinkPath)};

    function buildActiveBitsUrl(pathname, presentationUrl, extraParams) {
      const url = new URL(pathname, activeBitsOrigin);
      url.searchParams.set('presentationUrl', presentationUrl);
      for (const key in extraParams || {}) {
        url.searchParams.set(key, extraParams[key]);
      }
      return url.toString();
    }

    document.querySelectorAll('a[data-launch-path]').forEach((a) => {
      const presentationUrl = resolveUrl(a.getAttribute('data-launch-path') || '');
      const launchMode = a.getAttribute('data-launch');
      if (launchMode === 'instructor') {
        a.href = buildActiveBitsUrl(launchPath, presentationUrl, { mode: 'instructor' });
      } else if (launchMode === 'syncdeck') {
        a.href = buildActiveBitsUrl(permalinkPath, presentationUrl);
      }
    });

    async function copyText(text) {
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(text);
          return true;
        } catch {
          // fall through to the legacy fallback below
        }
      }
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        return ok;
      } catch {
        return false;
      }
    }

    const checkIcon = ${JSON.stringify(ICON_CHECK)};

    document.querySelectorAll('button[data-copy-path]').forEach((btn) => {
      const original = btn.innerHTML;
      let resetTimer = null;
      btn.addEventListener('click', async () => {
        const url = resolveUrl(btn.getAttribute('data-copy-path') || '');
        const ok = await copyText(url);
        if (resetTimer) clearTimeout(resetTimer);
        btn.classList.remove('copied', 'failed');
        if (ok) {
          btn.classList.add('copied');
          btn.innerHTML = checkIcon;
          btn.setAttribute('aria-label', 'Copied!');
        } else {
          btn.classList.add('failed');
          btn.setAttribute('aria-label', 'Copy failed');
        }
        resetTimer = setTimeout(() => {
          btn.classList.remove('copied', 'failed');
          btn.innerHTML = original;
          btn.setAttribute('aria-label', 'Copy presentation URL');
        }, 1500);
      });
    });
  })();
`;

export async function defaultTitleForFile(filePath) {
  try {
    const text = await fs.readFile(filePath, 'utf8');
    const match = text.match(/<title>(.*?)<\/title>/is);
    if (match) {
      const value = decodeHtmlEntities(match[1]).replace(/\s+/g, ' ').trim();
      if (value) {
        return value;
      }
    }
  } catch {
    // Ignore and fall back to filename.
  }
  return path.basename(filePath, path.extname(filePath)).replace(/[-_]/g, ' ').trim();
}

export async function permalinkHashForFile(filePath) {
  try {
    const text = await fs.readFile(filePath, 'utf8');
    return extractPermalinkHash(text);
  } catch {
    return null;
  }
}

function makePage(titleText, heading, description, listing, generatedAt, generatedAtIso, backLink = null) {
  const backHtml = backLink
    ? `<p class="back"><a href="${escapeHtml(backLink)}">&larr; Back</a></p>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(titleText)}</title>
  <style>${PAGE_STYLE}</style>
  <meta name="google-site-verification" content="wPBickmUgdPfm0kzBicpbNLxA5gYutw1V11iCsFvt5g" />
</head>
<body>
  <main class="wrap">
    ${backHtml}
    <h1>${escapeHtml(heading)}</h1>
    <p>${escapeHtml(description)}</p>
    <ul class="tree">
${listing}
    </ul>
    <p class="generated" id="generated-time" data-generated-utc="${escapeHtml(generatedAtIso)}">Generated: ${escapeHtml(generatedAt)}</p>
  </main>
  <script>${PAGE_SCRIPT}</script>
</body>
</html>
`;
}

function renderTree(node, indent = '      ', pathPrefix = '', pageDepth = 0) {
  const lines = [];
  // pageDepth is how many directories the *page being rendered* sits below
  // the site root (constant across this recursion), not how deep `pathPrefix`
  // has nested within that single page's listing — those are different axes.
  const rootPrefix = '../'.repeat(pageDepth);

  for (const file of [...node.files].sort((a, b) => NATURAL_COLLATOR.compare(a.title, b.title))) {
    const relativeHref = `${pathPrefix}${file.name}`;
    const permalinkHref = file.permalinkHash ? `${rootPrefix}p/${file.permalinkHash}.html` : null;
    // The syncdeck link is fed to ActiveBits as presentationUrl, so route it
    // through our own stable permalink when one exists rather than the raw
    // (reorg-fragile) path.
    const syncdeckLaunchPath = permalinkHref || relativeHref;
    lines.push(
      `${indent}<li class="file"><a href="${escapeHtml(relativeHref)}">${escapeHtml(file.title)}</a>` +
        `<button type="button" class="copy-url" data-copy-path="${escapeHtml(relativeHref)}" aria-label="Copy presentation URL" title="Copy URL">${ICON_COPY}</button>` +
        `<span class="file-actions">` +
        `<a href="#" data-launch="instructor" data-launch-path="${escapeHtml(relativeHref)}">Start as instructor</a>` +
        `<span class="sep">&middot;</span>` +
        `<a href="#" data-launch="syncdeck" data-launch-path="${escapeHtml(syncdeckLaunchPath)}">Syncdeck link</a>` +
        (permalinkHref
          ? `<span class="sep">&middot;</span>` +
            `<button type="button" class="copy-url copy-url-labeled" data-copy-path="${escapeHtml(permalinkHref)}" aria-label="Copy permalink URL" title="Copy permalink URL">Permalink ${ICON_COPY}</button>`
          : '') +
        `</span></li>`
    );
  }

  for (const [dirname, child] of [...node.dirs.entries()].sort((a, b) => NATURAL_COLLATOR.compare(a[0], b[0]))) {
    lines.push(`${indent}<li class="folder">`);
    lines.push(`${indent}  <details>`);
    lines.push(
      `${indent}    <summary><span class="disclosure" aria-hidden="true"></span>` +
        `<a class="folder-name" href="${escapeHtml(`${pathPrefix}${dirname}/index.html`)}">${escapeHtml(dirname)}/</a></summary>`
    );
    lines.push(`${indent}    <ul>`);
    lines.push(...renderTree(child, indent + '      ', `${pathPrefix}${dirname}/`, pageDepth));
    lines.push(`${indent}    </ul>`);
    lines.push(`${indent}  </details>`);
    lines.push(`${indent}</li>`);
  }

  return lines;
}

export async function buildIndexPages(htmlFiles, getTitleForPublicPath, getPermalinkForPublicPath) {
  const generatedAtDt = new Date();
  const generatedAt = generatedAtDt.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC');
  const generatedAtIso = generatedAtDt.toISOString();

  const normalized = [...htmlFiles]
    .map((file) => file.replace(/\\/g, '/'))
    .filter((file) => file.toLowerCase().endsWith('.html') && path.posix.basename(file) !== 'index.html')
    .sort((a, b) => NATURAL_COLLATOR.compare(a, b));

  const titledEntries = [];
  for (const rel of normalized) {
    titledEntries.push({
      rel,
      title: await getTitleForPublicPath(rel),
      permalinkHash: getPermalinkForPublicPath ? await getPermalinkForPublicPath(rel) : null,
    });
  }

  const tree = { files: [], dirs: new Map() };
  for (const entry of titledEntries) {
    const relPath = entry.rel;
    const parsed = path.posix.parse(relPath);

    let node = tree;
    const parts = parsed.dir ? parsed.dir.split('/').filter(Boolean) : [];
    for (const folderName of parts) {
      if (!node.dirs.has(folderName)) {
        node.dirs.set(folderName, { files: [], dirs: new Map() });
      }
      node = node.dirs.get(folderName);
    }
    node.files.push({
      name: parsed.base,
      rel: relPath,
      title: entry.title,
      permalinkHash: entry.permalinkHash,
    });
  }

  const pages = new Map();

  const rootListingLines = renderTree(tree);
  const rootListing = rootListingLines.length
    ? rootListingLines.join('\n')
    : '      <li>No presentations found.</li>';

  pages.set(
    'index.html',
    makePage(
      'Presentation Index',
      'Presentation Index',
      'Auto-generated list of HTML presentations in this repository.',
      rootListing,
      generatedAt,
      generatedAtIso
    )
  );

  function addFolderPages(node, folder = '.') {
    for (const [dirname, child] of [...node.dirs.entries()].sort((a, b) => NATURAL_COLLATOR.compare(a[0], b[0]))) {
      const childFolder = folder === '.' ? dirname : `${folder}/${dirname}`;
      const pageDepth = childFolder.split('/').filter(Boolean).length;
      const listingLines = renderTree(child, '      ', '', pageDepth);
      const listing = listingLines.length
        ? listingLines.join('\n')
        : '      <li>No presentations found.</li>';

      pages.set(
        `${childFolder}/index.html`,
        makePage(
          `${childFolder} — Presentations`,
          childFolder,
          `HTML presentations in ${childFolder}/`,
          listing,
          generatedAt,
          generatedAtIso,
          '../index.html'
        )
      );

      addFolderPages(child, childFolder);
    }
  }

  addFolderPages(tree);

  return pages;
}
