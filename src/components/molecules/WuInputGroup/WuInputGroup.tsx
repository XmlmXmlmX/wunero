import { WuButton, type WuButtonProps } from "@/components/atoms/WuButton/WuButton";
import { WuInput, type WuInputProps } from "@/components/atoms/WuInput/WuInput";
import styles from "./WuInputGroup.module.css";

export type WuInputGroupProps = {
  inputProps: WuInputProps;
  buttonProps: WuButtonProps;
  className?: string;
  fullWidth?: boolean;
};

export function WuInputGroup({ inputProps, buttonProps, className, fullWidth }: WuInputGroupProps) {
  const containerClass = [styles.group, fullWidth ? styles.fullWidth : "", className].filter(Boolean).join(" ");

  return (
    <div className={containerClass}>
      <WuInput {...inputProps} className={[styles.input, inputProps.className].filter(Boolean).join(" ")} />
      <WuButton {...buttonProps} className={[styles.button, buttonProps.className].filter(Boolean).join(" ")} />
    </div>
  );
}
