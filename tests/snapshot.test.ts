import { describe, expect, it } from 'vitest';
import {
  decodeExportEnvelope,
  parseImportText,
  wrapPayloadWithBase64,
  type SnapshotPayload
} from '../src/shared/snapshot';

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
});
