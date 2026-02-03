"use client";

import { useState, ReactNode, isValidElement } from "react";
import { WuDropdown } from "../WuDropdown/WuDropdown";
import styles from "./WuSelect.module.css";

interface OptionElement {
  props: {
    value: string | number;
    children: ReactNode;
  };
}

export interface WuSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  fullWidth?: boolean;
  hasError?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
}

export function WuSelect({ 
  className, 
  fullWidth, 
  hasError, 
  value,
  onChange,
  disabled = false,
  children,
  ...rest 
}: WuSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | number | readonly string[] | undefined>(value);

  // Extract options from children
  const options: OptionElement[] = (Array.isArray(children) 
    ? children 
    : [children]).filter(isValidElement);

  const selectedOption = options.find(
    (opt: OptionElement) => opt?.props?.value === selectedValue
  );
  const selectedLabel = selectedOption?.props?.children || "Select an option";

  const handleOptionClick = (optionValue: string | number, optionLabel: ReactNode) => {
    setSelectedValue(optionValue);
    setIsOpen(false);

    // Trigger onChange like a native select would
    if (onChange) {
      const event = {
        target: {
          value: optionValue,
          name: rest.name,
        },
      } as React.ChangeEvent<HTMLSelectElement>;
      onChange(event);
    }
  };

  const classes = [
    styles.selectButton,
    fullWidth ? styles.fullWidth : "",
    hasError ? styles.error : "",
    disabled ? styles.disabled : "",
    isOpen ? styles.open : "",
    className
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <WuDropdown
      trigger={
        <button 
          type="button"
          className={classes}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className={styles.label}>{selectedLabel}</span>
          <span className={styles.chevron} aria-hidden>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" focusable="false">
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
        </button>
      }
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      align="left"
    >
      <div className={`${styles.menu} ${fullWidth ? styles.fullWidth : ""}`} role="listbox">
        {options.map((option: OptionElement, index: number) => {
          const optValue = option?.props?.value;
          const optLabel = option?.props?.children;
          const isSelected = optValue === selectedValue;

          return (
            <button
              key={index}
              type="button"
              className={`${styles.option} ${isSelected ? styles.selected : ""}`}
              onClick={() => handleOptionClick(optValue, optLabel)}
              role="option"
              aria-selected={isSelected}
            >
              {isSelected && (
                <span className={styles.checkmark} aria-hidden>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M13 4L6 11L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
              {optLabel}
            </button>
          );
        })}
      </div>
    </WuDropdown>
  );
}
