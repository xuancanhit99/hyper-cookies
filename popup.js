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
const clearAllBtn = document.getElementById('clear-all-btn');
const copyUrlBtn = document.getElementById('copy-url-btn');
const themeToggleBtn = document.getElementById('theme-toggle');
const languageToggleBtn = document.getElementById('language-toggle');
const proToggleBtn = document.getElementById('pro-toggle');
const autoReloadCheckbox = document.getElementById('auto-reload-checkbox');
const base64ExportCheckbox = document.getElementById('base64-export-checkbox');
const exportJsonLabelEl = document.getElementById('export-json-label');
const importJsonLabelEl = document.getElementById('import-json-label');
const configBlocker = document.getElementById('config-blocker');
const configBlockerMessage = document.getElementById('config-blocker-message');
const configUpdateLink = document.getElementById('config-update-link');
const configMasterBtn = document.getElementById('config-master-btn');
const configLoadingOverlay = document.getElementById('config-loading');
const proKeyNote = document.getElementById('pro-key-note');
const proCodeModal = document.getElementById('pro-code-modal');
const proInfoModal = document.getElementById('pro-info-modal');
const proInfoDetails = document.getElementById('pro-info-details');
const proInfoCloseBtn = document.getElementById('pro-info-close');
const proInfoClearBtn = document.getElementById('pro-info-clear');
const proInfoNewKeyBtn = document.getElementById('pro-info-new-key');
const proCodeForm = document.getElementById('pro-code-form');
const proCodeInput = document.getElementById('pro-code-input');
const proCodeCancelBtn = document.getElementById('pro-code-cancel');
const proCodeSubmitBtn = document.getElementById('pro-code-submit');
const proCodeCloseBtn = document.getElementById('pro-code-close');

activeDomainLabel.dataset.domainSet = 'false';

