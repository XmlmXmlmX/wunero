'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { usePathname } from '@/i18n';
import { routing } from '@/i18n';
import { WuDropdown } from '../WuDropdown';
import styles from './WuLanguageSwitcher.module.css';
import 'flag-icons/css/flag-icons.min.css';

type LanguageCode = 'de' | 'en';

const languageConfig: Record<LanguageCode, { name: string; flag: string }> = {
  de: { name: 'Deutsch', flag: 'de' },
  en: { name: 'English', flag: 'gb' }
};

export function WuLanguageSwitcher() {
  const locale = useLocale() as LanguageCode;
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [nextLocale, setNextLocale] = useState<string | null>(null);

  const currentLanguage = languageConfig[locale] || languageConfig.de;

  useEffect(() => {
    if (nextLocale && nextLocale !== locale) {
      // Use window.location for a full page reload to get new messages
      const newUrl = `/${nextLocale}${pathname}`;
      window.location.href = newUrl;
    }
  }, [nextLocale, locale, pathname]);

  const handleLocaleChange = (newLocale: string) => {
    setIsOpen(false);
    setNextLocale(newLocale);
  };

  return (
    <WuDropdown
      trigger={
        <button
          className={styles.trigger}
          aria-label="Select language"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className={`fi fi-${currentLanguage.flag}`} aria-label={currentLanguage.name} />
          <svg className={`${styles.chevron} ${isOpen ? styles.open : ''}`} width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      }
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      align="right"
    >
      <div className={styles.menu} role="listbox">
        {routing.locales.map((loc) => {
          const lang = languageConfig[loc as LanguageCode] || { name: loc, flag: loc };
          return (
            <button
              key={loc}
              onClick={() => handleLocaleChange(loc)}
              className={`${styles.menuItem} ${locale === loc ? styles.active : ''}`}
              role="option"
              aria-selected={locale === loc}
            >
              <span className={`fi fi-${lang.flag}`} />
              <span>{lang.name}</span>
            </button>
          );
        })}
      </div>
    </WuDropdown>
  );
}
