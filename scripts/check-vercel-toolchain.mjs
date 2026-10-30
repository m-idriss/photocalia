import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export function checkVercelToolchain(lock) {
  const packages = lock?.packages;
  const builder = packages?.['node_modules/@vercel/build-utils'];
  const node = packages?.['node_modules/@vercel/node'];
  const expected = node?.peerDependencies?.['@vercel/build-utils'];
  if (typeof expected !== 'string' || !/^\d+\.\d+\.\d+$/.test(expected)
      || builder?.version !== expected) {
    throw new Error('The locked Vercel Node builder and build-utils peer must match exactly.');
  }
  if (Object.keys(packages).some(path => path.endsWith('/node_modules/@vercel/build-utils')
      && path !== 'node_modules/@vercel/build-utils')) {
    throw new Error('Multiple Vercel build-utils installations require explicit toolchain review.');
  }
  return true;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  checkVercelToolchain(JSON.parse(await readFile(new URL('../package-lock.json', import.meta.url), 'utf8')));
  console.log('Locked Vercel builder peer compatibility passed.');
}
