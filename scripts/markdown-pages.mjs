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
  // A closing run of # only counts after whitespace, so `# C#` keeps its #.
  const match = source.match(/^#\s+(.+?)(?:\s+#+)?\s*$/m);
  const title = match ? plainText(match[1]) : '';
  return title || path.basename(filePath, path.extname(filePath)).replace(/[-_]/g, ' ').trim();
}

// The Markdown file a generated `plan.html` comes from: `plan.md` with any
// case of extension (`plan.MD` publishes as `plan.html` too), or null.
export async function markdownSourceFor(htmlPath) {
  if (!htmlPath.toLowerCase().endsWith('.html')) {
    return null;
  }
  const dir = path.dirname(htmlPath);
  const stem = path.basename(htmlPath).slice(0, -'.html'.length);
  try {
    const match = (await fs.readdir(dir)).find(
      (name) => name.length === stem.length + 3 && name.startsWith(stem) && name.slice(stem.length).toLowerCase() === '.md'
    );
    return match ? path.join(dir, match) : null;
  } catch {
    return null;
  }
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
  // Ids the page itself uses are reserved, so a heading such as
  // "## Markdown source" can never collide with them.
  const usedIds = new Set(['markdown-source', 'copy-menu']);
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
  // A heading's own links are dropped from its contents entry, so the entry
  // is one link to the section instead of a link nested inside a link.
  const link = (item) => `<a href="#${item.id}">${item.html.replace(/<\/?a\b[^>]*>/gi, '')}</a>`;
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
  /* Copy page, with Copy Markdown behind a chevron menu. */
  .copy-split { position: relative; display: inline-flex; }
  .copy-split > button:first-child { border-radius: 6px 0 0 6px; }
  .copy-split .split-toggle { border-left: 0; border-radius: 0 6px 6px 0; padding: 4px 8px; line-height: 0; }
  .copy-split .split-toggle svg { width: 14px; height: 14px; transition: transform 120ms ease; }
  .copy-split .split-toggle[aria-expanded="true"] svg { transform: rotate(180deg); }
  .copy-menu {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    z-index: 10;
    min-width: 100%;
    padding: 4px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    box-shadow: 0 6px 18px rgba(27, 35, 48, 0.12);
  }
  .bar .copy-menu button { display: block; width: 100%; text-align: left; white-space: nowrap; border: 0; }
  .bar .copy-menu button:hover, .bar .copy-menu button:focus-visible { background: var(--soft); }
  .bar button {
    font: inherit;
    font-size: 14px;
    font-weight: 600;
    color: var(--accent);
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 4px 10px;
    cursor: pointer;
  }
  .bar button:hover { border-color: var(--accent); }
  .bar button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
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

// Browsers copy a selection with every element's computed styles inlined,
// so pasted text arrives with fonts, colors, and margins baked in. This puts
// clean HTML (tags only, no style, class, or id attributes) on the clipboard
// for an ordinary copy, and powers the bar's Copy button (the selection, or
// the whole page) and its menu (Copy page, Copy Markdown). Plain-text pastes
// of the whole page get the Markdown source.
const COPY_SCRIPT = `
(() => {
  const main = document.querySelector('main');
  const markdown = JSON.parse(document.getElementById('markdown-source').textContent);

  // The contents list is left out of whole-page copies only; a selection
  // that includes contents links keeps them.
  // Link and image addresses become absolute, so a pasted copy still points
  // back at this document (a copied "#section" link opens that section here,
  // since the copy drops the heading ids).
  function cleanHtml(node, { wholePage = false } = {}) {
    if (wholePage) node.querySelectorAll('nav.contents').forEach((nav) => nav.remove());
    node.querySelectorAll('a[href], img[src]').forEach((el) => {
      const attr = el.hasAttribute('href') ? 'href' : 'src';
      try {
        el.setAttribute(attr, new URL(el.getAttribute(attr), document.baseURI).href);
      } catch {
        // Leave an address the URL parser rejects as it is.
      }
    });
    node.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('style');
      el.removeAttribute('class');
      el.removeAttribute('id');
    });
    return node.innerHTML;
  }

  // A range's cloned contents leave out the elements around it, so a
  // selection inside a link or a code block would lose them. Rebuild those
  // enclosing elements (link, code, paragraph, list item, table cell, ...)
  // up to the document's <main>.
  function cloneWithAncestors(range) {
    let content = range.cloneContents();
    let node = range.commonAncestorContainer;
    if (node.nodeType !== Node.ELEMENT_NODE) node = node.parentNode;
    while (node && node !== main && main.contains(node)) {
      const shell = node.cloneNode(false);
      shell.appendChild(content);
      content = shell;
      node = node.parentNode;
    }
    return content;
  }

  document.addEventListener('copy', (event) => {
    const selection = document.getSelection();
    if (!selection || selection.isCollapsed || !event.clipboardData) return;
    const holder = document.createElement('div');
    for (let i = 0; i < selection.rangeCount; i++) {
      holder.appendChild(cloneWithAncestors(selection.getRangeAt(i)));
    }
    event.clipboardData.setData('text/html', cleanHtml(holder));
    event.clipboardData.setData('text/plain', selection.toString());
    event.preventDefault();
  });

  async function write(html, text) {
    if (html && window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {
      await navigator.clipboard.write([new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([text], { type: 'text/plain' }),
      })]);
    } else {
      await navigator.clipboard.writeText(text);
    }
  }

  // Copy takes the selection on the page, or the whole page when nothing is
  // selected. The selection is captured on pointerdown, before a click on
  // the button could change it. The menu's choices report back on the main
  // button, since the menu closes as soon as one is picked.
  const mainButton = document.querySelector('[data-copy="auto"]');
  const mainLabel = mainButton.textContent;
  const toggle = document.querySelector('.split-toggle');
  const menu = document.getElementById('copy-menu');
  const items = [...menu.querySelectorAll('[role="menuitem"]')];
  let pressedSelection = null;
  let resetTimer = null;

  // The selection on the page, if any: its range plus the browser's plain
  // text for it, which keeps line breaks and table-cell separators that
  // Range.toString() drops, matching an ordinary copy.
  // Every range is kept: Firefox allows a selection of several separate
  // pieces, and the HTML should hold all of them, as the plain text does.
  function pageSelection() {
    const selection = document.getSelection();
    if (!selection || selection.isCollapsed || !selection.rangeCount) return null;
    const ranges = [];
    for (let i = 0; i < selection.rangeCount; i++) ranges.push(selection.getRangeAt(i).cloneRange());
    return ranges.some((range) => range.intersectsNode(main)) ? { ranges, text: selection.toString() } : null;
  }

  function setMenu(open, focusItem) {
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (open && focusItem) items[0].focus();
  }

  async function copy(kind) {
    if (kind === 'markdown') {
      await write(null, markdown);
      return;
    }
    const selected = kind === 'auto' ? pressedSelection || pageSelection() : null;
    if (selected) {
      const holder = document.createElement('div');
      selected.ranges.forEach((range) => holder.appendChild(cloneWithAncestors(range)));
      await write(cleanHtml(holder), selected.text);
    } else {
      await write(cleanHtml(main.cloneNode(true), { wholePage: true }), markdown);
    }
  }

  mainButton.addEventListener('pointerdown', () => { pressedSelection = pageSelection(); });

  document.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      const fromMenu = button.getAttribute('role') === 'menuitem';
      setMenu(false);
      // Keep the button's width while its label reads Copied.
      mainButton.style.minWidth = mainButton.offsetWidth + 'px';
      try {
        await copy(button.dataset.copy);
        mainButton.textContent = 'Copied';
      } catch {
        mainButton.textContent = 'Copy failed';
      }
      pressedSelection = null;
      if (fromMenu) toggle.focus();
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => { mainButton.textContent = mainLabel; }, 1500);
    });
  });

  menu.addEventListener('keydown', (event) => {
    const i = items.indexOf(document.activeElement);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      items[(i + step + items.length) % items.length].focus();
    }
  });

  toggle.addEventListener('click', (event) => setMenu(menu.hidden, event.detail === 0));
  document.addEventListener('click', (event) => {
    if (!menu.hidden && !event.target.closest('.copy-split')) setMenu(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !menu.hidden) {
      setMenu(false);
      toggle.focus();
    }
  });
})();
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
    <span class="copy-split">
      <button type="button" data-copy="auto" title="Copy the selected text, or the whole page if nothing is selected">Copy</button>
      <button type="button" class="split-toggle" aria-haspopup="menu" aria-expanded="false" aria-controls="copy-menu" aria-label="More copy options" title="More copy options"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
      <div class="copy-menu" id="copy-menu" role="menu" hidden>
        <button type="button" role="menuitem" data-copy="page" title="Copy the whole document as clean formatted text">Copy page</button>
        <button type="button" role="menuitem" data-copy="markdown" title="Copy the document's Markdown source">Copy Markdown</button>
      </div>
    </span>
  </header>
  <main>
${withContents}
  </main>
  <script type="application/json" id="markdown-source">${JSON.stringify(source).replace(/</g, '\\u003c')}</script>
  <script>${COPY_SCRIPT}</script>
</body>
</html>
`;
}

export async function renderDocumentFile(filePath, options = {}) {
  const source = await fs.readFile(filePath, 'utf8');
  return renderDocumentPage(source, { filePath, ...options });
}