const VIEW_HOME = 'home';
const VIEW_COOKIES = 'cookies';
const VIEW_STORAGE = 'storage';
const CONFIG_URL = 'https://drive.google.com/file/d/1rhD6c8MnJoOXgTiTtGjBEDLkYXEth3nx/view';
const LANGUAGE_STORAGE_KEY = 'hyper-cookies:language';
const THEME_STORAGE_KEY = 'hyper-cookies:theme';
const AUTO_RELOAD_KEY = 'hyper-cookies:auto-reload';
const BASE64_EXPORT_KEY = 'hyper-cookies:base64-export';
const PRO_FEATURES_KEY = 'hyper-cookies:pro-enabled';
const PRO_INFO_STORAGE_KEY = 'hyper-cookies:pro-info';
const MASTER_PASSWORD_SHA1 = '41052c347b3e8d6ca3a20f2b15caf4a2ef80b1b9';
const DEFAULT_LANGUAGE = 'vi';
const DEFAULT_THEME = 'light';
const DEFAULT_AUTO_RELOAD = true;
const DEFAULT_BASE64_EXPORT = true;
const DEFAULT_PRO_ENABLED = false;
const FALLBACK_DEFAULTS = {
  language: DEFAULT_LANGUAGE,
  theme: DEFAULT_THEME,
  autoReload: DEFAULT_AUTO_RELOAD,
  base64Export: DEFAULT_BASE64_EXPORT
};
const EXTENSION_VERSION = chrome?.runtime?.getManifest?.().version || '0.0.0';
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
    importDriveModalDescription: 'Dán link chia sẻ file TXT/JSON trên Google Drive để bắt đầu import.',
    importDriveLinkLabel: 'Link Google Drive',
    importDrivePlaceholder: 'https://drive.google.com/...',
    proCodeTitle: 'Kích hoạt Pro',
    proCodeDescription: 'Nhập mã để kích hoạt phiên bản Pro mở khoá các tính năng nâng cao.',
    proCodeLabel: '',
    proCodePlaceholder: 'Nhập mã kích hoạt',
    proCodeSubmit: 'Mở khóa',
    proCodeInvalid: 'Mã không hợp lệ',
    proCodeExpired: 'Mã đã hết hạn',
    proCodeRequired: 'Vui lòng nhập mã',
    proCodeSuccess: 'Đã mở khóa Pro',
    configLoadError: 'Không tải được cấu hình: {{error}}',
    configDisabled: 'Extension đang bị tắt. {{message}}',
    updateRequired: 'Yêu cầu cập nhật',
    updateRequiredDescription: 'Cần cập nhật Hyper Cookies lên {{required}} (hiện tại {{current}}).',
    importDriveUrlMissing: 'Nhập link Google Drive hợp lệ',
    importDriveFetchError: 'Không thể tải file: {{error}}',
    importDriveStart: 'Import',
    cancel: 'Huỷ',
    closeModal: 'Đóng',
    clearAllTitle: 'Xóa cookies & local storage',
    clearAllConfirm: 'Xóa tất cả cookies và local storage của trang này?',
    clearAllSuccess: 'Đã xóa cookies và local storage',
    clearAllError: 'Xóa thất bại: {{error}}',
    base64ExportLabel: 'Mã hóa khi export',
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
    proToggleEnable: 'Mở khóa tính năng Pro',
    proToggleDisable: 'Tắt chế độ Pro',
    proFeatureLocked: 'Đây là tính năng nâng cao, vui lòng bật Pro để sử dụng.',
    autoReloadLabel: 'Tự động làm mới trang sau khi import',
    updateCookieSuccess: 'Đã cập nhật cookie',
    updateStorageSuccess: 'Đã cập nhật local storage',
    updateErrorGeneric: 'Không thể cập nhật giá trị',
    cookieNameRequired: 'Tên cookie không được để trống',
    cookieDomainRequired: 'Domain cookie không được để trống',
    storageKeyRequired: 'Key không được để trống',
    invalidExpiryFormat: 'Định dạng thời gian hết hạn không hợp lệ',
    proKeyInfoName: 'Tên: {{name}}',
    proKeyInfoEmail: 'Email: {{email}}',
    proKeyInfoExpiry: 'Hết hạn: {{date}}',
    proKeyInfoMaster: 'Developer Mode',
    proInfoNameLabel: 'Họ tên',
    proInfoEmailLabel: 'Email',
    proInfoKeyLabel: 'Key',
    proInfoHostsLabel: 'Hosts',
    proInfoTitle: 'Thông tin kích hoạt Pro',
    proInfoClear: 'Xóa key Pro',
    proInfoNewKey: 'Nhập key mới'
  },
  en: {
    loadingDomain: 'Loading...',
    tabHome: 'Home',
    tabCookies: 'Cookies',
    tabStorage: 'Local Storage',
    urlLabel: 'URL',
    exportJson: 'Export JSON',
    exportTxt: 'Export TXT',
    importJson: 'Import JSON',
    importTxt: 'Import TXT',
    importDrive: 'Import from Google Drive',
    importDriveModalTitle: 'Import from Google Drive',
    importDriveModalDescription: 'Paste the shared TXT/JSON link from Google Drive to import.',
    importDriveLinkLabel: 'Google Drive link',
    importDrivePlaceholder: 'https://drive.google.com/...',
    proCodeTitle: 'Activate Pro',
    proCodeDescription: 'Enter a code to activate Pro.',
    proCodeLabel: '',
    proCodePlaceholder: 'Enter activation code',
    proCodeSubmit: 'Unlock',
    proCodeInvalid: 'Invalid code',
    proCodeExpired: 'Code expired',
    proCodeRequired: 'Please enter a code',
    proCodeSuccess: 'Pro unlocked',
    configLoadError: 'Cannot load config: {{error}}',
    configDisabled: 'Extension is disabled. {{message}}',
    updateRequired: 'Update required',
    updateRequiredDescription: 'Update Hyper Cookies to {{required}} (current {{current}}).',
    importDriveUrlMissing: 'Enter a Google Drive link',
    importDriveFetchError: 'Unable to fetch file: {{error}}',
    importDriveStart: 'Import',
    cancel: 'Cancel',
    closeModal: 'Close',
    clearAllTitle: 'Clear cookies & local storage',
    clearAllConfirm: 'Clear all cookies and local storage for this page?',
    clearAllSuccess: 'All cookies and local storage cleared',
    clearAllError: 'Clear failed: {{error}}',
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
    proToggleEnable: 'Unlock Pro features',
    proToggleDisable: 'Turn off Pro mode',
    proFeatureLocked: 'This is a Pro feature. Please enable Pro to use it.',
    autoReloadLabel: 'Refresh tab after import',
    updateCookieSuccess: 'Cookie updated',
    updateStorageSuccess: 'Local storage updated',
    updateErrorGeneric: 'Unable to update value',
    cookieNameRequired: 'Cookie name cannot be empty',
    cookieDomainRequired: 'Cookie domain cannot be empty',
    storageKeyRequired: 'Key cannot be empty',
    invalidExpiryFormat: 'Invalid expiration date',
    proKeyInfoName: 'Name: {{name}}',
    proKeyInfoEmail: 'Email: {{email}}',
    proKeyInfoExpiry: 'Expires: {{date}}',
    proKeyInfoMaster: 'Developer Mode',
    proInfoNameLabel: 'Full name',
    proInfoEmailLabel: 'Email',
    proInfoKeyLabel: 'Key',
    proInfoHostsLabel: 'Hosts',
    proInfoTitle: 'Pro activation info',
    proInfoClear: 'Remove Pro key',
    proInfoNewKey: 'Enter new key'
  }
};

