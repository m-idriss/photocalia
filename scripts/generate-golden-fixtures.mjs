import { chromium } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'e2e', 'fixtures', 'golden');
const names = ['en-calendar', 'fr-calendrier-flou', 'dst-boundary'];
const browser = await chromium.launch({ headless: true });

try {
  for (const name of names) {
    const svg = await readFile(join(root, `${name}.svg`), 'utf8');
    const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
    await page.setContent(`<style>html,body{margin:0}</style>${svg}`);
    await page.screenshot({ path: join(root, `${name}.png`) });
    await page.pdf({
      path: join(root, `${name}.pdf`),
      width: '1200px',
      height: '800px',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });
    await page.close();
  }
} finally {
  await browser.close();
}
