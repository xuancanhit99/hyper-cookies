export type CookieImportFailureReason = 'invalid_cookie' | 'unrelated_domain';

export interface CookieImportFailure {
  index: number;
  name: string;
  reason: CookieImportFailureReason;
}

export interface PreparedCookieImport {
  cookies: chrome.cookies.Cookie[];
  failures: CookieImportFailure[];
}

const SAME_SITE_VALUES = new Set<chrome.cookies.Cookie['sameSite']>([
  'no_restriction',
  'lax',
  'strict',
  'unspecified'
]);

export function normalizeCookieDomain(domain: string | undefined): string | null {
  const candidate = (domain ?? '').trim().replace(/^\./, '').replace(/\.$/, '').toLowerCase();
  if (!candidate || /[\s/@?#]/.test(candidate)) return null;
  const hostname =
    candidate.includes(':') && !candidate.startsWith('[') ? `[${candidate}]` : candidate;
  try {
    return new URL(`http://${hostname}/`).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function domainMatchesHostname(
  hostname: string,
  domain: string | undefined,
  hostOnly = false
): boolean {
  const normalizedHost = normalizeCookieDomain(hostname);
  const normalizedDomain = normalizeCookieDomain(domain);
  if (!normalizedHost || !normalizedDomain) return false;
  if (normalizedHost === normalizedDomain) return true;
  return !hostOnly && normalizedHost.endsWith(`.${normalizedDomain}`);
}

export function buildCookieUrl(
  cookie: Pick<chrome.cookies.Cookie, 'domain' | 'path' | 'secure'>,
  fallbackUrl: string
): string | null {
  try {
    const fallback = new URL(fallbackUrl);
    if (fallback.protocol !== 'http:' && fallback.protocol !== 'https:') return null;
    const domain = normalizeCookieDomain(cookie.domain) || fallback.hostname;
    if (!domain) return null;
    const protocol = cookie.secure ? 'https:' : fallback.protocol;
    const path = cookie.path?.startsWith('/') ? cookie.path : '/';
    return `${protocol}//${domain}${path}`;
  } catch {
    return null;
  }
}

export function createCookieSetDetails(
  cookie: chrome.cookies.Cookie,
  fallbackUrl: string,
  storeId?: string
): chrome.cookies.SetDetails | null {
  const url = buildCookieUrl(cookie, fallbackUrl);
  if (!url || !cookie.name || !SAME_SITE_VALUES.has(cookie.sameSite)) return null;

  const details: chrome.cookies.SetDetails = {
    url,
    name: cookie.name,
    value: cookie.value ?? '',
    path: cookie.path?.startsWith('/') ? cookie.path : '/',
    secure: Boolean(cookie.secure),
    httpOnly: Boolean(cookie.httpOnly),
    sameSite: cookie.sameSite,
    storeId: storeId || cookie.storeId || undefined
  };
  if (!cookie.hostOnly && cookie.domain) {
    details.domain = cookie.domain;
  }
  if (!cookie.session && Number.isFinite(cookie.expirationDate)) {
    details.expirationDate = cookie.expirationDate;
  }
  if (isValidPartitionKey(cookie.partitionKey)) {
    details.partitionKey = cookie.partitionKey;
  }
  return details;
}

export function createCookieRemoveDetails(
  cookie: chrome.cookies.Cookie,
  fallbackUrl: string
): chrome.cookies.CookieDetails | null {
  const url = buildCookieUrl(cookie, fallbackUrl);
  if (!url || !cookie.name) return null;
  return {
    url,
    name: cookie.name,
    storeId: cookie.storeId || undefined,
    partitionKey: isValidPartitionKey(cookie.partitionKey) ? cookie.partitionKey : undefined
  };
}

export function cookieIdentity(cookie: chrome.cookies.Cookie): string {
  return JSON.stringify([
    cookie.name,
    normalizeCookieDomain(cookie.domain),
    cookie.path || '/',
    cookie.storeId || '',
    cookie.partitionKey?.topLevelSite || '',
    cookie.partitionKey?.hasCrossSiteAncestor ?? null
  ]);
}

export function partitionKeyForUrl(url: string): chrome.cookies.CookiePartitionKey | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return { topLevelSite: parsed.origin };
  } catch {
    return null;
  }
}

export function cookieAppliesToTarget(cookie: chrome.cookies.Cookie, targetUrl: string): boolean {
  try {
    const target = new URL(targetUrl);
    if (!domainMatchesHostname(target.hostname, cookie.domain, cookie.hostOnly)) return false;
    if (cookie.partitionKey?.topLevelSite) {
      const partitionSite = new URL(cookie.partitionKey.topLevelSite);
      return partitionSite.origin === target.origin;
    }
    return true;
  } catch {
    return false;
  }
}

export function prepareCookiesForTarget(
  inputCookies: chrome.cookies.Cookie[],
  sourceHostname: string | null,
  targetUrl: string
): PreparedCookieImport {
  const target = new URL(targetUrl);
  const source = normalizeCookieDomain(sourceHostname ?? undefined);
  const targetHost = normalizeCookieDomain(target.hostname);
  if (!targetHost) throw new Error('Invalid target URL');
  const crossHostImport = Boolean(source && source !== targetHost);
  const cookies: chrome.cookies.Cookie[] = [];
  const failures: CookieImportFailure[] = [];

  inputCookies.forEach((cookie, index) => {
    if (!isStructurallyValidCookie(cookie)) {
      failures.push({ index, name: cookie?.name || '', reason: 'invalid_cookie' });
      return;
    }

    if (crossHostImport) {
      const secure = target.protocol === 'https:' && cookie.secure;
      cookies.push({
        ...cookie,
        domain: targetHost,
        hostOnly: true,
        secure,
        sameSite: !secure && cookie.sameSite === 'no_restriction' ? 'unspecified' : cookie.sameSite,
        partitionKey: undefined
      });
      return;
    }

    const normalizedCookie = {
      ...cookie,
      domain: normalizeCookieDomain(cookie.domain) || targetHost
    };
    if (!cookieAppliesToTarget(normalizedCookie, targetUrl)) {
      failures.push({ index, name: cookie.name, reason: 'unrelated_domain' });
      return;
    }
    cookies.push(normalizedCookie);
  });

  return { cookies, failures };
}

function isStructurallyValidCookie(cookie: chrome.cookies.Cookie): boolean {
  return Boolean(
    cookie &&
    typeof cookie.name === 'string' &&
    cookie.name.length > 0 &&
    typeof cookie.value === 'string' &&
    normalizeCookieDomain(cookie.domain) &&
    typeof cookie.path === 'string' &&
    cookie.path.startsWith('/') &&
    typeof cookie.hostOnly === 'boolean' &&
    typeof cookie.secure === 'boolean' &&
    typeof cookie.httpOnly === 'boolean' &&
    typeof cookie.session === 'boolean' &&
    SAME_SITE_VALUES.has(cookie.sameSite) &&
    (!cookie.partitionKey || isValidPartitionKey(cookie.partitionKey))
  );
}

function isValidPartitionKey(
  partitionKey: chrome.cookies.CookiePartitionKey | undefined
): partitionKey is chrome.cookies.CookiePartitionKey {
  if (!partitionKey) return false;
  if (typeof partitionKey.hasCrossSiteAncestor !== 'undefined') {
    if (typeof partitionKey.hasCrossSiteAncestor !== 'boolean') return false;
  }
  if (!partitionKey.topLevelSite) return false;
  try {
    const url = new URL(partitionKey.topLevelSite);
    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      url.origin === url.href.replace(/\/$/, '')
    );
  } catch {
    return false;
  }
}
