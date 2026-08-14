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
