const cookieTableBody = document.getElementById('cookie-table-body');
const storageTableBody = document.getElementById('storage-table-body');
const cookieRowTemplate = document.getElementById('cookie-row-template');
const storageRowTemplate = document.getElementById('storage-row-template');
const homeSection = document.getElementById('home-section');
const cookiesSection = document.getElementById('cookies-section');
const storageSection = document.getElementById('storage-section');
const homeTabBtn = document.getElementById('home-tab');
const cookiesTabBtn = document.getElementById('cookies-tab');
const storageTabBtn = document.getElementById('storage-tab');
const toastEl = document.getElementById('toast');
const targetUrlInput = document.getElementById('target-url');
const activeDomainLabel = document.getElementById('active-domain');
const refreshBtn = document.getElementById('refresh-btn');
const exportJsonBtn = document.getElementById('export-json');
const importJsonBtn = document.getElementById('import-json');
const importFileInput = document.getElementById('import-file');
const importDriveBtn = document.getElementById('import-drive');
const driveModal = document.getElementById('drive-import-modal');
const driveForm = document.getElementById('drive-import-form');
const driveUrlInput = document.getElementById('drive-import-url');
const driveCancelBtn = document.getElementById('drive-import-cancel');
const driveSubmitBtn = document.getElementById('drive-import-submit');
const driveCloseBtn = document.getElementById('drive-import-close');
const copyUrlBtn = document.getElementById('copy-url-btn');
const themeToggleBtn = document.getElementById('theme-toggle');
const languageToggleBtn = document.getElementById('language-toggle');
const autoReloadCheckbox = document.getElementById('auto-reload-checkbox');

activeDomainLabel.dataset.domainSet = 'false';

const VIEW_HOME = 'home';
const VIEW_COOKIES = 'cookies';
const VIEW_STORAGE = 'storage';
const LANGUAGE_STORAGE_KEY = 'hyper-cookie:language';
const THEME_STORAGE_KEY = 'hyper-cookie:theme';
const AUTO_RELOAD_KEY = 'hyper-cookie:auto-reload';
const DEFAULT_LANGUAGE = 'vi';
const DEFAULT_THEME = 'dark';
const DEFAULT_AUTO_RELOAD = true;
const FLAG_BY_LANG = {
  vi: {
    src: 'images/vn.svg',
    alt: 'Vietnamese flag'
  },
  en: {
    src: 'images/us.svg',
    alt: 'United States flag'
  }
};

