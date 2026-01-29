import { type WuAtom } from "@/types/WuAtom";
import styles from "./WuSegmentControl.module.css";

interface WuSegmentOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface WuSegmentControlProps extends Omit<WuAtom<HTMLDivElement>, 'onChange'> {
  options: WuSegmentOption[];
  value: string;
  onChange: (value: string) => void;
  size?: "sm" | "md" | "lg";
}

export function WuSegmentControl({ 
  options, 
  value, 
  onChange, 
  size = "md",
  className,
  ...rest 
}: WuSegmentControlProps) {
  const sizeClass = styles[`segment-${size}`];
  const classes = [styles.segmentControl, sizeClass, className].filter(Boolean).join(" ");

  return (
    <div className={classes} role="group" {...rest}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`${styles.segmentButton} ${value === option.value ? styles.active : ''}`}
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
        >
          {option.icon && <span className={styles.icon}>{option.icon}</span>}
          <span className={styles.label}>{option.label}</span>
        </button>
      ))}
    </div>
  );
}
