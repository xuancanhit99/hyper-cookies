import { describe, expect, it } from 'vitest';
import { safeHostname, toHostPermissionPattern } from '../src/shared/url';

describe('safeHostname', () => {
  it('returns a hostname for an HTTP URL', () => {
    expect(safeHostname('https://sub.example.com/path')).toBe('sub.example.com');
  });

  it('returns null for invalid input', () => {
    expect(safeHostname('not a URL')).toBeNull();
  });
});

describe('toHostPermissionPattern', () => {
  it('creates a permission pattern for an HTTPS hostname without leaking path or port', () => {
    expect(toHostPermissionPattern('https://sub.example.com:8443/private?token=secret')).toBe(
      'https://sub.example.com/*'
    );
  });

  it('supports HTTP sites', () => {
    expect(toHostPermissionPattern('http://127.0.0.1:3000/')).toBe('http://127.0.0.1/*');
  });

  it('rejects unsupported and invalid URLs', () => {
    expect(toHostPermissionPattern('chrome://extensions')).toBeNull();
    expect(toHostPermissionPattern('not a URL')).toBeNull();
  });
});
