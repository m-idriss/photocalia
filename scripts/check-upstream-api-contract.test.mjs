import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { checkFiles, compareContracts, MAX_BYTES } from './check-upstream-api-contract.mjs';

const fixture = () => ({
  openapi: '3.0.3',
  paths: { '/example': { get: { responses: { 200: { description: 'Example' } } } } },
  components: {
    schemas: {
      Example: {
        type: 'object',
        required: ['id', 'name'],
        properties: { id: { type: 'string' }, name: { type: 'string', enum: ['A', 'B'] } },
      },
    },
  },
});

async function files(t, a, b) {
  const directory = await mkdtemp(join(tmpdir(), 'contract-drift-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const frontend = join(directory, 'frontend.json');
  const upstream = join(directory, 'upstream.json');
  if (a !== undefined) await writeFile(frontend, a);
  if (b !== undefined) await writeFile(upstream, b);
  return { frontend, upstream, directory };
}

test('formatting and nested object-key order are ignored', async (t) => {
  const { frontend, upstream } = await files(
    t,
    '{ "paths": {"/example":{"get":{}}}, "openapi":"3.0.3" }',
    '{\n"openapi":"3.0.3", "paths":{"/example":{"get":{}}}\n}',
  );
  assert.deepEqual(await checkFiles(frontend, upstream), []);
});

const changes = {
  path: (x) => {
    x.paths['/another'] = {};
  },
  operation: (x) => {
    x.paths['/example'].post = {};
  },
  field: (x) => {
    delete x.components.schemas.Example.properties.name;
  },
  type: (x) => {
    x.components.schemas.Example.properties.id.type = 'number';
  },
  required: (x) => {
    x.components.schemas.Example.required.pop();
  },
  enum: (x) => {
    x.components.schemas.Example.properties.name.enum.push('C');
  },
  'array order': (x) => {
    x.components.schemas.Example.required.reverse();
  },
  'JSON value type': (x) => {
    x.openapi = null;
  },
};
for (const [name, mutate] of Object.entries(changes)) {
  test(`detects changed ${name}`, () => {
    const a = fixture();
    const b = fixture();
    mutate(b);
    assert.ok(compareContracts(a, b).length > 0);
  });
}

test('diagnostics use JSON pointers and omit values', () => {
  assert.deepEqual(
    compareContracts(
      { paths: { '/x~y': 'private-value-a' } },
      { paths: { '/x~y': 'private-value-b' } },
    ),
    [{ path: '/paths/~1x~0y', reason: 'value changed' }],
  );
});
test('prototype-like keys are compared as ordinary JSON properties', () => {
  assert.equal(compareContracts(JSON.parse('{"__proto__":1}'), {}).length, 1);
});
test('limits the number of differences', () => {
  const many = Object.fromEntries(Array.from({ length: 100 }, (_, i) => [`field${i}`, i]));
  assert.equal(compareContracts(many, {}).length, 10);
});
for (const side of ['frontend', 'upstream']) {
  test(`rejects missing ${side} input`, async (t) => {
    const { frontend, upstream } = await files(
      t,
      side === 'frontend' ? undefined : '{}',
      side === 'upstream' ? undefined : '{}',
    );
    await assert.rejects(checkFiles(frontend, upstream), /unable to read input file/);
  });
  test(`rejects malformed ${side} JSON without logging contents`, async (t) => {
    const { frontend, upstream } = await files(
      t,
      side === 'frontend' ? 'private-invalid-json' : '{}',
      side === 'upstream' ? 'private-invalid-json' : '{}',
    );
    await assert.rejects(checkFiles(frontend, upstream), {
      message: `${side === 'frontend' ? 'Frontend' : 'Upstream'} contract: invalid UTF-8 or JSON`,
    });
  });
  test(`rejects oversized ${side} input`, async (t) => {
    const oversized = JSON.stringify({ field: 'x'.repeat(MAX_BYTES) });
    const { frontend, upstream } = await files(
      t,
      side === 'frontend' ? oversized : '{}',
      side === 'upstream' ? oversized : '{}',
    );
    await assert.rejects(checkFiles(frontend, upstream), /exceeds the 1 MiB input limit/);
  });
}
test('accepts an input exactly at the byte limit', async (t) => {
  const data = '{}' + ' '.repeat(MAX_BYTES - 2);
  const { frontend, upstream } = await files(t, data, '{}');
  assert.deepEqual(await checkFiles(frontend, upstream), []);
});
test('rejects non-object JSON documents', async (t) => {
  for (const value of ['null', '[]', '"text"', '42']) {
    const { frontend, upstream } = await files(t, value, '{}');
    await assert.rejects(checkFiles(frontend, upstream), /expected a JSON object/);
  }
});
test('rejects invalid UTF-8', async (t) => {
  const { frontend, upstream } = await files(t, Buffer.from([0xff]), '{}');
  await assert.rejects(checkFiles(frontend, upstream), /invalid UTF-8 or JSON/);
});
test('rejects directories', async (t) => {
  const { directory, upstream } = await files(t, '{}', '{}');
  await assert.rejects(checkFiles(directory, upstream), /expected a regular file/);
});
test('CLI succeeds for equivalent files and fails for drift, invalid input, and missing arguments', async (t) => {
  const { frontend, upstream } = await files(t, '{"x":1}', '{"x":1}');
  const script = fileURLToPath(new URL('./check-upstream-api-contract.mjs', import.meta.url));
  const run = (...args) =>
    spawnSync(process.execPath, [script, ...args], { encoding: 'utf8', timeout: 5000 });
  assert.equal(run(frontend, upstream).status, 0);
  await writeFile(upstream, '{"x":2}');
  const drift = run(frontend, upstream);
  assert.equal(drift.status, 1);
  assert.match(drift.stderr, /drift detected/);
  await writeFile(upstream, 'private-invalid-json');
  const malformed = run(frontend, upstream);
  assert.equal(malformed.status, 1);
  assert.ok(!malformed.stderr.includes('private-invalid-json'));
  assert.equal(run(frontend, join(upstream, 'missing')).status, 1);
  assert.equal(run().status, 1);
});

test('rejects excessive nesting without unbounded path traversal', () => {
  const nest = () => {
    let x = {};
    for (let i = 0; i < 130; i++) x = { child: x };
    return x;
  };
  assert.throws(() => compareContracts(nest(), nest()), /128-level comparison limit/);
});

test('detects int64 maximum changes beyond floating-point precision', async (t) => {
  const { frontend, upstream } = await files(
    t,
    '{"type":"integer","format":"int64","maximum":9007199254740992}',
    '{"type":"integer","format":"int64","maximum":9007199254740993}',
  );
  assert.deepEqual(await checkFiles(frontend, upstream), [
    { path: '/maximum', reason: 'value changed' },
  ]);
});
test('detects distinct decimals, underflow, and overflow without rounding', async (t) => {
  for (const [a, b] of [
    ['0.12345678901234567890', '0.12345678901234567891'],
    ['1e-999', '2e-999'],
    ['1e999', '2e999'],
  ]) {
    const { frontend, upstream } = await files(t, `{"value":${a}}`, `{"value":${b}}`);
    assert.equal((await checkFiles(frontend, upstream)).length, 1);
  }
});
test('equivalent numeric notation and signed zero remain equivalent', async (t) => {
  for (const [a, b] of [
    ['1000.0', '1e3'],
    ['0.0100', '1e-2'],
    ['-0', '0.0'],
    ['-1200', '-1.200e3'],
    ['9007199254740993', '9007199254740993.00'],
  ]) {
    const { frontend, upstream } = await files(t, `{"value":${a}}`, `{"value":${b}}`);
    assert.deepEqual(await checkFiles(frontend, upstream), []);
  }
});
test('numbers cannot collide with similarly shaped JSON objects or strings', async (t) => {
  for (const b of ['{"canonical":"1e0"}', '"1e0"']) {
    const { frontend, upstream } = await files(t, '{"value":1}', `{"value":${b}}`);
    assert.deepEqual(await checkFiles(frontend, upstream), [
      { path: '/value', reason: 'type changed' },
    ]);
  }
});
test('oversized numeric literals fail closed without exposing their contents', async (t) => {
  const { frontend, upstream } = await files(t, `{"value":1e${'9'.repeat(4096)}}`, '{}');
  await assert.rejects(checkFiles(frontend, upstream), {
    message: 'Frontend contract: numeric literal exceeds 4096 characters',
  });
});
