import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const source = resolve(
  process.argv[2] ?? '../3dime-api/contracts/openapi-v1.json',
);
const destination = resolve('contracts/3dime-api/openapi-v1.json');

const document = JSON.parse(await readFile(source, 'utf8'));
await mkdir(resolve('contracts/3dime-api'), { recursive: true });
await writeFile(destination, `${JSON.stringify(document, null, 2)}\n`);

console.log(`Updated ${destination} from ${source}`);
