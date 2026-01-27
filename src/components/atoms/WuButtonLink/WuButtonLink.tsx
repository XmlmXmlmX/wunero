import Link from "next/link";
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

  return (
    <Link href={href} prefetch={prefetch} className={classes} {...rest}>
      {children}
    </Link>
  );
}