const translations = {
  vi: {
    loadingDomain: 'Đang tải...',
    tabHome: 'Trang chủ',
    tabCookies: 'Cookies',
    tabStorage: 'Bộ nhớ',
    urlLabel: 'URL',
    exportJson: 'Export JSON',
    importJson: 'Import JSON',
    importDrive: 'Import Drive',
    importDriveModalTitle: 'Import từ Google Drive',
    importDriveModalDescription: 'Dán link chia sẻ file JSON trên Google Drive để bắt đầu import.',
    importDriveLinkLabel: 'Link Google Drive',
    importDrivePlaceholder: 'https://drive.google.com/...',
    importDriveUrlMissing: 'Nhập link Google Drive hợp lệ',
    importDriveFetchError: 'Không thể tải file: {{error}}',
    importDriveStart: 'Import',
    cancel: 'Huỷ',
    closeModal: 'Đóng',
    cookiesColumnName: 'Tên',
    cookiesColumnDomain: 'Domain',
    cookiesColumnExpiry: 'Hết hạn',
    cookiesColumnValue: 'Giá trị',
    storageColumnKey: 'Key',
    storageColumnValue: 'Giá trị',
    cookiesEmpty: 'Không tìm thấy cookie nào',
    storageEmpty: 'Không tìm thấy item nào',
    emptyValue: '(trống)',
    sessionCookie: 'Phiên',
    invalidTabUrl: 'Tab hiện tại không có URL hợp lệ',
    enterValidUrl: 'Nhập URL hợp lệ trước đã',
    loadCookiesError: 'Không thể tải cookie: {{error}}',
    loadStorageError: 'Không thể tải local storage: {{error}}',
    unknownTab: 'Không xác định được tab hiện tại',
    deleteCookieConfirm: 'Xóa cookie {{name}}?',
    deleteCookieSuccess: 'Đã xóa {{name}}',
    deleteCookieError: 'Không thể xóa cookie: {{error}}',
    deleteStorageConfirm: 'Xóa localStorage key "{{key}}"?',
    deleteStorageSuccess: 'Đã xóa {{key}}',
    deleteStorageError: 'Không thể xóa local storage: {{error}}',
    noUrlToCopy: 'Không có URL để copy',
    urlCopied: 'Đã copy URL',
    urlCopyFailed: 'Không thể copy URL',
    exportUrlMissing: 'Nhập URL hợp lệ trước khi export',
    exportTabMissing: 'Không xác định được tab hiện tại',
    exportSuccess: 'Đã export dữ liệu',
    exportError: 'Export thất bại: {{error}}',
    importInvalidFile: 'File import không hợp lệ',
    importHostMismatch: 'Dữ liệu được export từ {{source}}, trong khi tab hiện tại là {{current}}. Bạn có chắc muốn import?',
    importSuccess: 'Import thành công',
    importUrlMissing: 'Chưa xác định URL để import cookie',
    importTabMissing: 'Không xác định được tab hiện tại',
    importError: 'Import thất bại: {{error}}',
    setCookiesError: 'Không thể import cookie: {{error}}',
    setStorageError: 'Không thể import local storage: {{error}}',
    validatePayloadMissingData: 'File không chứa dữ liệu hợp lệ',
    validatePayloadUnsupportedVersion: 'Phiên bản file không được hỗ trợ',
    validatePayloadInvalid: 'File import không hợp lệ',
    copyUrlTitle: 'Copy URL hiện tại',
    refreshTooltip: 'Tải lại dữ liệu',
    deleteCookieTitle: 'Xóa cookie',
    deleteStorageTitle: 'Xóa item',
    themeToggleDark: 'Chuyển sang giao diện tối',
    themeToggleLight: 'Chuyển sang giao diện sáng',
    languageToggle: 'Chuyển ngôn ngữ',
    autoReloadLabel: 'Tự làm mới trang sau khi import JSON',
    updateCookieSuccess: 'Đã cập nhật cookie',
    updateStorageSuccess: 'Đã cập nhật local storage',
    updateErrorGeneric: 'Không thể cập nhật giá trị',
    cookieNameRequired: 'Tên cookie không được để trống',
    cookieDomainRequired: 'Domain cookie không được để trống',
    storageKeyRequired: 'Key không được để trống',
    invalidExpiryFormat: 'Định dạng thời gian hết hạn không hợp lệ'
  },
  en: {
    loadingDomain: 'Loading...',
    tabHome: 'Home',
    tabCookies: 'Cookies',
    tabStorage: 'Local Storage',
    urlLabel: 'URL',
    exportJson: 'Export JSON',
    importJson: 'Import JSON',
    importDrive: 'Import Drive',
    importDriveModalTitle: 'Import from Google Drive',
    importDriveModalDescription: 'Paste the shared JSON link from Google Drive to import.',
    importDriveLinkLabel: 'Google Drive link',
    importDrivePlaceholder: 'https://drive.google.com/...',
    importDriveUrlMissing: 'Enter a Google Drive link',
    importDriveFetchError: 'Unable to fetch file: {{error}}',
    importDriveStart: 'Import',
    cancel: 'Cancel',
    closeModal: 'Close',
    cookiesColumnName: 'Name',
    cookiesColumnDomain: 'Domain',
    cookiesColumnExpiry: 'Expires',
    cookiesColumnValue: 'Value',
    storageColumnKey: 'Key',
    storageColumnValue: 'Value',
    cookiesEmpty: 'No cookies found',
    storageEmpty: 'No items found',
    emptyValue: '(empty)',
    sessionCookie: 'Session',
    invalidTabUrl: 'The current tab does not have a valid URL',
    enterValidUrl: 'Enter a valid URL first',
    loadCookiesError: 'Unable to load cookies: {{error}}',
    loadStorageError: 'Unable to load local storage: {{error}}',
    unknownTab: 'Cannot determine the current tab',
    deleteCookieConfirm: 'Delete cookie {{name}}?',
    deleteCookieSuccess: 'Deleted {{name}}',
    deleteCookieError: 'Unable to delete cookie: {{error}}',
    deleteStorageConfirm: 'Delete localStorage key "{{key}}"?',
    deleteStorageSuccess: 'Deleted {{key}}',
    deleteStorageError: 'Unable to delete local storage: {{error}}',
    noUrlToCopy: 'No URL to copy',
    urlCopied: 'URL copied',
    urlCopyFailed: 'Unable to copy URL',
    exportUrlMissing: 'Enter a valid URL before exporting',
    exportTabMissing: 'Cannot determine the current tab',
    exportSuccess: 'Data exported',
    exportError: 'Export failed: {{error}}',
    importInvalidFile: 'Invalid import file',
    importHostMismatch: 'Data was exported from {{source}} while the current tab is {{current}}. Do you still want to import?',
    importSuccess: 'Import successful',
    importUrlMissing: 'No URL available to import cookies into',
    importTabMissing: 'Cannot determine the current tab',
    importError: 'Import failed: {{error}}',
    setCookiesError: 'Unable to import cookies: {{error}}',
    setStorageError: 'Unable to import local storage: {{error}}',
    validatePayloadMissingData: 'File does not contain valid data',
    validatePayloadUnsupportedVersion: 'File version is not supported',
    validatePayloadInvalid: 'Invalid import file',
    copyUrlTitle: 'Copy current URL',
    refreshTooltip: 'Reload data',
    deleteCookieTitle: 'Delete cookie',
    deleteStorageTitle: 'Delete item',
    themeToggleDark: 'Switch to dark theme',
    themeToggleLight: 'Switch to light theme',
    languageToggle: 'Switch language',
    autoReloadLabel: 'Refresh tab after import JSON',
    updateCookieSuccess: 'Cookie updated',
    updateStorageSuccess: 'Local storage updated',
    updateErrorGeneric: 'Unable to update value',
    cookieNameRequired: 'Cookie name cannot be empty',
    cookieDomainRequired: 'Cookie domain cannot be empty',
    storageKeyRequired: 'Key cannot be empty',
    invalidExpiryFormat: 'Invalid expiration date'
  }
};