let currentCookies = [];
let currentStorageEntries = [];
let activeView = VIEW_HOME;
let activeTab = null;
let currentLanguage = DEFAULT_LANGUAGE;
let currentTheme = DEFAULT_THEME;
let autoReloadEnabled = DEFAULT_AUTO_RELOAD;
let base64ExportEnabled = DEFAULT_BASE64_EXPORT;
let proEnabled = DEFAULT_PRO_ENABLED;
let configDefaults = { ...FALLBACK_DEFAULTS };
let remoteConfig = null;
let configStatus = 'pending'; // pending | ok | error | disabled | update_required
let configErrorMessage = '';
let configUpdateUrl = '';
let masterBypass = false;
let proKeyInfo = null;

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
if (proToggleBtn) {
  proToggleBtn.addEventListener('click', openProInfoModal);
}
if (autoReloadCheckbox) {
  autoReloadCheckbox.addEventListener('change', handleAutoReloadChange);
}
if (base64ExportCheckbox) {
  base64ExportCheckbox.addEventListener('change', handleBase64ExportChange);
}
if (configMasterBtn) {
  configMasterBtn.addEventListener('click', openProCodeModal);
}
if (proCodeForm) {
  proCodeForm.addEventListener('submit', handleProCodeSubmit);
}
if (proCodeCancelBtn) {
  proCodeCancelBtn.addEventListener('click', closeProCodeModal);
}
if (proCodeCloseBtn) {
  proCodeCloseBtn.addEventListener('click', closeProCodeModal);
}
if (proInfoCloseBtn) {
  proInfoCloseBtn.addEventListener('click', closeProInfoModal);
}
if (proInfoClearBtn) {
  proInfoClearBtn.addEventListener('click', handleClearProKey);
}
if (proInfoNewKeyBtn) {
  proInfoNewKeyBtn.addEventListener('click', () => {
    closeProInfoModal();
    openProCodeModal();
  });
}
if (proCodeModal || proInfoModal) {
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && proCodeModal?.classList.contains('open')) {
      event.preventDefault();
      closeProCodeModal();
    }
    if (event.key === 'Escape' && proInfoModal?.classList.contains('open')) {
      event.preventDefault();
      closeProInfoModal();
    }
  });
}

async function init() {
  await loadRemoteConfig();
  applyConfigDefaultsToState();
  updateConfigBlockerUI();
  await loadPreferences();
  applyTheme();
  applyTranslations();
  setDomainLabel(null);
  updateViewUI();
  if (isExtensionLocked()) {
    return;
  }
  await populateFromActiveTab();
}

