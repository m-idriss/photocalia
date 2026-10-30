import test from 'node:test';
import assert from 'node:assert/strict';
import { checkVercelToolchain } from './check-vercel-toolchain.mjs';
const fixture = () => ({ packages: {
  'node_modules/@vercel/node': { version: '28.0.0', peerDependencies: { '@vercel/build-utils': '15.1.0' } },
  'node_modules/@vercel/build-utils': { version: '15.1.0' },
} });
test('accepts the coordinated builder pair', () => assert.ok(checkVercelToolchain(fixture())));
test('rejects the standalone updates that legacy-peer-deps otherwise permits', () => {
  const lock = fixture(); lock.packages['node_modules/@vercel/build-utils'].version = '14.20.1';
  assert.throws(() => checkVercelToolchain(lock), /match exactly/);
});
test('missing metadata and unreviewed ranges fail closed', () => {
  assert.throws(() => checkVercelToolchain({}));
  const lock = fixture(); lock.packages['node_modules/@vercel/node'].peerDependencies['@vercel/build-utils'] = '^15.1.0';
  assert.throws(() => checkVercelToolchain(lock), /match exactly/);
});
test('rejects a second hidden builder implementation', () => {
  const lock = fixture(); lock.packages['node_modules/example/node_modules/@vercel/build-utils'] = { version: '14.20.1' };
  assert.throws(() => checkVercelToolchain(lock), /Multiple/);
});
