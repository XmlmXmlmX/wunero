import type { WuAtom } from "@/types/WuAtom";
import styles from "./WuButton.module.css";

const variantClassName: Record<WuButtonVariant, string> = {
  primary: styles.primary,
  secondary: styles.secondary,
  outline: styles.outline,
  danger: styles.danger,
  ghost: styles.ghost,
};

export type WuButtonVariant = "primary" | "secondary" | "outline" | "danger" | "ghost";

export type WuButtonProps = WuAtom<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: WuButtonVariant;
  fullWidth?: boolean;
  isLoading?: boolean;
};

export function WuButton({
  children,
  className,
  variant = "primary",
  fullWidth,
  isLoading,
  type = "button",
  disabled,
  ...rest
}: WuButtonProps) {
  const classes = [styles.button, variantClassName[variant], fullWidth ? styles.fullWidth : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...rest}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
}
