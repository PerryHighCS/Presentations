#!/usr/bin/env node
/**
 * check-fonts.mjs
 *
 * Fails when a deck asks for a font it never loads. The browser then falls
 * back to whatever the viewer has installed, so text widths (and which lines
 * wrap or overflow) change from machine to machine.
 *
 * For every deck under Decks/, collects the CSS it uses:
 *   - its inline <style> blocks and style="" attributes
 *   - linked local stylesheets (theme.css, etc.) and their local @imports
 *   - SVG font-family="" attributes
 * then takes the first family of every font-family (and font shorthand),
 * resolving var(--name) against the custom properties those sources define.
 * A family passes when a Google Fonts <link> or @import requests it, an
 * @font-face rule defines it, or it is generic or ships with every OS.
 * Fallback families after the first are not checked: they only matter when
 * the first one is missing.
 *
 * Usage:
 *   node scripts/check-fonts.mjs              # every deck
 *   node scripts/check-fonts.mjs Decks/HPy    # one subtree, or deck paths
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { collectDeckFiles } from './permalink-utils.mjs';
import { decodeHtmlEntities } from './site-indexes.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Families that never need loading: CSS keywords and generic families, plus
// fonts installed on both Windows and macOS. Windows has no Helvetica, Times,
// or Courier, but substitutes Arial, Times New Roman, and Courier New, which
// share their metrics, so layout doesn't change. Helvetica Neue has no such
// substitute, so it must be loaded like any other font.
const ALWAYS_AVAILABLE = new Set([
  'inherit', 'initial', 'unset', 'revert',
  'serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'math', 'emoji',
  'system-ui', 'ui-serif', 'ui-sans-serif', 'ui-monospace', 'ui-rounded',
  '-apple-system', 'blinkmacsystemfont',
  'arial', 'helvetica', 'georgia', 'times', 'times new roman',
  'courier', 'courier new', 'verdana', 'tahoma', 'trebuchet ms',
]);

const STYLE_BLOCK_RE = /<style[^>]*>([\s\S]*?)<\/style>/gi;
const STYLE_ATTR_RE = /\sstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
const SVG_FONT_ATTR_RE = /\sfont-family\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
const LINK_RE = /<link\b[^>]*>/gi;
const HREF_RE = /\shref\s*=\s*["']([^"']+)["']/i;
// Google Fonts URLs contain semicolons (wght@400;700), so read the quoted URL whole.
const IMPORT_RE = /@import\s+(?:url\(\s*(?:"([^"]*)"|'([^']*)'|([^)\s]*))\s*\)|"([^"]*)"|'([^']*)')/gi;
const FONT_FACE_RE = /@font-face\s*{[^}]*?font-family\s*:\s*([^;}]+)/gi;
const CUSTOM_PROP_RE = /(--[\w-]+)\s*:\s*([^;}]+)/g;
const FONT_FAMILY_RE = /(?<![\w-])font-family\s*:\s*([^;}]+)/gi;
const FONT_SHORTHAND_RE = /(?<![\w-])font\s*:\s*([^;}]+)/gi;
const COMMENT_RE = /\/\*[\s\S]*?\*\//g;
const HTML_COMMENT_RE = /<!--[\s\S]*?-->/g;

function usageAndExit() {
  console.error('Usage: node scripts/check-fonts.mjs [<deck.html | Decks/subdir> ...]');
  process.exit(1);
}

function normalize(family) {
  return family.trim().replace(/^["']|["']$/g, '').trim().toLowerCase();
}

function importUrl(match) {
  return match.slice(1).find((group) => group !== undefined);
}

// Maps a local stylesheet URL to a file: drops any ?query or #hash (cache
// busting, media fragments) and decodes %-escapes, as the browser would.
function localStylesheetPath(fromFile, href) {
  const pathname = href.split(/[?#]/)[0];
  let decoded = pathname;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    // a malformed escape: leave it, the read below just fails
  }
  return path.resolve(path.dirname(fromFile), decoded);
}

function isRemote(href) {
  return /^(https?:)?\/\//i.test(href);
}

// Google Fonts css/css2 URLs name each family as family=Name+Words:axes.
function googleFamilies(url) {
  if (!/fonts\.googleapis\.com/i.test(url)) {
    return [];
  }
  const query = url.split('?')[1] ?? '';
  return query
    .split('&')
    .filter((param) => param.startsWith('family='))
    .flatMap((param) => decodeURIComponent(param.slice('family='.length).replace(/\+/g, ' ')).split('|'))
    .map((family) => normalize(family.split(':')[0]));
}

// Reads a local stylesheet and the local stylesheets it @imports. Each
// source is { file, css } so failures can say where a font was declared.
async function readStylesheet(absolutePath, sources, seen) {
  if (seen.has(absolutePath)) {
    return;
  }
  seen.add(absolutePath);
  let css;
  try {
    css = await fs.readFile(absolutePath, 'utf8');
  } catch {
    return; // a missing stylesheet is a different problem; leave it to review
  }
  css = css.replace(COMMENT_RE, '');
  sources.push({ file: path.relative(rootDir, absolutePath).split(path.sep).join('/'), css });
  for (const match of css.matchAll(IMPORT_RE)) {
    const href = importUrl(match);
    if (!isRemote(href)) {
      await readStylesheet(localStylesheetPath(absolutePath, href), sources, seen);
    }
  }
}

async function collectSources(deck) {
  // A commented-out <link> loads nothing and a commented-out rule asks for nothing.
  const html = (await fs.readFile(deck.absolutePath, 'utf8')).replace(HTML_COMMENT_RE, '');
  const deckFile = `Decks/${deck.publicPath}`;
  const sources = [];
  const remoteUrls = [];
  const seen = new Set();

  for (const [, block] of html.matchAll(STYLE_BLOCK_RE)) {
    const css = block.replace(COMMENT_RE, '');
    sources.push({ file: deckFile, css });
    for (const match of css.matchAll(IMPORT_RE)) {
      const href = importUrl(match);
      if (!isRemote(href)) {
        await readStylesheet(localStylesheetPath(deck.absolutePath, href), sources, seen);
      }
    }
  }
  for (const [tag] of html.matchAll(LINK_RE)) {
    const rawHref = tag.match(HREF_RE)?.[1];
    const href = rawHref && decodeHtmlEntities(rawHref); // ?family=A&amp;family=B
    if (!href || !/rel\s*=\s*["']?stylesheet/i.test(tag)) {
      continue;
    }
    if (isRemote(href)) {
      remoteUrls.push(href);
    } else if (!href.includes('runtime/syncdeck-reveal/')) {
      // The SyncDeck runtime styles its own overlay, not slide content.
      await readStylesheet(localStylesheetPath(deck.absolutePath, href), sources, seen);
    }
  }
  // Attribute values reach CSS with their character references decoded (&quot;).
  for (const match of html.matchAll(STYLE_ATTR_RE)) {
    sources.push({ file: deckFile, css: decodeHtmlEntities(match[1] ?? match[2]).replace(COMMENT_RE, '') });
  }
  const svgFamilies = [...html.matchAll(SVG_FONT_ATTR_RE)].map((match) => decodeHtmlEntities(match[1] ?? match[2]));
  return { sources, remoteUrls, svgFamilies, deckFile };
}

// Splits on the first top-level comma, ignoring commas inside quotes or
// parentheses, so var(--a, b) and "Font, Inc" stay whole.
function splitFirst(value) {
  let depth = 0;
  let quote = null;
  for (let i = 0; i < value.length; i++) {
    const ch = value[i];
    if (quote) {
      if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === '(') {
      depth++;
    } else if (ch === ')') {
      depth--;
    } else if (ch === ',' && depth === 0) {
      return [value.slice(0, i), value.slice(i + 1)];
    }
  }
  return [value, null];
}

// Returns every family that could end up first in a font-family value,
// expanding var(--name) (and its fallback, which may hold more var()s) into
// each value the deck defines for it, so a family set in a theme token is
// checked like a literal.
function firstFamilies(value, customProps, depth = 0) {
  const [first, rest] = splitFirst(value.replace(/\s*!important\s*$/i, '').trim());
  const match = first.trim().match(/^var\(\s*(--[\w-]+)\s*(?:,([\s\S]*))?\)$/);
  if (!match) {
    return [first.trim()];
  }
  if (depth > 10) {
    return [];
  }
  // var() substitutes text, so whatever follows it in the list stays a fallback.
  const tail = rest === null ? '' : `, ${rest}`;
  const defined = customProps.get(match[1]);
  if (defined?.length) {
    return defined.flatMap((v) => firstFamilies(v + tail, customProps, depth + 1));
  }
  // An undefined variable with no fallback makes the declaration invalid,
  // so the element inherits its font instead; nothing to check here.
  return match[2] !== undefined ? firstFamilies(match[2] + tail, customProps, depth + 1) : [];
}

// Substitutes every var() in a value with each text the deck defines for it
// (or its fallback), returning each fully expanded value. An undefined
// variable with no fallback makes the declaration invalid, so it yields none.
function expandVars(value, customProps, depth = 0) {
  const start = value.indexOf('var(');
  if (start === -1) {
    return [value];
  }
  if (depth > 20) {
    return [];
  }
  let end = start + 'var('.length;
  for (let open = 1; end < value.length && open; end++) {
    if (value[end] === '(') open++;
    else if (value[end] === ')') open--;
  }
  const inner = value.slice(start + 'var('.length, end - 1);
  const [name, fallback] = splitFirst(inner);
  const defined = customProps.get(name.trim());
  const replacements = defined?.length ? defined : fallback !== null ? [fallback.trim()] : [];
  return replacements.flatMap((text) =>
    expandVars(value.slice(0, start) + text + value.slice(end), customProps, depth + 1));
}

// Splits a value on top-level whitespace and slashes (keeping each "/" as its
// own token), leaving quoted strings and parenthesized groups whole.
function shorthandTokens(value) {
  const tokens = [];
  let current = '';
  let depth = 0;
  let quote = null;
  const flush = () => {
    if (current) tokens.push(current);
    current = '';
  };
  for (const ch of value) {
    if (quote) {
      current += ch;
      if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      current += ch;
      quote = ch;
    } else if (ch === '(' || ch === ')') {
      depth += ch === '(' ? 1 : -1;
      current += ch;
    } else if (depth === 0 && /\s/.test(ch)) {
      flush();
    } else if (depth === 0 && ch === '/') {
      flush();
      tokens.push('/');
    } else {
      current += ch;
    }
  }
  flush();
  return tokens;
}

const FONT_SIZE_RE = /^(?:[\d.]+(?:px|em|rem|pt|pc|cm|mm|in|q|ch|ex|vw|vh|vmin|vmax|%)|(?:calc|clamp|min|max)\(.*\)|xx-small|x-small|small|medium|large|x-large|xx-large|xxx-large|larger|smaller)$/i;

// The family list of a font shorthand follows the size and an optional
// /line-height (a number, length, or normal): "700 24px/1.5 'Fira Code', monospace".
// Call it on a value whose var()s are already expanded.
function shorthandFamilies(value) {
  const tokens = shorthandTokens(value);
  const size = tokens.findIndex((token) => FONT_SIZE_RE.test(token));
  if (size === -1) {
    return null; // a system font keyword like "caption", or not a font value
  }
  const familiesAt = tokens[size + 1] === '/' ? size + 3 : size + 1;
  const families = tokens.slice(familiesAt).join(' ');
  return families || null;
}

async function checkDeck(deck) {
  const { sources, remoteUrls, svgFamilies, deckFile } = await collectSources(deck);
  const loaded = new Set(remoteUrls.flatMap(googleFamilies));
  const customProps = new Map();
  const usages = []; // { value, file, declaration }

  for (const { file, css } of sources) {
    for (const match of css.matchAll(IMPORT_RE)) {
      googleFamilies(importUrl(match)).forEach((family) => loaded.add(family));
    }
    for (const [, family] of css.matchAll(FONT_FACE_RE)) {
      loaded.add(normalize(family));
    }
    for (const [, name, value] of css.matchAll(CUSTOM_PROP_RE)) {
      if (!customProps.has(name)) {
        customProps.set(name, []);
      }
      customProps.get(name).push(value.trim());
    }
    for (const [declaration, value] of css.matchAll(FONT_FAMILY_RE)) {
      usages.push({ value: value.trim(), file, declaration: declaration.trim() });
    }
    for (const [declaration, value] of css.matchAll(FONT_SHORTHAND_RE)) {
      usages.push({ value: value.trim(), file, declaration: declaration.trim(), shorthand: true });
    }
  }
  for (const value of svgFamilies) {
    usages.push({ value, file: deckFile, declaration: `font-family="${value}"` });
  }

  const missing = new Map(); // normalized family -> { family, usage } for the first declaration asking for it
  for (const usage of usages) {
    // Expand shorthands only now, once every source's custom properties are known.
    const familyLists = usage.shorthand
      ? expandVars(usage.value.replace(/\s*!important\s*$/i, ''), customProps).map(shorthandFamilies).filter(Boolean)
      : [usage.value];
    for (const first of familyLists.flatMap((list) => firstFamilies(list, customProps))) {
      const family = first.replace(/^["']|["']$/g, '');
      const key = normalize(family);
      if (key && !ALWAYS_AVAILABLE.has(key) && !loaded.has(key) && !missing.has(key)) {
        missing.set(key, { family, usage });
      }
    }
  }
  return [...missing.values()];
}

async function selectDecks(args) {
  const decks = await collectDeckFiles(rootDir);
  if (!args.length) {
    return decks;
  }
  const prefixes = args.map((arg) => {
    const rel = path.relative(rootDir, path.resolve(process.cwd(), arg)).split(path.sep).join('/');
    if (!rel.startsWith('Decks')) {
      console.error(`Not under Decks/: ${arg}`);
      process.exit(1);
    }
    return rel.slice('Decks/'.length);
  });
  return decks.filter((deck) => prefixes.some((prefix) => !prefix || deck.publicPath === prefix || deck.publicPath.startsWith(`${prefix}/`)));
}

async function main() {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg.startsWith('-'))) {
    usageAndExit();
  }
  const decks = await selectDecks(args);
  const failures = [];
  for (const deck of decks) {
    for (const { family, usage } of await checkDeck(deck)) {
      failures.push(
        `${deck.publicPath}: "${family}" is never loaded (${usage.file}: ${usage.declaration}). ` +
          'Add it to a Google Fonts <link> or @import, or define it with @font-face.'
      );
    }
  }
  if (failures.length) {
    console.error(`Font check failed with ${failures.length} issue(s):\n`);
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }
  console.log(`Font check passed for ${decks.length} deck(s).`);
}

await main();
