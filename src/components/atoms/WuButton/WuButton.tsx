import type { AnimatedIconHandle } from "@/components/ui/types";
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

export type WuButtonSize = "sm" | "md" | "lg";

export type WuButtonProps = WuAtom<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: WuButtonVariant;
  size?: WuButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  animatedIconRef?: React.RefObject<AnimatedIconHandle | null>;
};

export function WuButton({
  children,
  className,
  variant = "primary",
  size = "md",
  fullWidth,
  isLoading,
  type = "button",
  disabled,
  animatedIconRef,
  onMouseEnter,
  onMouseLeave,
  ...rest
}: WuButtonProps) {
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    animatedIconRef?.current?.startAnimation?.();
    onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    animatedIconRef?.current?.stopAnimation?.();
    onMouseLeave?.(e);
  };

  const btnSize = size === "sm" ? styles.sm : size === "lg" ? styles.lg : styles.md;

  const classes = [styles.button, variantClassName[variant], btnSize, fullWidth ? styles.fullWidth : "", className]
    .filter(Boolean)
    .join(" ");

  const ariaAttrs = isLoading ? { "aria-busy": "true" as const } : { "aria-busy": "false" as const };

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || isLoading}
      {...ariaAttrs}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
}
