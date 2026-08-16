export interface LocalStorageEntry {
  key: string;
  value: string | null;
}

export interface SnapshotPayload {
  version: 1;
  exportedAt: string;
  sourceUrl: string;
  sourceHostname: string | null;
  cookies: chrome.cookies.Cookie[];
  localStorage: LocalStorageEntry[];
}

export interface ImportPayload {
  version?: 1;
  sourceUrl?: string;
  sourceHostname?: string;
  cookies?: chrome.cookies.Cookie[];
  localStorage?: LocalStorageEntry[];
}

export const MAX_IMPORT_BYTES = 10 * 1024 * 1024;
export const MAX_IMPORT_ITEMS = 5_000;

export interface ImportValidationMessages {
  invalid: string;
  unsupportedVersion: string;
  missingData: string;
  tooManyItems: string;
}

export function wrapPayloadWithBase64(payload: SnapshotPayload): string {
  return encodeStringToBase64(JSON.stringify(payload));
}

export function decodeExportEnvelope(rawPayload: unknown, invalidPayloadMessage: string): unknown {
  return typeof rawPayload === 'string'
    ? parseEncodedPayload(rawPayload, invalidPayloadMessage)
    : rawPayload;
}

export function parseImportText(text: string, invalidPayloadMessage: string): unknown {
  const trimmed = (text || '').trim();
  if (!trimmed) {
    throw new Error(invalidPayloadMessage);
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed;
  }
}

export function assertImportSize(size: number, tooLargeMessage: string): void {
  if (!Number.isFinite(size) || size < 0 || size > MAX_IMPORT_BYTES) {
    throw new Error(tooLargeMessage);
  }
}

export function validateImportPayload(
  payload: unknown,
  messages: ImportValidationMessages
): asserts payload is ImportPayload {
  if (!isRecord(payload)) throw new Error(messages.invalid);
  if (payload.version != null && payload.version !== 1) {
    throw new Error(messages.unsupportedVersion);
  }
  if (payload.sourceUrl != null && typeof payload.sourceUrl !== 'string') {
    throw new Error(messages.invalid);
  }
  if (payload.sourceHostname != null && typeof payload.sourceHostname !== 'string') {
    throw new Error(messages.invalid);
  }
  const cookies = Array.isArray(payload.cookies) ? payload.cookies : null;
  const localStorage = Array.isArray(payload.localStorage) ? payload.localStorage : null;
  if (!cookies && !localStorage) throw new Error(messages.missingData);
  if (
    (cookies && cookies.length > MAX_IMPORT_ITEMS) ||
    (localStorage && localStorage.length > MAX_IMPORT_ITEMS)
  ) {
    throw new Error(messages.tooManyItems);
  }
  if (cookies && !cookies.every(isCookieRecord)) {
    throw new Error(messages.invalid);
  }
  if (localStorage && !localStorage.every(isLocalStorageRecord)) {
    throw new Error(messages.invalid);
  }
}

function encodeStringToBase64(value: string): string {
  try {
    const bytes = new TextEncoder().encode(value);
    let binary = '';
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary);
  } catch {
    return btoa(unescape(encodeURIComponent(value)));
  }
}

function parseEncodedPayload(encodedText: string, invalidPayloadMessage: string): unknown {
  try {
    return JSON.parse(decodeBase64ToString(encodedText.trim()));
  } catch {
    throw new Error(invalidPayloadMessage);
  }
}

function decodeBase64ToString(encoded: string): string {
  try {
    const binary = atob(encoded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return decodeURIComponent(
      atob(encoded)
        .split('')
        .map((character) => `%${character.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('')
    );
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function isCookieRecord(value: unknown): boolean {
  if (!isRecord(value)) return false;
  if (
    typeof value.name !== 'string' ||
    !value.name ||
    typeof value.value !== 'string' ||
    typeof value.domain !== 'string' ||
    typeof value.path !== 'string' ||
    typeof value.secure !== 'boolean' ||
    typeof value.httpOnly !== 'boolean' ||
    typeof value.hostOnly !== 'boolean' ||
    typeof value.session !== 'boolean' ||
    !['no_restriction', 'lax', 'strict', 'unspecified'].includes(String(value.sameSite))
  ) {
    return false;
  }
  if (value.expirationDate != null) {
    if (typeof value.expirationDate !== 'number' || !Number.isFinite(value.expirationDate)) {
      return false;
    }
  }
  if (value.partitionKey != null) {
    if (!isRecord(value.partitionKey)) return false;
    if (
      value.partitionKey.topLevelSite != null &&
      typeof value.partitionKey.topLevelSite !== 'string'
    ) {
      return false;
    }
    if (
      value.partitionKey.hasCrossSiteAncestor != null &&
      typeof value.partitionKey.hasCrossSiteAncestor !== 'boolean'
    ) {
      return false;
    }
  }
  return true;
}

function isLocalStorageRecord(value: unknown): boolean {
  return Boolean(
    isRecord(value) &&
    typeof value.key === 'string' &&
    (typeof value.value === 'string' || value.value === null)
  );
}
