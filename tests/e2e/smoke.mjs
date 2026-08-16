/* global document */

import assert from 'node:assert/strict';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const extensionPath = path.join(projectRoot, 'dist');
const server = http.createServer((_request, response) => {
  response.writeHead(200, {
    'content-type': 'text/html; charset=utf-8',
    'set-cookie': 'hyper_cookie_probe=present; Path=/; HttpOnly; SameSite=Lax'
  });
  response.end('<!doctype html><title>Hyper Cookies smoke test</title>');
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
assert(address && typeof address !== 'string');
const pageUrl = `http://127.0.0.1:${address.port}/`;

const browser = await puppeteer.launch({
  headless: true,
  pipe: true,
  args: process.platform === 'linux' ? ['--no-sandbox'] : [],
  enableExtensions: [extensionPath]
});

try {
  const page = await browser.newPage();
  await page.goto(pageUrl);
  const extension = [...(await browser.extensions()).values()][0];
  assert(extension);
  await page.triggerExtensionAction(extension);
  const popupTarget = await browser.waitForTarget(
    (target) => target.type() === 'page' && target.url().endsWith('/popup.html'),
    { timeout: 15_000 }
  );
  const popup = await popupTarget.asPage();
  assert(popup);
  await popup.waitForFunction(
    (expectedUrl) => document.querySelector('#target-url')?.value === expectedUrl,
    {},
    pageUrl
  );
  await popup.click('#cookies-tab');
  await popup.waitForFunction(() =>
    [...document.querySelectorAll('#cookie-table-body tr')].some((row) =>
      row.textContent?.includes('hyper_cookie_probe')
    )
  );

  assert.equal(await popup.title(), 'Hyper Cookies');
  assert.equal(
    await popup.$eval('#cookies-tab', (element) => element.textContent?.trim()),
    'Cookies'
  );
  assert.equal(await popup.$eval('#target-url', (element) => element.value), pageUrl);
  assert.match(
    await popup.$eval('#cookie-table-body', (element) => element.textContent ?? ''),
    /hyper_cookie_probe/
  );
  assert.equal(await popup.$('#cookie-permission-button'), null);
  assert.equal(await popup.$('#pro-toggle'), null);
  assert.equal(await popup.$('#config-blocker'), null);
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

console.log('Extension smoke test passed');
