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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Families that never need loading: CSS keywords and generic families, plus
// fonts installed on every Windows and macOS machine students use.
const ALWAYS_AVAILABLE = new Set([
  'inherit', 'initial', 'unset', 'revert',
  'serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'math', 'emoji',
  'system-ui', 'ui-serif', 'ui-sans-serif', 'ui-monospace', 'ui-rounded',
  '-apple-system', 'blinkmacsystemfont',
  'arial', 'helvetica', 'helvetica neue', 'georgia', 'times', 'times new roman',
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
      await readStylesheet(path.resolve(path.dirname(absolutePath), href), sources, seen);
    }
  }
}

async function collectSources(deck) {
  const html = await fs.readFile(deck.absolutePath, 'utf8');
  const deckFile = `Decks/${deck.publicPath}`;
  const sources = [];
  const remoteUrls = [];
  const seen = new Set();

  for (const [, css] of html.matchAll(STYLE_BLOCK_RE)) {
    sources.push({ file: deckFile, css: css.replace(COMMENT_RE, '') });
  }
  for (const [tag] of html.matchAll(LINK_RE)) {
    const href = tag.match(HREF_RE)?.[1];
    if (!href || !/rel\s*=\s*["']?stylesheet/i.test(tag)) {
      continue;
    }
    if (isRemote(href)) {
      remoteUrls.push(href);
    } else if (!href.includes('runtime/syncdeck-reveal/')) {
      // The SyncDeck runtime styles its own overlay, not slide content.
      await readStylesheet(path.resolve(path.dirname(deck.absolutePath), href), sources, seen);
    }
  }
  for (const match of html.matchAll(STYLE_ATTR_RE)) {
    sources.push({ file: deckFile, css: match[1] ?? match[2] });
  }
  const svgFamilies = [...html.matchAll(SVG_FONT_ATTR_RE)].map((match) => match[1] ?? match[2]);
  return { sources, remoteUrls, svgFamilies, deckFile };
}

// Expands var(--name) (with an optional fallback) into every value the deck
// defines for it, so a family set in a theme token is checked like a literal.
function resolveValues(value, customProps, depth = 0) {
  const match = value.match(/^\s*var\(\s*(--[\w-]+)\s*(?:,\s*([^)]*))?\)\s*$/);
  if (!match || depth > 10) {
    return [value];
  }
  const defined = customProps.get(match[1]);
  if (defined?.length) {
    return defined.flatMap((v) => resolveValues(v, customProps, depth + 1));
  }
  return match[2] ? resolveValues(match[2], customProps, depth + 1) : [];
}

// The family list of a font shorthand follows the size (and optional
// line-height): "700 24px/1.5 'Fira Code', monospace".
function shorthandFamilies(value) {
  const match = value.match(/[\d.]+(?:px|em|rem|pt|%)(?:\s*\/\s*[\d.]+\w*)?\s+(.+)$/);
  return match ? match[1] : null;
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
      const families = shorthandFamilies(value.trim());
      if (families) {
        usages.push({ value: families, file, declaration: declaration.trim() });
      }
    }
  }
  for (const value of svgFamilies) {
    usages.push({ value, file: deckFile, declaration: `font-family="${value}"` });
  }

  const missing = new Map(); // normalized family -> { family, usage } for the first declaration asking for it
  for (const usage of usages) {
    for (const value of resolveValues(usage.value, customProps)) {
      const family = value.split(',')[0].trim().replace(/^["']|["']$/g, '');
      const key = normalize(family);
      if (key && !key.startsWith('var(') && !ALWAYS_AVAILABLE.has(key) && !loaded.has(key) && !missing.has(key)) {
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
