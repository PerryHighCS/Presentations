// Document pages: Markdown files under a mount with `markdownPages: true`
// (see config/site-map.mjs), such as lesson plans, are published as standalone
// HTML pages. The same renderer runs at deploy time (stage-site.mjs writes
// `plan.md` as `plan.html`) and on request in the dev server, so both stay
// identical.
import fs from 'node:fs/promises';
import path from 'node:path';

// `marked` is loaded only when a page is rendered, so the path and title
// helpers here also work in jobs that run without `npm ci` (the PR checks).
let MarkedClass = null;
async function loadMarked() {
  MarkedClass ??= (await import('marked')).Marked;
  return MarkedClass;
}

// Marks a generated page so the index pages list it under Documents rather
// than Slide Decks (no launch links, permalinks, or project badges).
export const DOCUMENT_DOC_TYPE = 'document';
const DOC_TYPE_META = `<meta name="syncdeck-doc-type" content="${DOCUMENT_DOC_TYPE}" />`;

export function isMarkdownPath(filePath) {
  return filePath.toLowerCase().endsWith('.md');
}

// `unit/plan.md` -> `unit/plan.html`
export function markdownToHtmlPath(filePath) {
  return filePath.replace(/\.md$/i, '.html');
}

export function isDocumentHtml(html) {
  return /<meta\s+name="syncdeck-doc-type"\s+content="document"/i.test(html);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

// Plain text of a line of inline Markdown, for titles and heading ids.
function plainText(markdown) {
  return markdown
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`~]/g, '')
    .replace(/\\(.)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

// The first level 1 heading, or the file name.
export function titleFromMarkdown(source, filePath) {
  const match = source.match(/^#\s+(.+?)\s*#*\s*$/m);
  const title = match ? plainText(match[1]) : '';
  return title || path.basename(filePath, path.extname(filePath)).replace(/[-_]/g, ' ').trim();
}

export async function titleForMarkdownFile(filePath) {
  try {
    return titleFromMarkdown(await fs.readFile(filePath, 'utf8'), filePath);
  } catch {
    return path.basename(filePath, path.extname(filePath)).replace(/[-_]/g, ' ').trim();
  }
}

function slugify(text) {
  return plainText(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section';
}

// Renders a Markdown document to its HTML body plus every heading after the
// title, for the contents list.
function renderBody(source, Marked) {
  const usedIds = new Set();
  const headings = [];
  let titleSeen = false;
  const marked = new Marked({ gfm: true });
  marked.use({
    walkTokens(token) {
      // Links between Markdown files point at the published pages.
      if (token.type === 'link' && !/^[a-z][a-z0-9+.-]*:/i.test(token.href) && !token.href.startsWith('#')) {
        token.href = token.href.replace(/\.md(?=$|[#?])/i, '.html');
      }
    },
    renderer: {
      heading({ tokens, depth, text }) {
        const base = slugify(text);
        // Check every candidate against all ids handed out so far, so
        // "Task", "Task", "Task 2" become task, task-2, task-2-2.
        let id = base;
        for (let n = 2; usedIds.has(id); n++) {
          id = `${base}-${n}`;
        }
        usedIds.add(id);
        const html = this.parser.parseInline(tokens);
        if (depth === 1 && !titleSeen) {
          titleSeen = true;
        } else {
          headings.push({ id, html, depth });
        }
        return `<h${depth} id="${id}">${html}</h${depth}>\n`;
      },
      table(token) {
        // Wide tables scroll inside their own box instead of the page.
        return `<div class="table-wrap">${marked.Renderer.prototype.table.call(this, token)}</div>\n`;
      },
    },
  });
  const body = marked.parse(source);
  return { body, headings };
}

// Two levels of contents, starting from the highest heading level used after
// the title (## in most documents, # when a document uses # for sections).
// Second level entries are listed inline under their section.
function renderContents(headings) {
  if (!headings.length) {
    return '';
  }
  const top = Math.min(...headings.map((heading) => heading.depth));
  const sections = [];
  for (const heading of headings) {
    if (heading.depth === top) {
      sections.push({ ...heading, children: [] });
    } else if (heading.depth === top + 1 && sections.length) {
      sections[sections.length - 1].children.push(heading);
    }
  }
  if (sections.length < 2) {
    return '';
  }
  const link = (item) => `<a href="#${item.id}">${item.html}</a>`;
  const items = sections.map((section) => {
    const children = section.children.length
      ? `\n<ol class="sub">${section.children.map((child) => `<li>${link(child)}</li>`).join('')}</ol>`
      : '';
    return `<li>${link(section)}${children}</li>`;
  });
  return `<nav class="contents" aria-label="Contents">\n<h2>Contents</h2>\n<ol>\n${items.join('\n')}\n</ol>\n</nav>\n`;
}

export const DOCUMENT_STYLE = `
  :root {
    color-scheme: light;
    --bg: #ffffff;
    --text: #1b2330;
    --muted: #4a5568;
    --accent: #0b5cad;
    --border: #d5dbe3;
    --soft: #f3f6fa;
    --code-bg: #f1f3f6;
  }
  * { box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; }
  body {
    margin: 0;
    background: var(--bg);
    color: var(--text);
    font: 17px/1.6 system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  }
  .bar {
    position: sticky;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 10px clamp(16px, 4vw, 40px);
    background: var(--soft);
    border-bottom: 1px solid var(--border);
    font-size: 15px;
  }
  .bar a { color: var(--accent); text-decoration: none; font-weight: 600; }
  .bar a:hover, .bar a:focus-visible { text-decoration: underline; }
  main { max-width: 52rem; margin: 0 auto; padding: 24px clamp(16px, 4vw, 40px) 64px; }
  h1, h2, h3, h4 { line-height: 1.25; margin: 1.6em 0 0.5em; scroll-margin-top: 64px; }
  h1 { font-size: 2em; margin-top: 0.4em; }
  h2 { font-size: 1.5em; padding-bottom: 0.25em; border-bottom: 1px solid var(--border); }
  h3 { font-size: 1.2em; }
  h4 { font-size: 1.05em; }
  p, ul, ol, blockquote, pre, .table-wrap { margin: 0 0 1em; }
  ul, ol { padding-left: 1.6em; }
  li + li { margin-top: 0.25em; }
  a { color: var(--accent); }
  hr { border: 0; border-top: 1px solid var(--border); margin: 2em 0; }
  blockquote { margin-left: 0; padding: 0.4em 1em; border-left: 4px solid var(--accent); background: var(--soft); }
  blockquote p:last-child { margin-bottom: 0; }
  code { font: 0.92em/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace; background: var(--code-bg); padding: 0.1em 0.3em; border-radius: 4px; }
  pre { background: var(--code-bg); border: 1px solid var(--border); border-radius: 6px; padding: 12px 14px; overflow-x: auto; }
  :not(pre) > code { overflow-wrap: anywhere; }
  pre code { background: none; padding: 0; }
  .table-wrap { overflow-x: auto; }
  table { border-collapse: collapse; width: 100%; font-size: 0.95em; }
  th, td { border: 1px solid var(--border); padding: 6px 10px; text-align: left; vertical-align: top; }
  th { background: var(--soft); }
  tbody tr:nth-child(even) td { background: #fafbfd; }
  img { max-width: 100%; height: auto; }
  nav.contents { margin: 0 0 2em; padding: 12px 18px; background: var(--soft); border: 1px solid var(--border); border-radius: 8px; }
  nav.contents h2 { font-size: 1em; margin: 0 0 0.4em; padding: 0; border: 0; }
  nav.contents > ol { margin: 0; columns: 2 20rem; column-gap: 2.5rem; }
  nav.contents > ol > li { break-inside: avoid; margin-bottom: 0.35em; }
  nav.contents ol.sub { list-style: none; margin: 0.1em 0 0; padding: 0; font-size: 0.88em; line-height: 1.45; }
  nav.contents ol.sub li { display: inline; margin: 0; }
  nav.contents ol.sub li + li::before { content: " \\00b7  "; color: var(--muted); }
  @media print {
    body { font-size: 11pt; }
    .bar, nav.contents { display: none; }
    main { max-width: none; padding: 0; }
    a { color: inherit; text-decoration: none; }
    h1, h2, h3, h4 { break-after: avoid; }
    pre, blockquote, tr, img { break-inside: avoid; }
    tbody tr:nth-child(even) td { background: none; }
  }
`;

// Renders a complete document page. `backHref` points at the folder's index
// page, relative to the page itself.
export async function renderDocumentPage(source, { filePath, backHref = 'index.html', backLabel = 'Back to folder' } = {}) {
  const title = titleFromMarkdown(source, filePath || 'Document');
  const { body, headings } = renderBody(source, await loadMarked());
  const contentsHtml = renderContents(headings);
  // The contents list follows the title, or opens the page if it has none.
  const withContents = /<\/h1>\n/.test(body)
    ? body.replace(/<\/h1>\n/, (match) => match + contentsHtml)
    : contentsHtml + body;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${DOC_TYPE_META}
  <title>${escapeHtml(title)}</title>
  <style>${DOCUMENT_STYLE}</style>
</head>
<body>
  <header class="bar">
    <a href="${escapeHtml(backHref)}">&larr; ${escapeHtml(backLabel)}</a>
  </header>
  <main>
${withContents}
  </main>
</body>
</html>
`;
}

export async function renderDocumentFile(filePath, options = {}) {
  const source = await fs.readFile(filePath, 'utf8');
  return renderDocumentPage(source, { filePath, ...options });
}
