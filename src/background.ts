import { MessageType } from './shared/messages';
import {
  cookieAppliesToTarget,
  cookieIdentity,
  createCookieSetDetails,
  partitionKeyForUrl
} from './shared/cookies';
import type { LocalStorageEntry } from './shared/snapshot';

// Service worker cho Hyper Cookies

const LEGACY_STORAGE_KEYS = [
  'hyper-cookies:last-domain',
  'hyper-cookies:pro-enabled',
  'hyper-cookies:pro-info'
];

interface TabTargetPayload {
  tabId?: number;
}

interface CookieTargetPayload extends TabTargetPayload {
  url: string;
}

interface CookieActionPayload {
  cookie: chrome.cookies.Cookie;
  fallbackUrl: string;
}

type CookieChanges = Partial<
  Pick<chrome.cookies.Cookie, 'name' | 'value' | 'domain' | 'expirationDate'>
>;

interface UpdateCookiePayload extends CookieActionPayload {
  changes: CookieChanges;
}

interface LocalStorageValuePayload extends TabTargetPayload {
  key?: string;
  newValue?: string;
}

interface RenameLocalStoragePayload extends TabTargetPayload {
  oldKey?: string;
  newKey?: string;
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.remove(LEGACY_STORAGE_KEYS);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === MessageType.GetCookies) {
    handleGetCookies(message.payload)
      .then((cookies) => sendResponse({ cookies }))
      .catch((error) => {
        console.error('Hyper Cookies: error while fetching cookies', error);
        sendResponse({ error: error.message });
      });
    return true; // keep channel for async response
  }

  if (message.type === MessageType.DeleteCookie) {
    deleteCookie(message.payload)
      .then((result) => sendResponse(result))
      .catch((error) => {
        console.error('Hyper Cookies: error deleting cookie', error);
        sendResponse({ error: error.message });
      });
    return true;
  }

  if (message.type === MessageType.GetLocalStorage) {
    handleGetLocalStorage(message.payload?.tabId)
      .then((entries) => sendResponse({ entries }))
      .catch((error) => {
        console.error('Hyper Cookies: error while reading local storage', error);
        sendResponse({ error: error.message });
      });
    return true;
  }

  if (message.type === MessageType.DeleteLocalStorageItem) {
    removeLocalStorageItem(message.payload?.tabId, message.payload?.key)
      .then((result) => sendResponse(result))
      .catch((error) => {
        console.error('Hyper Cookies: error removing local storage item', error);
        sendResponse({ error: error.message });
      });
    return true;
  }

  if (message.type === MessageType.SetCookies) {
    importCookies(
      message.payload?.cookies || [],
      message.payload?.targetUrl,
      message.payload?.tabId
    )
      .then((result) => sendResponse(result))
      .catch((error) => {
        console.error('Hyper Cookies: error importing cookies', error);
        sendResponse({ error: error.message });
      });
    return true;
  }

  if (message.type === MessageType.SetLocalStorage) {
    importLocalStorage(message.payload?.tabId, message.payload?.entries || [])
      .then((result) => sendResponse(result))
      .catch((error) => {
        console.error('Hyper Cookies: error importing local storage', error);
        sendResponse({ error: error.message });
      });
    return true;
  }

  if (message.type === MessageType.UpdateCookieFields) {
    updateCookieFields(message.payload)
      .then((result) => sendResponse(result))
      .catch((error) => {
        console.error('Hyper Cookies: error updating cookie fields', error);
        sendResponse({ error: error.message });
      });
    return true;
  }

  if (message.type === MessageType.UpdateLocalStorageValue) {
    updateLocalStorageValue(message.payload)
      .then((result) => sendResponse(result))
      .catch((error) => {
        console.error('Hyper Cookies: error updating local storage value', error);
        sendResponse({ error: error.message });
      });
    return true;
  }

  if (message.type === MessageType.RenameLocalStorageKey) {
    renameLocalStorageKey(message.payload)
      .then((result) => sendResponse(result))
      .catch((error) => {
        console.error('Hyper Cookies: error renaming local storage key', error);
        sendResponse({ error: error.message });
      });
    return true;
  }

  if (message.type === MessageType.ClearAllData) {
    clearAllData(message.payload)
      .then((result) => sendResponse(result))
      .catch((error) => {
        console.error('Hyper Cookies: error clearing data', error);
        sendResponse({ error: error.message });
      });
    return true;
  }
});

async function handleGetCookies({ url, tabId }: CookieTargetPayload) {
  if (!url) {
    throw new Error('URL không hợp lệ');
  }
  const storeId = await resolveCookieStoreId(tabId);
  const query = { url, storeId };
  const regularCookies = await chrome.cookies.getAll(query);
  const partitionKey = partitionKeyForUrl(url);
  const partitionedCookies = partitionKey
    ? await chrome.cookies.getAll({ ...query, partitionKey }).catch((error) => {
        console.warn('Hyper Cookies: cannot query partitioned cookies', error);
        return [];
      })
    : [];
  return [regularCookies, partitionedCookies]
    .flat()
    .filter(
      (cookie, index, cookies) =>
        cookies.findIndex((candidate) => cookieIdentity(candidate) === cookieIdentity(cookie)) ===
        index
    );
}

