import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

export function inspectAudit(input) {
  const report = JSON.parse(input);
  if (
    report.auditReportVersion !== 2 ||
    report.error ||
    !report.vulnerabilities ||
    typeof report.vulnerabilities !== 'object' ||
    Array.isArray(report.vulnerabilities) ||
    !report.metadata?.vulnerabilities
  )
    throw Error('Invalid audit report');
  const counts = { info: 0, low: 0, moderate: 0, high: 0, critical: 0 };
  const findings = [];
  for (const [name, entry] of Object.entries(report.vulnerabilities)) {
    if (name.length > 214 || !/^(?:@[a-z0-9._-]+\/)?[a-z0-9._-]+$/.test(name))
      throw Error('Invalid package name');
    if (!entry || !Object.hasOwn(counts, entry.severity)) throw Error('Invalid severity');
    counts[entry.severity]++;
    if (['high', 'critical'].includes(entry.severity))
      findings.push({ name, severity: entry.severity });
  }
  for (const [severity, count] of Object.entries(counts)) {
    if (report.metadata.vulnerabilities[severity] !== count)
      throw Error('Inconsistent audit inventory');
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (report.metadata.vulnerabilities.total !== total) throw Error('Inconsistent audit total');
  return { ...counts, total, blocked: counts.high > 0 || counts.critical > 0, findings };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const path = process.argv[2];
    if (!path || fs.statSync(path).size > 5 * 1024 * 1024) throw Error('Invalid input');
    const result = inspectAudit(fs.readFileSync(path, 'utf8'));
    console.log(`Audit counts: ${JSON.stringify(result)}`);
    if (process.env.GITHUB_STEP_SUMMARY)
      fs.appendFileSync(
        process.env.GITHUB_STEP_SUMMARY,
        `## Dependency audit\n\nHigh: ${result.high}; critical: ${result.critical}; moderate: ${result.moderate}; low: ${result.low}.\n\nResult: ${result.blocked ? 'BLOCKED — high/critical dependencies require remediation.' : 'No high/critical dependency findings.'}\n\n${result.findings.map((f) => '- `' + f.name + '`: ' + f.severity).join('\n')}\n`,
      );
    if (result.blocked) process.exitCode = 1;
  } catch {
    console.error(
      'Dependency audit failed: missing, malformed, unavailable, oversized, or inconsistent report.',
    );
    process.exitCode = 1;
  }
}
