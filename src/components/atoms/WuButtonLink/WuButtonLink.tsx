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

function WuButtonLinkInner({ 
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

  const locale = useLocale();
  const Link = locale ? IntlLink : NextLink;

  return (
    <Link href={href} prefetch={prefetch} className={classes} {...rest}>
      {children}
    </Link>
  );
}

export function WuButtonLink(props: WuButtonLinkProps) {
  return <WuButtonLinkInner {...props} />;
}
