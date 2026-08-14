import { describe, expect, it } from 'vitest';
import { buildDriveDownloadUrl } from '../src/shared/drive';

describe('Google Drive URL conversion', () => {
  it('converts a shared file URL to a direct download URL', () => {
    expect(buildDriveDownloadUrl('https://drive.google.com/file/d/file-id/view')).toBe(
      'https://drive.google.com/uc?export=download&id=file-id'
    );
  });

  it('keeps an existing direct download URL unchanged', () => {
    const url = 'https://drive.google.com/uc?export=download&id=file-id';
    expect(buildDriveDownloadUrl(url)).toBe(url);
  });

  it('preserves the existing behavior for non-Drive URLs', () => {
    const url = 'https://example.com/export.json';
    expect(buildDriveDownloadUrl(url)).toBe(url);
  });
});
