import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildIndexPages, defaultTitleForFile } from './site-indexes.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const siteDir = path.resolve(rootDir, process.argv[2] || '.build/site');

function isHidden(relPath) {
  return relPath.split('/').some((part) => part.startsWith('.'));
}

async function collectHtmlFiles(baseDir, relativeDir = '') {
  const dir = path.join(baseDir, relativeDir);
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const htmlFiles = [];

  for (const entry of entries) {
    const rel = relativeDir ? path.posix.join(relativeDir, entry.name) : entry.name;
    if (isHidden(rel)) {
      continue;
    }
    const absolute = path.join(baseDir, rel);
    if (entry.isDirectory()) {
      htmlFiles.push(...await collectHtmlFiles(baseDir, rel));
      continue;
    }
    if (entry.isFile() && rel.toLowerCase().endsWith('.html') && path.posix.basename(rel) !== 'index.html') {
      htmlFiles.push(rel);
    }
  }

  return htmlFiles;
}

async function main() {
  const htmlFiles = await collectHtmlFiles(siteDir);
  const pages = await buildIndexPages(htmlFiles, async (publicPath) => {
    return defaultTitleForFile(path.join(siteDir, publicPath));
  });

  for (const [relativePath, html] of pages) {
    const outputPath = path.join(siteDir, relativePath);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, html + '\n', 'utf8');
  }

  const folderCount = [...pages.keys()].filter((item) => item !== 'index.html').length;
  console.log(`Generated root index.html with ${htmlFiles.length} link(s).`);
  console.log(`Generated ${folderCount} folder index.html file(s).`);
}

await main();