let currentCookies = [];
let currentStorageEntries = [];
let activeView = VIEW_HOME;
let activeTab = null;
let currentLanguage = DEFAULT_LANGUAGE;
let currentTheme = DEFAULT_THEME;
let autoReloadEnabled = DEFAULT_AUTO_RELOAD;

document.addEventListener('DOMContentLoaded', init);
refreshBtn.addEventListener('click', loadActiveData);
homeTabBtn.addEventListener('click', () => setActiveView(VIEW_HOME));
cookiesTabBtn.addEventListener('click', () => setActiveView(VIEW_COOKIES));
storageTabBtn.addEventListener('click', () => setActiveView(VIEW_STORAGE));
exportJsonBtn.addEventListener('click', exportData);
importJsonBtn.addEventListener('click', () => importFileInput.click());
importFileInput.addEventListener('change', handleImportFile);
if (importDriveBtn) {
  importDriveBtn.addEventListener('click', openDriveImportModal);
}
if (driveForm) {
  driveForm.addEventListener('submit', handleDriveImportSubmit);
}
if (driveCancelBtn) {
  driveCancelBtn.addEventListener('click', closeDriveImportModal);
}
if (driveCloseBtn) {
  driveCloseBtn.addEventListener('click', closeDriveImportModal);
}
if (driveModal) {
  driveModal.addEventListener('click', event => {
    if (event.target === driveModal) {
      closeDriveImportModal();
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && driveModal.classList.contains('open')) {
      event.preventDefault();
      closeDriveImportModal();
    }
  });
}
copyUrlBtn.addEventListener('click', copyUrlToClipboard);
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', toggleTheme);
}
if (languageToggleBtn) {
  languageToggleBtn.addEventListener('click', toggleLanguage);
}
if (autoReloadCheckbox) {
  autoReloadCheckbox.addEventListener('change', handleAutoReloadChange);
}

async function init() {
  await loadPreferences();
  applyTheme();
  applyTranslations();
  setDomainLabel(null);
  updateViewUI();
  await populateFromActiveTab();
}

async function loadPreferences() {
  try {
    const stored = await getFromStorage([LANGUAGE_STORAGE_KEY, THEME_STORAGE_KEY, AUTO_RELOAD_KEY]);
    if (stored?.[LANGUAGE_STORAGE_KEY] && translations[stored[LANGUAGE_STORAGE_KEY]]) {
      currentLanguage = stored[LANGUAGE_STORAGE_KEY];
    }
    if (stored?.[THEME_STORAGE_KEY]) {
      currentTheme = stored[THEME_STORAGE_KEY];
    }
    if (typeof stored?.[AUTO_RELOAD_KEY] === 'boolean') {
      autoReloadEnabled = stored[AUTO_RELOAD_KEY];
    } else {
      autoReloadEnabled = DEFAULT_AUTO_RELOAD;
    }
  } catch (error) {
    console.warn('Hyper Cookie: cannot load preferences', error);
  }
  if (autoReloadCheckbox) {
    autoReloadCheckbox.checked = autoReloadEnabled;
  }
}

function getFromStorage(keys) {
  return new Promise(resolve => {
    if (chrome?.storage?.local) {
      chrome.storage.local.get(keys, resolve);
    } else {
      resolve({});
    }
  });
}

function savePreference(key, value) {
  return new Promise(resolve => {
    if (chrome?.storage?.local) {
      chrome.storage.local.set({ [key]: value }, resolve);
    } else {
      resolve();
    }
  });
}

async function populateFromActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url?.startsWith('http')) {
    activeTab = null;
    targetUrlInput.value = '';
    setDomainLabel(null);
    showToast(t('invalidTabUrl'), true);
    return;
  }
  activeTab = tab;
  targetUrlInput.value = tab.url;
  setDomainLabel(new URL(tab.url).hostname);
  await loadActiveData();
}

