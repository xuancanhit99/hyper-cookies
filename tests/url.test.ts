import { describe, expect, it } from 'vitest';
import { safeHostname } from '../src/shared/url';

describe('safeHostname', () => {
  it('returns a hostname for an HTTP URL', () => {
    expect(safeHostname('https://sub.example.com/path')).toBe('sub.example.com');
  });

  it('returns null for invalid input', () => {
    expect(safeHostname('not a URL')).toBeNull();
  });
});
