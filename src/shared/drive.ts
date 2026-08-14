export function buildDriveDownloadUrl(input: string): string {
  try {
    const url = new URL(input);
    const host = url.hostname;
    if (!host.includes('drive.google.com')) {
      return input;
    }
    if (url.pathname.includes('/uc')) {
      return input;
    }
    const fileMatch = url.pathname.match(/\/file\/d\/([^/]+)/);
    if (fileMatch?.[1]) {
      return `https://drive.google.com/uc?export=download&id=${fileMatch[1]}`;
    }
    const openId = url.searchParams.get('id');
    if (openId) {
      return `https://drive.google.com/uc?export=download&id=${openId}`;
    }
    return input;
  } catch {
    return input;
  }
}