async function loadActiveData() {
  if (activeView === VIEW_STORAGE) {
    await loadLocalStorage();
  } else if (activeView === VIEW_COOKIES) {
    await loadCookies();
  } else {
    await loadCookies();
    await loadLocalStorage();
  }
}

async function loadCookies() {
  const url = targetUrlInput.value.trim();
  if (!url) {
    showToast(t('enterValidUrl'), true);
    return;
  }
  setLoading(true);
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'GET_COOKIES',
      payload: { url }
    });
    if (response.error) {
      throw new Error(response.error);
    }
    currentCookies = response.cookies || [];
    renderCookies();
  } catch (error) {
    console.error(error);
    showToast(t('loadCookiesError', { error: formatError(error) }), true);
  } finally {
    setLoading(false);
  }
}

async function loadLocalStorage() {
  if (!activeTab || !activeTab.id || !activeTab.url?.startsWith('http')) {
    showToast(t('unknownTab'), true);
    return;
  }
  setLoading(true);
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'GET_LOCAL_STORAGE',
      payload: { tabId: activeTab.id }
    });
    if (response.error) {
      throw new Error(response.error);
    }
    currentStorageEntries = response.entries || [];
    renderLocalStorage();
  } catch (error) {
    console.error(error);
    showToast(t('loadStorageError', { error: formatError(error) }), true);
  } finally {
    setLoading(false);
  }
}

function renderCookies() {
  cookieTableBody.innerHTML = '';
  if (!currentCookies.length) {
    cookieTableBody.innerHTML = `<tr><td class="hc-empty" colspan="5">${t('cookiesEmpty')}</td></tr>`;
    return;
  }

  currentCookies.forEach(cookie => {
    const row = cookieRowTemplate.content.firstElementChild.cloneNode(true);
    const nameCell = row.querySelector('.hc-cookie-name');
    const domainCell = row.querySelector('.hc-cookie-domain');
    const expiryCell = row.querySelector('.hc-cookie-expiry');
    const valueCell = row.querySelector('.hc-cookie-value');

    nameCell.textContent = cookie.name;
    domainCell.textContent = cookie.domain;
    expiryCell.textContent = formatExpiry(cookie);
    valueCell.textContent = cookie.value || t('emptyValue');
    [nameCell, domainCell, expiryCell, valueCell].forEach((cell, index) => {
      cell.classList.add('hc-editable-cell');
      if (cell === nameCell) {
        cell.addEventListener('click', () => handleEditCookieName(cookie, cell));
      } else if (cell === domainCell) {
        cell.addEventListener('click', () => handleEditCookieDomain(cookie, cell));
      } else if (cell === expiryCell) {
        cell.addEventListener('click', () => handleEditCookieExpiry(cookie, cell));
      } else if (cell === valueCell) {
        cell.addEventListener('click', () => handleEditCookieValue(cookie, cell));
      }
    });

    nameCell.dataset.label = t('cookiesColumnName');
    domainCell.dataset.label = t('cookiesColumnDomain');
    expiryCell.dataset.label = t('cookiesColumnExpiry');
    valueCell.dataset.label = t('cookiesColumnValue');

    const deleteBtn = row.querySelector('.hc-delete');
    deleteBtn.title = t('deleteCookieTitle');
    deleteBtn.addEventListener('click', () => confirmDeleteCookie(cookie));

    cookieTableBody.appendChild(row);
  });
}

function renderLocalStorage() {
  storageTableBody.innerHTML = '';
  if (!currentStorageEntries.length) {
    storageTableBody.innerHTML = `<tr><td class="hc-empty" colspan="3">${t('storageEmpty')}</td></tr>`;
    return;
  }

  currentStorageEntries.forEach(entry => {
    const row = storageRowTemplate.content.firstElementChild.cloneNode(true);
    const keyCell = row.querySelector('.hc-storage-key');
    const valueCell = row.querySelector('.hc-storage-value');

    keyCell.textContent = entry.key;
    valueCell.textContent = entry.value || t('emptyValue');
    keyCell.classList.add('hc-editable-cell');
    valueCell.classList.add('hc-editable-cell');
    keyCell.addEventListener('click', () => handleEditStorageKey(entry, keyCell));
    valueCell.addEventListener('click', () => handleEditStorageValue(entry, valueCell));

    keyCell.dataset.label = t('storageColumnKey');
    valueCell.dataset.label = t('storageColumnValue');

    const deleteBtn = row.querySelector('.hc-delete');
    deleteBtn.title = t('deleteStorageTitle');
    deleteBtn.addEventListener('click', () => confirmDeleteStorage(entry));

    storageTableBody.appendChild(row);
  });
}

function formatExpiry(cookie) {
  if (!cookie.expirationDate) return t('sessionCookie');
  return new Date(cookie.expirationDate * 1000).toLocaleString();
}

