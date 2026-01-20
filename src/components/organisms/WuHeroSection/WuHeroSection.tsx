import Image from "next/image";
import { WuButtonLink } from "@/components/atoms";
import { type WuOrganism } from "@/types/WuOrganism";
import styles from "./WuHeroSection.module.css";
import logo from "@/assets/logo.svg";

export function WuHeroSection({ className, ...rest }: WuOrganism<HTMLElement> = {}) {
  const classes = [styles.wrapper, className].filter(Boolean).join(" ");
  return (
    <section className={classes} {...rest}>
      <Image src={logo} alt="Wunero" width={320} height={80} className={styles.logo} />
      <div className={styles.badge}>🎉 Joy starts with a wish</div>
      <h1 className={styles.title}>Collect, organize, and share wishes with ease</h1>
      <p className={styles.subtitle}>
        Wunero keeps your wishlist tidy across occasions. Add products from Amazon, eBay, and Idealo, then share with friends in one click.
      </p>
      <div className={styles.actions}>
        <WuButtonLink href="/wishlists" variant="primary">
          Get Started
        </WuButtonLink>
        <WuButtonLink href="/wishlists" variant="outline">
          View Wishlists
        </WuButtonLink>
      </div>
    </section>
  );
}
