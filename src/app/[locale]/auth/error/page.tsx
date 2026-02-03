"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useTranslations } from "next-intl";
import styles from "./page.module.css";
import { WuButtonLink } from "@/components/atoms";

function ErrorContent() {
  const t = useTranslations('auth.error');
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const message = error ? t(error as unknown as string, { defaultValue: t('default') }) : t('default');

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('title')}</h1>
          <p className={styles.subtitle}>{message}</p>
        </div>

        <div className={styles.actions}>
          <WuButtonLink href="signin">
            {t('tryAgain')}
          </WuButtonLink>
          <WuButtonLink href="/" variant="outline">
            {t('backToHome')}
          </WuButtonLink>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  );
}
