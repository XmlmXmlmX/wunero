import { ReactNode } from "react";
import styles from "./WuBadge.module.css";
import { type WuAtom } from "@/types/WuAtom";

export interface WuBadgeProps extends WuAtom<HTMLSpanElement> {
  children: ReactNode;
  variant?: "default" | "primary" | "danger";
}

export function WuBadge({ children, variant = "default", className, ...rest }: WuBadgeProps) {
  const classes = [styles.badge, styles[variant], className].filter(Boolean).join(" ");
  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  );
}
