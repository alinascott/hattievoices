// Lists every unfinished value before launch: bracketed placeholders such as
// "[Narrator full name]", TODO comments, and the empty form endpoint.
// Run with: npm run placeholders
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const roots = ['src/content', 'src/config.ts', 'src/pages', 'src/components'];
const pattern = /["'>(\s]\[[A-Z][^\]\n]{2,}\]|TODO/;
// The withheld-passage label is real wording, not a placeholder
// and lists of ids such as [HV-1961-001] are links, not placeholders
const ignore = /Passage withheld at the narrator's request|\[(?:[A-Z]{2}-\d{4}-\d{3},?\s*)+\]/;

function* files(path) {
  if (statSync(path).isDirectory()) {
    for (const f of readdirSync(path)) yield* files(join(path, f));
  } else if (/\.(md|json|ts|astro)$/.test(path) && !path.endsWith('Value.astro')) {
    yield path;
  }
}

let count = 0;
for (const root of roots) {
  for (const file of files(root)) {
    readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
      if (pattern.test(line) && !ignore.test(line)) {
        console.log(`${file}:${i + 1}  ${line.trim().slice(0, 110)}`);
        count++;
      }
    });
    if (file === 'src/config.ts' && /formEndpoint:\s*''/.test(readFileSync(file, 'utf8'))) {
      console.log(`${file}  formEndpoint is empty, so the Get involved form is not connected`);
      count++;
    }
  }
}
console.log(count ? `\n${count} line(s) still need attention.` : 'No placeholders found.');
