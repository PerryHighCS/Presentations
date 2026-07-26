import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  collectDeckFiles,
  computeUniqueHash,
  extractPermalinkHash,
  extractTitle,
  insertPermalinkTag,
  loadManifest,
  saveManifest,
} from './permalink-utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

function usageAndExit() {
  console.error(
    'Usage:\n' +
      '  node scripts/generate-permalink.mjs <deck.html> [<deck2.html> ...]\n' +
      '  node scripts/generate-permalink.mjs --all\n' +
      '  node scripts/generate-permalink.mjs --check'
  );
  process.exit(1);
}

function stemFor(publicPath) {
  return path.posix.basename(publicPath, path.posix.extname(publicPath));
}

// Idempotent: safe to re-run against a deck that already has a permalink.
// Assigns a new hash only when the deck has none yet; otherwise just keeps
// the manifest's cached path/title in sync with the deck's current location.
async function ensurePermalink(deck, manifest) {
  const html = await fs.readFile(deck.absolutePath, 'utf8');
  const existingHash = extractPermalinkHash(html);
  const title = extractTitle(html) || stemFor(deck.publicPath);

  if (existingHash) {
    const entry = manifest[existingHash];
    if (!entry || entry.path !== deck.publicPath || entry.title !== title) {
      manifest[existingHash] = { path: deck.publicPath, title };
      console.log(`Synced manifest for existing permalink ${existingHash} -> ${deck.publicPath}`);
    }
    return;
  }

  const stem = stemFor(deck.publicPath);
  const hash = computeUniqueHash(stem, manifest, { excludePath: deck.publicPath });
  const updatedHtml = insertPermalinkTag(html, hash);
  await fs.writeFile(deck.absolutePath, updatedHtml, 'utf8');
  manifest[hash] = { path: deck.publicPath, title };
  console.log(`Assigned permalink ${hash} -> ${deck.publicPath}`);
}

async function runAdd(targetPaths) {
  const manifest = await loadManifest(rootDir);

  const decks = targetPaths.map((targetPath) => {
    const absolutePath = path.resolve(process.cwd(), targetPath);
    const relFromRoot = path.relative(rootDir, absolutePath).split(path.sep).join('/');
    if (!relFromRoot.startsWith('Decks/')) {
      console.error(`Not a deck under Decks/: ${targetPath}`);
      process.exit(1);
    }
    return { publicPath: relFromRoot.slice('Decks/'.length), absolutePath };
  });

  for (const deck of decks) {
    await ensurePermalink(deck, manifest);
  }

  await saveManifest(rootDir, manifest);
}

async function runAll() {
  const manifest = await loadManifest(rootDir);
  const decks = await collectDeckFiles(rootDir);

  for (const deck of decks) {
    await ensurePermalink(deck, manifest);
  }

  await saveManifest(rootDir, manifest);
}

async function runCheck() {
  const manifest = await loadManifest(rootDir);
  const decks = await collectDeckFiles(rootDir);
  const failures = [];
  const hashToDecks = new Map();

  for (const deck of decks) {
    const html = await fs.readFile(deck.absolutePath, 'utf8');
    const hash = extractPermalinkHash(html);

    if (!hash) {
      failures.push(
        `Missing syncdeck-permalink meta tag: ${deck.publicPath}\n` +
          `    Fix: node scripts/generate-permalink.mjs Decks/${deck.publicPath}`
      );
      continue;
    }

    if (!hashToDecks.has(hash)) {
      hashToDecks.set(hash, []);
    }
    hashToDecks.get(hash).push(deck.publicPath);

    const entry = manifest[hash];
    if (!entry) {
      failures.push(
        `Deck has permalink "${hash}" but no manifest entry: ${deck.publicPath}\n` +
          `    Fix: node scripts/generate-permalink.mjs --all`
      );
    } else if (entry.path !== deck.publicPath) {
      failures.push(
        `Manifest entry for "${hash}" points at "${entry.path}" but that deck is now at ` +
          `"${deck.publicPath}"\n` +
          `    Fix: node scripts/generate-permalink.mjs --all`
      );
    }
  }

  for (const [hash, paths] of hashToDecks) {
    if (paths.length > 1) {
      failures.push(`Duplicate permalink hash "${hash}" used by: ${paths.join(', ')}`);
    }
  }

  for (const hash of Object.keys(manifest)) {
    const entry = manifest[hash];
    const deckExists = decks.some((deck) => deck.publicPath === entry.path);
    if (!deckExists) {
      failures.push(
        `Manifest entry "${hash}" points at "${entry.path}", which no longer exists.\n` +
          `    Fix: remove the entry from config/permalinks.json if the deck was deleted intentionally.`
      );
    }
  }

  if (failures.length) {
    console.error(`Permalink check failed with ${failures.length} issue(s):\n`);
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log(`Permalink check passed for ${decks.length} deck(s).`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    usageAndExit();
  }
  if (args.includes('--check')) {
    await runCheck();
    return;
  }
  if (args.includes('--all')) {
    await runAll();
    return;
  }
  await runAdd(args);
}

await main();
