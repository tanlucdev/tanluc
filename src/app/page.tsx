import { HeroMeadow } from "@/components/hero/HeroMeadow";
import WorkShowcase from "@/components/home/WorkShowcase";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className="portfolio-home">
      <HeroMeadow />

      <WorkShowcase />

      <footer id="footer" className={styles.footer} aria-label="Site footer">
        <span>© 2026 Tan Luc</span>
        <a href="#">Back to top</a>
      </footer>
    </div>
  );
}
