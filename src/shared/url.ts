export function safeHostname(url: string | undefined): string | null {
  try {
    return new URL(url ?? '').hostname;
  } catch {
    return null;
  }
}

export function toHostPermissionPattern(url: string | undefined): string | null {
  try {
    const parsedUrl = new URL(url ?? '');
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return null;
    }
    return `${parsedUrl.protocol}//${parsedUrl.hostname}/*`;
  } catch {
    return null;
  }
}
