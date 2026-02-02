"use client";

import { signIn, getProviders, type ClientSafeProvider } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { WuInput } from "@/components/atoms/WuInput/WuInput";
import { WuButton } from "@/components/atoms/WuButton/WuButton";
import styles from "./page.module.css";
import { WuButtonLink } from "@/components/atoms";
import ArrowNarrowLeftIcon from "@/components/ui/arrow-narrow-left-icon";

function SignInContent() {
  const t = useTranslations('auth.signin');
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/wishlists";
  const error = searchParams.get("error");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [providers, setProviders] = useState<Record<string, ClientSafeProvider> | null>(null);

  useEffect(() => {
    getProviders().then(setProviders).catch(() => setProviders(null));
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setLocalError(null);
    const result = await signIn("credentials", {
      redirect: true,
      callbackUrl,
      email,
      password,
    });
    if (result?.error) {
      setLocalError(t('invalidCredentials'));
      setIsLoading(false);
    }
  };

  const displayedError = localError || (error ? t('authFailed') : null);
  const socialProviders = Object.values(providers ?? {}).filter(provider => provider.id !== "credentials");

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('title')}</h1>
          <p className={styles.subtitle}>{t('subtitle')}</p>
        </div>

        {displayedError && (
          <div className={styles.error}>
            <p>{displayedError}</p>
          </div>
        )}

        {socialProviders.length > 0 && (
          <div className={styles.providers}>
            {socialProviders.map(provider => (
              <WuButton
                key={provider.id}
                type="button"
                onClick={() => signIn(provider.id, { callbackUrl })}
                variant="secondary"
                fullWidth
              >
                {t('continueWith', { provider: provider.name })}
              </WuButton>
            ))}
          </div>
        )}

        <form className={styles.content} onSubmit={handleSubmit}>
          <label htmlFor="email">{t('email')}</label>
          <WuInput
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('emailPlaceholder')}
            autoComplete="email"
            fullWidth
          />

          <label htmlFor="password">{t('password')}</label>
          <WuInput
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('passwordPlaceholder')}
            autoComplete="current-password"
            fullWidth
          />

          <div style={{ textAlign: 'right', marginTop: '-0.5rem', marginBottom: '1rem' }}>
            <Link href="forgot-password" className={styles.link} style={{ fontSize: '0.875rem' }}>
              {t('forgotPassword')}
            </Link>
          </div>

          <WuButton
            type="submit"
            disabled={isLoading}
            fullWidth
          >
            {isLoading ? t('signingIn') : t('signInButton')}
          </WuButton>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            {t('noAccount')}{" "}
            <Link href="register" className={styles.link}>
              {t('registerLink')}
            </Link>
          </p>
          <WuButtonLink href="/" variant="ghost">
            <ArrowNarrowLeftIcon /> {t('backToHome')}
          </WuButtonLink>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}
