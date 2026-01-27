import type { WuAtom } from "@/types/WuAtom";
import styles from "./WuInput.module.css";

type BaseProps = WuAtom<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>> & {
  fullWidth?: boolean;
  hasError?: boolean;
};

function buildClassName(className?: string, fullWidth?: boolean, hasError?: boolean) {
  return [styles["wu-input"], fullWidth ? styles.fullWidth : "", hasError ? styles.error : "", className]
    .filter(Boolean)
    .join(" ");
}

export type WuInputProps = BaseProps;

export function WuInput({ className, fullWidth, hasError, ...rest }: WuInputProps) {
  return <input className={buildClassName(className, fullWidth, hasError)} {...rest} />;
}
