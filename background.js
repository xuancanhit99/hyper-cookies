// Service worker cho Hyper Cookies

const COOKIE_CACHE_KEY = 'hyper-cookies:last-domain';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_COOKIES') {
    handleGetCookies(message.payload)
      .then(cookies => sendResponse({ cookies }))
      .catch(error => {
        console.error('Hyper Cookies: error while fetching cookies', error);
        sendResponse({ error: error.message });
      });
    return true; // keep channel for async response
  }

  if (message.type === 'DELETE_COOKIE') {
    chrome.cookies.remove(
      {
        url: message.payload.url,
        name: message.payload.name,
        storeId: message.payload.storeId
      },
      details => sendResponse({ details, error: chrome.runtime.lastError?.message })
    );
    return true;
  }

  if (message.type === 'REMEMBER_DOMAIN') {
    chrome.storage.local.set({ [COOKIE_CACHE_KEY]: message.payload.domain }, () => {
      sendResponse({ ok: !chrome.runtime.lastError, error: chrome.runtime.lastError?.message });
    });
    return true;
  }

  if (message.type === 'GET_LOCAL_STORAGE') {
    handleGetLocalStorage(message.payload?.tabId)
      .then(entries => sendResponse({ entries }))
      .catch(error => {
        console.error('Hyper Cookies: error while reading local storage', error);
        sendResponse({ error: error.message });
      });
    return true;
  }

  if (message.type === 'DELETE_LOCAL_STORAGE_ITEM') {
    removeLocalStorageItem(message.payload?.tabId, message.payload?.key)
      .then(result => sendResponse(result))
      .catch(error => {
        console.error('Hyper Cookies: error removing local storage item', error);
        sendResponse({ error: error.message });
      });
    return true;
  }

  if (message.type === 'SET_COOKIES') {
    importCookies(message.payload?.cookies || [], message.payload?.targetUrl)
      .then(result => sendResponse(result))
      .catch(error => {
        console.error('Hyper Cookies: error importing cookies', error);
        sendResponse({ error: error.message });
      });
    return true;
  }

  if (message.type === 'SET_LOCAL_STORAGE') {
    importLocalStorage(message.payload?.tabId, message.payload?.entries || [])
      .then(result => sendResponse(result))
      .catch(error => {
        console.error('Hyper Cookies: error importing local storage', error);
        sendResponse({ error: error.message });
      });
    return true;
  }

  if (message.type === 'UPDATE_COOKIE_FIELDS') {
    updateCookieFields(message.payload)
      .then(result => sendResponse(result))
      .catch(error => {
        console.error('Hyper Cookies: error updating cookie fields', error);
        sendResponse({ error: error.message });
      });
    return true;
  }

  if (message.type === 'UPDATE_LOCAL_STORAGE_VALUE') {
    updateLocalStorageValue(message.payload)
      .then(result => sendResponse(result))
      .catch(error => {
        console.error('Hyper Cookies: error updating local storage value', error);
        sendResponse({ error: error.message });
      });
    return true;
  }

  if (message.type === 'RENAME_LOCAL_STORAGE_KEY') {
    renameLocalStorageKey(message.payload)
      .then(result => sendResponse(result))
      .catch(error => {
        console.error('Hyper Cookies: error renaming local storage key', error);
        sendResponse({ error: error.message });
      });
    return true;
  }

  if (message.type === 'CLEAR_ALL_DATA') {
    clearAllData(message.payload)
      .then(result => sendResponse(result))
      .catch(error => {
        console.error('Hyper Cookies: error clearing data', error);
        sendResponse({ error: error.message });
      });
    return true;
  }
});

async function handleGetCookies({ url }) {
  if (!url) {
    throw new Error('URL không hợp lệ');
  }

  const cookies = await chrome.cookies.getAll({ url });
  // Lưu domain vừa truy vấn để popup nhớ trạng thái
  try {
    const domain = new URL(url).hostname;
    await chrome.storage.local.set({ [COOKIE_CACHE_KEY]: domain });
  } catch (error) {
    console.warn('Hyper Cookies: cannot cache domain', error);
  }
  return cookies;
}

async function handleGetLocalStorage(tabId) {
  if (!tabId) throw new Error('Tab ID không hợp lệ');
  const [injectionResult] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      try {
        return {
          entries: Object.keys(localStorage).map(key => ({
            key,
            value: localStorage.getItem(key)
          }))
        };
      } catch (error) {
        return { error: error.message };
      }
    }
  });

  if (!injectionResult) throw new Error('Không nhận được dữ liệu từ tab');
  if (injectionResult.result?.error) throw new Error(injectionResult.result.error);
  return injectionResult.result.entries;
}

async function removeLocalStorageItem(tabId, key) {
  if (!tabId || !key) throw new Error('Thiếu tabId hoặc key');
  const [injectionResult] = await chrome.scripting.executeScript({
    target: { tabId },
    func: keyName => {
      try {
        localStorage.removeItem(keyName);
        return { ok: true };
      } catch (error) {
        return { error: error.message };
      }
    },
    args: [key]
  });

  if (!injectionResult) throw new Error('Không có phản hồi khi xóa local storage');
  if (injectionResult.result?.error) throw new Error(injectionResult.result.error);
  return { ok: true };
}

