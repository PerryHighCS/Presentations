import fs from 'node:fs/promises';
import path from 'node:path';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
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
  .generated { margin: 0 0 18px; color: var(--muted); font-size: 0.92rem; }
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
`;

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
`;

export async function defaultTitleForFile(filePath) {
  try {
    const text = await fs.readFile(filePath, 'utf8');
    const match = text.match(/<title>(.*?)<\/title>/is);
    if (match) {
      const value = match[1].replace(/\s+/g, ' ').trim();
      if (value) {
        return value;
      }
    }
  } catch {
    // Ignore and fall back to filename.
  }
  return path.basename(filePath, path.extname(filePath)).replace(/[-_]/g, ' ').trim();
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
</head>
<body>
  <main class="wrap">
    ${backHtml}
    <h1>${escapeHtml(heading)}</h1>
    <p>${escapeHtml(description)}</p>
    <p class="generated" id="generated-time" data-generated-utc="${escapeHtml(generatedAtIso)}">Generated: ${escapeHtml(generatedAt)}</p>
    <ul class="tree">
${listing}
    </ul>
  </main>
  <script>${PAGE_SCRIPT}</script>
</body>
</html>
`;
}

function renderTree(node, indent = '      ', pathPrefix = '') {
  const lines = [];

  for (const file of [...node.files].sort((a, b) => a.rel.localeCompare(b.rel))) {
    lines.push(
      `${indent}<li class="file"><a href="${escapeHtml(`${pathPrefix}${file.name}`)}">${escapeHtml(file.title)}</a></li>`
    );
  }

  for (const [dirname, child] of [...node.dirs.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    lines.push(
      `${indent}<li class="folder"><a class="folder-name" href="${escapeHtml(`${pathPrefix}${dirname}/index.html`)}">${escapeHtml(dirname)}/</a>`
    );
    lines.push(`${indent}  <ul>`);
    lines.push(...renderTree(child, indent + '    ', `${pathPrefix}${dirname}/`));
    lines.push(`${indent}  </ul>`);
    lines.push(`${indent}</li>`);
  }

  return lines;
}

export async function buildIndexPages(htmlFiles, getTitleForPublicPath) {
  const generatedAtDt = new Date();
  const generatedAt = generatedAtDt.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC');
  const generatedAtIso = generatedAtDt.toISOString();

  const normalized = [...htmlFiles]
    .map((file) => file.replace(/\\/g, '/'))
    .filter((file) => file.toLowerCase().endsWith('.html') && path.posix.basename(file) !== 'index.html')
    .sort((a, b) => a.localeCompare(b));

  const titledEntries = [];
  for (const rel of normalized) {
    titledEntries.push({
      rel,
      title: await getTitleForPublicPath(rel),
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
    for (const [dirname, child] of [...node.dirs.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
      const childFolder = folder === '.' ? dirname : `${folder}/${dirname}`;
      const listingLines = renderTree(child);
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
