"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { WuButtonLink } from "@/components/atoms";
import { type WuOrganism } from "@/types/WuOrganism";
import styles from "./WuHeroSection.module.css";
import logo from "@/assets/logo_on_dark.svg";

export function WuHeroSection({ className, ...rest }: WuOrganism<HTMLElement> = {}) {
  const { status } = useSession();
  const t = useTranslations('home');
  const isAuthenticated = status === "authenticated";

  const { primaryHref, primaryLabel } = useMemo(() => {
    if (isAuthenticated) {
      return {
        primaryHref: "/wishlists",
        primaryLabel: t('viewWishlists'),
      };
    }

    return {
      primaryHref: "/auth/signin?callbackUrl=/wishlists",
      primaryLabel: t('getStarted'),
    };
  }, [isAuthenticated, t]);

  const classes = [styles.wrapper, className].filter(Boolean).join(" ");

  return (
    <section className={classes} {...rest}>
      <div className={styles.logoContainer}>
        <Image src={logo} alt="Wunero" width={598} height={128} className={styles.logo} />
      </div>
      <div className={styles.badge}>{t('badge')}</div>
      <h1 className={styles.title}>{t('title')}</h1>
      <p className={styles.subtitle}>
        {t('subtitle')}
      </p>
      <div className={styles.actions}>
        <WuButtonLink href={primaryHref} variant="primary">
          {primaryLabel}
        </WuButtonLink>
      </div>
    </section>
  );
}
