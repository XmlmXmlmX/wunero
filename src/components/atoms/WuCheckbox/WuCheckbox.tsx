import React, { useEffect, useId, useRef } from "react";
import { Check } from "lucide-react";
import styles from "./WuCheckbox.module.css";

export interface WuCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  checked: boolean;
  onChange: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  indeterminate?: boolean;
}

export function WuCheckbox({
  checked,
  onChange,
  label,
  description,
  error,
  indeterminate = false,
  disabled = false,
  className,
  id,
  ...rest
}: WuCheckboxProps) {
  const internalId = useId();
  const inputId = id ?? internalId;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate && !checked;
    }
  }, [indeterminate, checked]);

  const wrapperClasses = [styles.wrapper, className, disabled ? styles.disabled : "", error ? styles.error : ""]
    .filter(Boolean)
    .join(" ");

  const ariaInvalidProps = error ? { "aria-invalid": "true" as const } : {};

  return (
    <label className={wrapperClasses} htmlFor={inputId}>
      <input
        ref={inputRef}
        id={inputId}
        type="checkbox"
        className={styles.input}
        checked={checked}
        disabled={disabled}
        aria-describedby={description ? `${inputId}-desc` : undefined}
        onChange={(event) => onChange(event.target.checked, event)}
        {...ariaInvalidProps}
        {...rest}
      />
      <span className={styles.box} aria-hidden>
        <Check className={styles.checkIcon} strokeWidth={3} />
      </span>
      {(label || description) && (
        <span className={styles.texts}>
          {label && <span className={styles.label}>{label}</span>}
          {description && (
            <span className={styles.description} id={`${inputId}-desc`}>
              {description}
            </span>
          )}
          {error && <span className={styles.errorText}>{error}</span>}
        </span>
      )}
    </label>
  );
}
