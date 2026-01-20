import { WuFeatureList } from "@/components/organisms/WuFeatureList/WuFeatureList";
import { WuHeroSection } from "@/components/organisms/WuHeroSection/WuHeroSection";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <WuHeroSection />
        <WuFeatureList />
      </main>
    </div>
  );
}
