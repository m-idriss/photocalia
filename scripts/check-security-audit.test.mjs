import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inspectAudit } from './check-security-audit.mjs';
const audit = (vulnerabilities) =>
  JSON.stringify({
    auditReportVersion: 2,
    vulnerabilities,
    metadata: {
      vulnerabilities: {
        info: 0,
        low: 0,
        moderate: 0,
        high: 0,
        critical: 0,
        total: Object.keys(vulnerabilities).length,
        ...Object.values(vulnerabilities).reduce(
          (a, v) => ({ ...a, [v.severity]: (a[v.severity] || 0) + 1 }),
          {},
        ),
      },
    },
  });
test('modern pretty-printed npm audit blocks high and critical findings', () => {
  for (const severity of ['high', 'critical'])
    assert.equal(
      inspectAudit(JSON.stringify(JSON.parse(audit({ pkg: { severity } })), null, 2)).blocked,
      true,
    );
});
test('empty complete report passes; moderate remains visible without blocking', () => {
  assert.equal(inspectAudit(audit({})).blocked, false);
  const r = inspectAudit(audit({ pkg: { severity: 'moderate' } }));
  assert.equal(r.moderate, 1);
  assert.equal(r.blocked, false);
});
test('malformed, registry-error and old reports fail closed', () => {
  for (const input of [
    '',
    'not json',
    '{}',
    '{"error":{"message":"unavailable"}}',
    audit({}).replace('"auditReportVersion":2', '"auditReportVersion":1'),
  ])
    assert.throws(() => inspectAudit(input));
});
test('unknown severities and inconsistent inventory fail closed', () => {
  assert.throws(() => inspectAudit(audit({ pkg: { severity: 'unknown' } })));
  const r = JSON.parse(audit({ pkg: { severity: 'high' } }));
  r.metadata.vulnerabilities.high = 0;
  assert.throws(() => inspectAudit(JSON.stringify(r)));
  r.metadata.vulnerabilities.high = 1;
  r.metadata.vulnerabilities.total = 0;
  assert.throws(() => inspectAudit(JSON.stringify(r)));
});
test('non-object inventories cannot qualify as clean reports', () => {
  for (const inventory of [true, false, 42, '', 'text', [], null]) {
    const report = JSON.parse(audit({}));
    report.vulnerabilities = inventory;
    assert.throws(() => inspectAudit(JSON.stringify(report)));
  }
});
test('findings contain only validated package names and severity', () => {
  const report = JSON.parse(audit({ '@scope/pkg': { severity: 'high' } }));
  report.vulnerabilities['@scope/pkg'].via = ['untrusted body'];
  assert.deepEqual(inspectAudit(JSON.stringify(report)).findings, [
    { name: '@scope/pkg', severity: 'high' },
  ]);
  assert.throws(() => inspectAudit(audit({ 'pkg\n@everyone': { severity: 'high' } })));
});
