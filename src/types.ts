export interface BuildPresentationRequestUrlInput {
  pdUrl: string;
  returnUrl?: string | null;
  walletBaseUrl?: string;
}

export interface OpenPresentationRequestInput extends BuildPresentationRequestUrlInput {
  windowLike?: Pick<Window, 'location'>;
}

export interface NavigatorLike {
  userAgent?: string;
  platform?: string;
  maxTouchPoints?: number;
}

export interface PresentationRequestQrLabels {
  link?: string;
  expired?: string;
  expiresIn?: (seconds: number) => string;
  refresh?: string;
  checkStatus?: string;
}
