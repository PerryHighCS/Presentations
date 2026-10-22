import fs from 'node:fs/promises';
import path from 'node:path';

export const projectsRelativePath = 'config/projects.json';

// Space-separated ids of the projects (from config/projects.json) this deck
// has been completed for. A project missing from the list is not done yet.
const PROJECTS_META_NAME = 'syncdeck-projects';
const PROJECTS_META_RE = new RegExp(
  `[ \\t]*<meta\\s+name=["']${PROJECTS_META_NAME}["']\\s+content=["']([^"']*)["']\\s*/?>[ \\t]*\\r?\\n?`,
  'i'
);
const PERMALINK_META_RE = /<meta\s+name=["']syncdeck-permalink["'][^>]*>/i;
const HEAD_OPEN_RE = /<head[^>]*>/i;
const PROJECT_ID_RE = /^[a-z0-9][a-z0-9-]*$/;

// Returns the registry as an ordered array of
// { id, title, issue, symbol, scope, complete } where `scope` is a list of
// public path prefixes (e.g. "CSP/") the project applies to, or null for every
// deck, and `complete` marks a finished project: its id stays valid in deck
// tags, but the index pages and the default report no longer show it.
export async function loadProjects(rootDir) {
  const raw = await fs.readFile(path.join(rootDir, projectsRelativePath), 'utf8');
  const parsed = JSON.parse(raw);
  return Object.entries(parsed).map(([id, entry]) => {
    if (!PROJECT_ID_RE.test(id)) {
      throw new Error(`Invalid project id "${id}" in ${projectsRelativePath}: use lowercase kebab-case`);
    }
    if (!entry.title || !entry.symbol) {
      throw new Error(`Project "${id}" in ${projectsRelativePath} needs a title and a symbol`);
    }
    return {
      id,
      title: entry.title,
      issue: entry.issue ?? null,
      symbol: entry.symbol,
      scope: Array.isArray(entry.scope) && entry.scope.length ? entry.scope : null,
      complete: entry.complete === true,
    };
  });
}

export function projectAppliesTo(project, publicPath) {
  return !project.scope || project.scope.some((prefix) => publicPath.startsWith(prefix));
}

export function extractCompletedProjects(html) {
  const match = html.match(PROJECTS_META_RE);
  return match ? match[1].split(/\s+/).filter(Boolean) : [];
}

// Rewrites (or inserts, or removes when `ids` is empty) the deck's
// syncdeck-projects tag, keeping it right after the permalink tag.
export function setCompletedProjects(html, ids) {
  const stripped = html.replace(PROJECTS_META_RE, '');
  if (!ids.length) {
    return stripped;
  }
  const tag = `<meta name="${PROJECTS_META_NAME}" content="${ids.join(' ')}">`;
  if (PERMALINK_META_RE.test(stripped)) {
    return stripped.replace(PERMALINK_META_RE, (match) => `${match}\n${tag}`);
  }
  if (!HEAD_OPEN_RE.test(stripped)) {
    throw new Error('No <head> tag found');
  }
  return stripped.replace(HEAD_OPEN_RE, (match) => `${match}\n${tag}`);
}

export async function completedProjectsForFile(filePath) {
  try {
    return extractCompletedProjects(await fs.readFile(filePath, 'utf8'));
  } catch {
    return [];
  }
}
