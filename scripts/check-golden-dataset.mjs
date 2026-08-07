import { access, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const fixtureRoot = fileURLToPath(new URL('../e2e/fixtures/golden/', import.meta.url));
const manifest = JSON.parse(await readFile(join(fixtureRoot, 'expected.json'), 'utf8'));
const failures = [];
const coverage = {
  languages: new Set(),
  formats: new Set(),
  allDay: new Set(),
  warnings: new Set(),
  hasMultipleEvents: false,
  hasDstCase: false,
};

function fail(caseId, field, detail) {
  failures.push(`${caseId}.${field}: ${detail}`);
}

if (manifest.version !== 1 || !Array.isArray(manifest.cases) || manifest.cases.length === 0) {
  throw new Error('expected.json must contain a non-empty version 1 cases array');
}

const caseIds = new Set();
for (const fixtureCase of manifest.cases) {
  const caseId = fixtureCase.id || 'unknown-case';
  if (caseIds.has(caseId)) fail(caseId, 'id', 'must be unique');
  caseIds.add(caseId);

  if (!fixtureCase.source) {
    fail(caseId, 'source', 'is required');
  } else {
    await access(join(fixtureRoot, fixtureCase.source)).catch(() =>
      fail(caseId, 'source', 'file does not exist'),
    );
    coverage.formats.add(extname(fixtureCase.source).slice(1));
  }

  coverage.languages.add(fixtureCase.language);
  try {
    new Intl.DateTimeFormat('en', { timeZone: fixtureCase.timeZone }).format(new Date());
  } catch {
    fail(caseId, 'timeZone', 'must be a valid IANA timezone');
  }

  if (!Array.isArray(fixtureCase.expected) || fixtureCase.expected.length === 0) {
    fail(caseId, 'expected', 'must contain at least one event');
    continue;
  }
  coverage.hasMultipleEvents ||= fixtureCase.expected.length > 1;
  coverage.hasDstCase ||= caseId.includes('dst');
  if (fixtureCase.expectedWarning) coverage.warnings.add(fixtureCase.expectedWarning);

  fixtureCase.expected.forEach((event, index) => {
    const field = `expected[${index}]`;
    if (!event.title) fail(caseId, `${field}.title`, 'is required');
    if (typeof event.allDay !== 'boolean') fail(caseId, `${field}.allDay`, 'must be boolean');
    coverage.allDay.add(event.allDay);
    if (typeof event.location !== 'string') fail(caseId, `${field}.location`, 'must be explicit');

    const expectedDatePattern = event.allDay
      ? /^\d{4}-\d{2}-\d{2}$/
      : /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/;
    if (!expectedDatePattern.test(event.start || '')) {
      fail(caseId, `${field}.start`, 'must include the expected date and timezone semantics');
    }
    if (event.end && !expectedDatePattern.test(event.end)) {
      fail(caseId, `${field}.end`, 'must use the same date representation as start');
    }
  });
}

for (const language of ['en', 'fr']) {
  if (!coverage.languages.has(language)) failures.push(`coverage.language: missing ${language}`);
}
for (const format of ['png', 'pdf']) {
  if (!coverage.formats.has(format)) failures.push(`coverage.format: missing ${format}`);
}
for (const allDay of [true, false]) {
  if (!coverage.allDay.has(allDay)) failures.push(`coverage.allDay: missing ${allDay}`);
}
for (const warning of ['ambiguous-date-format', 'timezone-review-required']) {
  if (!coverage.warnings.has(warning)) failures.push(`coverage.warning: missing ${warning}`);
}
if (!coverage.hasMultipleEvents) failures.push('coverage.multiEvent: missing multiple-event case');
if (!coverage.hasDstCase) failures.push('coverage.dst: missing DST-boundary case');

const provenance = await readFile(join(fixtureRoot, 'README.md'), 'utf8');
if (!provenance.includes('CC0-1.0') || !provenance.includes('no personal')) {
  failures.push('provenance: README must document license and privacy-safe origin');
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Verified ${manifest.cases.length} privacy-safe golden cases and required coverage.`);
