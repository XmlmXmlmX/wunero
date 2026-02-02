"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { WuInput } from "@/components/atoms/WuInput/WuInput";
import { WuButton } from "@/components/atoms/WuButton/WuButton";
import { WuButtonLink } from "@/components/atoms";
import ArrowNarrowLeftIcon from "@/components/ui/arrow-narrow-left-icon";
import styles from "../signin/page.module.css";

export default function ForgotPasswordPage() {
  const t = useTranslations('auth.forgotPassword');
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t('errorSending'));
        return;
      }

      setMessage(data.message);
      setEmail("");
    } catch (err) {
      setError(t('errorOccurred'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('title')}</h1>
          <p className={styles.subtitle}>
            {t('subtitle')}
          </p>
        </div>

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        )}

        {message && (
          <div className={styles.success}>
            <p>{message}</p>
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

          <WuButton
            type="submit"
            disabled={isLoading}
            fullWidth
          >
            {isLoading ? t('sending') : t('sendButton')}
          </WuButton>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            {t('rememberPassword')}{" "}
            <Link href="signin" className={styles.link}>
              {t('signinLink')}
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
