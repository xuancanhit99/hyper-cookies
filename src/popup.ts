import {
  assertImportSize,
  decodeExportEnvelope,
  parseImportText,
  validateImportPayload,
  wrapPayloadWithBase64,
  type ImportPayload,
  type LocalStorageEntry,
  type SnapshotPayload
} from './shared/snapshot';
import { buildDriveDownloadUrl, isAllowedDriveHost } from './shared/drive';
import { safeHostname, sanitizeSourceUrl } from './shared/url';
import { MessageType } from './shared/messages';
import { prepareCookiesForTarget } from './shared/cookies';

function getRequiredElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing required element #${id}`);
  }
  return element as T;
}

const cookieTableBody = getRequiredElement<HTMLTableSectionElement>('cookie-table-body');
const storageTableBody = getRequiredElement<HTMLTableSectionElement>('storage-table-body');
const cookieRowTemplate = getRequiredElement<HTMLTemplateElement>('cookie-row-template');
const storageRowTemplate = getRequiredElement<HTMLTemplateElement>('storage-row-template');
const homeSection = getRequiredElement<HTMLElement>('home-section');
const cookiesSection = getRequiredElement<HTMLElement>('cookies-section');
const storageSection = getRequiredElement<HTMLElement>('storage-section');
const homeTabBtn = getRequiredElement<HTMLButtonElement>('home-tab');
const cookiesTabBtn = getRequiredElement<HTMLButtonElement>('cookies-tab');
const storageTabBtn = getRequiredElement<HTMLButtonElement>('storage-tab');
const toastEl = getRequiredElement<HTMLElement>('toast');
const targetUrlInput = getRequiredElement<HTMLInputElement>('target-url');
const activeDomainLabel = getRequiredElement<HTMLElement>('active-domain');
const refreshBtn = getRequiredElement<HTMLButtonElement>('refresh-btn');
const exportJsonBtn = getRequiredElement<HTMLButtonElement>('export-json');
const importJsonBtn = getRequiredElement<HTMLButtonElement>('import-json');
const importFileInput = getRequiredElement<HTMLInputElement>('import-file');
const importDriveBtn = getRequiredElement<HTMLButtonElement>('import-drive');
const driveModal = getRequiredElement<HTMLElement>('drive-import-modal');
const driveForm = getRequiredElement<HTMLFormElement>('drive-import-form');
const driveUrlInput = getRequiredElement<HTMLInputElement>('drive-import-url');
const driveCancelBtn = getRequiredElement<HTMLButtonElement>('drive-import-cancel');
const driveSubmitBtn = getRequiredElement<HTMLButtonElement>('drive-import-submit');
const driveCloseBtn = getRequiredElement<HTMLButtonElement>('drive-import-close');
const clearAllBtn = getRequiredElement<HTMLButtonElement>('clear-all-btn');
const copyUrlBtn = getRequiredElement<HTMLButtonElement>('copy-url-btn');
const themeToggleBtn = getRequiredElement<HTMLButtonElement>('theme-toggle');
const languageToggleBtn = getRequiredElement<HTMLButtonElement>('language-toggle');
const autoReloadCheckbox = getRequiredElement<HTMLInputElement>('auto-reload-checkbox');
const base64ExportCheckbox = getRequiredElement<HTMLInputElement>('base64-export-checkbox');
const exportJsonLabelEl = getRequiredElement<HTMLElement>('export-json-label');
const importJsonLabelEl = getRequiredElement<HTMLElement>('import-json-label');

activeDomainLabel.dataset.domainSet = 'false';

