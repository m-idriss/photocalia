import { test as base, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface GoldenEvent {
  title: string;
  start: string;
  end?: string;
  location: string;
  allDay: boolean;
}
export interface GoldenCase {
  id: string;
  source: string;
  timeZone: string;
  expected: GoldenEvent[];
}
export const goldenCases = (
  JSON.parse(readFileSync(join(process.cwd(), 'e2e/fixtures/golden/expected.json'), 'utf8')) as {
    cases: GoldenCase[];
  }
).cases;
const pdfVersion = (
  JSON.parse(readFileSync(join(process.cwd(), 'node_modules/pdfjs-dist/package.json'), 'utf8')) as {
    version: string;
  }
).version;
const pdfWorkerURL = `https://unpkg.com/pdfjs-dist@${pdfVersion}/build/pdf.worker.min.mjs`;

export type Decision = 'local' | 'mock' | 'style' | 'worker' | 'release' | 'blocked';
const apiPaths = new Map([
  ['/v1/converter/plans', 'GET'],
  ['/v1/converter/quota-status', 'GET'],
  ['/v1/converter/statistics', 'GET'],
  ['/v1/subscriptions/status', 'GET'],
  ['/v1/converter', 'POST'],
]);
export function requestDecision(raw: string, method: string, localOrigin: string): Decision {
  const url = new URL(raw);
  if (
    ['http://localhost:8080', localOrigin].includes(url.origin) &&
    apiPaths.get(url.pathname) === method
  )
    return 'mock';
  if (url.origin === localOrigin && !/^\/(?:v1|api|preview-api)(?:\/|$)/.test(url.pathname))
    return 'local';
  if (method === 'GET' && raw === 'https://unpkg.com/cal-heatmap/dist/cal-heatmap.css')
    return 'style';
  if (method === 'GET' && raw === pdfWorkerURL) return 'worker';
  if (
    method === 'GET' &&
    raw === 'https://api.github.com/repos/m-idriss/photocalia/releases/latest'
  )
    return 'release';
  return 'blocked';
}

function calendar(events: GoldenEvent[]) {
  const escape = (value: string) =>
    value
      .replaceAll('\\', '\\\\')
      .replaceAll('\n', '\\n')
      .replaceAll(',', '\\,')
      .replaceAll(';', '\\;');
  const stamp = (value: string) =>
    new Date(value).toISOString().replace(/[-:]/g, '').replace('.000', '');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Photocalia Synthetic QA//EN'];
  for (const [i, event] of events.entries()) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:qa-${i}@example.invalid`,
      'DTSTAMP:20260101T000000Z',
      `SUMMARY:${escape(event.title)}`,
      `LOCATION:${escape(event.location)}`,
    );
    if (event.allDay) {
      lines.push(`DTSTART;VALUE=DATE:${event.start.replaceAll('-', '')}`);
      if (event.end) lines.push(`DTEND;VALUE=DATE:${event.end.replaceAll('-', '')}`);
    } else {
      lines.push(
        `DTSTART:${stamp(event.start)}`,
        `DTEND:${stamp(event.end ?? new Date(new Date(event.start).getTime() + 3_600_000).toISOString())}`,
      );
    }
    lines.push('END:VEVENT');
  }
  return [...lines, 'END:VCALENDAR', ''].join('\r\n');
}

interface QAState {
  mode: 'success' | 'unavailable' | 'quota';
  goldenCase: GoldenCase;
  conversions: number;
  maxConversions: number;
  violations: string[];
  expectedProbeOrigins: Set<string>;
  blockedProbes: string[];
  localOrigin: string;
  stubbedAssets: number;
}

export const test = base.extend<{ qa: QAState; syntheticUser: boolean }>({
  syntheticUser: [true, { option: true }],
  qa: [
    async ({ context, syntheticUser }, use, testInfo) => {
      const origin = new URL(String(testInfo.project.use.baseURL));
      if (origin.protocol !== 'http:' || !['localhost', '127.0.0.1'].includes(origin.hostname)) {
        throw new Error('QA browser origin must be a loopback development server.');
      }
      const qa: QAState = {
        mode: 'success',
        goldenCase: goldenCases[0],
        conversions: 0,
        maxConversions: 0,
        violations: [],
        expectedProbeOrigins: new Set(),
        blockedProbes: [],
        localOrigin: origin.origin,
        stubbedAssets: 0,
      };
      const blocked = (url: string) => {
        const origin = new URL(url).origin;
        if (qa.expectedProbeOrigins.has(origin) && new URL(url).hostname.endsWith('.invalid'))
          qa.blockedProbes.push(origin);
        else qa.violations.push(origin);
      };
      await context.addInitScript((signedIn) => {
        if (signedIn)
          (window as Window & { __PHOTOCALIA_E2E_AUTH__?: boolean }).__PHOTOCALIA_E2E_AUTH__ = true;
        localStorage.setItem(
          'photocalia_cookie_consent',
          JSON.stringify({
            essential: true,
            analytics: false,
            preferences: false,
            timestamp: Date.now(),
          }),
        );
      }, syntheticUser);
      await context.routeWebSocket('**', (socket) => {
        blocked(socket.url());
        socket.close({ code: 1008, reason: 'Synthetic QA blocks WebSockets' });
      });
      await context.route('**/*', async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        const decision = requestDecision(request.url(), request.method(), qa.localOrigin);
        if (decision === 'blocked') {
          blocked(request.url());
          await route.abort('blockedbyclient');
        } else if (decision === 'style') {
          qa.stubbedAssets++;
          await route.fulfill({ contentType: 'text/css', body: '' });
        } else if (decision === 'worker') {
          qa.stubbedAssets++;
          await route.fulfill({
            contentType: 'application/javascript',
            headers: { 'access-control-allow-origin': '*' },
            body: readFileSync(
              join(process.cwd(), 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs'),
            ),
          });
        } else if (decision === 'release') {
          await route.fulfill({
            json: { tag_name: 'v0.0.0-qa', html_url: 'https://example.invalid/release' },
          });
        } else if (decision === 'local') {
          // Never follow an asset redirect outside the guarded local server.
          const response = await route.fetch({ maxRedirects: 0, timeout: 15_000 });
          if (response.status() >= 300 && response.status() < 400) {
            qa.violations.push('loopback-redirect');
            await route.abort('blockedbyclient');
          } else if (request.resourceType() === 'document') {
            // Prevent speculative external DNS/TLS hints; retain the app's CSP unchanged.
            const body = (await response.text()).replace(
              /<link\b[^>]*\brel=["'](?:preconnect|dns-prefetch)["'][^>]*>/gi,
              '',
            );
            await route.fulfill({ response, body });
          } else await route.fulfill({ response });
        } else {
          if (url.pathname === '/v1/converter') {
            qa.conversions++;
            if (qa.conversions > qa.maxConversions) {
              qa.violations.push('unexpected-conversion-count');
              await route.abort('blockedbyclient');
            } else if (qa.mode === 'unavailable')
              await route.fulfill({ status: 503, json: { errorCode: 'SERVICE_UNAVAILABLE' } });
            else if (qa.mode === 'quota')
              await route.fulfill({ status: 429, json: { errorCode: 'QUOTA_EXCEEDED' } });
            else {
              const payload = request.postDataJSON() as { timeZone?: string; files?: unknown[] };
              expect(payload.timeZone).toBe(qa.goldenCase.timeZone);
              expect(payload.files?.length).toBeGreaterThan(0);
              await route.fulfill({
                json: { success: true, icsContent: calendar(qa.goldenCase.expected) },
              });
            }
          } else if (url.pathname === '/v1/converter/plans')
            await route.fulfill({
              json: [
                { plan: 'FREE', limit: 3 },
                { plan: 'PLUS', limit: 15 },
              ],
            });
          else if (url.pathname === '/v1/converter/quota-status')
            await route.fulfill({
              json: {
                success: true,
                enabled: true,
                quota: { usageCount: 0, limit: 3, remaining: 3, plan: 'FREE', paidCredits: 0 },
              },
            });
          else if (url.pathname === '/v1/converter/statistics')
            await route.fulfill({ json: { fileCount: 0, eventCount: 0 } });
          else await route.fulfill({ json: { planId: 'free', status: 'free' } });
        }
      });
      await use(qa);
      await testInfo.attach('synthetic-network-summary', {
        contentType: 'application/json',
        body: JSON.stringify({
          conversions: qa.conversions,
          blockedProbes: qa.blockedProbes.length,
          unexpectedRequests: qa.violations.length,
          stubbedAssets: qa.stubbedAssets,
        }),
      });
      expect(qa.violations, 'Unexpected browser requests (origins only; no payloads)').toEqual([]);
    },
    { auto: true },
  ],
});
export { expect };
