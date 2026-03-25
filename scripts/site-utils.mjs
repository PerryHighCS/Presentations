import fs from 'node:fs/promises';
import path from 'node:path';

import { siteMounts } from '../config/site-map.mjs';

export const manifestName = '.pages-manifest';

export const defaultDirExcludes = new Set([
  '.git',
  '.github',
  '.devcontainer',
  '.vscode',
  '.agent',
  '.claude',
  '.build',
  'build',
  '_site',
  'node_modules',
]);

export const defaultFileExcludes = new Set([
  'AGENTS.md',
  'CLAUDE.md',
  'README.md',
  'LICENSE',
  'LICENSE.md',
  '.gitignore',
  '.gitattributes',
  '.gitmodules',
  '.editorconfig',
  'CODEOWNERS',
]);

function toPosix(value) {
  return value.split(path.sep).join('/');
}

function trimLeadingSlash(value) {
  return value.replace(/^\/+/, '');
}

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '');
}

export function normalizeMount(mount) {
  const publicPath = '/' + trimLeadingSlash(trimTrailingSlash(mount.publicPath || ''));
  const sourcePath = trimTrailingSlash(toPosix(mount.sourcePath || ''));
  return {
    publicPath,
    sourcePath,
  };
}

export function getNormalizedMounts() {
  return siteMounts.map(normalizeMount);
}

export function publicPathToSegments(publicPath) {
  return trimLeadingSlash(trimTrailingSlash(publicPath)).split('/').filter(Boolean);
}

export function pathIsWithin(relPosix, base) {
  return base === '.' || relPosix === base || relPosix.startsWith(base + '/');
}

export function includeAllows(relPosix, isDir, rule) {
  const rulePath = rule.path;
  if (rule.isDir) {
    if (relPosix === rulePath || relPosix.startsWith(rulePath + '/')) {
      return true;
    }
    if (isDir && rulePath.startsWith(relPosix + '/')) {
      return true;
    }
    return false;
  }
  if (relPosix === rulePath) {
    return true;
  }
  if (isDir && rulePath.startsWith(relPosix + '/')) {
    return true;
  }
  return false;
}

export async function loadManifestRules(rootDir, options = {}) {
  const mode = options.mode === 'dev' ? 'dev' : 'publish';
  const manifestPaths = [];

  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const absolutePath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (defaultDirExcludes.has(entry.name)) {
          continue;
        }
        await walk(absolutePath);
        continue;
      }
      if (entry.isFile() && entry.name === manifestName) {
        manifestPaths.push(absolutePath);
      }
    }
  }

  await walk(rootDir);

  const rules = [];
  for (const manifestPath of manifestPaths.sort()) {
    const manifestBase = toPosix(path.relative(rootDir, path.dirname(manifestPath))) || '.';
    const entry = {
      base: manifestBase,
      manifest: toPosix(path.relative(rootDir, manifestPath)),
      includes: [],
      excludes: [],
    };
    const content = await fs.readFile(manifestPath, 'utf8');
    for (const [index, rawLine] of content.split(/\r?\n/).entries()) {
      const lineNumber = index + 1;
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) {
        continue;
      }
      let directive = null;
      if (line.startsWith('include-dev ')) {
        directive = 'include-dev';
      } else if (line.startsWith('exclude-dev ')) {
        directive = 'exclude-dev';
      } else if (line.startsWith('include ')) {
        directive = 'include';
      } else if (line.startsWith('exclude ')) {
        directive = 'exclude';
      } else {
        throw new Error(`Unsupported directive in ${manifestPath}: line ${lineNumber}: ${rawLine}`);
      }
      const value = line.slice(directive.length + 1).trim();
      if (!value) {
        throw new Error(`Empty ${directive} rule in ${manifestPath}: line ${lineNumber}`);
      }
      const isDir = value.endsWith('/');
      let normalized = isDir ? value.slice(0, -1) : value;
      if (normalized.startsWith('./')) {
        normalized = normalized.slice(2);
      }
      if (!normalized) {
        throw new Error(`Invalid ${directive} rule in ${manifestPath}: line ${lineNumber}`);
      }
      const joined = manifestBase !== '.' ? path.posix.join(manifestBase, normalized) : normalized;
      const isDevOnly = directive.endsWith('-dev');
      if (isDevOnly && mode !== 'dev') {
        continue;
      }
      const targetKey = directive.startsWith('include') ? 'includes' : 'excludes';
      entry[targetKey].push({
        path: joined,
        isDir,
        lineNumber,
      });
    }
    rules.push(entry);
  }

  return rules;
}

export function createExclusionChecker(rootDir, manifestRules) {
  return function isExcluded(relPath, isDir) {
    const relPosix = typeof relPath === 'string' ? relPath : toPosix(relPath);
    const parts = relPosix.split('/').filter(Boolean);

    if (parts.some((part) => defaultDirExcludes.has(part))) {
      return true;
    }
    if (!isDir && relPosix.toLowerCase().endsWith('.md')) {
      return true;
    }
    if (defaultFileExcludes.has(path.posix.basename(relPosix))) {
      return true;
    }
    if (path.posix.basename(relPosix) === manifestName) {
      return true;
    }

    for (const manifestRule of manifestRules) {
      if (!pathIsWithin(relPosix, manifestRule.base)) {
        continue;
      }

      if (
        manifestRule.includes.length > 0 &&
        !manifestRule.includes.some((rule) => includeAllows(relPosix, isDir, rule))
      ) {
        return true;
      }

      for (const rule of manifestRule.excludes) {
        const rulePath = rule.path;
        if (rule.isDir) {
          if (relPosix === rulePath || relPosix.startsWith(rulePath + '/')) {
            return true;
          }
        } else if (relPosix === rulePath) {
          return true;
        }
      }
    }

    return false;
  };
}

export async function walkMountedFiles(rootDir, manifestRules, onFile) {
  const mounts = getNormalizedMounts();
  const isExcluded = createExclusionChecker(rootDir, manifestRules);

  for (const mount of mounts) {
    const sourceRoot = path.join(rootDir, mount.sourcePath);
    const publicSegments = publicPathToSegments(mount.publicPath);

    async function walk(relativeDir = '') {
      const absoluteDir = path.join(sourceRoot, relativeDir);
      const entries = await fs.readdir(absoluteDir, { withFileTypes: true });
      for (const entry of entries) {
        const sourceRelative = relativeDir ? path.posix.join(relativeDir, entry.name) : entry.name;
        const sourceRepoRelative = toPosix(path.join(mount.sourcePath, sourceRelative));
        const publicRelative = publicSegments.length
          ? path.posix.join(...publicSegments, sourceRelative)
          : sourceRelative;

        if (entry.isDirectory()) {
          if (isExcluded(sourceRepoRelative, true)) {
            continue;
          }
          await walk(sourceRelative);
          continue;
        }

        if (!entry.isFile()) {
          continue;
        }
        if (isExcluded(sourceRepoRelative, false)) {
          continue;
        }

        await onFile({
          mount,
          sourceAbsolutePath: path.join(sourceRoot, sourceRelative),
          sourceRepoRelative,
          publicRelativePath: publicRelative,
        });
      }
    }

    await walk();
  }
}

export async function collectHtmlFiles(rootDir, manifestRules) {
  const htmlFiles = [];
  await walkMountedFiles(rootDir, manifestRules, async (file) => {
    if (file.publicRelativePath.toLowerCase().endsWith('.html')) {
      htmlFiles.push(file.publicRelativePath);
    }
  });
  htmlFiles.sort((a, b) => a.localeCompare(b));
  return htmlFiles;
}
