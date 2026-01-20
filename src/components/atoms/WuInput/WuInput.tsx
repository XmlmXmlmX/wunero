import type { WuAtom } from "@/types/WuAtom";
import styles from "./WuInput.module.css";

type BaseProps<T> = WuAtom<T> & {
  fullWidth?: boolean;
  hasError?: boolean;
};

function buildClassName(className?: string, fullWidth?: boolean, hasError?: boolean, extra?: string) {
  return [styles.control, fullWidth ? styles.fullWidth : "", hasError ? styles.error : "", extra, className]
    .filter(Boolean)
    .join(" ");
}

export type WuInputProps = BaseProps<HTMLInputElement>;

export function WuInput({ className, fullWidth, hasError, ...rest }: WuInputProps) {
  return <input className={buildClassName(className, fullWidth, hasError)} {...rest} />;
}

export type WuTextAreaProps = BaseProps<HTMLTextAreaElement>;

export function WuTextArea({ className, fullWidth, hasError, ...rest }: WuTextAreaProps) {
  return <textarea className={buildClassName(className, fullWidth, hasError, styles.textarea)} {...rest} />;
}
