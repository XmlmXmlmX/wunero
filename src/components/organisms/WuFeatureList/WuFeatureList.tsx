"use client";

import { useTranslations } from "next-intl";
import { type WuOrganism } from "@/types/WuOrganism";
import styles from "./WuFeatureList.module.css";
import UnorderedListIcon from "@/components/ui/unordered-list-icon";
import LinkIcon from "@/components/ui/link-icon";
import RefreshIcon from "@/components/ui/refresh-icon";

export function WuFeatureList({ className, ...rest }: WuOrganism<HTMLElement> = {}) {
  const t = useTranslations("home.features");
  
  const features = [
    {
      icon: UnorderedListIcon,
      title: t("create.title"),
      description: t("create.description"),
    },
    {
      icon: LinkIcon,
      title: t("link.title"),
      description: t("link.description"),
    },
    {
      icon: RefreshIcon,
      title: t("share.title"),
      description: t("share.description"),
    },
  ];

  const classes = [styles.grid, className].filter(Boolean).join(" ");
  return (
    <section className={classes} {...rest}>
      {features.map((feature) => (
        <article key={feature.title} className={styles.card}>
          <feature.icon className={styles.icon} />
          <h3 className={styles.title}>{feature.title}</h3>
          <p className={styles.description}>{feature.description}</p>
        </article>
      ))}
    </section>
  );
}
