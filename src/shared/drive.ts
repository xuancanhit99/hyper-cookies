export function buildDriveDownloadUrl(input: string): string {
  const url = new URL(input);
  if (url.protocol !== 'https:' || !isAllowedDriveHost(url.hostname)) {
    throw new Error('Unsupported Google Drive URL');
  }
  if (url.hostname === 'drive.usercontent.google.com') {
    return url.toString();
  }
  if (url.pathname === '/uc') {
    return url.toString();
  }
  const fileMatch = url.pathname.match(/\/file\/d\/([A-Za-z0-9_-]+)/);
  if (fileMatch?.[1]) {
    return `https://drive.google.com/uc?export=download&id=${fileMatch[1]}`;
  }
  const openId = url.searchParams.get('id');
  if (openId && /^[A-Za-z0-9_-]+$/.test(openId)) {
    return `https://drive.google.com/uc?export=download&id=${openId}`;
  }
  throw new Error('Unsupported Google Drive URL');
}

export function isAllowedDriveHost(hostname: string): boolean {
  return hostname === 'drive.google.com' || hostname === 'drive.usercontent.google.com';
}
