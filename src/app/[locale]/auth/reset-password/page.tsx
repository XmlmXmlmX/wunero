"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { WuInput } from "@/components/atoms/WuInput/WuInput";
import { WuButton } from "@/components/atoms/WuButton/WuButton";
import { WuButtonLink } from "@/components/atoms";
import ArrowNarrowLeftIcon from "@/components/ui/arrow-narrow-left-icon";
import styles from "../signin/page.module.css";

function ResetPasswordForm() {
  const t = useTranslations('auth.resetPassword');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError(t('invalidLink'));
    }
  }, [token, t]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (password !== confirmPassword) {
      setError(t('passwordsNoMatch'));
      return;
    }

    if (password.length < 8) {
      setError(t('passwordTooShort'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t('errorResetting'));
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("signin");
      }, 2000);
    } catch {
      setError(t('errorOccurred'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>{t('invalidLink')}</h1>
            <p className={styles.subtitle}>
              {t('linkExpired')}
            </p>
          </div>
          <div className={styles.footer}>
            <WuButtonLink href="forgot-password" variant="ghost">
              {t('requestNewLink')}
            </WuButtonLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('title')}</h1>
          <p className={styles.subtitle}>{t('subtitle')}</p>
        </div>

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className={styles.success}>
            <p>{t('success')}</p>
          </div>
        )}

        {!success && (
          <form className={styles.content} onSubmit={handleSubmit}>
            <label htmlFor="password">{t('password')}</label>
            <WuInput
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('passwordPlaceholder')}
              minLength={8}
              autoComplete="new-password"
              fullWidth
            />

            <label htmlFor="confirmPassword">{t('confirmPassword')}</label>
            <WuInput
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('passwordPlaceholder')}
              minLength={8}
              autoComplete="new-password"
              fullWidth
            />

            <WuButton
              type="submit"
              disabled={isLoading}
              fullWidth
            >
              {isLoading ? t('resetting') : t('resetButton')}
            </WuButton>
          </form>
        )}

        <div className={styles.footer}>
          <p className={styles.footerText}>
            {t('rememberPassword', { defaultValue: 'Remember your password?' })}{" "}
            <Link href="signin" className={styles.link}>
              {t('signinLink', { defaultValue: 'Sign in here' })}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Loading...</h1>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
