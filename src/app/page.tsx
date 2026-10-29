import Link from "next/link";
import { HeroMeadow } from "@/components/hero/HeroMeadow";
import WorkShowcase from "@/components/home/WorkShowcase";
import { PROFILE } from "@/content/profile";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className="portfolio-home">
      <HeroMeadow />

      <WorkShowcase />

      <section className={styles.profileTeaser} aria-labelledby="profile-teaser-title">
        <h2 id="profile-teaser-title"><Link href={PROFILE.homeTeaser.href}>{PROFILE.homeTeaser.title}</Link></h2>
        <p>{PROFILE.homeTeaser.copy}</p>
      </section>

      <footer id="footer" className={styles.footer} aria-label="Site footer">
        <span>© 2026 Tan Luc</span>
        <a href="#">Back to top</a>
      </footer>
    </div>
  );
}
