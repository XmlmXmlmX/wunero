import { routing } from '@/i18n';

const LOCALE_COOKIE = 'NEXT_LOCALE';

export type SupportedLocale = (typeof routing.locales)[number];

export const getUserLocale = (): SupportedLocale | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]+)`));
  return match ? (decodeURIComponent(match[1]) as SupportedLocale) : null;
};

export const setUserLocale = (locale: SupportedLocale) => {
  if (typeof document === 'undefined') return;
  if (!routing.locales.includes(locale)) return;

  document.cookie = `${LOCALE_COOKIE}=${encodeURIComponent(locale)}; path=/; max-age=31536000; SameSite=Lax`;
};
