export function safeHostname(url: string | undefined): string | null {
  try {
    return new URL(url ?? '').hostname;
  } catch {
    return null;
  }
}
