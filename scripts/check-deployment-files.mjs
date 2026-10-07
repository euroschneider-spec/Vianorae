import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import ignore from 'ignore';

// Vercel applies gitignore-style rules before installation/build, unlike next build.
const rules = await readFile('.vercelignore', 'utf8');
async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.filter(entry => !['.temp', '.branches'].includes(entry.name)).map(async entry => {
    const path = `${directory}/${entry.name}`;
    return entry.isDirectory() ? listFiles(path) : [path];
  }))).flat();
}
const roots = ['src', 'public', 'supabase', 'scripts', 'tests', 'docs', '.github'];
const buildInputs = ['package.json', 'package-lock.json', 'next.config.ts', 'tsconfig.json'];
const files = [...(await Promise.all(roots.map(listFiles))).flat(), ...buildInputs];
const matcher = ignore().add(rules);
const included = files.filter(file => !matcher.ignores(file));
const runtime = files.filter(file => file.startsWith('src/') || file.startsWith('public/'));
assert.ok(runtime.length > 0, 'Expected application source and public assets');
for (const file of runtime) assert.ok(included.includes(file), `Deployment excludes runtime file: ${file}`);
for (const file of buildInputs) {
  await readFile(file);
  assert.ok(included.includes(file), `Deployment excludes build input: ${file}`);
}
for (const file of files.filter(file => /^(supabase|scripts|tests|docs|\.github)\//.test(file))) {
  assert.ok(!included.includes(file), `Deployment includes root tooling: ${file}`);
}
console.log(`PASS deployment packaging: all ${runtime.length} runtime files and build inputs retained; root tooling excluded.`);