async function confirmDeleteCookie(cookie) {
  if (!confirm(t('deleteCookieConfirm', { name: cookie.name }))) return;
  const protocol = cookie.secure ? 'https://' : 'http://';
  const path = cookie.path || '/';
  const url = `${protocol}${cookie.domain.replace(/^\./, '')}${path}`;

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'DELETE_COOKIE',
      payload: { url, name: cookie.name, storeId: cookie.storeId }
    });
    if (response?.error) {
      throw new Error(response.error);
    }
    showToast(t('deleteCookieSuccess', { name: cookie.name }));
    currentCookies = currentCookies.filter(item => item.name !== cookie.name);
    renderCookies();
  } catch (error) {
    console.error(error);
    showToast(t('deleteCookieError', { error: formatError(error) }), true);
  }
}

async function confirmDeleteStorage(entry) {
  if (!confirm(t('deleteStorageConfirm', { key: entry.key }))) return;
  if (!activeTab?.id) {
    showToast(t('unknownTab'), true);
    return;
  }

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'DELETE_LOCAL_STORAGE_ITEM',
      payload: { tabId: activeTab.id, key: entry.key }
    });
    if (response?.error) {
      throw new Error(response.error);
    }
    showToast(t('deleteStorageSuccess', { key: entry.key }));
    currentStorageEntries = currentStorageEntries.filter(item => item.key !== entry.key);
    renderLocalStorage();
  } catch (error) {
    console.error(error);
    showToast(t('deleteStorageError', { error: formatError(error) }), true);
  }
}

async function exportData() {
  const url = targetUrlInput.value.trim();
  if (!url) {
    showToast(t('exportUrlMissing'), true);
    return;
  }
  if (!activeTab?.id) {
    showToast(t('exportTabMissing'), true);
    return;
  }

  setLoading(true);
  try {
    const [cookiesResponse, storageResponse] = await Promise.all([
      chrome.runtime.sendMessage({ type: 'GET_COOKIES', payload: { url } }),
      chrome.runtime.sendMessage({ type: 'GET_LOCAL_STORAGE', payload: { tabId: activeTab.id } })
    ]);
    if (cookiesResponse.error) throw new Error(cookiesResponse.error);
    if (storageResponse.error) throw new Error(storageResponse.error);

    const exportPayload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      sourceUrl: url,
      sourceHostname: safeHostname(url),
      cookies: cookiesResponse.cookies || [],
      localStorage: storageResponse.entries || []
    };
    const filename = `hyper-cookie-export-${exportPayload.sourceHostname || 'data'}.json`;
    downloadJSON(exportPayload, filename);
    showToast(t('exportSuccess'));
  } catch (error) {
    console.error(error);
    showToast(t('exportError', { error: formatError(error) }), true);
  } finally {
    setLoading(false);
  }
}

async function handleImportFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const payload = JSON.parse(text);
    await processImportedPayload(payload);
  } catch (error) {
    console.error(error);
    showToast(t('importError', { error: formatError(error) }), true);
  } finally {
    event.target.value = '';
  }
}

async function processImportedPayload(payload) {
  validateImportPayload(payload);
  const sourceHost = payload.sourceHostname || safeHostname(payload.sourceUrl);
  const currentHost = safeHostname(activeTab?.url || targetUrlInput.value);
  if (sourceHost && currentHost && sourceHost !== currentHost) {
    const proceed = confirm(t('importHostMismatch', { source: sourceHost, current: currentHost }));
    if (!proceed) return;
  }
  await importData(payload);
}

async function importData(payload) {
  const url = targetUrlInput.value.trim();
  if (!url) throw new Error(t('importUrlMissing'));
  if (!activeTab?.id) throw new Error(t('importTabMissing'));

  setLoading(true);
  try {
    if (Array.isArray(payload.cookies) && payload.cookies.length) {
      const response = await chrome.runtime.sendMessage({
        type: 'SET_COOKIES',
        payload: { cookies: payload.cookies, targetUrl: url }
      });
      if (response?.error) {
        throw new Error(t('setCookiesError', { error: response.error }));
      }
    }

    if (Array.isArray(payload.localStorage) && payload.localStorage.length) {
      const response = await chrome.runtime.sendMessage({
        type: 'SET_LOCAL_STORAGE',
        payload: { tabId: activeTab.id, entries: payload.localStorage }
      });
      if (response?.error) {
        throw new Error(t('setStorageError', { error: response.error }));
      }
    }

    showToast(t('importSuccess'));
    await loadActiveData();
    if (autoReloadEnabled && activeTab?.id) {
      chrome.tabs.reload(activeTab.id);
    }
  } finally {
    setLoading(false);
  }
}

function openDriveImportModal() {
  if (!driveModal) return;
  driveModal.classList.add('open');
  driveModal.setAttribute('aria-hidden', 'false');
  setDriveImportLoading(false);
  setTimeout(() => driveUrlInput?.focus(), 50);
}

