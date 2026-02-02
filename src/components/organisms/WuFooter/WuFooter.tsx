'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { reopenConsentBanner } from '@/lib/cookies';
import styles from './WuFooter.module.css';

const WuFooter: React.FC = () => {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.links}>
          <Link href="/legal/imprint" className={styles.link}>
            {t('imprint')}
          </Link>
          <span className={styles.divider}>•</span>
          <Link href="/legal/privacy" className={styles.link}>
            {t('privacy')}
          </Link>
          <span className={styles.divider}>•</span>
          <button
            onClick={reopenConsentBanner}
            className={styles.link}
            style={{ background: 'none', border: 'none', padding: 0 }}
          >
            {t('cookieSettings')}
          </button>
        </div>
        <p className={styles.copyright}>
          {t('copyright', { year: currentYear })}
        </p>
      </div>
    </footer>
  );
};

export default WuFooter;
