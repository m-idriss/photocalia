import { open } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export const MAX_BYTES = 1024 * 1024;
const MAX_DIFFERENCES = 10;

class NumberParsingError extends Error {}

function canonicalNumber(source) {
  // Normalize decimal notation without converting through floating-point arithmetic.
  if (source.length > 4096) throw new NumberParsingError('numeric literal exceeds 4096 characters');
  const [, sign, integer, fraction = '', exponent = '0'] = source.match(
    /^(-?)(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/,
  );
  let digits = (integer + fraction).replace(/^0+/, '');
  if (!digits) return '0';
  const trailing = digits.match(/0+$/)?.[0].length ?? 0;
  if (trailing) digits = digits.slice(0, -trailing);
  const power = BigInt(exponent) - BigInt(fraction.length) + BigInt(trailing);
  return `${sign}${digits}e${power}`;
}

class ExactNumber {
  constructor(source) {
    this.canonical = canonicalNumber(source);
  }
}

async function readContract(path, label) {
  let file;
  try {
    file = await open(path, 'r');
    const stat = await file.stat();
    if (!stat.isFile()) throw new Error(`${label}: expected a regular file`);
    if (stat.size > MAX_BYTES) throw new Error(`${label}: exceeds the 1 MiB input limit`);
    const buffer = Buffer.alloc(MAX_BYTES + 1);
    let size = 0;
    while (size < buffer.length) {
      const { bytesRead } = await file.read(buffer, size, buffer.length - size, null);
      if (bytesRead === 0) break;
      size += bytesRead;
    }
    if (size > MAX_BYTES) throw new Error(`${label}: exceeds the 1 MiB input limit`);
    let document;
    try {
      document = JSON.parse(
        new TextDecoder('utf-8', { fatal: true }).decode(buffer.subarray(0, size)),
        (_key, value, context) => {
          if (typeof value !== 'number') return value;
          if (typeof context?.source !== 'string') {
            throw new NumberParsingError(
              'lossless numeric parsing requires supported Node.js 22 or newer',
            );
          }
          return new ExactNumber(context.source);
        },
      );
    } catch (error) {
      if (error instanceof NumberParsingError) throw new Error(`${label}: ${error.message}`);
      throw new Error(`${label}: invalid UTF-8 or JSON`);
    }
    if (
      !document ||
      typeof document !== 'object' ||
      Array.isArray(document) ||
      document instanceof ExactNumber
    ) {
      throw new Error(`${label}: expected a JSON object`);
    }
    return document;
  } catch (error) {
    if (error.message.startsWith(`${label}: `)) throw error;
    throw new Error(`${label}: unable to read input file`);
  } finally {
    await file?.close();
  }
}

const pointer = (path, key) => `${path}/${String(key).replaceAll('~', '~0').replaceAll('/', '~1')}`;

export function compareContracts(frontend, upstream) {
  const differences = [];
  const pending = [{ a: frontend, b: upstream, path: '', depth: 0 }];
  while (pending.length && differences.length < MAX_DIFFERENCES) {
    const { a, b, path, depth } = pending.pop();
    if (depth > 128) throw new Error('Contract nesting exceeds the 128-level comparison limit');
    if (a === b) continue;
    const kind = (value) =>
      value instanceof ExactNumber
        ? 'number'
        : value === null
          ? 'null'
          : Array.isArray(value)
            ? 'array'
            : typeof value;
    if (kind(a) !== kind(b)) {
      differences.push({ path, reason: 'type changed' });
    } else if (kind(a) === 'number') {
      const exact = (value) =>
        value instanceof ExactNumber ? value.canonical : canonicalNumber(String(value));
      if (exact(a) !== exact(b)) differences.push({ path, reason: 'value changed' });
    } else if (Array.isArray(a)) {
      if (a.length !== b.length) differences.push({ path, reason: 'array length changed' });
      for (let i = Math.min(a.length, b.length) - 1; i >= 0; i--) {
        pending.push({ a: a[i], b: b[i], path: pointer(path, i), depth: depth + 1 });
      }
    } else if (a && typeof a === 'object') {
      const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
      for (let i = keys.length - 1; i >= 0; i--) {
        const key = keys[i];
        if (!Object.hasOwn(a, key) || !Object.hasOwn(b, key)) {
          differences.push({
            path: pointer(path, key),
            reason: 'property missing from one contract',
          });
          if (differences.length >= MAX_DIFFERENCES) break;
        } else {
          pending.push({ a: a[key], b: b[key], path: pointer(path, key), depth: depth + 1 });
        }
      }
    } else {
      differences.push({ path, reason: 'value changed' });
    }
  }
  return differences;
}

export async function checkFiles(frontendPath, upstreamPath) {
  const frontend = await readContract(frontendPath, 'Frontend contract');
  const upstream = await readContract(upstreamPath, 'Upstream contract');
  return compareContracts(frontend, upstream);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 2) {
    throw new Error(
      'Usage: node scripts/check-upstream-api-contract.mjs <frontend.json> <upstream.json>',
    );
  }
  const differences = await checkFiles(...args);
  if (differences.length) {
    console.error('API contract drift detected (up to 10 differences; values omitted):');
    for (const { path, reason } of differences) {
      console.error(
        `- ${JSON.stringify(path.length > 200 ? path.slice(0, 200) + '...' : path || '/')}: ${reason}`,
      );
    }
    process.exitCode = 1;
  } else {
    console.log('API contracts are JSON-equivalent; whitespace and object-key order are ignored.');
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