const VIEW_HOME = 'home';
const VIEW_COOKIES = 'cookies';
const VIEW_STORAGE = 'storage';
const LANGUAGE_STORAGE_KEY = 'hyper-cookies:language';
const THEME_STORAGE_KEY = 'hyper-cookies:theme';
const AUTO_RELOAD_KEY = 'hyper-cookies:auto-reload';
const BASE64_EXPORT_KEY = 'hyper-cookies:base64-export';
const DEFAULT_LANGUAGE = 'vi';
const DEFAULT_THEME = 'light';
const DEFAULT_AUTO_RELOAD = true;
const DEFAULT_BASE64_EXPORT = true;
const DRIVE_FETCH_TIMEOUT_MS = 15_000;
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
    exportTxt: 'Export TXT',
    importJson: 'Import JSON',
    importTxt: 'Import TXT',
    importDrive: 'Import từ Google Drive',
    importDriveModalTitle: 'Import từ Google Drive',
    importDriveModalDescription:
      'Dán link chia sẻ file TXT/JSON trên Google Drive để bắt đầu import.',
    importDriveLinkLabel: 'Link Google Drive',
    importDrivePlaceholder: 'https://drive.google.com/...',
    importDriveUrlMissing: 'Nhập link Google Drive hợp lệ',
    importDriveInvalidUrl: 'Chỉ hỗ trợ link HTTPS từ Google Drive',
    importDriveFetchError: 'Không thể tải file: {{error}}',
    importDriveTimeout: 'Google Drive phản hồi quá lâu',
    importDriveInvalidResponse: 'Google Drive trả về nội dung không hợp lệ',
    importDriveStart: 'Import',
    cancel: 'Huỷ',
    closeModal: 'Đóng',
    clearAllTitle: 'Xóa cookies & local storage',
    clearAllConfirm: 'Xóa tất cả cookies và local storage của trang này?',
    clearAllSuccess: 'Đã xóa cookies và local storage',
    clearAllError: 'Xóa thất bại: {{error}}',
    clearAllPartial: 'Đã xóa local storage nhưng có {{count}} cookie không xóa được',
    base64ExportLabel: 'Mã hóa Base64 khi export',
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
    importHostMismatch:
      'Dữ liệu được export từ {{source}}, trong khi tab hiện tại là {{current}}. Bạn có chắc muốn import?',
    importSuccess: 'Import thành công',
    importPartial: 'Import không hoàn tất: thành công {{imported}}/{{requested}} item',
    importCookieRejected: '{{count}} cookie không hợp lệ hoặc không thuộc domain đích',
    importUrlMissing: 'Chưa xác định URL để import cookie',
    importTabMissing: 'Không xác định được tab hiện tại',
    importError: 'Import thất bại: {{error}}',
    setCookiesError: 'Không thể import cookie: {{error}}',
    setStorageError: 'Không thể import local storage: {{error}}',
    validatePayloadMissingData: 'File không chứa dữ liệu hợp lệ',
    validatePayloadUnsupportedVersion: 'Phiên bản file không được hỗ trợ',
    validatePayloadInvalid: 'File import không hợp lệ',
    validatePayloadTooLarge: 'File import vượt quá giới hạn 10 MB',
    validatePayloadTooManyItems: 'File import chứa quá nhiều item',
    copyUrlTitle: 'Copy URL hiện tại',
    refreshTooltip: 'Tải lại dữ liệu',
    deleteCookieTitle: 'Xóa cookie',
    deleteStorageTitle: 'Xóa item',
    themeToggleDark: 'Chuyển sang giao diện tối',
    themeToggleLight: 'Chuyển sang giao diện sáng',
    languageToggle: 'Chuyển ngôn ngữ',
    autoReloadLabel: 'Tự động làm mới trang sau khi import',
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
    exportJson: 'Export JSON',
    exportTxt: 'Export TXT',
    importJson: 'Import JSON',
    importTxt: 'Import TXT',
    importDrive: 'Import from Google Drive',
    importDriveModalTitle: 'Import from Google Drive',
    importDriveModalDescription: 'Paste the shared TXT/JSON link from Google Drive to import.',
    importDriveLinkLabel: 'Google Drive link',
    importDrivePlaceholder: 'https://drive.google.com/...',
    importDriveUrlMissing: 'Enter a Google Drive link',
    importDriveInvalidUrl: 'Only HTTPS Google Drive links are supported',
    importDriveFetchError: 'Unable to fetch file: {{error}}',
    importDriveTimeout: 'Google Drive took too long to respond',
    importDriveInvalidResponse: 'Google Drive returned invalid content',
    importDriveStart: 'Import',
    cancel: 'Cancel',
    closeModal: 'Close',
    clearAllTitle: 'Clear cookies & local storage',
    clearAllConfirm: 'Clear all cookies and local storage for this page?',
    clearAllSuccess: 'All cookies and local storage cleared',
    clearAllError: 'Clear failed: {{error}}',
    clearAllPartial: 'Local storage was cleared, but {{count}} cookies could not be removed',
    base64ExportLabel: 'Encode export',
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
    importHostMismatch:
      'Data was exported from {{source}} while the current tab is {{current}}. Do you still want to import?',
    importSuccess: 'Import successful',
    importPartial: 'Import incomplete: {{imported}}/{{requested}} items succeeded',
    importCookieRejected: '{{count}} cookies are invalid or unrelated to the target domain',
    importUrlMissing: 'No URL available to import cookies into',
    importTabMissing: 'Cannot determine the current tab',
    importError: 'Import failed: {{error}}',
    setCookiesError: 'Unable to import cookies: {{error}}',
    setStorageError: 'Unable to import local storage: {{error}}',
    validatePayloadMissingData: 'File does not contain valid data',
    validatePayloadUnsupportedVersion: 'File version is not supported',
    validatePayloadInvalid: 'Invalid import file',
    validatePayloadTooLarge: 'Import file exceeds the 10 MB limit',
    validatePayloadTooManyItems: 'Import file contains too many items',
    copyUrlTitle: 'Copy current URL',
    refreshTooltip: 'Reload data',
    deleteCookieTitle: 'Delete cookie',
    deleteStorageTitle: 'Delete item',
    themeToggleDark: 'Switch to dark theme',
    themeToggleLight: 'Switch to light theme',
    languageToggle: 'Switch language',
    autoReloadLabel: 'Refresh tab after import',
    updateCookieSuccess: 'Cookie updated',
    updateStorageSuccess: 'Local storage updated',
    updateErrorGeneric: 'Unable to update value',
    cookieNameRequired: 'Cookie name cannot be empty',
    cookieDomainRequired: 'Cookie domain cannot be empty',
    storageKeyRequired: 'Key cannot be empty',
    invalidExpiryFormat: 'Invalid expiration date'
  }
};