async function loadPreferences() {
  try {
    const stored = await getFromStorage([
      LANGUAGE_STORAGE_KEY,
      THEME_STORAGE_KEY,
      AUTO_RELOAD_KEY,
      BASE64_EXPORT_KEY,
      PRO_FEATURES_KEY,
      PRO_INFO_STORAGE_KEY
    ]);
    const pendingSaves = [];
    if (stored?.[LANGUAGE_STORAGE_KEY] && translations[stored[LANGUAGE_STORAGE_KEY]]) {
      currentLanguage = stored[LANGUAGE_STORAGE_KEY];
    } else {
      currentLanguage = getDefaultSetting('language');
      pendingSaves.push(savePreference(LANGUAGE_STORAGE_KEY, currentLanguage));
    }
    if (stored?.[THEME_STORAGE_KEY]) {
      currentTheme = stored[THEME_STORAGE_KEY];
    } else {
      currentTheme = getDefaultSetting('theme');
      pendingSaves.push(savePreference(THEME_STORAGE_KEY, currentTheme));
    }
    if (typeof stored?.[AUTO_RELOAD_KEY] === 'boolean') {
      autoReloadEnabled = stored[AUTO_RELOAD_KEY];
    } else {
      autoReloadEnabled = getDefaultSetting('autoReload');
      pendingSaves.push(savePreference(AUTO_RELOAD_KEY, autoReloadEnabled));
    }
    if (typeof stored?.[BASE64_EXPORT_KEY] === 'boolean') {
      base64ExportEnabled = stored[BASE64_EXPORT_KEY];
    } else {
      base64ExportEnabled = getDefaultSetting('base64Export');
      pendingSaves.push(savePreference(BASE64_EXPORT_KEY, base64ExportEnabled));
    }
    if (typeof stored?.[PRO_FEATURES_KEY] === 'boolean') {
      proEnabled = stored[PRO_FEATURES_KEY];
    } else {
      proEnabled = DEFAULT_PRO_ENABLED;
    }
    if (stored?.[PRO_INFO_STORAGE_KEY]) {
      proKeyInfo = stored[PRO_INFO_STORAGE_KEY];
      if (proKeyInfo?.source === 'master') {
        masterBypass = true;
        configStatus = 'ok';
      }
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
  updateProToggle();
  updateExportImportLabels();
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

async function loadRemoteConfig() {
  configStatus = 'pending';
  configErrorMessage = '';
  configUpdateUrl = '';
  setConfigLoading(true);
  try {
    const downloadUrl = buildDriveDownloadUrl(CONFIG_URL);
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error(response.statusText || String(response.status));
    }
    const text = await response.text();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (error) {
      parsed = parseEncodedPayload(text);
    }
    validateRemoteConfig(parsed);
    remoteConfig = parsed;
    applyConfigDefaults(parsed.defaults);
    configStatus = 'ok';
    if (parsed.enabled === false) {
      configStatus = 'disabled';
      configErrorMessage = t('configDisabled', { message: parsed?.messages?.maintenance || '' });
    }
    if (parsed.versionRequired && isVersionOutdated(EXTENSION_VERSION, parsed.versionRequired)) {
      configStatus = 'update_required';
      configErrorMessage = t('updateRequiredDescription', {
        required: parsed.versionRequired,
        current: EXTENSION_VERSION
      });
      configUpdateUrl = parsed.updateUrl || '';
    }
  } catch (error) {
    console.warn('Hyper Cookies: cannot load remote config', error);
    configStatus = 'error';
    configErrorMessage = t('configLoadError', { error: formatError(error) });
  }
  setConfigLoading(false);
}

function applyConfigDefaults(defaults) {
  const normalized = {
    language: defaults?.language || configDefaults.language,
    theme: defaults?.theme || configDefaults.theme,
    autoReload:
      typeof defaults?.autoReload === 'boolean' ? defaults.autoReload : configDefaults.autoReload,
    base64Export:
      typeof defaults?.base64Export === 'boolean'
        ? defaults.base64Export
        : configDefaults.base64Export
  };
  configDefaults = normalized;
}

function applyConfigDefaultsToState() {
  currentLanguage = configDefaults.language || currentLanguage;
  currentTheme = configDefaults.theme || currentTheme;
  autoReloadEnabled = configDefaults.autoReload;
  base64ExportEnabled = configDefaults.base64Export;
}

function getDefaultSetting(key) {
  return configDefaults[key] ?? FALLBACK_DEFAULTS[key];
}

function isExtensionLocked() {
  return !masterBypass && configStatus !== 'ok';
}

function updateConfigBlockerUI() {
  if (!configBlocker) return;
  const hidden = !isExtensionLocked();
  configBlocker.dataset.hidden = hidden ? 'true' : 'false';
  if (hidden) return;
  configBlockerMessage.textContent = getConfigLockMessage();
  if (configUpdateLink) {
    const showLink = Boolean(configUpdateUrl) && configStatus === 'update_required';
    configUpdateLink.dataset.hidden = showLink ? 'false' : 'true';
    if (showLink) {
      configUpdateLink.href = configUpdateUrl;
      configUpdateLink.querySelector('span:last-child').textContent = t('updateRequired');
    }
  }
}

function getConfigLockMessage() {
  if (configStatus === 'update_required') {
    return t('updateRequiredDescription', {
      required: remoteConfig?.versionRequired || '',
      current: EXTENSION_VERSION
    });
  }
  if (configStatus === 'disabled') {
    return t('configDisabled', { message: remoteConfig?.messages?.maintenance || '' });
  }
  return configErrorMessage || t('configLoadError', { error: '' });
}

function compareVersions(a, b) {
  const pa = String(a || '')
    .split('.')
    .map(Number);
  const pb = String(b || '')
    .split('.')
    .map(Number);
  const length = Math.max(pa.length, pb.length);
  for (let i = 0; i < length; i += 1) {
    const ai = pa[i] || 0;
    const bi = pb[i] || 0;
    if (ai > bi) return 1;
    if (ai < bi) return -1;
  }
  return 0;
}

function isVersionOutdated(current, required) {
  if (!required) return false;
  return compareVersions(current, required) < 0;
}

function setConfigLoading(isLoading) {
  if (!configLoadingOverlay) return;
  configLoadingOverlay.dataset.hidden = isLoading ? 'false' : 'true';
}

function parseExpiryDate(dateString) {
  if (!dateString) return null;
  const parts = String(dateString).split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    throw new Error(t('invalidExpiryFormat'));
  }
  const [day, month, year] = parts;
  const date = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
  if (Number.isNaN(date.getTime())) {
    throw new Error(t('invalidExpiryFormat'));
  }
  return date;
}

function isProCodeExpired(expiryDate) {
  if (!expiryDate) return false;
  return Date.now() > expiryDate.getTime();
}

async function sha1Hex(input) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const buffer = await crypto.subtle.digest('SHA-1', data);
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

function validateRemoteConfig(config) {
  if (!config || typeof config !== 'object') {
    throw new Error(t('validatePayloadInvalid'));
  }
  if (config.version && config.version !== 1) {
    throw new Error(t('validatePayloadUnsupportedVersion'));
  }
  if (config.proKeys && !Array.isArray(config.proKeys)) {
    throw new Error(t('validatePayloadInvalid'));
  }
}

async function populateFromActiveTab() {
  if (!requireExtensionReady()) return;
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
  if (!requireExtensionReady()) return;
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
  if (!requireExtensionReady()) return;
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
    const filenameBase = `hyper-cookies-export-${exportPayload.sourceHostname || 'data'}`;
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

async function handleImportFile(event) {
  if (!requireExtensionReady()) return;
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const payload = parseImportText(text);
    await processImportedPayload(payload);
  } catch (error) {
    console.error(error);
    showToast(t('importError', { error: formatError(error) }), true);
  } finally {
    event.target.value = '';
  }
}

async function processImportedPayload(rawPayload) {
  const payload = decodeExportEnvelope(rawPayload);
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
  if (!requireExtensionReady()) return;
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
  if (!requireExtensionReady()) return;
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
  return parseImportText(text);
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

function openProCodeModal() {
  if (!proCodeModal) return;
  closeProInfoModal();
  proCodeModal.classList.add('open');
  proCodeModal.setAttribute('aria-hidden', 'false');
  setProCodeLoading(false);
  setTimeout(() => proCodeInput?.focus(), 50);
}

function closeProCodeModal() {
  if (!proCodeModal) return;
  proCodeModal.classList.remove('open');
  proCodeModal.setAttribute('aria-hidden', 'true');
  setProCodeLoading(false);
  if (proCodeForm) {
    proCodeForm.reset();
  }
}

function openProInfoModal() {
  if (!proEnabled || !proKeyInfo) {
    openProCodeModal();
    return;
  }
  if (!proInfoModal) return;
  closeProCodeModal();
  renderProInfoDetails();
  proInfoModal.classList.add('open');
  proInfoModal.setAttribute('aria-hidden', 'false');
  setTimeout(() => proInfoModal?.focus(), 20);
}

function closeProInfoModal() {
  if (!proInfoModal) return;
  proInfoModal.classList.remove('open');
  proInfoModal.setAttribute('aria-hidden', 'true');
}

function renderProInfoDetails() {
  if (!proInfoDetails) return;
  const parts = [];
  if (proKeyInfo?.fullName) {
    parts.push(
      `<p><strong>${t('proInfoNameLabel')}:</strong> ${escapeHtml(proKeyInfo.fullName)}</p>`
    );
  }
  if (proKeyInfo?.email) {
    parts.push(`<p><strong>${t('proInfoEmailLabel')}:</strong> ${escapeHtml(proKeyInfo.email)}</p>`);
  }
  if (proKeyInfo?.code) {
    parts.push(
      `<p><strong>${t('proInfoKeyLabel')}:</strong> ${escapeHtml(maskCode(proKeyInfo.code))}</p>`
    );
  }
  if (proKeyInfo?.expiresAt) {
    parts.push(`<p>${t('proKeyInfoExpiry', { date: proKeyInfo.expiresAt })}</p>`);
  }
  if (proKeyInfo?.allowedHosts?.length) {
    const hosts = proKeyInfo.allowedHosts.join(', ');
    parts.push(`<p><strong>${t('proInfoHostsLabel')}:</strong> ${escapeHtml(hosts)}</p>`);
  }
  if (!parts.length) {
    parts.push(`<p>${t('proKeyInfoMaster')}</p>`);
  }
  proInfoDetails.innerHTML = parts.join('');
}

function handleClearProKey() {
  proEnabled = false;
  proKeyInfo = null;
  masterBypass = false;
  savePreference(PRO_FEATURES_KEY, proEnabled);
  savePreference(PRO_INFO_STORAGE_KEY, proKeyInfo);
  updateProToggle();
  updateProKeyNote();
  closeProInfoModal();
  setActiveView(VIEW_HOME);
  showToast(t('proKeyCleared') || 'Pro key cleared');
}

function setProCodeLoading(isLoading) {
  if (proCodeSubmitBtn) proCodeSubmitBtn.disabled = isLoading;
  if (proCodeCancelBtn) proCodeCancelBtn.disabled = isLoading;
  if (proCodeInput) proCodeInput.disabled = isLoading;
}

async function handleProCodeSubmit(event) {
  event.preventDefault();
  if (!proCodeInput) return;
  const code = proCodeInput.value.trim();
  if (!code) {
    showToast(t('proCodeRequired'), true);
    return;
  }
  setProCodeLoading(true);
  try {
    const result = await attemptUnlockPro(code);
    proEnabled = true;
    savePreference(PRO_FEATURES_KEY, proEnabled);
    proKeyInfo = buildProKeyInfo(result);
    savePreference(PRO_INFO_STORAGE_KEY, proKeyInfo);
    updateProToggle();
    updateProKeyNote();
    renderProInfoDetails();
    updateConfigBlockerUI();
    closeProCodeModal();
    showToast(t('proCodeSuccess'));
    if (activeView === VIEW_COOKIES || activeView === VIEW_STORAGE) {
      if (!activeTab) {
        await populateFromActiveTab();
      }
      loadActiveData();
    }
  } catch (error) {
    console.error('Pro unlock failed', error);
    showToast(formatError(error), true);
  } finally {
    setProCodeLoading(false);
  }
}

function wrapPayloadWithBase64(payload) {
  const jsonString = JSON.stringify(payload);
  return encodeStringToBase64(jsonString);
}

function decodeExportEnvelope(rawPayload) {
  if (typeof rawPayload === 'string') {
    return parseEncodedPayload(rawPayload);
  }
  return rawPayload;
}

function encodeStringToBase64(str) {
  try {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    let binary = '';
    bytes.forEach(byte => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary);
  } catch (error) {
    return btoa(unescape(encodeURIComponent(str)));
  }
}

function decodeBase64ToString(encoded) {
  try {
    const binary = atob(encoded);
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
  } catch (error) {
    return decodeURIComponent(
      atob(encoded)
        .split('')
        .map(char => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('')
    );
  }
}

function parseEncodedPayload(encodedText) {
  try {
    const decodedString = decodeBase64ToString(encodedText.trim());
    return JSON.parse(decodedString);
  } catch (error) {
    throw new Error(t('validatePayloadInvalid'));
  }
}

function parseImportText(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) {
    throw new Error(t('validatePayloadInvalid'));
  }
  try {
    return JSON.parse(trimmed);
  } catch (error) {
    return trimmed;
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

function downloadText(content, filename) {
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

function requireExtensionReady() {
  if (!isExtensionLocked()) return true;
  showToast(getConfigLockMessage(), true);
  openProCodeModal();
  return false;
}

function requirePro() {
  if (!requireExtensionReady()) return false;
  if (proEnabled) return true;
  showToast(t('proFeatureLocked'), true);
  return false;
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
  if (!requireExtensionReady()) return;
  if (!proEnabled && (view === VIEW_COOKIES || view === VIEW_STORAGE)) {
    showToast(t('proFeatureLocked'), true);
    return;
  }
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

async function handleClearAll() {
  if (!requireExtensionReady()) return;
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
      type: 'CLEAR_ALL_DATA',
      payload: { url, tabId: activeTab.id }
    });
    if (response?.error) {
      throw new Error(response.error);
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
  if (!requireExtensionReady()) return;
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
  updateProToggle();
  updateThemeToggleIcon();
  updateExportImportLabels();
  updateConfigBlockerUI();
  updateProKeyNote();
  renderProInfoDetails();
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

async function attemptUnlockPro(codeInput) {
  const trimmed = codeInput.trim();
  if (!trimmed) {
    throw new Error(t('proCodeRequired'));
  }
  const hashedInput = await sha1Hex(trimmed);
  if (hashedInput === MASTER_PASSWORD_SHA1) {
    masterBypass = true;
    configStatus = 'ok';
    return { masterBypass: true };
  }
  if (isExtensionLocked()) {
    throw new Error(getConfigLockMessage());
  }
  const proKeys = remoteConfig?.proKeys || [];
  const matched = proKeys.find(key => {
    const keyCode = key?.code?.trim?.();
    if (keyCode && keyCode.toLowerCase() === trimmed.toLowerCase()) {
      return true;
    }
    if (key?.codeHash) {
      return String(key.codeHash).toLowerCase() === hashedInput.toLowerCase();
    }
    return false;
  });
  if (!matched) {
    throw new Error(t('proCodeInvalid'));
  }
  const expiryDate = parseExpiryDate(matched.expiresAt);
  if (isProCodeExpired(expiryDate)) {
    throw new Error(t('proCodeExpired'));
  }
  return { masterBypass: false, matched };
}

function toggleProMode() {
  openProCodeModal();
}

function buildProKeyInfo(unlockResult) {
  if (unlockResult?.masterBypass) {
    return {
      source: 'master',
      label: t('proKeyInfoMaster'),
      unlockedAt: new Date().toISOString()
    };
  }
  const entry = unlockResult?.matched || {};
  return {
    source: 'code',
    code: entry.code,
    email: entry.email,
    fullName: entry.fullName,
    expiresAt: entry.expiresAt || null,
    unlockedAt: new Date().toISOString()
  };
}

function formatProKeyNote(info) {
  if (!info) return '';
  if (info.source === 'master') {
    return info.label || t('proKeyInfoMaster');
  }
  const parts = [];
  if (info.fullName) {
    parts.push(info.fullName);
  } else if (info.email) {
    parts.push(info.email);
  } else if (info.code) {
    parts.push(info.code);
  }
  if (info.expiresAt) {
    parts.push(t('proKeyInfoExpiry', { date: info.expiresAt }));
  }
  return parts.filter(Boolean).join(' • ');
}

function updateProToggle() {
  if (!proToggleBtn) return;
  proToggleBtn.classList.toggle('hc-pro-active', proEnabled);
  proToggleBtn.setAttribute('aria-pressed', String(proEnabled));
  const label = proEnabled ? formatProKeyNote(proKeyInfo) : t('proToggleEnable');
  proToggleBtn.title = label;
  proToggleBtn.setAttribute('aria-label', label);
  const textEl = proToggleBtn.querySelector('.hc-pro-label');
  if (textEl) {
    textEl.textContent = proEnabled ? 'PRO' : 'LITE';
  }
}

function updateProKeyNote() {
  if (!proKeyNote) return;
  proKeyNote.dataset.hidden = 'true';
  proKeyNote.textContent = '';
}

function handleAutoReloadChange(event) {
  if (!requirePro()) {
    event.target.checked = autoReloadEnabled;
    return;
  }
  autoReloadEnabled = Boolean(event.target.checked);
  savePreference(AUTO_RELOAD_KEY, autoReloadEnabled);
}

function handleBase64ExportChange(event) {
  if (!requirePro()) {
    event.target.checked = base64ExportEnabled;
    return;
  }
  base64ExportEnabled = Boolean(event.target.checked);
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

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function maskCode(code) {
  const str = String(code ?? '');
  if (str.length <= 2) return '*'.repeat(str.length);
  return `${str[0]}${'*'.repeat(Math.max(1, str.length - 2))}${str[str.length - 1]}`;
}



