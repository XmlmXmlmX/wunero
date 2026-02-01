'use client';

import React, { useState } from 'react';
import { WuModal } from '@/components/molecules/WuModal/WuModal';
import { WuButton } from '@/components/atoms';
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
  const [isOpen, setIsOpen] = useState(() => !getConsent());
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsentState] = useState(() => {
    const stored = getConsent();
    return stored || getDefaultConsent();
  });

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

  if (!isOpen) return null;

  return (
    <WuModal
      isOpen={isOpen}
      onClose={() => {}} // Prevent closing without selection
      title="🍪 Cookie-Einstellungen"
      closeOnOverlayClick={false}
    >
      <div className={styles.content}>
        {!showDetails ? (
          <>
            <p className={styles.description}>
              Wir verwenden Cookies, um Ihnen das beste Erlebnis auf unserer Website zu bieten. 
              Einige Cookies sind notwendig für die Funktionalität, während andere uns helfen, 
              die Website zu verbessern und Ihnen personalisierte Inhalte anzuzeigen.
            </p>
            
            <div className={styles.actions}>
              <WuButton
                onClick={handleAcceptAll}
                variant="primary"
                fullWidth
              >
                Alle akzeptieren
              </WuButton>
              <WuButton
                onClick={handleAcceptNecessary}
                variant="secondary"
                fullWidth
              >
                Nur notwendige
              </WuButton>
              <WuButton
                className={styles.detailsButton}
                variant='ghost'
                onClick={() => setShowDetails(true)}
              >
                Einstellungen anpassen
              </WuButton>
            </div>

            <p className={styles.privacyLink}>
              Weitere Informationen finden Sie in unserer{' '}
              <a href="/legal/privacy" target="_blank" rel="noopener noreferrer">
                Datenschutzerklärung
              </a>
            </p>
          </>
        ) : (
          <>
            <div className={styles.cookieSettings}>
              <div className={styles.cookieGroup}>
                <div className={styles.cookieHeader}>
                  <h3>Notwendige Cookies</h3>
                  <WuSwitch
                    checked={true}
                    onChange={() => {}}
                    disabled={true}
                    id="cookie-necessary"
                  />
                </div>
                <p className={styles.cookieDescription}>
                  Diese Cookies sind für die Grundfunktionen der Website erforderlich und können 
                  nicht deaktiviert werden. Sie speichern z.B. Ihre Anmeldung und Cookie-Präferenzen.
                </p>
              </div>

              <div className={styles.cookieGroup}>
                <div className={styles.cookieHeader}>
                  <h3>Analytik-Cookies</h3>
                  <WuSwitch
                    checked={consent.analytics}
                    onChange={handleToggleAnalytics}
                    id="cookie-analytics"
                  />
                </div>
                <p className={styles.cookieDescription}>
                  Diese Cookies helfen uns zu verstehen, wie Besucher mit unserer Website interagieren, 
                  indem Informationen anonym gesammelt und gemeldet werden.
                </p>
              </div>

              <div className={styles.cookieGroup}>
                <div className={styles.cookieHeader}>
                  <h3>Marketing-Cookies</h3>
                  <WuSwitch
                    checked={consent.marketing}
                    onChange={handleToggleMarketing}
                    id="cookie-marketing"
                  />
                </div>
                <p className={styles.cookieDescription}>
                  Diese Cookies werden verwendet, um Ihnen relevante Werbung und Angebote anzuzeigen. 
                  Sie können auch zur Messung der Effektivität von Werbekampagnen verwendet werden.
                </p>
              </div>
            </div>

            <div className={styles.detailActions}>
              <WuButton
                onClick={() => setShowDetails(false)}
                variant="secondary"
              >
                Zurück
              </WuButton>
              <WuButton
                onClick={handleSavePreferences}
                variant="primary"
              >
                Einstellungen speichern
              </WuButton>
            </div>
          </>
        )}
      </div>
    </WuModal>
  );
};

export default WuCookieBanner;
