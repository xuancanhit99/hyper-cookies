import { describe, expect, it } from 'vitest';
import { safeHostname, sanitizeSourceUrl } from '../src/shared/url';

describe('safeHostname', () => {
  it('returns a hostname for an HTTP URL', () => {
    expect(safeHostname('https://sub.example.com/path')).toBe('sub.example.com');
  });

  it('returns null for invalid input', () => {
    expect(safeHostname('not a URL')).toBeNull();
  });
});

describe('sanitizeSourceUrl', () => {
  it('keeps only the origin in exported metadata', () => {
    expect(
      sanitizeSourceUrl('https://user:pass@example.com/path?token=secret#private-section')
    ).toBe('https://example.com/');
  });
});
