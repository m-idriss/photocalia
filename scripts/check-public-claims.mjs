import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const repositoryRoot = new URL('../', import.meta.url);
const planSourcePath = new URL('src/app/constants/subscription.constants.ts', repositoryRoot);
const planSource = await readFile(planSourcePath, 'utf8');

const quotas = new Map();
for (const match of planSource.matchAll(
  /id:\s*'(free|pro|business)'[\s\S]*?monthlyQuota:\s*(\d+)/g,
)) {
  quotas.set(match[1], Number(match[2]));
}

for (const plan of ['free', 'pro', 'business']) {
  if (!quotas.has(plan)) {
    throw new Error(`Could not read the ${plan} quota from subscription.constants.ts`);
  }
}

const textExtensions = new Set(['.html', '.json', '.md', '.ts', '.txt']);
const roots = ['README.md', 'content', 'docs', 'public', 'src'];
const files = [];

async function collect(relativePath) {
  const absolutePath = new URL(relativePath, repositoryRoot);
  const entries = await readdir(absolutePath, { withFileTypes: true }).catch(() => null);
  if (!entries) {
    files.push(relativePath);
    return;
  }

  for (const entry of entries) {
    const child = join(relativePath, entry.name);
    if (entry.isDirectory()) {
      await collect(`${child}/`);
    } else if (textExtensions.has(extname(entry.name))) {
      files.push(child);
    }
  }
}

for (const root of roots) {
  await collect(root);
}

const failures = [];
const supportedMonthlyQuotas = new Set(quotas.values());
const forbiddenClaims = [
  { pattern: /\bHEIC\b/i, reason: 'HEIC is not accepted by the upload control' },
  { pattern: /\bGPT-4\b/i, reason: 'the backend provider is configuration-dependent' },
  { pattern: /\bOpenAI\b/i, reason: 'the backend provider is configuration-dependent' },
];
const monthlyClaimPattern =
  /\b(\d+)\s+(?:free\s+|gratuites?\s+)?conversions?(?:\s+gratuites?)?\s*(?:per month|\/\s*month|par mois|\/\s*mois)/gi;

for (const file of files) {
  const content = await readFile(new URL(file, repositoryRoot), 'utf8');

  for (const { pattern, reason } of forbiddenClaims) {
    if (pattern.test(content)) {
      failures.push(`${file}: ${reason}`);
    }
  }

  for (const match of content.matchAll(monthlyClaimPattern)) {
    const value = Number(match[1]);
    if (!supportedMonthlyQuotas.has(value)) {
      failures.push(`${file}: monthly conversion claim ${value} is absent from the plan source`);
    }
  }
}

for (const locale of ['en', 'fr']) {
  const translations = JSON.parse(
    await readFile(new URL(`public/assets/i18n/${locale}.json`, repositoryRoot), 'utf8'),
  );
  for (const plan of ['free', 'pro', 'business']) {
    if (!translations[`pricing.plan.${plan}.quota`]?.includes('{limit}')) {
      failures.push(`${locale}.json: pricing.plan.${plan}.quota must use {limit}`);
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(
  `Verified public claims against plan quotas: free=${quotas.get('free')}, pro=${quotas.get('pro')}, business=${quotas.get('business')}.`,
);
