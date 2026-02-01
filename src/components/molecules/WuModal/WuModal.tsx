"use client";

import React from "react";
import { WuButton } from "@/components/atoms";
import { type WuMolecule } from "@/types/WuMolecule";
import styles from "./WuModal.module.css";
import { XIcon } from "lucide-react";

interface WuModalProps extends WuMolecule<HTMLDivElement> {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  actions?: React.ReactNode; // button bar content
  children: React.ReactNode; // modal body content
  closeOnOverlayClick?: boolean;
}

export function WuModal({
  isOpen,
  title,
  onClose,
  actions,
  children,
  className,
  closeOnOverlayClick = true,
  ...rest
}: WuModalProps) {
  const titleId = React.useId();
  if (!isOpen) return null;

  const classes = [styles.modal, className].filter(Boolean).join(" ");

  const handleOverlayClick = () => {
    if (closeOnOverlayClick) onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div
        className={classes}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        {...rest}
      >
        <div className={styles.header}>
          <h3 id={titleId} className={styles.title}>{title}</h3>
          <WuButton
            type="button"
            variant="ghost"
            className={styles.closeButton}
            title="Close"
            aria-label="Close"
            onClick={onClose}
          >
            <XIcon size={18} />
          </WuButton>
        </div>

        <div className={styles.content}>{children}</div>

        {actions && (
          <div className={styles.footer}>{actions}</div>
        )}
      </div>
    </div>
  );
}
