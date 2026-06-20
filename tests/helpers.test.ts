import { describe, expect, it, vi } from 'vitest';
import {
  buildPresentationRequestUrl,
  isIOSMobileBrowser,
  openPresentationRequest,
} from '../src';

describe('presentation request helpers', () => {
  it('builds wallet request URLs with encoded PD and return URLs', () => {
    const pdUrl = 'https://api.example.test/pd?sessionId=qr_123';
    const returnUrl = 'https://app.example.test/votes/vote-1?ballotSessionId=qr_123';

    const walletUrl = new URL(buildPresentationRequestUrl({ pdUrl, returnUrl }));

    expect(`${walletUrl.origin}${walletUrl.pathname}`).toBe('https://iamhuman.link/presentation-request');
    expect(walletUrl.searchParams.get('url')).toBe(pdUrl);
    expect(walletUrl.searchParams.get('returnUrl')).toBe(returnUrl);
  });

  it('supports a custom wallet base URL', () => {
    const walletUrl = new URL(
      buildPresentationRequestUrl({
        pdUrl: 'https://api.example.test/pd',
        walletBaseUrl: 'https://wallet.example.test/request?source=demo',
      }),
    );

    expect(`${walletUrl.origin}${walletUrl.pathname}`).toBe('https://wallet.example.test/request');
    expect(walletUrl.searchParams.get('source')).toBe('demo');
    expect(walletUrl.searchParams.get('url')).toBe('https://api.example.test/pd');
  });

  it('detects iPhone and iPadOS mobile browsers', () => {
    expect(
      isIOSMobileBrowser({
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
        platform: 'iPhone',
        maxTouchPoints: 0,
      }),
    ).toBe(true);

    expect(
      isIOSMobileBrowser({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15',
        platform: 'MacIntel',
        maxTouchPoints: 5,
      }),
    ).toBe(true);
  });

  it('does not detect desktop or Android browsers as iOS mobile', () => {
    expect(
      isIOSMobileBrowser({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        platform: 'MacIntel',
        maxTouchPoints: 0,
      }),
    ).toBe(false);

    expect(
      isIOSMobileBrowser({
        userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Mobile Safari/537.36',
        platform: 'Linux armv8l',
        maxTouchPoints: 5,
      }),
    ).toBe(false);
  });

  it('opens the wallet presentation request', () => {
    const location = { href: '' };

    openPresentationRequest({
      pdUrl: 'https://api.example.test/pd',
      returnUrl: 'https://app.example.test/return',
      windowLike: { location } as Window,
    });

    expect(location.href).toContain('https://iamhuman.link/presentation-request?');
    expect(new URL(location.href).searchParams.get('returnUrl')).toBe('https://app.example.test/return');
  });
});
