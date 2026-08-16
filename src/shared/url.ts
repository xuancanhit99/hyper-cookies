export function safeHostname(url: string | undefined): string | null {
  try {
    return new URL(url ?? '').hostname;
  } catch {
    return null;
  }
}

export function sanitizeSourceUrl(url: string): string {
  const parsed = new URL(url);
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Unsupported URL');
  }
  parsed.username = '';
  parsed.password = '';
  parsed.search = '';
  parsed.hash = '';
  return `${parsed.origin}/`;
}
