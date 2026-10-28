import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

function invoke(overrides = {}) {
  const output = ts.transpileModule(
    readFileSync(new URL('../api/log.ts', import.meta.url), 'utf8'),
    {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    },
  ).outputText;
  const records = [];
  const context = {
    exports: {},
    console: Object.fromEntries(
      ['info', 'log', 'warn', 'error'].map((level) => [
        level,
        (entry) => records.push(JSON.parse(entry)),
      ]),
    ),
  };
  vm.runInNewContext(output, context, { timeout: 1000 });
  const response = {
    code: undefined,
    ended: false,
    status(code) {
      this.code = code;
      return this;
    },
    json() {
      this.ended = true;
      return this;
    },
    end() {
      this.ended = true;
      return this;
    },
  };
  context.exports.default(
    {
      method: 'POST',
      headers: { origin: 'https://www.photocalia.com' },
      body: { level: 'info', message: 'synthetic test event' },
      ...overrides,
    },
    response,
  );
  return { response, records };
}

test('non-POST requests and untrusted origins produce no log records', () => {
  for (const [request, expected] of [
    [{ method: 'GET' }, 405],
    [{ headers: {} }, 403],
    [{ headers: { origin: 'https://untrusted.invalid' } }, 403],
  ]) {
    const { response, records } = invoke(request);
    assert.equal(response.code, expected);
    assert.equal(records.length, 0);
  }
});

test('invalid or oversized payloads fail without logging', () => {
  for (const body of [
    null,
    { level: 'info', message: '' },
    { level: 'trace', message: 'synthetic' },
    { level: 'info', message: 'x'.repeat(501) },
    { level: 'info', message: 'synthetic', context: 'x'.repeat(101) },
  ]) {
    const { response, records } = invoke({ body });
    assert.equal(response.code, 400);
    assert.equal(records.length, 0);
  }
});

test('valid synthetic events retain response contract and bounded data', () => {
  for (const level of ['info', 'warn', 'error']) {
    const { response, records } = invoke({
      body: { level, message: 'synthetic', data: { value: 'x'.repeat(5000) } },
    });
    assert.equal(response.code, 204);
    assert.equal(response.ended, true);
    assert.equal(records.length, 1);
    assert.equal(records[0].level, level);
    assert.equal(records[0].message, 'synthetic');
    assert.equal(records[0].data.length, 4000);
  }
});
