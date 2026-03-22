import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getNormalizedMounts, loadManifestRules, walkMountedFiles } from './site-utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const siteDir = path.join(rootDir, '_site');

async function main() {
  await fs.rm(siteDir, { recursive: true, force: true });
  await fs.mkdir(siteDir, { recursive: true });

  const mounts = getNormalizedMounts();
  const manifestRules = await loadManifestRules(rootDir, { mode: 'publish' });

  let copiedFiles = 0;
  await walkMountedFiles(rootDir, manifestRules, async (file) => {
    const destPath = path.join(siteDir, file.publicRelativePath);
    await fs.mkdir(path.dirname(destPath), { recursive: true });
    await fs.copyFile(file.sourceAbsolutePath, destPath);
    copiedFiles += 1;
  });

  const totalRules = manifestRules.reduce(
    (sum, entry) => sum + entry.includes.length + entry.excludes.length,
    0
  );

  console.log(`Staged ${copiedFiles} file(s) into ${path.relative(rootDir, siteDir)}.`);
  console.log(`Applied ${totalRules} manifest rule(s) across ${mounts.length} mount(s).`);
}

await main();