async function resolveCookieStoreId(tabId?: number): Promise<string | undefined> {
  if (!tabId) return undefined;
  const stores = await chrome.cookies.getAllCookieStores();
  return stores.find((store) => store.tabIds.includes(tabId))?.id;
}

async function deleteCookie({ cookie, fallbackUrl }: CookieActionPayload) {
  if (!cookie || !fallbackUrl) throw new Error('Cookie không hợp lệ');
  return { details: await removeExactCookie(cookie, fallbackUrl) };
}

async function removeExactCookie(cookie: chrome.cookies.Cookie, fallbackUrl: string) {
  const expiredCookie = {
    ...cookie,
    session: false,
    expirationDate: Math.floor(Date.now() / 1000) - 60
  };
  const setDetails = createCookieSetDetails(expiredCookie, fallbackUrl, cookie.storeId);
  if (!setDetails) throw new Error('Không xác định được cookie cần xóa');

  await chrome.cookies.set(setDetails);
  const query = {
    url: setDetails.url,
    name: cookie.name,
    storeId: cookie.storeId || undefined,
    partitionKey: cookie.partitionKey || undefined
  };
  const remainingCookies = await chrome.cookies.getAll(query);
  if (remainingCookies.some((candidate) => cookieIdentity(candidate) === cookieIdentity(cookie))) {
    throw new Error('Không thể xóa chính xác cookie đã chọn');
  }

  return {
    url: setDetails.url,
    name: cookie.name,
    storeId: cookie.storeId,
    partitionKey: cookie.partitionKey
  };
}

async function handleGetLocalStorage(tabId?: number): Promise<LocalStorageEntry[]> {
  if (!tabId) throw new Error('Tab ID không hợp lệ');
  const [injectionResult] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      try {
        return {
          entries: Object.keys(localStorage).map((key) => ({
            key,
            value: localStorage.getItem(key)
          }))
        };
      } catch (error) {
        return { error: error instanceof Error ? error.message : String(error) };
      }
    }
  });

  const result = injectionResult?.result;
  if (!result) throw new Error('Không nhận được dữ liệu từ tab');
  if (result.error) throw new Error(result.error);
  return result.entries || [];
}

async function removeLocalStorageItem(tabId?: number, key?: string) {
  if (!tabId || key == null) throw new Error('Thiếu tabId hoặc key');
  const [injectionResult] = await chrome.scripting.executeScript({
    target: { tabId },
    func: (keyName) => {
      try {
        localStorage.removeItem(keyName);
        return { ok: true };
      } catch (error) {
        return { error: error instanceof Error ? error.message : String(error) };
      }
    },
    args: [key]
  });

  if (!injectionResult) throw new Error('Không có phản hồi khi xóa local storage');
  if (injectionResult.result?.error) throw new Error(injectionResult.result.error);
  return { ok: true };
}

async function importCookies(
  cookies: chrome.cookies.Cookie[],
  fallbackUrl?: string,
  tabId?: number
) {
  if (!Array.isArray(cookies) || cookies.length === 0) {
    return { requested: 0, imported: 0, failed: 0, failures: [] };
  }
  if (!fallbackUrl) throw new Error('URL đích không hợp lệ');
  const targetStoreId = await resolveCookieStoreId(tabId);
  let imported = 0;
  const failures: Array<{ index: number; name: string; reason: string }> = [];
  for (const [index, cookie] of cookies.entries()) {
    if (!cookie?.name || !cookieAppliesToTarget(cookie, fallbackUrl)) {
      failures.push({ index, name: cookie?.name || '', reason: 'invalid_or_unrelated' });
      continue;
    }
    const details = createCookieSetDetails(cookie, fallbackUrl, targetStoreId);
    if (!details) {
      failures.push({ index, name: cookie.name, reason: 'invalid_cookie' });
      continue;
    }
    try {
      const result = await chrome.cookies.set(details);
      if (!result) throw new Error('Chrome did not return the imported cookie');
      imported += 1;
    } catch (error) {
      console.warn('Hyper Cookies: failed to import cookie', cookie.name, error);
      failures.push({ index, name: cookie.name, reason: errorMessage(error) });
    }
  }
  return {
    requested: cookies.length,
    imported,
    failed: failures.length,
    failures
  };
}