async function importCookies(cookies, fallbackUrl) {
  if (!Array.isArray(cookies) || cookies.length === 0) {
    return { imported: 0 };
  }

  let imported = 0;
  for (const cookie of cookies) {
    if (!cookie?.name) continue;
    const url = buildCookieUrl(cookie, fallbackUrl);
    if (!url) continue;
    try {
      await chrome.cookies.set({
        url,
        name: cookie.name,
        value: cookie.value ?? '',
        domain: cookie.domain,
        path: cookie.path,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        sameSite: cookie.sameSite,
        expirationDate: cookie.expirationDate,
        storeId: cookie.storeId
      });
      imported += 1;
    } catch (error) {
      console.warn('Hyper Cookies: failed to import cookie', cookie.name, error);
    }
  }
  return { imported };
}

async function importLocalStorage(tabId, entries) {
  if (!tabId) throw new Error('Tab ID không hợp lệ');
  if (!Array.isArray(entries) || entries.length === 0) {
    return { imported: 0 };
  }
  const [result] = await chrome.scripting.executeScript({
    target: { tabId },
    func: items => {
      try {
        items.forEach(item => {
          if (item?.key != null) {
            localStorage.setItem(String(item.key), item.value ?? '');
          }
        });
        return { imported: items.length };
      } catch (error) {
        return { error: error.message };
      }
    },
    args: [entries]
  });

  if (!result) throw new Error('Không thể import local storage');
  if (result.result?.error) throw new Error(result.result.error);
  return { imported: result.result?.imported ?? 0 };
}

function buildCookieUrl(cookie, fallbackUrl) {
  try {
    const domain = (cookie.domain || new URL(fallbackUrl).hostname || '').replace(/^\./, '');
    if (!domain) return null;
    const protocol = cookie.secure ? 'https://' : 'http://';
    const path = cookie.path || '/';
    return `${protocol}${domain}${path.startsWith('/') ? path : `/${path}`}`;
  } catch (error) {
    console.warn('Hyper Cookies: cannot build cookie url', error);
    return null;
  }
}

async function updateCookieFields({ cookie, changes, fallbackUrl }) {
  if (!cookie?.name) {
    throw new Error('Cookie không hợp lệ');
  }
  const updatedCookie = { ...cookie, ...changes };
  const url = buildCookieUrl(updatedCookie, fallbackUrl);
  if (!url) {
    throw new Error('Không xác định được URL cookie');
  }
  await chrome.cookies.set({
    url,
    name: updatedCookie.name,
    value: updatedCookie.value ?? '',
    domain: updatedCookie.domain,
    path: updatedCookie.path || '/',
    secure: Boolean(updatedCookie.secure),
    httpOnly: Boolean(updatedCookie.httpOnly),
    sameSite: updatedCookie.sameSite,
    expirationDate: updatedCookie.expirationDate,
    storeId: updatedCookie.storeId
  });

  const identityChanged =
    updatedCookie.name !== cookie.name ||
    updatedCookie.domain !== cookie.domain ||
    updatedCookie.path !== cookie.path;

  if (identityChanged) {
    try {
      const originalUrl = buildCookieUrl(cookie, fallbackUrl);
      if (originalUrl) {
        await chrome.cookies.remove({
          url: originalUrl,
          name: cookie.name,
          storeId: cookie.storeId
        });
      }
    } catch (error) {
      console.warn('Hyper Cookies: failed to remove original cookie after update', error);
    }
  }
  return { ok: true, updatedCookie };
}

async function updateLocalStorageValue({ tabId, key, newValue }) {
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
        return { error: error.message };
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

async function renameLocalStorageKey({ tabId, oldKey, newKey }) {
  if (!tabId || oldKey == null || newKey == null) {
    throw new Error('Thiếu thông tin để đổi tên local storage');
  }
  const [result] = await chrome.scripting.executeScript({
    target: { tabId },
    func: (fromKey, toKey) => {
      try {
        const value = localStorage.getItem(fromKey);
        localStorage.removeItem(fromKey);
        localStorage.setItem(String(toKey), value ?? '');
        return { ok: true, value };
      } catch (error) {
        return { error: error.message };
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

async function clearAllData({ url, tabId }) {
  if (!url) throw new Error('URL khng h?p l?');
  if (!tabId) throw new Error('Tab ID khng h?p l?');

  const cookies = await chrome.cookies.getAll({ url });
  let removedCookies = 0;
  for (const cookie of cookies) {
    try {
      const cookieUrl = buildCookieUrl(cookie, url);
      if (!cookieUrl) continue;
      await chrome.cookies.remove({
        url: cookieUrl,
        name: cookie.name,
        storeId: cookie.storeId
      });
      removedCookies += 1;
    } catch (error) {
      console.warn('Hyper Cookies: failed to remove cookie while clearing', cookie.name, error);
    }
  }

  const [result] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      try {
        localStorage.clear();
        return { cleared: true };
      } catch (error) {
        return { error: error.message };
      }
    }
  });

  if (!result) throw new Error('Khng th? xa local storage');
  if (result.result?.error) throw new Error(result.result.error);

  return { ok: true, removedCookies, clearedStorage: true };
}

