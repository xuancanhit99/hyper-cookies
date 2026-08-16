import { describe, expect, it } from 'vitest';
import {
  assertImportSize,
  decodeExportEnvelope,
  MAX_IMPORT_BYTES,
  parseImportText,
  validateImportPayload,
  wrapPayloadWithBase64,
  type SnapshotPayload
} from '../src/shared/snapshot';

const validationMessages = {
  invalid: 'invalid',
  unsupportedVersion: 'unsupported',
  missingData: 'missing',
  tooManyItems: 'too-many'
};

const snapshot: SnapshotPayload = {
  version: 1,
  exportedAt: '2026-01-01T00:00:00.000Z',
  sourceUrl: 'https://example.com/',
  sourceHostname: 'example.com',
  cookies: [],
  localStorage: [{ key: 'language', value: 'vi' }]
};

describe('snapshot envelope', () => {
  it('round-trips UTF-8 data through the existing Base64 format', () => {
    const encoded = wrapPayloadWithBase64(snapshot);
    expect(decodeExportEnvelope(encoded, 'invalid')).toEqual(snapshot);
  });

  it('parses plain JSON imports', () => {
    expect(parseImportText(JSON.stringify(snapshot), 'invalid')).toEqual(snapshot);
  });

  it('rejects empty imports', () => {
    expect(() => parseImportText('  ', 'invalid')).toThrow('invalid');
  });

  it('validates a complete snapshot payload', () => {
    expect(() => validateImportPayload(snapshot, validationMessages)).not.toThrow();
  });

  it('rejects malformed item records', () => {
    expect(() =>
      validateImportPayload({ version: 1, cookies: [{ name: 'only-a-name' }] }, validationMessages)
    ).toThrow('invalid');
  });

  it('enforces the import byte limit before parsing', () => {
    expect(() => assertImportSize(MAX_IMPORT_BYTES, 'large')).not.toThrow();
    expect(() => assertImportSize(MAX_IMPORT_BYTES + 1, 'large')).toThrow('large');
  });
});
