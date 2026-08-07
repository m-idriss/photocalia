import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const schemaPath = resolve('contracts/3dime-api/openapi-v1.json');
const generatedPath = resolve('src/app/generated/3dime-api.ts');
const schema = JSON.parse(await readFile(schemaPath, 'utf8'));

const expectedOperations = {
  '/v1/converter': ['post'],
  '/v1/converter/quota-status': ['get'],
  '/v1/converter/plans': ['get'],
  '/v1/subscriptions': ['post'],
  '/v1/subscriptions/status': ['get'],
  '/v1/subscriptions/cancel': ['post'],
  '/v1/donations/checkout': ['post'],
};

for (const [path, methods] of Object.entries(expectedOperations)) {
  for (const method of methods) {
    if (!schema.paths?.[path]?.[method]) {
      throw new Error(`OpenAPI contract is missing ${method.toUpperCase()} ${path}`);
    }
  }
}

for (const component of [
  'ConverterRequest',
  'ConverterResponse',
  'QuotaStatusResponse',
  'PlanInfo',
  'CheckoutRequest',
  'CheckoutResponse',
  'SubscriptionStatusResponse',
  'DonationRequest',
  'ErrorResponse',
]) {
  if (!schema.components?.schemas?.[component]) {
    throw new Error(`OpenAPI contract is missing schema ${component}`);
  }
}

const temporaryDirectory = await mkdtemp(join(tmpdir(), 'photocalia-contract-'));
const temporaryGenerated = join(temporaryDirectory, '3dime-api.ts');

try {
  const result = spawnSync(
    resolve('node_modules/.bin/openapi-typescript'),
    [schemaPath, '--output', temporaryGenerated],
    { encoding: 'utf8' },
  );
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || 'OpenAPI type generation failed');
  }

  const [expected, actual] = await Promise.all([
    readFile(generatedPath, 'utf8'),
    readFile(temporaryGenerated, 'utf8'),
  ]);
  if (expected !== actual) {
    throw new Error('Generated API types are stale. Run: npm run contracts:generate');
  }
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}

console.log('OpenAPI contract and generated TypeScript types are synchronized.');
