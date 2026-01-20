import { type WuOrganism } from "@/types/WuOrganism";
import styles from "./WuFeatureList.module.css";

const features = [
  {
    icon: "📝",
    title: "Create Wishlists",
    description: "Organize your wishes into lists for events, people, or themes so nothing gets forgotten.",
  },
  {
    icon: "🔗",
    title: "Link Products",
    description: "Drop in Amazon, eBay, or Idealo links and keep key product details alongside your notes.",
  },
  {
    icon: "🤝",
    title: "Share Easily",
    description: "Send a single link to friends or family so they know exactly what you want this season.",
  },
];

export function WuFeatureList({ className, ...rest }: WuOrganism<HTMLElement> = {}) {
  const classes = [styles.grid, className].filter(Boolean).join(" ");
  return (
    <section className={classes} {...rest}>
      {features.map((feature) => (
        <article key={feature.title} className={styles.card}>
          <div className={styles.icon}>{feature.icon}</div>
          <h3 className={styles.title}>{feature.title}</h3>
          <p className={styles.description}>{feature.description}</p>
        </article>
      ))}
    </section>
  );
}
