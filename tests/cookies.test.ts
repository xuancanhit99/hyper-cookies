import { describe, expect, it } from 'vitest';
import {
  buildCookieUrl,
  cookieIdentity,
  createCookieRemoveDetails,
  createCookieSetDetails,
  domainMatchesHostname,
  prepareCookiesForTarget
} from '../src/shared/cookies';

function cookie(overrides: Partial<chrome.cookies.Cookie> = {}): chrome.cookies.Cookie {
  return {
    domain: 'app.example.com',
    name: 'session',
    value: 'value',
    storeId: '0',
    path: '/',
    secure: true,
    httpOnly: true,
    hostOnly: true,
    session: true,
    sameSite: 'lax',
    ...overrides
  };
}

describe('cookie helpers', () => {
  it('matches parent-domain cookies without accepting unrelated domains', () => {
    expect(domainMatchesHostname('app.example.com', '.example.com')).toBe(true);
    expect(domainMatchesHostname('app.example.com', 'example.com', true)).toBe(false);
    expect(domainMatchesHostname('app.example.com', 'evil-example.com')).toBe(false);
  });

  it('supports IPv6 host-only cookie domains', () => {
    const ipv6Cookie = cookie({ domain: '[::1]', hostOnly: true, secure: false });
    expect(domainMatchesHostname('[::1]', ipv6Cookie.domain, ipv6Cookie.hostOnly)).toBe(true);
    expect(buildCookieUrl(ipv6Cookie, 'http://[::1]:8080/app')).toBe('http://[::1]/');
  });

  it('preserves host-only semantics by omitting domain when setting', () => {
    const details = createCookieSetDetails(cookie(), 'https://app.example.com/');
    expect(details).not.toHaveProperty('domain');
  });

  it('preserves partition keys for set and remove operations', () => {
    const partitionKey = { topLevelSite: 'https://app.example.com' };
    const partitioned = cookie({ partitionKey });
    expect(createCookieSetDetails(partitioned, 'https://app.example.com/')).toMatchObject({
      partitionKey
    });
    expect(createCookieRemoveDetails(partitioned, 'https://app.example.com/')).toMatchObject({
      partitionKey
    });
  });

  it('uses path, domain, store and partition key in cookie identity', () => {
    const base = cookie();
    expect(cookieIdentity(base)).not.toBe(cookieIdentity(cookie({ path: '/admin' })));
    expect(cookieIdentity(base)).not.toBe(
      cookieIdentity(cookie({ partitionKey: { topLevelSite: 'https://app.example.com' } }))
    );
  });

  it('rewrites cross-host imports to a host-only target cookie', () => {
    const result = prepareCookiesForTarget(
      [
        cookie({
          domain: '.source.example',
          hostOnly: false,
          partitionKey: { topLevelSite: 'https://source.example' }
        })
      ],
      'source.example',
      'https://target.example/dashboard'
    );
    expect(result.failures).toEqual([]);
    expect(result.cookies[0]).toMatchObject({
      domain: 'target.example',
      hostOnly: true,
      partitionKey: undefined
    });
  });

  it('rejects unrelated cookie domains for same-host imports', () => {
    const result = prepareCookiesForTarget(
      [cookie({ domain: 'attacker.example' })],
      'app.example.com',
      'https://app.example.com/'
    );
    expect(result.cookies).toEqual([]);
    expect(result.failures).toHaveLength(1);
  });
});
