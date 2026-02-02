"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { WuInput } from "@/components/atoms/WuInput/WuInput";
import { WuButton } from "@/components/atoms/WuButton/WuButton";
import styles from "./page.module.css";
import { WuButtonLink } from "@/components/atoms";
import ArrowNarrowLeftIcon from "@/components/ui/arrow-narrow-left-icon";

function RegisterForm() {
  const t = useTranslations('auth.register');
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const invitationCode = searchParams.get("invitation");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const body: any = { email, password };
    if (invitationCode) {
      body.invitation = invitationCode;
    }

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error || t('registrationFailed'));
      setIsLoading(false);
      return;
    }

    await signIn("credentials", { redirect: true, callbackUrl: "/wishlists", email, password });
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('title')}</h1>
          <p className={styles.subtitle}>
            {invitationCode ? t('subtitleInvite') : t('subtitle')}
          </p>
        </div>

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        )}

        {invitationCode && (
          <div className={`${styles.infoBox} ${styles.infoBoxInvitation}`}>
            <p className={styles.infoText}>
              {t('invitationText')}
            </p>
          </div>
        )}

        <form className={styles.content} onSubmit={handleSubmit}>
          <div className={styles.infoBox}>
            <p className={styles.infoText}>
              {t('infoText')}
            </p>
          </div>

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
            minLength={8}
            autoComplete="new-password"
            fullWidth
          />

          <WuButton
            type="submit"
            disabled={isLoading}
            fullWidth
          >
            {isLoading ? t('registering') : t('registerButton')}
          </WuButton>

          <div className={styles.divider}>
            <span>{t('dividerOr')}</span>
          </div>

          <p className={styles.signinPrompt}>
            {t('alreadyAccount')}{" "}
            <Link href="signin" className={styles.link}>
              {t('signinLink')}
            </Link>
          </p>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            {t('secureAuth')}
          </p>
          <WuButtonLink href="/" variant="ghost">
            <ArrowNarrowLeftIcon /> {t('backToHome')}
          </WuButtonLink>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
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
      <RegisterForm />
    </Suspense>
  );
}
