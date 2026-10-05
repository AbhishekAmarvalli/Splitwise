// One-shot installer: downloads Neon agent skills into .agents/skills/ so every
// model/agent in this repo can load them. Verifies the published sha256 digest
// and adds YAML frontmatter (the raw SKILL.md files ship without it).
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';

const BASE = 'https://neon.com';
const REGISTRY = `${BASE}/.well-known/agent-skills`;
const DEST = '.agents/skills';

// Matches `neon skills -y` (the CLI also skips this one).
const SKIP = new Set(['neon-postgres-agent-platforms']);

const res = await fetch(REGISTRY);
const registry = await res.json();

let installed = 0;
const report = [];

for (const skill of registry.skills) {
  if (SKIP.has(skill.name)) {
    report.push({ name: skill.name, status: 'skipped (unrelated to this app)' });
    continue;
  }

  const url = `${BASE}${skill.url}`;
  const skillRes = await fetch(url);
  if (!skillRes.ok) {
    report.push({ name: skill.name, status: `FAILED HTTP ${skillRes.status}` });
    continue;
  }

  const body = await skillRes.text();
  const digest = createHash('sha256').update(body).digest('hex');
  const expected = String(skill.digest || '').replace(/^sha256:/, '');
  const verified = expected ? digest === expected : null;

  const hasFrontmatter = body.startsWith('---\n');
  const frontmatter = `---\nname: ${skill.name}\ndescription: ${JSON.stringify(skill.description)}\n---\n`;
  const out = hasFrontmatter ? body : `${frontmatter}\n${body.trimStart()}`;

  const dir = `${DEST}/${skill.name}`;
  const file = `${dir}/SKILL.md`;
  const existed = existsSync(file);
  if (existed && readFileSync(file, 'utf8') === out) {
    report.push({ name: skill.name, status: 'unchanged (already current)' });
    continue;
  }

  mkdirSync(dir, { recursive: true });
  writeFileSync(file, out);
  installed += 1;
  report.push({
    name: skill.name,
    status: `${existed ? 'updated' : 'installed'} · digest ${verified === null ? 'n/a' : verified ? 'OK' : 'MISMATCH'}`,
  });
}

for (const row of report) console.log(`${row.status.padEnd(34)} ${row.name}`);
console.log(`\n${installed} file(s) written into ${DEST}/`);
