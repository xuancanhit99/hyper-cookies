/* global chrome, document, window */

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
    'set-cookie': [
      'hyper_cookie_probe=present; Path=/; HttpOnly; SameSite=Lax',
      'duplicate_cookie=root; Path=/; HttpOnly; SameSite=Lax',
      'duplicate_cookie=app; Path=/app; HttpOnly; SameSite=Lax'
    ]
  });
  response.end(`<!doctype html>
    <title>Hyper Cookies smoke test</title>
    <script>
      localStorage.setItem('', 'empty-key');
      localStorage.setItem('source', 'source-value');
      localStorage.setItem('target', 'target-value');
    </script>`);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
assert(address && typeof address !== 'string');
const pageUrl = `http://127.0.0.1:${address.port}/app/page`;

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

  const hostOnlyUpdate = await popup.evaluate(async (url) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const before = (await chrome.cookies.getAll({ url })).find(
      (cookie) => cookie.name === 'hyper_cookie_probe'
    );
    const response = await chrome.runtime.sendMessage({
      type: 'UPDATE_COOKIE_FIELDS',
      payload: { cookie: before, changes: { value: 'updated' }, fallbackUrl: url }
    });
    const after = (await chrome.cookies.getAll({ url })).find(
      (cookie) => cookie.name === 'hyper_cookie_probe'
    );
    return { response, before, after, tabId: tab.id };
  }, pageUrl);
  assert.equal(hostOnlyUpdate.response.error, undefined);
  assert.equal(hostOnlyUpdate.before.hostOnly, true);
  assert.equal(hostOnlyUpdate.after.hostOnly, true);
  assert.equal(hostOnlyUpdate.after.value, 'updated');

  const duplicateCookiesBeforeDelete = await popup.evaluate(
    async (url) =>
      (await chrome.cookies.getAll({ url })).filter((cookie) => cookie.name === 'duplicate_cookie'),
    pageUrl
  );
  assert.deepEqual(duplicateCookiesBeforeDelete.map((cookie) => cookie.path).sort(), ['/', '/app']);

  const deleteTriggered = await popup.evaluate(() => {
    window.confirm = () => true;
    const row = [...document.querySelectorAll('#cookie-table-body tr')].find((candidate) =>
      candidate.querySelector('.hc-cookie-value')?.textContent?.includes('app')
    );
    const button = row?.querySelector('.hc-delete');
    button?.click();
    return Boolean(button);
  });
  assert.equal(deleteTriggered, true);
  try {
    await popup.waitForFunction(
      () => {
        const text = document.querySelector('#cookie-table-body')?.textContent ?? '';
        return text.includes('root') && !text.includes('app');
      },
      { timeout: 5_000 }
    );
  } catch (error) {
    const state = await popup.evaluate(
      async (url) => ({
        cookies: document.querySelector('#cookie-table-body')?.textContent ?? '',
        toast: document.querySelector('#toast')?.textContent ?? '',
        browserCookies: (await chrome.cookies.getAll({ url })).filter(
          (cookie) => cookie.name === 'duplicate_cookie'
        )
      }),
      pageUrl
    );
    throw new Error(`Cookie delete UI state: ${JSON.stringify(state)}`, { cause: error });
  }

  const partitionResult = await popup.evaluate(async (url) => {
    const topLevelSite = 'https://example.com';
    await chrome.cookies.set({
      url: `${topLevelSite}/`,
      name: 'partition_probe',
      value: 'partitioned',
      path: '/',
      secure: true,
      sameSite: 'no_restriction',
      partitionKey: { topLevelSite }
    });
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const listed = await chrome.runtime.sendMessage({
      type: 'GET_COOKIES',
      payload: { url: `${topLevelSite}/`, tabId: tab.id }
    });
    const partitioned = listed.cookies?.find((cookie) => cookie.name === 'partition_probe');
    const removed = await chrome.runtime.sendMessage({
      type: 'DELETE_COOKIE',
      payload: { cookie: partitioned, fallbackUrl: `${topLevelSite}/` }
    });
    return { partitioned, removed, activeUrl: url };
  }, pageUrl);
  assert.equal(partitionResult.partitioned.partitionKey.topLevelSite, 'https://example.com');
  assert(partitionResult.removed.details);

  await popup.click('#storage-tab');
  await popup.waitForFunction(() =>
    document.querySelector('#storage-table-body')?.textContent?.includes('source')
  );
  const storageResult = await popup.evaluate(async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const removeEmpty = await chrome.runtime.sendMessage({
      type: 'DELETE_LOCAL_STORAGE_ITEM',
      payload: { tabId: tab.id, key: '' }
    });
    const renameConflict = await chrome.runtime.sendMessage({
      type: 'RENAME_LOCAL_STORAGE_KEY',
      payload: { tabId: tab.id, oldKey: 'source', newKey: 'target' }
    });
    return { removeEmpty, renameConflict };
  });
  assert.equal(storageResult.removeEmpty.ok, true);
  assert.match(storageResult.renameConflict.error, /tồn tại/);
  assert.equal(await page.evaluate(() => localStorage.getItem('')), null);
  assert.equal(await page.evaluate(() => localStorage.getItem('source')), 'source-value');
  assert.equal(await page.evaluate(() => localStorage.getItem('target')), 'target-value');

  assert.equal(await popup.$('#cookie-permission-button'), null);
  assert.equal(await popup.$('#pro-toggle'), null);
  assert.equal(await popup.$('#config-blocker'), null);
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

console.log('Extension smoke test passed');