type Language = keyof typeof translations;
type Theme = 'light' | 'dark';
type View = typeof VIEW_HOME | typeof VIEW_COOKIES | typeof VIEW_STORAGE;
type CookieChanges = Partial<
  Pick<chrome.cookies.Cookie, 'name' | 'value' | 'domain' | 'expirationDate'>
>;
type InlineEditorResult = string | { display: string } | null | undefined;
type InlineSave = (newValue: string) => InlineEditorResult | Promise<InlineEditorResult>;

let currentCookies: chrome.cookies.Cookie[] = [];
let currentStorageEntries: LocalStorageEntry[] = [];
let activeView: View = VIEW_HOME;
let activeTab: chrome.tabs.Tab | null = null;
let currentLanguage: Language = DEFAULT_LANGUAGE;
let currentTheme: Theme = DEFAULT_THEME;
let autoReloadEnabled = DEFAULT_AUTO_RELOAD;
let base64ExportEnabled = DEFAULT_BASE64_EXPORT;
let toastTimeout: ReturnType<typeof setTimeout> | undefined;

document.addEventListener('DOMContentLoaded', init);
refreshBtn.addEventListener('click', () => loadActiveData());
homeTabBtn.addEventListener('click', () => setActiveView(VIEW_HOME));
cookiesTabBtn.addEventListener('click', () => setActiveView(VIEW_COOKIES));
storageTabBtn.addEventListener('click', () => setActiveView(VIEW_STORAGE));
exportJsonBtn.addEventListener('click', () => exportData());
importJsonBtn.addEventListener('click', () => importFileInput.click());
importFileInput.addEventListener('change', handleImportFile);
if (importDriveBtn) {
  importDriveBtn.addEventListener('click', openDriveImportModal);
}
if (clearAllBtn) {
  clearAllBtn.addEventListener('click', handleClearAll);
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
  document.addEventListener('keydown', (event) => {
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
if (base64ExportCheckbox) {
  base64ExportCheckbox.addEventListener('change', handleBase64ExportChange);
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
    const stored = await getFromStorage([
      LANGUAGE_STORAGE_KEY,
      THEME_STORAGE_KEY,
      AUTO_RELOAD_KEY,
      BASE64_EXPORT_KEY
    ]);
    const pendingSaves: Promise<void>[] = [];
    const storedLanguage = stored[LANGUAGE_STORAGE_KEY];
    if (isLanguage(storedLanguage)) {
      currentLanguage = storedLanguage;
    } else {
      currentLanguage = DEFAULT_LANGUAGE;
      pendingSaves.push(savePreference(LANGUAGE_STORAGE_KEY, currentLanguage));
    }
    const storedTheme = stored[THEME_STORAGE_KEY];
    if (storedTheme === 'light' || storedTheme === 'dark') {
      currentTheme = storedTheme;
    } else {
      currentTheme = DEFAULT_THEME;
      pendingSaves.push(savePreference(THEME_STORAGE_KEY, currentTheme));
    }
    if (typeof stored?.[AUTO_RELOAD_KEY] === 'boolean') {
      autoReloadEnabled = stored[AUTO_RELOAD_KEY];
    } else {
      autoReloadEnabled = DEFAULT_AUTO_RELOAD;
      pendingSaves.push(savePreference(AUTO_RELOAD_KEY, autoReloadEnabled));
    }
    if (typeof stored?.[BASE64_EXPORT_KEY] === 'boolean') {
      base64ExportEnabled = stored[BASE64_EXPORT_KEY];
    } else {
      base64ExportEnabled = DEFAULT_BASE64_EXPORT;
      pendingSaves.push(savePreference(BASE64_EXPORT_KEY, base64ExportEnabled));
    }
    if (pendingSaves.length) {
      await Promise.all(pendingSaves);
    }
  } catch (error) {
    console.warn('Hyper Cookies: cannot load preferences', error);
  }
  if (autoReloadCheckbox) {
    autoReloadCheckbox.checked = autoReloadEnabled;
  }
  if (base64ExportCheckbox) {
    base64ExportCheckbox.checked = base64ExportEnabled;
  }
  updateExportImportLabels();
}

function getFromStorage(keys: string[]): Promise<Record<string, unknown>> {
  return chrome.storage.local.get(keys);
}

function savePreference(key: string, value: unknown): Promise<void> {
  return chrome.storage.local.set({ [key]: value });
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
      type: MessageType.GetCookies,
      payload: { url, tabId: activeTab?.id }
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
      type: MessageType.GetLocalStorage,
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

  currentCookies.forEach((cookie) => {
    const row = cookieRowTemplate.content.firstElementChild?.cloneNode(true) as HTMLTableRowElement;
    const nameCell = row.querySelector<HTMLElement>('.hc-cookie-name')!;
    const domainCell = row.querySelector<HTMLElement>('.hc-cookie-domain')!;
    const expiryCell = row.querySelector<HTMLElement>('.hc-cookie-expiry')!;
    const valueCell = row.querySelector<HTMLElement>('.hc-cookie-value')!;

    nameCell.textContent = cookie.name;
    domainCell.textContent = cookie.domain;
    expiryCell.textContent = formatExpiry(cookie);
    valueCell.textContent = cookie.value || t('emptyValue');
    [nameCell, domainCell, expiryCell, valueCell].forEach((cell) => {
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

    const deleteBtn = row.querySelector<HTMLButtonElement>('.hc-delete')!;
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

  currentStorageEntries.forEach((entry) => {
    const row = storageRowTemplate.content.firstElementChild?.cloneNode(
      true
    ) as HTMLTableRowElement;
    const keyCell = row.querySelector<HTMLElement>('.hc-storage-key')!;
    const valueCell = row.querySelector<HTMLElement>('.hc-storage-value')!;

    keyCell.textContent = entry.key;
    valueCell.textContent = entry.value || t('emptyValue');
    keyCell.classList.add('hc-editable-cell');
    valueCell.classList.add('hc-editable-cell');
    keyCell.addEventListener('click', () => handleEditStorageKey(entry, keyCell));
    valueCell.addEventListener('click', () => handleEditStorageValue(entry, valueCell));

    keyCell.dataset.label = t('storageColumnKey');
    valueCell.dataset.label = t('storageColumnValue');

    const deleteBtn = row.querySelector<HTMLButtonElement>('.hc-delete')!;
    deleteBtn.title = t('deleteStorageTitle');
    deleteBtn.addEventListener('click', () => confirmDeleteStorage(entry));

    storageTableBody.appendChild(row);
  });
}

function formatExpiry(cookie: chrome.cookies.Cookie): string {
  if (!cookie.expirationDate) return t('sessionCookie');
  return new Date(cookie.expirationDate * 1000).toLocaleString();
}

async function confirmDeleteCookie(cookie: chrome.cookies.Cookie) {
  if (!confirm(t('deleteCookieConfirm', { name: cookie.name }))) return;
  const fallbackUrl = targetUrlInput.value.trim() || activeTab?.url;
  if (!fallbackUrl) {
    showToast(t('enterValidUrl'), true);
    return;
  }

  try {
    const response = await chrome.runtime.sendMessage({
      type: MessageType.DeleteCookie,
      payload: { cookie, fallbackUrl }
    });
    if (response?.error || !response?.details) {
      throw new Error(response?.error || t('updateErrorGeneric'));
    }
    showToast(t('deleteCookieSuccess', { name: cookie.name }));
    await loadCookies();
  } catch (error) {
    console.error(error);
    showToast(t('deleteCookieError', { error: formatError(error) }), true);
  }
}

async function confirmDeleteStorage(entry: LocalStorageEntry) {
  if (!confirm(t('deleteStorageConfirm', { key: entry.key }))) return;
  if (!activeTab?.id) {
    showToast(t('unknownTab'), true);
    return;
  }

  try {
    const response = await chrome.runtime.sendMessage({
      type: MessageType.DeleteLocalStorageItem,
      payload: { tabId: activeTab.id, key: entry.key }
    });
    if (response?.error) {
      throw new Error(response.error);
    }
    showToast(t('deleteStorageSuccess', { key: entry.key }));
    currentStorageEntries = currentStorageEntries.filter((item) => item.key !== entry.key);
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
      chrome.runtime.sendMessage({
        type: MessageType.GetCookies,
        payload: { url, tabId: activeTab.id }
      }),
      chrome.runtime.sendMessage({
        type: MessageType.GetLocalStorage,
        payload: { tabId: activeTab.id }
      })
    ]);
    if (cookiesResponse.error) throw new Error(cookiesResponse.error);
    if (storageResponse.error) throw new Error(storageResponse.error);

    const exportPayload: SnapshotPayload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      sourceUrl: sanitizeSourceUrl(url),
      sourceHostname: safeHostname(url),
      cookies: cookiesResponse.cookies || [],
      localStorage: storageResponse.entries || []
    };
    const filenameHost = (exportPayload.sourceHostname || 'data').replace(/[^a-z0-9._-]/gi, '_');
    const filenameBase = `hyper-cookies-export-${filenameHost}`;
    if (base64ExportEnabled) {
      const encoded = wrapPayloadWithBase64(exportPayload);
      downloadText(encoded, `${filenameBase}-encoded.txt`);
    } else {
      downloadJSON(exportPayload, `${filenameBase}.json`);
    }
    showToast(t('exportSuccess'));
  } catch (error) {
    console.error(error);
    showToast(t('exportError', { error: formatError(error) }), true);
  } finally {
    setLoading(false);
  }
}

async function handleImportFile(event: Event) {
  const input = event.currentTarget as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    assertImportSize(file.size, t('validatePayloadTooLarge'));
    const text = await file.text();
    assertImportSize(new TextEncoder().encode(text).byteLength, t('validatePayloadTooLarge'));
    const payload = parseImportText(text, t('validatePayloadInvalid'));
    await processImportedPayload(payload);
  } catch (error) {
    console.error(error);
    showToast(t('importError', { error: formatError(error) }), true);
  } finally {
    input.value = '';
  }
}

async function processImportedPayload(rawPayload: unknown) {
  const payload = decodeExportEnvelope(rawPayload, t('validatePayloadInvalid'));
  validateImportPayload(payload, {
    invalid: t('validatePayloadInvalid'),
    unsupportedVersion: t('validatePayloadUnsupportedVersion'),
    missingData: t('validatePayloadMissingData'),
    tooManyItems: t('validatePayloadTooManyItems')
  });
  const sourceHost = payload.sourceHostname || safeHostname(payload.sourceUrl);
  const currentHost = safeHostname(activeTab?.url || targetUrlInput.value);
  if (sourceHost && currentHost && sourceHost !== currentHost) {
    const proceed = confirm(t('importHostMismatch', { source: sourceHost, current: currentHost }));
    if (!proceed) return;
  }
  if (Array.isArray(payload.cookies) && payload.cookies.length) {
    const prepared = prepareCookiesForTarget(payload.cookies, sourceHost, targetUrlInput.value);
    if (prepared.failures.length) {
      throw new Error(t('importCookieRejected', { count: prepared.failures.length }));
    }
    payload.cookies = prepared.cookies;
  }
  await importData(payload);
}

async function importData(payload: ImportPayload) {
  const url = targetUrlInput.value.trim();
  if (!url) throw new Error(t('importUrlMissing'));
  if (!activeTab?.id) throw new Error(t('importTabMissing'));

  setLoading(true);
  try {
    if (Array.isArray(payload.cookies) && payload.cookies.length) {
      const response = await chrome.runtime.sendMessage({
        type: MessageType.SetCookies,
        payload: { cookies: payload.cookies, targetUrl: url, tabId: activeTab.id }
      });
      if (response?.error) {
        throw new Error(t('setCookiesError', { error: response.error }));
      }
      if (response.failed || response.imported !== response.requested) {
        throw new Error(
          t('importPartial', { imported: response.imported, requested: response.requested })
        );
      }
    }

    if (Array.isArray(payload.localStorage) && payload.localStorage.length) {
      const response = await chrome.runtime.sendMessage({
        type: MessageType.SetLocalStorage,
        payload: { tabId: activeTab.id, entries: payload.localStorage }
      });
      if (response?.error) {
        throw new Error(t('setStorageError', { error: response.error }));
      }
      if (response.failed || response.imported !== response.requested) {
        throw new Error(
          t('importPartial', { imported: response.imported, requested: response.requested })
        );
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

async function handleDriveImportSubmit(event: Event) {
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

async function fetchDrivePayload(url: string): Promise<unknown> {
  let downloadUrl;
  try {
    downloadUrl = buildDriveDownloadUrl(url);
  } catch (error) {
    throw new Error(t('importDriveInvalidUrl'), { cause: error });
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DRIVE_FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(downloadUrl, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(
        t('importDriveFetchError', { error: response.statusText || response.status })
      );
    }
    if (!isAllowedDriveHost(new URL(response.url).hostname)) {
      throw new Error(t('importDriveInvalidResponse'));
    }
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      throw new Error(t('importDriveInvalidResponse'));
    }
    const contentLength = Number(response.headers.get('content-length'));
    if (Number.isFinite(contentLength) && contentLength > 0) {
      assertImportSize(contentLength, t('validatePayloadTooLarge'));
    }
    const text = await readResponseText(response);
    return parseImportText(text, t('validatePayloadInvalid'));
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(t('importDriveTimeout'), { cause: error });
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function readResponseText(response: Response): Promise<string> {
  if (!response.body) {
    const text = await response.text();
    assertImportSize(new TextEncoder().encode(text).byteLength, t('validatePayloadTooLarge'));
    return text;
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let totalBytes = 0;
  let text = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      assertImportSize(totalBytes, t('validatePayloadTooLarge'));
      text += decoder.decode(value, { stream: true });
    }
  } catch (error) {
    await reader.cancel(error).catch(() => undefined);
    throw error;
  }
  return text + decoder.decode();
}

function setDriveImportLoading(isLoading: boolean) {
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

function downloadJSON(data: unknown, filename: string) {
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

function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function showToast(message: string, isError = false) {
  toastEl.textContent = message;
  toastEl.style.background = isError ? 'var(--hc-toast-error)' : 'var(--hc-toast-success)';
  toastEl.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toastEl.classList.remove('show'), 2500);
}

function setLoading(isLoading: boolean) {
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

function setActiveView(view: View) {
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
  document.body.classList.toggle(
    'hc-view-data',
    activeView === VIEW_COOKIES || activeView === VIEW_STORAGE
  );
}

function handleEditCookieValue(cookie: chrome.cookies.Cookie, cell: HTMLElement) {
  openInlineEditor(cell, cookie.value || '', async (newValue) => {
    if ((cookie.value ?? '') === newValue) {
      return cookie.value ?? '';
    }
    await updateCookieFieldsRequest(cookie, { value: newValue });
    showToast(t('updateCookieSuccess'));
    renderCookies();
    return newValue;
  });
}

function handleEditCookieName(cookie: chrome.cookies.Cookie, cell: HTMLElement) {
  openInlineEditor(cell, cookie.name || '', async (newValue) => {
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

function handleEditCookieDomain(cookie: chrome.cookies.Cookie, cell: HTMLElement) {
  openInlineEditor(cell, cookie.domain || '', async (newValue) => {
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

function handleEditCookieExpiry(cookie: chrome.cookies.Cookie, cell: HTMLElement) {
  const isoValue = cookie.expirationDate
    ? new Date(cookie.expirationDate * 1000).toISOString()
    : '';
  openInlineEditor(cell, isoValue, async (newValue) => {
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

function handleEditStorageValue(entry: LocalStorageEntry, cell: HTMLElement) {
  openInlineEditor(cell, entry.value || '', async (newValue) => {
    if ((entry.value ?? '') === newValue) {
      return entry.value ?? '';
    }
    await updateStorageValueRequest(entry, newValue);
    showToast(t('updateStorageSuccess'));
    renderLocalStorage();
    return newValue;
  });
}

function handleEditStorageKey(entry: LocalStorageEntry, cell: HTMLElement) {
  openInlineEditor(cell, entry.key || '', async (newValue) => {
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

async function updateCookieFieldsRequest(cookie: chrome.cookies.Cookie, changes: CookieChanges) {
  const fallbackUrl = targetUrlInput.value.trim() || activeTab?.url;
  if (!fallbackUrl) {
    throw new Error(t('enterValidUrl'));
  }
  const response = await chrome.runtime.sendMessage({
    type: MessageType.UpdateCookieFields,
    payload: { cookie, changes, fallbackUrl }
  });
  if (response?.error) {
    throw new Error(response.error);
  }
  Object.assign(cookie, response.updatedCookie || { ...cookie, ...changes });
}

async function updateStorageValueRequest(entry: LocalStorageEntry, newValue: string) {
  if (!activeTab?.id) {
    throw new Error(t('unknownTab'));
  }
  const response = await chrome.runtime.sendMessage({
    type: MessageType.UpdateLocalStorageValue,
    payload: { tabId: activeTab.id, key: entry.key, newValue }
  });
  if (response?.error) {
    throw new Error(response.error);
  }
  entry.value = newValue;
}

async function renameStorageKeyRequest(entry: LocalStorageEntry, newKey: string) {
  if (!activeTab?.id) {
    throw new Error(t('unknownTab'));
  }
  const response = await chrome.runtime.sendMessage({
    type: MessageType.RenameLocalStorageKey,
    payload: { tabId: activeTab.id, oldKey: entry.key, newKey }
  });
  if (response?.error) {
    throw new Error(response.error);
  }
  entry.key = newKey;
}

function openInlineEditor(cell: HTMLElement, initialValue: string, onSave: InlineSave) {
  if (!cell || cell.dataset.editing === 'true') return;
  cell.dataset.editing = 'true';
  const editor = document.createElement('textarea');
  editor.className = 'hc-inline-editor';
  editor.value = initialValue ?? '';
  const originalValue = initialValue ?? '';
  cell.textContent = '';
  cell.appendChild(editor);
  editor.focus();
  editor.select();

  let isSaving = false;
  const cleanup = (result: InlineEditorResult) => {
    cell.dataset.editing = 'false';
    cell.innerHTML = '';
    let displayValue: string | null | undefined =
      typeof result === 'string' || result == null ? result : result.display;
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
      showToast(formatError(error) || t('updateErrorGeneric'), true);
    }
  };

  editor.addEventListener('keydown', (event) => {
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

async function handleClearAll() {
  const url = targetUrlInput.value.trim();
  if (!url) {
    showToast(t('enterValidUrl'), true);
    return;
  }
  if (!activeTab?.id) {
    showToast(t('unknownTab'), true);
    return;
  }
  const confirmed = confirm(t('clearAllConfirm'));
  if (!confirmed) return;
  try {
    const response = await chrome.runtime.sendMessage({
      type: MessageType.ClearAllData,
      payload: { url, tabId: activeTab.id }
    });
    if (response?.error) {
      throw new Error(response.error);
    }
    if (response.failedCookies) {
      throw new Error(t('clearAllPartial', { count: response.failedCookies }));
    }
    showToast(t('clearAllSuccess'));
    await loadActiveData();
    if (autoReloadEnabled && activeTab?.id) {
      chrome.tabs.reload(activeTab.id);
    }
  } catch (error) {
    console.error('Clear all failed', error);
    showToast(t('clearAllError', { error: formatError(error) }), true);
  }
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

async function setLanguage(lang: string) {
  const nextLanguage: Language = isLanguage(lang) ? lang : DEFAULT_LANGUAGE;
  if (nextLanguage === currentLanguage) return;
  currentLanguage = nextLanguage;
  await savePreference(LANGUAGE_STORAGE_KEY, nextLanguage);
  applyTranslations();
  renderCookies();
  renderLocalStorage();
}

function applyTranslations() {
  document.documentElement.lang = currentLanguage;
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    if (key) {
      el.textContent = t(key);
    }
  });
  document.querySelectorAll<HTMLElement>('[data-i18n-title]').forEach((el) => {
    const key = el.dataset.i18nTitle;
    if (key) {
      el.title = t(key);
    }
  });
  document.querySelectorAll<HTMLElement>('[data-i18n-placeholder]').forEach((el) => {
    const key = el.dataset.i18nPlaceholder;
    if (key) {
      el.setAttribute('placeholder', t(key));
    }
  });
  document.querySelectorAll<HTMLElement>('[data-i18n-aria-label]').forEach((el) => {
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
  updateExportImportLabels();
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
  const flagIcon = languageToggleBtn.querySelector<HTMLImageElement>('.hc-flag-icon');
  const flag = FLAG_BY_LANG[currentLanguage];
  if (flagIcon && flag) {
    flagIcon.src = flag.src;
    flagIcon.alt = flag.alt;
  }
  languageToggleBtn.setAttribute('aria-label', t('languageToggle'));
}

function handleAutoReloadChange(event: Event) {
  autoReloadEnabled = (event.currentTarget as HTMLInputElement).checked;
  savePreference(AUTO_RELOAD_KEY, autoReloadEnabled);
}

function handleBase64ExportChange(event: Event) {
  base64ExportEnabled = (event.currentTarget as HTMLInputElement).checked;
  savePreference(BASE64_EXPORT_KEY, base64ExportEnabled);
  updateExportImportLabels();
}

function updateExportImportLabels() {
  const exportKey = base64ExportEnabled ? 'exportTxt' : 'exportJson';
  const importKey = base64ExportEnabled ? 'importTxt' : 'importJson';
  if (exportJsonLabelEl) {
    exportJsonLabelEl.dataset.i18n = exportKey;
    exportJsonLabelEl.textContent = t(exportKey);
  }
  if (importJsonLabelEl) {
    importJsonLabelEl.dataset.i18n = importKey;
    importJsonLabelEl.textContent = t(importKey);
  }
  if (importFileInput) {
    importFileInput.setAttribute(
      'accept',
      base64ExportEnabled ? '.txt,text/plain' : '.json,application/json'
    );
  }
}

function parseExpiryInput(input: string): number | null {
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

function setDomainLabel(domain: string | null) {
  if (domain) {
    activeDomainLabel.textContent = domain;
    activeDomainLabel.dataset.domainSet = 'true';
  } else {
    activeDomainLabel.textContent = t('loadingDomain');
    activeDomainLabel.dataset.domainSet = 'false';
  }
}

function t(key: string, vars: Record<string, string | number | null | undefined> = {}): string {
  const langPack: Record<string, string> = translations[currentLanguage];
  const fallbackPack: Record<string, string> = translations[DEFAULT_LANGUAGE];
  const template = langPack[key] ?? fallbackPack[key] ?? key;
  if (typeof template !== 'string') {
    return key;
  }
  return template.replace(/\{\{(\w+)\}\}/g, (_, varName) => String(vars[varName] ?? ''));
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(translations, value);
}
