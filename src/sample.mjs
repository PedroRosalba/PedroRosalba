// Samples each project's source file into a list of line lengths → src/signals.json.
// Run when a project changes: `npm run sample`. The build itself stays offline.
import { writeFile } from 'node:fs/promises';
import { projects, owner } from './projects.mjs';

const signals = {};
for (const p of projects) {
  const url = `https://raw.githubusercontent.com/${owner}/${p.repo}/HEAD/${p.source}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const lines = (await res.text()).replace(/\n$/, '').split('\n');
  signals[p.repo] = { source: p.source, lines: lines.map((l) => l.replace(/\t/g, '    ').trimEnd().length) };
  console.log(`${p.repo.padEnd(40)} ${p.source} · ${lines.length} lines`);
}
await writeFile(new URL('./signals.json', import.meta.url), JSON.stringify(signals) + '\n');
