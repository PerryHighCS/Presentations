#!/usr/bin/env node
/**
 * check-css-coverage.mjs
 *
 * For every HTML deck under Decks/, reports class names used in markup
 * that have no matching CSS selector in:
 *   - the file's own inline <style> blocks
 *   - any linked local stylesheets (theme.css, etc.)
 *   - the built SyncDeck-Reveal runtime stylesheet
 *
 * Usage:
 *   node scripts/check-css-coverage.mjs              # all decks
 *   node scripts/check-css-coverage.mjs Decks/AR1    # one subtree
 *   node scripts/check-css-coverage.mjs Decks/AR1/DCCircuits/EX1_Intro_DC_Circuits.html
 */

import fs   from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT  = path.resolve(__dirname, '..');
const DECKS_DIR  = path.join(REPO_ROOT, 'Decks');
const RUNTIME_CSS = path.join(REPO_ROOT, 'vendor/SyncDeck-Reveal/dist/syncdeck-reveal.css');

// ── Classes injected at runtime by JS (never appear in any stylesheet) ──────

const RUNTIME_INJECTED = new Set([
  // Reveal.js slide state
  'present', 'past', 'future', 'visible', 'hidden', 'loaded', 'ready',
  'current-fragment', 'no-transition', 'print-pdf',
  'has-dark-background', 'has-light-background', 'has-invisible-background',
  // Reveal fragment type alias: fade-in is the default fragment behavior and
  // has no explicit CSS rule — adding it to a fragment is a semantic no-op.
  'fade-in',
  // Toggled by JS in these decks
  'open', 'active', 'disabled',
]);

// Class name prefixes that belong to third-party libs loaded at runtime
const IGNORE_PREFIXES = ['r-', 'reveal-', 'hljs', 'navigate-'];

// ── Helpers ──────────────────────────────────────────────────────────────────

function walkHtml(target) {
  const stat = fs.statSync(target);
  if (stat.isFile()) return target.endsWith('.html') ? [target] : [];
  const results = [];
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    const full = path.join(target, entry.name);
    if (entry.isDirectory()) results.push(...walkHtml(full));
    else if (entry.isFile() && entry.name.endsWith('.html')) results.push(full);
  }
  return results;
}

/** All class names referenced in class="..." attributes (strips style/script blocks first). */
function classesUsedInHTML(html) {
  const used = new Set();
  const stripped = html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '');
  const re = /\bclass\s*=\s*(?:"([^"]*?)"|'([^']*?)')/gi;
  let m;
  while ((m = re.exec(stripped)) !== null) {
    for (const cls of (m[1] ?? m[2]).split(/\s+/)) {
      if (cls) used.add(cls);
    }
  }
  return used;
}

/** All class names that appear as selectors in a CSS string. */
function classesDefinedInCSS(css) {
  const defined = new Set();
  // Strip comments before scanning
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const re = /\.(-?[a-zA-Z_][a-zA-Z0-9_-]*)/g;
  let m;
  while ((m = re.exec(stripped)) !== null) defined.add(m[1]);
  return defined;
}

/** Classes defined in all inline <style> blocks. */
function inlineDefinedClasses(html) {
  const defined = new Set();
  const re = /<style[\s\S]*?>([\s\S]*?)<\/style>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    for (const cls of classesDefinedInCSS(m[1])) defined.add(cls);
  }
  return defined;
}

/** Classes defined in linked local stylesheets (skips CDN and the runtime bundle). */
function linkedDefinedClasses(htmlPath, html) {
  const dir     = path.dirname(htmlPath);
  const defined = new Set();
  const re = /<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const href = m[1];
    if (href.startsWith('http') || href.includes('syncdeck-reveal')) continue;
    const cssPath = path.resolve(dir, href);
    if (fs.existsSync(cssPath)) {
      for (const cls of classesDefinedInCSS(fs.readFileSync(cssPath, 'utf8')))
        defined.add(cls);
    }
  }
  return defined;
}

function shouldIgnore(cls) {
  if (RUNTIME_INJECTED.has(cls)) return true;
  for (const prefix of IGNORE_PREFIXES) {
    if (cls.startsWith(prefix)) return true;
  }
  return false;
}

// ── Load runtime CSS once ────────────────────────────────────────────────────

const runtimeDefined = new Set();
if (fs.existsSync(RUNTIME_CSS)) {
  for (const cls of classesDefinedInCSS(fs.readFileSync(RUNTIME_CSS, 'utf8')))
    runtimeDefined.add(cls);
  console.log(`Runtime CSS: ${runtimeDefined.size} selectors from syncdeck-reveal.css\n`);
} else {
  console.warn('Warning: runtime CSS not found. Run `npm run build` inside vendor/SyncDeck-Reveal first.\n');
}

// ── Main ─────────────────────────────────────────────────────────────────────

const searchRoot = process.argv[2]
  ? path.resolve(REPO_ROOT, process.argv[2])
  : DECKS_DIR;

const htmlFiles = walkHtml(searchRoot);
let filesMissing = 0;
let totalMissing = 0;

for (const htmlPath of htmlFiles) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const rel  = path.relative(REPO_ROOT, htmlPath);

  const defined = new Set([
    ...runtimeDefined,
    ...inlineDefinedClasses(html),
    ...linkedDefinedClasses(htmlPath, html),
  ]);

  const missing = [...classesUsedInHTML(html)]
    .filter(cls => !defined.has(cls) && !shouldIgnore(cls))
    .sort();

  if (missing.length > 0) {
    console.log(`${rel}  (${missing.length} missing)`);
    for (const cls of missing) console.log(`  .${cls}`);
    console.log();
    filesMissing++;
    totalMissing += missing.length;
  }
}

if (totalMissing === 0) {
  console.log(`✓ All CSS classes accounted for across ${htmlFiles.length} file(s).`);
  process.exit(0);
} else {
  console.log(`${totalMissing} undefined class(es) across ${filesMissing}/${htmlFiles.length} file(s).`);
  process.exit(1);
}
