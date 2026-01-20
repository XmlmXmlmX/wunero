import { type WuMolecule } from "@/types/WuMolecule";
import styles from "./WuEmptyState.module.css";

interface WuEmptyStateProps extends WuMolecule<HTMLDivElement> {
  icon?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function WuEmptyState({ icon, title, description, actions, className, ...rest }: WuEmptyStateProps) {
  const classes = [styles.wrapper, className].filter(Boolean).join(" ");
  return (
    <div className={classes} {...rest}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}
