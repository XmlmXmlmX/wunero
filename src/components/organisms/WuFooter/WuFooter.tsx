'use client';

import React from 'react';
import Link from 'next/link';
import { reopenConsentBanner } from '@/lib/cookies';
import styles from './WuFooter.module.css';

const WuFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.links}>
          <Link href="/legal/imprint" className={styles.link}>
            Impressum
          </Link>
          <span className={styles.divider}>•</span>
          <Link href="/legal/privacy" className={styles.link}>
            Datenschutz
          </Link>
          <span className={styles.divider}>•</span>
          <button
            onClick={reopenConsentBanner}
            className={styles.link}
            style={{ background: 'none', border: 'none', padding: 0 }}
          >
            Cookie-Einstellungen
          </button>
        </div>
        <p className={styles.copyright}>
          © {currentYear} Wunero. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default WuFooter;
