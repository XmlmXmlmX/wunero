"use client";

import { Link as IntlLink } from "@/i18n";
import NextLink from "next/link";
import { useLocale } from "next-intl";
import type { WuAtom } from "@/types/WuAtom";
import styles from "../WuButton/WuButton.module.css";

const variantClassName: Record<WuButtonLinkVariant, string> = {
  primary: styles.primary,
  secondary: styles.secondary,
  outline: styles.outline,
  danger: styles.danger,
  ghost: styles.ghost,
};

export type WuButtonLinkVariant = "primary" | "secondary" | "outline" | "danger" | "ghost";

export type WuButtonLinkProps = WuAtom<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>> & {
  href: string;
  variant?: WuButtonLinkVariant;
  fullWidth?: boolean;
  prefetch?: boolean;
};

export function WuButtonLink({ 
  children, 
  className, 
  href, 
  variant = "primary", 
  fullWidth, 
  prefetch = false, 
  ...rest 
}: WuButtonLinkProps) {
  const classes = [styles.button, variantClassName[variant], fullWidth ? styles.fullWidth : "", className]
    .filter(Boolean)
    .join(" ");

  // Try to use intl-aware Link, fallback to Next.js Link if no intl context
  let locale: string | undefined;
  try {
    locale = useLocale();
  } catch (e) {
    // No intl context available
  }

  const Link = locale ? IntlLink : NextLink;

  return (
    <Link href={href} prefetch={prefetch} className={classes} {...rest}>
      {children}
    </Link>
  );
}
