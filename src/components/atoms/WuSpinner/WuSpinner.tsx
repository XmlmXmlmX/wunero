import { type WuAtom } from "@/types/WuAtom";
import styles from "./WuSpinner.module.css";

interface WuSpinnerProps extends WuAtom<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

export function WuSpinner({ size = "md", className, ...rest }: WuSpinnerProps) {
  const classes = [styles.spinner, styles[size], className].filter(Boolean).join(" ");
  
  return (
    <div className={classes} {...rest} role="status" aria-live="polite" aria-label="Lädt">
      <div className={styles.spinnerCircle}></div>
    </div>
  );
}
