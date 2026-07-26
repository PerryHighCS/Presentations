import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadManifest, redirectHtml, toRedirectTarget } from './permalink-utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const siteDir = path.resolve(rootDir, process.argv[2] || '.build/site');

async function main() {
  const manifest = await loadManifest(rootDir);
  const permalinkDir = path.join(siteDir, 'p');
  await fs.mkdir(permalinkDir, { recursive: true });

  let count = 0;
  for (const [hash, entry] of Object.entries(manifest)) {
    const target = toRedirectTarget(entry.path);
    const outputPath = path.join(permalinkDir, `${hash}.html`);
    await fs.writeFile(outputPath, redirectHtml(target), 'utf8');
    count += 1;
  }

  console.log(`Generated ${count} permalink redirect(s) in ${path.relative(rootDir, permalinkDir)}/`);
}

await main();