function closeDriveImportModal() {
  if (!driveModal) return;
  driveModal.classList.remove('open');
  driveModal.setAttribute('aria-hidden', 'true');
  setDriveImportLoading(false);
  if (driveForm) {
    driveForm.reset();
  }
}

async function handleDriveImportSubmit(event) {
  event.preventDefault();
  if (!driveUrlInput) return;
  const driveLink = driveUrlInput.value.trim();
  if (!driveLink) {
    showToast(t('importDriveUrlMissing'), true);
    return;
  }
  setDriveImportLoading(true);
  try {
    const payload = await fetchDrivePayload(driveLink);
    await processImportedPayload(payload);
    closeDriveImportModal();
  } catch (error) {
    console.error('Drive import failed', error);
    showToast(t('importError', { error: formatError(error) }), true);
  } finally {
    setDriveImportLoading(false);
  }
}

async function fetchDrivePayload(url) {
  const downloadUrl = buildDriveDownloadUrl(url);
  const response = await fetch(downloadUrl);
  if (!response.ok) {
    throw new Error(t('importDriveFetchError', { error: response.statusText || response.status }));
  }
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(t('validatePayloadInvalid'));
  }
}

function setDriveImportLoading(isLoading) {
  if (driveSubmitBtn) {
    driveSubmitBtn.disabled = isLoading;
  }
  if (driveCancelBtn) {
    driveCancelBtn.disabled = isLoading;
  }
  if (driveUrlInput) {
    driveUrlInput.disabled = isLoading;
  }
}

function buildDriveDownloadUrl(input) {
  try {
    const url = new URL(input);
    const host = url.hostname;
    if (!host.includes('drive.google.com')) {
      return input;
    }
    if (url.pathname.includes('/uc')) {
      return input;
    }
    const fileMatch = url.pathname.match(/\/file\/d\/([^/]+)/);
    if (fileMatch?.[1]) {
      const fileId = fileMatch[1];
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
    const openId = url.searchParams.get('id');
    if (openId) {
      return `https://drive.google.com/uc?export=download&id=${openId}`;
    }
    return input;
  } catch (error) {
    return input;
  }
}

function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function validateImportPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error(t('validatePayloadInvalid'));
  }
  if (payload.version && payload.version !== 1) {
    throw new Error(t('validatePayloadUnsupportedVersion'));
  }
  if (!Array.isArray(payload.cookies) && !Array.isArray(payload.localStorage)) {
    throw new Error(t('validatePayloadMissingData'));
  }
}

function safeHostname(url) {
  try {
    return new URL(url).hostname;
  } catch (error) {
    return null;
  }
}

function showToast(message, isError = false) {
  toastEl.textContent = message;
  toastEl.style.background = isError ? 'var(--hc-toast-error)' : 'var(--hc-toast-success)';
  toastEl.classList.add('show');
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => toastEl.classList.remove('show'), 2500);
}

function setLoading(isLoading) {
  refreshBtn.disabled = isLoading;
  exportJsonBtn.disabled = isLoading;
  importJsonBtn.disabled = isLoading;
  if (importDriveBtn) {
    importDriveBtn.disabled = isLoading;
  }
  const icon = refreshBtn.querySelector('.material-symbols-rounded');
  if (icon) {
    icon.textContent = isLoading ? 'hourglass_top' : 'cached';
  }
}

function setActiveView(view) {
  if (activeView === view) return;
  activeView = view;
  updateViewUI();
  if (view === VIEW_COOKIES || view === VIEW_STORAGE) {
    loadActiveData();
  }
}

function updateViewUI() {
  homeTabBtn.classList.toggle('active', activeView === VIEW_HOME);
  cookiesTabBtn.classList.toggle('active', activeView === VIEW_COOKIES);
  storageTabBtn.classList.toggle('active', activeView === VIEW_STORAGE);
  homeSection.classList.toggle('active', activeView === VIEW_HOME);
  cookiesSection.classList.toggle('active', activeView === VIEW_COOKIES);
  storageSection.classList.toggle('active', activeView === VIEW_STORAGE);
  document.body.classList.toggle('hc-view-home', activeView === VIEW_HOME);
  document.body.classList.toggle('hc-view-data', activeView === VIEW_COOKIES || activeView === VIEW_STORAGE);
}

function handleEditCookieValue(cookie, cell) {
  openInlineEditor(cell, cookie.value || '', async newValue => {
    if ((cookie.value ?? '') === newValue) {
      return cookie.value ?? '';
    }
    await updateCookieFieldsRequest(cookie, { value: newValue });
    showToast(t('updateCookieSuccess'));
    renderCookies();
    return newValue;
  });
}

