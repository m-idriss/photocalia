import { chromium } from 'playwright';
import { execFile } from 'node:child_process';
import { mkdir, readdir, rename, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

const root = dirname(fileURLToPath(import.meta.url));
const outputDir = join(root, 'output');
const temporaryDir = join(outputDir, 'capture');
const run = promisify(execFile);
const locale = process.argv[2] ?? 'fr';

if (!['fr', 'en'].includes(locale)) {
  throw new Error('Locale must be "fr" or "en".');
}

const sourceFile = join(root, `index-${locale}.html`);
const outputBase = `photocalia-summer-campaign-${locale}`;

await rm(temporaryDir, { recursive: true, force: true });
await mkdir(temporaryDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
const context = await browser.newContext({
  viewport: { width: 1080, height: 1920 },
  deviceScaleFactor: 1,
  recordVideo: {
    dir: temporaryDir,
    size: { width: 1080, height: 1920 },
  },
});

const page = await context.newPage();
await page.goto(pathToFileURL(sourceFile).href, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => document.querySelector('.video')?.classList.add('play'));
await page.waitForTimeout(900);
await page.screenshot({
  path: join(outputDir, `${outputBase}-poster.png`),
  fullPage: true,
});
await page.waitForTimeout(24_600);
await context.close();
await browser.close();

const captures = (await readdir(temporaryDir)).filter((file) => file.endsWith('.webm'));
if (captures.length !== 1) {
  throw new Error(`Expected one video capture, found ${captures.length}`);
}

await rename(join(temporaryDir, captures[0]), join(outputDir, `${outputBase}.webm`));

await run('/opt/homebrew/bin/ffmpeg', [
  '-y',
  '-i',
  join(outputDir, `${outputBase}.webm`),
  '-c:v',
  'libx264',
  '-preset',
  'slow',
  '-crf',
  '18',
  '-pix_fmt',
  'yuv420p',
  '-movflags',
  '+faststart',
  join(outputDir, `${outputBase}.mp4`),
]);

console.log(`Video created: marketing/summer-campaign/output/${outputBase}.mp4`);
