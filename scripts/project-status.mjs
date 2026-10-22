import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { collectDeckFiles } from './permalink-utils.mjs';
import {
  extractCompletedProjects,
  loadProjects,
  projectAppliesTo,
  projectsRelativePath,
  setCompletedProjects,
} from './project-utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

function usageAndExit() {
  console.error(
    'Usage:\n' +
      '  node scripts/project-status.mjs [--pending|--done] [<project> ...] [--under <path>]\n' +
      '  node scripts/project-status.mjs mark <project> <deck.html> [<deck2.html> ...]\n' +
      '  node scripts/project-status.mjs unmark <project> <deck.html> [<deck2.html> ...]\n' +
      '  node scripts/project-status.mjs --check'
  );
  process.exit(1);
}

function toDeck(targetPath) {
  const absolutePath = path.resolve(process.cwd(), targetPath);
  const relFromRoot = path.relative(rootDir, absolutePath).split(path.sep).join('/');
  if (!relFromRoot.startsWith('Decks/') || !relFromRoot.toLowerCase().endsWith('.html')) {
    console.error(`Not a deck under Decks/: ${targetPath}`);
    process.exit(1);
  }
  return { publicPath: relFromRoot.slice('Decks/'.length), absolutePath };
}

function findProject(projects, id) {
  const project = projects.find((p) => p.id === id);
  if (!project) {
    console.error(`Unknown project "${id}". Known: ${projects.map((p) => p.id).join(', ')}`);
    process.exit(1);
  }
  return project;
}

async function runMark(projectId, targetPaths, done) {
  const projects = await loadProjects(rootDir);
  const project = findProject(projects, projectId);
  if (project.complete) {
    console.error(`Project "${project.id}" is complete. Remove "complete" from ${projectsRelativePath} to reopen it.`);
    process.exit(1);
  }
  const order = projects.map((p) => p.id);

  for (const deck of targetPaths.map(toDeck)) {
    if (done && !projectAppliesTo(project, deck.publicPath)) {
      console.error(`Project "${project.id}" does not apply to ${deck.publicPath} (see its scope)`);
      process.exit(1);
    }
    const html = await fs.readFile(deck.absolutePath, 'utf8');
    const current = extractCompletedProjects(html);
    const next = new Set(current);
    if (done) {
      next.add(project.id);
    } else {
      next.delete(project.id);
    }
    const ids = [...next].sort((a, b) => order.indexOf(a) - order.indexOf(b));
    if (ids.join(' ') === current.join(' ')) {
      console.log(`Unchanged: ${deck.publicPath}`);
      continue;
    }
    await fs.writeFile(deck.absolutePath, setCompletedProjects(html, ids), 'utf8');
    console.log(`${done ? 'Marked' : 'Unmarked'} ${project.id}: ${deck.publicPath}`);
  }
}

async function runCheck() {
  const projects = await loadProjects(rootDir);
  const known = new Set(projects.map((p) => p.id));
  const decks = await collectDeckFiles(rootDir);
  const failures = [];

  for (const deck of decks) {
    const ids = extractCompletedProjects(await fs.readFile(deck.absolutePath, 'utf8'));
    for (const id of ids) {
      if (!known.has(id)) {
        failures.push(`Unknown project "${id}" in ${deck.publicPath} (not in ${projectsRelativePath})`);
      } else if (!projectAppliesTo(projects.find((p) => p.id === id), deck.publicPath)) {
        failures.push(`Project "${id}" is marked done in ${deck.publicPath}, which is outside its scope`);
      }
    }
    if (new Set(ids).size !== ids.length) {
      failures.push(`Duplicate project ids in ${deck.publicPath}: ${ids.join(' ')}`);
    }
  }

  if (failures.length) {
    console.error(`Project check failed with ${failures.length} issue(s):\n`);
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }
  console.log(`Project check passed for ${decks.length} deck(s).`);
}

// Prints done/total per course for each project, and optionally the decks
// that are still pending (or already done).
async function runReport(args) {
  const projects = await loadProjects(rootDir);
  let list = null;
  let under = '';
  const ids = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--pending' || args[i] === '--done') {
      list = args[i].slice(2);
    } else if (args[i] === '--under') {
      under = (args[++i] || '').replace(/^Decks\//, '').replace(/^\/+/, '');
    } else if (args[i].startsWith('-')) {
      usageAndExit();
    } else {
      ids.push(args[i]);
    }
  }
  // Completed projects are only reported when named explicitly.
  const selected = ids.length ? ids.map((id) => findProject(projects, id)) : projects.filter((p) => !p.complete);

  const decks = [];
  for (const deck of await collectDeckFiles(rootDir)) {
    if (!deck.publicPath.startsWith(under)) {
      continue;
    }
    const html = await fs.readFile(deck.absolutePath, 'utf8');
    decks.push({ ...deck, done: new Set(extractCompletedProjects(html)) });
  }

  for (const project of selected) {
    const applicable = decks.filter((deck) => projectAppliesTo(project, deck.publicPath));
    const doneCount = applicable.filter((deck) => deck.done.has(project.id)).length;
    const issue = project.issue ? ` (#${project.issue})` : '';
    console.log(`${project.symbol} ${project.id}${issue}: ${project.title}`);
    console.log(`  ${doneCount}/${applicable.length} done`);

    const byCourse = new Map();
    for (const deck of applicable) {
      const course = deck.publicPath.split('/')[0];
      const counts = byCourse.get(course) || { done: 0, total: 0 };
      counts.total += 1;
      counts.done += deck.done.has(project.id) ? 1 : 0;
      byCourse.set(course, counts);
    }
    for (const [course, counts] of byCourse) {
      console.log(`    ${course.padEnd(12)} ${counts.done}/${counts.total}`);
    }

    if (list) {
      const wantDone = list === 'done';
      const listed = applicable.filter((deck) => deck.done.has(project.id) === wantDone);
      console.log(`  ${wantDone ? 'Done' : 'Pending'} (${listed.length}):`);
      for (const deck of listed) {
        console.log(`    Decks/${deck.publicPath}`);
      }
    }
    console.log('');
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === 'mark' || args[0] === 'unmark') {
    if (args.length < 3) {
      usageAndExit();
    }
    await runMark(args[1], args.slice(2), args[0] === 'mark');
    return;
  }
  if (args.includes('--check')) {
    await runCheck();
    return;
  }
  await runReport(args);
}

await main();