function handleEditCookieName(cookie, cell) {
  openInlineEditor(cell, cookie.name || '', async newValue => {
    const trimmed = newValue.trim();
    if (!trimmed) {
      throw new Error(t('cookieNameRequired'));
    }
    if (trimmed === cookie.name) {
      return trimmed;
    }
    await updateCookieFieldsRequest(cookie, { name: trimmed });
    showToast(t('updateCookieSuccess'));
    renderCookies();
    return trimmed;
  });
}

function handleEditCookieDomain(cookie, cell) {
  openInlineEditor(cell, cookie.domain || '', async newValue => {
    const trimmed = newValue.trim();
    if (!trimmed) {
      throw new Error(t('cookieDomainRequired'));
    }
    if (trimmed === cookie.domain) {
      return trimmed;
    }
    await updateCookieFieldsRequest(cookie, { domain: trimmed });
    showToast(t('updateCookieSuccess'));
    renderCookies();
    return trimmed;
  });
}

function handleEditCookieExpiry(cookie, cell) {
  const isoValue = cookie.expirationDate ? new Date(cookie.expirationDate * 1000).toISOString() : '';
  openInlineEditor(cell, isoValue, async newValue => {
    const parsed = parseExpiryInput(newValue);
    const currentExpiry = cookie.expirationDate ?? null;
    if (
      (parsed == null && currentExpiry == null) ||
      (parsed != null && currentExpiry != null && parsed === currentExpiry)
    ) {
      return { display: formatExpiry(cookie) };
    }
    await updateCookieFieldsRequest(cookie, { expirationDate: parsed ?? undefined });
    showToast(t('updateCookieSuccess'));
    renderCookies();
    return { display: formatExpiry(cookie) };
  });
}

function handleEditStorageValue(entry, cell) {
  openInlineEditor(cell, entry.value || '', async newValue => {
    if ((entry.value ?? '') === newValue) {
      return entry.value ?? '';
    }
    await updateStorageValueRequest(entry, newValue);
    showToast(t('updateStorageSuccess'));
    renderLocalStorage();
    return newValue;
  });
}

function handleEditStorageKey(entry, cell) {
  openInlineEditor(cell, entry.key || '', async newValue => {
    const trimmed = newValue.trim();
    if (!trimmed) {
      throw new Error(t('storageKeyRequired'));
    }
    if (trimmed === entry.key) {
      return trimmed;
    }
    await renameStorageKeyRequest(entry, trimmed);
    showToast(t('updateStorageSuccess'));
    renderLocalStorage();
    return trimmed;
  });
}

async function updateCookieFieldsRequest(cookie, changes) {
  const fallbackUrl = targetUrlInput.value.trim() || activeTab?.url;
  if (!fallbackUrl) {
    throw new Error(t('enterValidUrl'));
  }
  const response = await chrome.runtime.sendMessage({
    type: 'UPDATE_COOKIE_FIELDS',
    payload: { cookie, changes, fallbackUrl }
  });
  if (response?.error) {
    throw new Error(response.error);
  }
  Object.assign(cookie, response.updatedCookie || { ...cookie, ...changes });
}

async function updateStorageValueRequest(entry, newValue) {
  if (!activeTab?.id) {
    throw new Error(t('unknownTab'));
  }
  const response = await chrome.runtime.sendMessage({
    type: 'UPDATE_LOCAL_STORAGE_VALUE',
    payload: { tabId: activeTab.id, key: entry.key, newValue }
  });
  if (response?.error) {
    throw new Error(response.error);
  }
  entry.value = newValue;
}

async function renameStorageKeyRequest(entry, newKey) {
  if (!activeTab?.id) {
    throw new Error(t('unknownTab'));
  }
  const response = await chrome.runtime.sendMessage({
    type: 'RENAME_LOCAL_STORAGE_KEY',
    payload: { tabId: activeTab.id, oldKey: entry.key, newKey }
  });
  if (response?.error) {
    throw new Error(response.error);
  }
  entry.key = newKey;
}

function openInlineEditor(cell, initialValue, onSave) {
  if (!cell || cell.dataset.editing === 'true') return;
  cell.dataset.editing = 'true';
  const editor = document.createElement('textarea');
  editor.className = 'hc-inline-editor';
  editor.value = initialValue ?? '';
  const originalValue = initialValue ?? '';
  const originalContent = cell.textContent;
  cell.textContent = '';
  cell.appendChild(editor);
  editor.focus();
  editor.select();

  let isSaving = false;
  const cleanup = result => {
    cell.dataset.editing = 'false';
    cell.innerHTML = '';
    let displayValue = result;
    if (result && typeof result === 'object' && 'display' in result) {
      displayValue = result.display;
    }
    if (displayValue == null || displayValue === '') {
      displayValue = t('emptyValue');
    }
    cell.textContent = displayValue;
  };

  const cancel = () => {
    cleanup(originalValue);
  };

  const commit = async () => {
    if (isSaving) return;
    isSaving = true;
    const newValue = editor.value;
    try {
      const savedValue = await onSave(newValue);
      cleanup(savedValue ?? newValue);
    } catch (error) {
      console.error('Inline edit failed', error);
      cleanup(originalValue);
      showToast(error.message || t('updateErrorGeneric'), true);
    }
  };

  editor.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      commit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      cancel();
    }
  });
  editor.addEventListener('blur', () => {
    commit();
  });
}

