import { type WuAtom } from "@/types/WuAtom";
import styles from "./WuTooltip.module.css";

interface WuTooltipProps extends WuAtom<HTMLSpanElement> {
  content: string;
  position?: "top" | "bottom" | "left" | "right";
}

export function WuTooltip({ content, position = "top", className, children, ...rest }: WuTooltipProps) {
  const classes = [styles.tooltip, styles[position], className].filter(Boolean).join(" ");

  return (
    <span className={classes} {...rest}>
      {children}
      <span className={styles.bubble} role="tooltip" aria-hidden="true">
        {content}
      </span>
    </span>
  );
}
