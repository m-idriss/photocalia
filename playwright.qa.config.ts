import { defineConfig, devices } from '@playwright/test';
import { isAbsolute } from 'node:path';

const baseURL = 'http://127.0.0.1:4202';
const executablePath = process.env['QA_CHROMIUM_EXECUTABLE_PATH'];
if (executablePath && !isAbsolute(executablePath))
  throw new Error('QA browser executable must be an absolute local path.');
for (const key of ['BASE_URL', 'PLAYWRIGHT_BASE_URL', 'PHOTOCALIA_PREVIEW_URL']) {
  if (process.env[key] && process.env[key] !== baseURL) {
    throw new Error(
      'QA targets must use the fixed local server; external URL overrides are refused.',
    );
  }
}

export default defineConfig({
  testDir: './e2e',
  testMatch: 'core-journeys.qa.spec.ts',
  forbidOnly: true,
  failOnFlakyTests: true,
  workers: 1,
  retries: 0,
  timeout: 45_000,
  globalTimeout: 600_000,
  outputDir: 'test-results/qa/artifacts',
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results/qa/results.json' }],
    ['html', { outputFolder: 'playwright-report/qa', open: 'never' }],
  ],
  use: {
    baseURL,
    launchOptions: { executablePath },
    timezoneId: 'Europe/Paris',
    serviceWorkers: 'block',
    trace: 'off',
    video: 'off',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'qa-chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command:
      'node node_modules/@angular/cli/bin/ng.js serve --configuration=development --host=127.0.0.1 --port=4202 --hmr=false --live-reload=false',
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
