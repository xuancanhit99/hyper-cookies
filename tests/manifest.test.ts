import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));

describe('production manifest', () => {
  it('has persistent host access required by the cookies API', () => {
    expect(manifest.permissions).toContain('activeTab');
    expect(manifest.host_permissions).toEqual(['<all_urls>']);
    expect(manifest.optional_host_permissions).toBeUndefined();
  });

  it('keeps package and extension versions aligned', () => {
    expect(manifest.version).toBe(packageJson.version);
  });

  it('restricts extension code and styles to bundled resources', () => {
    expect(manifest.content_security_policy.extension_pages).toBe(
      "script-src 'self'; object-src 'self'; style-src 'self'"
    );
  });
});
