import type { WuAtom } from "@/types/WuAtom";
import styles from "./WuTextArea.module.css";

type BaseProps = WuAtom<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>> & {
  fullWidth?: boolean;
  hasError?: boolean;
};

function buildClassName(className?: string, fullWidth?: boolean, hasError?: boolean) {
  return [styles["wu-textarea"], fullWidth ? styles.fullWidth : "", hasError ? styles.error : "", className]
    .filter(Boolean)
    .join(" ");
}

export type WuTextAreaProps = BaseProps;

export function WuTextArea({ className, fullWidth, hasError, ...rest }: WuTextAreaProps) {
  return <textarea className={buildClassName(className, fullWidth, hasError)} {...rest} />;
}
