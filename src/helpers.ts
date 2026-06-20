import type { BuildPresentationRequestUrlInput, NavigatorLike, OpenPresentationRequestInput } from './types';

export const DEFAULT_WALLET_PRESENTATION_REQUEST_URL = 'https://iamhuman.link/presentation-request';

export function buildPresentationRequestUrl(input: BuildPresentationRequestUrlInput): string {
  const baseUrl = input.walletBaseUrl ?? DEFAULT_WALLET_PRESENTATION_REQUEST_URL;
  const url = new URL(baseUrl);
  url.searchParams.set('url', input.pdUrl);
  if (input.returnUrl) {
    url.searchParams.set('returnUrl', input.returnUrl);
  }
  return url.toString();
}

export function isIOSMobileBrowser(navigatorLike: NavigatorLike | undefined = globalThis.navigator): boolean {
  if (!navigatorLike) return false;
  const userAgent = navigatorLike.userAgent || '';
  const platform = navigatorLike.platform || '';
  const maxTouchPoints = navigatorLike.maxTouchPoints || 0;
  const isiPhoneOrIPod = /iPhone|iPod/i.test(userAgent);
  const isiPad = /iPad/i.test(userAgent) || (platform === 'MacIntel' && maxTouchPoints > 1);
  return isiPhoneOrIPod || isiPad;
}

export function openPresentationRequest(input: OpenPresentationRequestInput): void {
  const targetWindow = input.windowLike ?? globalThis.window;
  if (!targetWindow?.location) return;
  targetWindow.location.href = buildPresentationRequestUrl(input);
}
