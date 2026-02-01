/**
 * Cookie Consent Management
 */

export interface CookieConsent {
  necessary: boolean; // Always true, required cookies
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

const CONSENT_KEY = 'cookie-consent';

export const getDefaultConsent = (): CookieConsent => ({
  necessary: true,
  analytics: false,
  marketing: false,
  timestamp: Date.now(),
});

export const getConsent = (): CookieConsent | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

export const setConsent = (consent: Omit<CookieConsent, 'timestamp'>): void => {
  if (typeof window === 'undefined') return;
  
  const consentWithTimestamp: CookieConsent = {
    ...consent,
    timestamp: Date.now(),
  };
  
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consentWithTimestamp));
};

export const hasConsent = (): boolean => {
  return getConsent() !== null;
};

export const acceptAll = (): void => {
  setConsent({
    necessary: true,
    analytics: true,
    marketing: true,
  });
};

export const acceptNecessary = (): void => {
  setConsent({
    necessary: true,
    analytics: false,
    marketing: false,
  });
};

export const resetConsent = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CONSENT_KEY);
};

export const reopenConsentBanner = (): void => {
  resetConsent();
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
};
