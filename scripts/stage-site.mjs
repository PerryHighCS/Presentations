import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { isMarkdownPath, markdownToHtmlPath, renderDocumentFile } from './markdown-pages.mjs';
import { getNormalizedMounts, loadManifestRules, walkMountedFiles } from './site-utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const siteDir = path.join(rootDir, '.build', 'site');

async function main() {
  await fs.rm(siteDir, { recursive: true, force: true });
  await fs.mkdir(siteDir, { recursive: true });

  const mounts = getNormalizedMounts();
  const manifestRules = await loadManifestRules(rootDir, { mode: 'publish' });

  let copiedFiles = 0;
  const documents = [];
  await walkMountedFiles(rootDir, manifestRules, async (file) => {
    if (isMarkdownPath(file.publicRelativePath)) {
      documents.push(file);
      return;
    }
    const destPath = path.join(siteDir, file.publicRelativePath);
    await fs.mkdir(path.dirname(destPath), { recursive: true });
    await fs.copyFile(file.sourceAbsolutePath, destPath);
    copiedFiles += 1;
  });

  // Documents are rendered after the copy so a Markdown page can never
  // silently replace a presentation that has the same name.
  for (const file of documents) {
    // index.html is each folder's generated listing, which would replace
    // the rendered document later in the build.
    if (path.posix.basename(file.publicRelativePath).toLowerCase() === 'index.md') {
      throw new Error(`${file.sourceRepoRelative}: index.md is reserved for the folder's index page. Rename the document.`);
    }
    const publicPath = markdownToHtmlPath(file.publicRelativePath);
    const destPath = path.join(siteDir, publicPath);
    try {
      await fs.access(destPath);
      throw new Error(`${file.sourceRepoRelative} would be published as ${publicPath}, which already exists. Rename one of them.`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
    await fs.mkdir(path.dirname(destPath), { recursive: true });
    await fs.writeFile(destPath, await renderDocumentFile(file.sourceAbsolutePath), 'utf8');
  }

  const totalRules = manifestRules.reduce(
    (sum, entry) => sum + entry.includes.length + entry.excludes.length,
    0
  );

  console.log(`Staged ${copiedFiles} file(s) into ${path.relative(rootDir, siteDir)}.`);
  console.log(`Rendered ${documents.length} document page(s) from Markdown.`);
  console.log(`Applied ${totalRules} manifest rule(s) across ${mounts.length} mount(s).`);
}

await main();
