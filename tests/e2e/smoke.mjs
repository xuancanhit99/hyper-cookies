import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const extensionPath = path.join(projectRoot, 'dist');

const browser = await puppeteer.launch({
  headless: true,
  pipe: true,
  enableExtensions: [extensionPath]
});

try {
  const workerTarget = await browser.waitForTarget(
    (target) => target.type() === 'service_worker' && target.url().endsWith('/background.js'),
    { timeout: 15_000 }
  );
  const extensionId = new URL(workerTarget.url()).hostname;
  const page = await browser.newPage();
  await page.goto(`chrome-extension://${extensionId}/popup.html`);

  assert.equal(await page.title(), 'Hyper Cookies');
  assert.equal(
    await page.$eval('#cookies-tab', (element) => element.textContent?.trim()),
    'Cookies'
  );
  assert.equal(await page.$('#pro-toggle'), null);
  assert.equal(await page.$('#config-blocker'), null);
} finally {
  await browser.close();
}

console.log('Extension smoke test passed');