async function importLocalStorage(tabId: number | undefined, entries: LocalStorageEntry[]) {
  if (!tabId) throw new Error('Tab ID không hợp lệ');
  if (!Array.isArray(entries) || entries.length === 0) {
    return { requested: 0, imported: 0, failed: 0 };
  }
  const [result] = await chrome.scripting.executeScript({
    target: { tabId },
    func: (items) => {
      try {
        let imported = 0;
        items.forEach((item) => {
          if (
            typeof item?.key === 'string' &&
            (typeof item.value === 'string' || item.value === null)
          ) {
            localStorage.setItem(item.key, item.value ?? '');
            imported += 1;
          }
        });
        return { imported };
      } catch (error) {
        return { error: error instanceof Error ? error.message : String(error) };
      }
    },
    args: [entries]
  });

  if (!result) throw new Error('Không thể import local storage');
  if (result.result?.error) throw new Error(result.result.error);
  const imported = result.result?.imported ?? 0;
  return { requested: entries.length, imported, failed: entries.length - imported };
}

async function updateCookieFields({ cookie, changes, fallbackUrl }: UpdateCookiePayload) {
  if (!cookie?.name) {
    throw new Error('Cookie không hợp lệ');
  }
  const updatedCookie = { ...cookie, ...changes };
  if (Object.prototype.hasOwnProperty.call(changes, 'expirationDate')) {
    updatedCookie.session = changes.expirationDate == null;
  }
  if (!cookieAppliesToTarget(updatedCookie, fallbackUrl)) {
    throw new Error('Domain cookie không thuộc tab hiện tại');
  }
  const setDetails = createCookieSetDetails(updatedCookie, fallbackUrl);
  if (!setDetails) throw new Error('Không xác định được URL cookie');
  const savedCookie = await chrome.cookies.set(setDetails);
  if (!savedCookie) throw new Error('Chrome không trả về cookie đã cập nhật');

  const identityChanged = cookieIdentity(updatedCookie) !== cookieIdentity(cookie);

  if (identityChanged) {
    await removeExactCookie(cookie, fallbackUrl);
  }
  return { ok: true, updatedCookie: savedCookie };
}

async function updateLocalStorageValue({ tabId, key, newValue }: LocalStorageValuePayload) {
  if (!tabId || key == null) {
    throw new Error('Thiếu thông tin để cập nhật local storage');
  }
  const [result] = await chrome.scripting.executeScript({
    target: { tabId },
    func: (itemKey, itemValue) => {
      try {
        localStorage.setItem(String(itemKey), itemValue ?? '');
        return { ok: true };
      } catch (error) {
        return { error: error instanceof Error ? error.message : String(error) };
      }
    },
    args: [key, newValue]
  });

  if (!result) {
    throw new Error('Không thể cập nhật local storage');
  }
  if (result.result?.error) {
    throw new Error(result.result.error);
  }
  return { ok: true };
}

async function renameLocalStorageKey({ tabId, oldKey, newKey }: RenameLocalStoragePayload) {
  if (!tabId || oldKey == null || newKey == null) {
    throw new Error('Thiếu thông tin để đổi tên local storage');
  }
  const [result] = await chrome.scripting.executeScript({
    target: { tabId },
    func: (fromKey, toKey) => {
      try {
        const value = localStorage.getItem(fromKey);
        if (value === null) return { error: 'Không tìm thấy key nguồn' };
        if (fromKey !== toKey && localStorage.getItem(toKey) !== null) {
          return { error: 'Key đích đã tồn tại' };
        }
        localStorage.setItem(String(toKey), value ?? '');
        if (fromKey !== toKey) localStorage.removeItem(fromKey);
        return { ok: true, value };
      } catch (error) {
        return { error: error instanceof Error ? error.message : String(error) };
      }
    },
    args: [oldKey, newKey]
  });

  if (!result) {
    throw new Error('Không thể đổi tên local storage');
  }
  if (result.result?.error) {
    throw new Error(result.result.error);
  }
  return { ok: true, value: result.result?.value };
}

async function clearAllData({ url, tabId }: CookieTargetPayload) {
  if (!url) throw new Error('URL không hợp lệ');
  if (!tabId) throw new Error('Tab ID không hợp lệ');

  const cookies = await handleGetCookies({ url, tabId });
  let removedCookies = 0;
  const cookieFailures = [];
  for (const cookie of cookies) {
    try {
      await removeExactCookie(cookie, url);
      removedCookies += 1;
    } catch (error) {
      console.warn('Hyper Cookies: failed to remove cookie while clearing', cookie.name, error);
      cookieFailures.push({ name: cookie.name, reason: errorMessage(error) });
    }
  }

  const [result] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      try {
        localStorage.clear();
        return { cleared: true };
      } catch (error) {
        return { error: error instanceof Error ? error.message : String(error) };
      }
    }
  });

  if (!result) throw new Error('Không thể xóa local storage');
  if (result.result?.error) throw new Error(result.result.error);

  return {
    ok: cookieFailures.length === 0,
    removedCookies,
    failedCookies: cookieFailures.length,
    cookieFailures,
    clearedStorage: true
  };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