async function copyUrlToClipboard() {
  const url = targetUrlInput.value.trim();
  if (!url) {
    showToast(t('noUrlToCopy'), true);
    return;
  }
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
    } else {
      const tempInput = document.createElement('input');
      tempInput.value = url;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      tempInput.remove();
    }
    showToast(t('urlCopied'));
  } catch (error) {
    console.error('Copy URL failed', error);
    showToast(t('urlCopyFailed'), true);
  }
}

async function setLanguage(lang) {
  const nextLanguage = translations[lang] ? lang : DEFAULT_LANGUAGE;
  if (nextLanguage === currentLanguage) return;
  currentLanguage = nextLanguage;
  await savePreference(LANGUAGE_STORAGE_KEY, nextLanguage);
  applyTranslations();
  renderCookies();
  renderLocalStorage();
}

function applyTranslations() {
  document.documentElement.lang = currentLanguage;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (key) {
      el.textContent = t(key);
    }
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.dataset.i18nTitle;
    if (key) {
      el.title = t(key);
    }
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (key) {
      el.setAttribute('placeholder', t(key));
    }
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
    const key = el.dataset.i18nAriaLabel;
    if (key) {
      el.setAttribute('aria-label', t(key));
    }
  });
  if (activeDomainLabel.dataset.domainSet !== 'true') {
    activeDomainLabel.textContent = t('loadingDomain');
  }
  updateLanguageToggle();
  updateThemeToggleIcon();
}

function applyTheme() {
  document.body.classList.toggle('hc-theme-dark', currentTheme === 'dark');
  document.body.classList.toggle('hc-theme-light', currentTheme !== 'dark');
  updateThemeToggleIcon();
}

async function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  await savePreference(THEME_STORAGE_KEY, currentTheme);
  applyTheme();
}

function updateThemeToggleIcon() {
  if (!themeToggleBtn) return;
  const icon = themeToggleBtn.querySelector('.material-symbols-rounded');
  if (icon) {
    icon.textContent = currentTheme === 'dark' ? 'light_mode' : 'dark_mode';
  }
  const titleKey = currentTheme === 'dark' ? 'themeToggleLight' : 'themeToggleDark';
  themeToggleBtn.title = t(titleKey);
}

function toggleLanguage() {
  const nextLanguage = currentLanguage === 'vi' ? 'en' : 'vi';
  setLanguage(nextLanguage);
}

function updateLanguageToggle() {
  if (!languageToggleBtn) return;
  const flagIcon = languageToggleBtn.querySelector('.hc-flag-icon');
  const flag = FLAG_BY_LANG[currentLanguage];
  if (flagIcon && flag) {
    flagIcon.src = flag.src;
    flagIcon.alt = flag.alt;
  }
  languageToggleBtn.setAttribute('aria-label', t('languageToggle'));
}

function handleAutoReloadChange(event) {
  autoReloadEnabled = Boolean(event.target.checked);
  savePreference(AUTO_RELOAD_KEY, autoReloadEnabled);
}

function parseExpiryInput(input) {
  const value = (input ?? '').trim();
  if (!value) return null;
  const sessionLabel = t('sessionCookie').toLowerCase();
  if (value.toLowerCase() === sessionLabel) {
    return null;
  }
  if (/^\d+$/.test(value)) {
    const numeric = Number(value);
    if (!Number.isNaN(numeric) && numeric > 0) {
      return numeric > 1e12 ? Math.floor(numeric / 1000) : numeric;
    }
  }
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    throw new Error(t('invalidExpiryFormat'));
  }
  return Math.floor(parsed / 1000);
}

function setDomainLabel(domain) {
  if (domain) {
    activeDomainLabel.textContent = domain;
    activeDomainLabel.dataset.domainSet = 'true';
  } else {
    activeDomainLabel.textContent = t('loadingDomain');
    activeDomainLabel.dataset.domainSet = 'false';
  }
}

function t(key, vars = {}) {
  const langPack = translations[currentLanguage] || translations[DEFAULT_LANGUAGE] || {};
  const fallbackPack = translations[DEFAULT_LANGUAGE] || {};
  let template = langPack[key] ?? fallbackPack[key] ?? key;
  if (typeof template !== 'string') {
    return key;
  }
  return template.replace(/\{\{(\w+)\}\}/g, (_, varName) => vars[varName] ?? '');
}

function formatError(error) {
  return error?.message || String(error);
}
