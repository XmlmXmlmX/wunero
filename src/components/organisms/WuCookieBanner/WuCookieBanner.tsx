'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { WuModal } from '@/components/molecules/WuModal/WuModal';
import { WuButton, WuLanguageSwitcher } from '@/components/atoms';
import { WuSwitch } from '@/components/atoms';
import {
  getConsent,
  setConsent,
  acceptAll,
  acceptNecessary,
  getDefaultConsent
} from '@/lib/cookies';
import styles from './WuCookieBanner.module.css';

const WuCookieBanner: React.FC = () => {
  const t = useTranslations('cookies');
  const [isClient, setIsClient] = useState(false);
  const [isOpen, setIsOpen] = useState(() => {
    // Initialize state on mount to prevent hydration mismatch
    if (typeof window === 'undefined') return false;
    const stored = getConsent();
    return !stored;
  });
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsentState] = useState(() => {
    if (typeof window === 'undefined') return getDefaultConsent();
    const stored = getConsent();
    return stored || getDefaultConsent();
  });

  // Track client-side rendering to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAcceptAll = () => {
    acceptAll();
    setIsOpen(false);
  };

  const handleAcceptNecessary = () => {
    acceptNecessary();
    setIsOpen(false);
  };

  const handleSavePreferences = () => {
    setConsent(consent);
    setIsOpen(false);
  };

  const handleToggleAnalytics = (checked: boolean) => {
    setConsentState(prev => ({ ...prev, analytics: checked }));
  };

  const handleToggleMarketing = (checked: boolean) => {
    setConsentState(prev => ({ ...prev, marketing: checked }));
  };

  // Only render after hydration to prevent mismatch
  if (!isClient || !isOpen) return null;

  return (
    <WuModal
      isOpen={isOpen}
      onClose={() => {}} // Prevent closing without selection
      title={t('title')}
      closeOnOverlayClick={false}
    >
      <div className={styles.content}>
        <div className={styles.languageSwitcher}>
          <WuLanguageSwitcher />
        </div>
        
        {!showDetails ? (
          <>
            <p className={styles.description}>
              {t('description')}
            </p>
            
            <div className={styles.actions}>
              <WuButton
                onClick={handleAcceptAll}
                variant="primary"
                fullWidth
              >
                {t('acceptAll')}
              </WuButton>
              <WuButton
                onClick={handleAcceptNecessary}
                variant="secondary"
                fullWidth
              >
                {t('acceptNecessary')}
              </WuButton>
              <WuButton
                className={styles.detailsButton}
                variant='ghost'
                onClick={() => setShowDetails(true)}
              >
                {t('customize')}
              </WuButton>
            </div>

            <p className={styles.privacyLink}>
              {t('privacyLinkText')}{' '}
              <a href="/legal/privacy" target="_blank" rel="noopener noreferrer">
                {t('privacyLink')}
              </a>
            </p>
          </>
        ) : (
          <>
            <div className={styles.cookieSettings}>
              <div className={styles.cookieGroup}>
                <div className={styles.cookieHeader}>
                  <h3>{t('necessary.title')}</h3>
                  <WuSwitch
                    checked={true}
                    onChange={() => {}}
                    disabled={true}
                    id="cookie-necessary"
                  />
                </div>
                <p className={styles.cookieDescription}>
                  {t('necessary.description')}
                </p>
              </div>

              <div className={styles.cookieGroup}>
                <div className={styles.cookieHeader}>
                  <h3>{t('analytics.title')}</h3>
                  <WuSwitch
                    checked={consent.analytics}
                    onChange={handleToggleAnalytics}
                    id="cookie-analytics"
                  />
                </div>
                <p className={styles.cookieDescription}>
                  {t('analytics.description')}
                </p>
              </div>

              <div className={styles.cookieGroup}>
                <div className={styles.cookieHeader}>
                  <h3>{t('marketing.title')}</h3>
                  <WuSwitch
                    checked={consent.marketing}
                    onChange={handleToggleMarketing}
                    id="cookie-marketing"
                  />
                </div>
                <p className={styles.cookieDescription}>
                  {t('marketing.description')}
                </p>
              </div>
            </div>

            <div className={styles.detailActions}>
              <WuButton
                onClick={() => setShowDetails(false)}
                variant="secondary"
              >
                {t('back')}
              </WuButton>
              <WuButton
                onClick={handleSavePreferences}
                variant="primary"
              >
                {t('savePreferences')}
              </WuButton>
            </div>
          </>
        )}
      </div>
    </WuModal>
  );
};

export default WuCookieBanner;
