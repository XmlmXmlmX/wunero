import Link from "next/link";
import { type WuOrganism } from "@/types/WuOrganism";
import styles from "./WuPageHeader.module.css";
import ArrowNarrowLeftIcon from "@/components/ui/arrow-narrow-left-icon";

interface WuPageHeaderProps extends WuOrganism<HTMLDivElement> {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
}

export function WuPageHeader({ title, subtitle, backHref, backLabel = "Back", actions, className, ...rest }: WuPageHeaderProps) {
  const classes = [styles.wrapper, className].filter(Boolean).join(" ");
  return (
    <div className={classes} {...rest}>
      <div className={styles.left}>
        {backHref && (
          <Link href={backHref} className={styles.backLink}>
            <ArrowNarrowLeftIcon /> {backLabel}
          </Link>
        )}
        <div>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}
