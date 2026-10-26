import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
await mkdir(resolve(root, 'dist/vendor'), { recursive: true });
await cp(resolve(root, 'public'), resolve(root, 'dist'), { recursive: true });
await cp(resolve(root, 'node_modules/pdf-lib/dist/pdf-lib.esm.min.js'), resolve(root, 'dist/vendor/pdf-lib.esm.min.js'));
await cp(resolve(root, 'node_modules/pdf-lib/LICENSE.md'), resolve(root, 'dist/vendor/pdf-lib-LICENSE.md'));
const catalog = await readFile(resolve(root, 'public/catalog.js'), 'utf8');
if (!catalog.includes('Brawn') || !catalog.includes('Disrupt Magic')) throw new Error('Reviewed catalog is missing.');
await writeFile(resolve(root, 'dist/build.txt'), 'Draw Steel Skill Ledger\n');
console.log('Built static website in dist/');
