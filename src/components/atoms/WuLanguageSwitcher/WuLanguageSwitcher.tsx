'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n';
import { routing } from '@/i18n';
import styles from './WuLanguageSwitcher.module.css';

export function WuLanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: string) => {
    if (newLocale !== locale) {
      // Use window.location for a full page reload to get new messages
      const newUrl = `/${newLocale}${pathname}`;
      window.location.href = newUrl;
    }
  };

  return (
    <div className={styles.switcher}>
      {routing.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleLocaleChange(loc)}
          className={`${styles.button} ${locale === loc ? styles.active : ''}`}
          aria-label={`Switch to ${loc.toUpperCase()}`}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

