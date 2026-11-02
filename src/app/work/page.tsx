import Link from "next/link";
import Image from "next/image";
import { WORK } from "@/content/work";
import styles from "./page.module.css";

export const metadata = { title: "Work — Tan Luc" };

export default function WorkIndex() {
  return (
    <div className={styles.work}>
      <header className={styles.intro}>
        <h1>Work</h1>
        <p>A selection of products and the thinking behind them.</p>
      </header>
      <div className={styles.projects}>
        {WORK.map((w) => (
          <article key={w.slug} className={styles.project}>
            <h2 className={styles.title}><Link href={`/work/${w.slug}`}>{w.title}<span aria-hidden="true">↗</span></Link></h2>
            <span className={styles.meta}>{w.role} · {w.year}</span>
            <Link href={`/work/${w.slug}`} className={styles.cover} data-project={w.slug} aria-label={`Read ${w.title} case study`}>
              {w.slug === "dynamic-model" ? (
                <div className={styles.modelCover} aria-hidden="true">
                  <div className={styles.modelCard}>
                    <span className={styles.eyebrow}>Model</span>
                    <span className={styles.modelSymbol}>✳</span>
                    <strong>Qwen Image 3.0</strong>
                    <span>Text to Image</span>
                  </div>
                  <span className={styles.connector} />
                  <div className={styles.properties}>
                    <span className={styles.eyebrow}>Properties</span>
                    <span>Prompt</span>
                    <div>A quiet cafe, morning light.</div>
                    <span>Aspect ratio</span>
                    <div>16:9 <span>⌄</span></div>
                    <span className={styles.ready}>Ready to create</span>
                  </div>
                  <span className={styles.coverNote}>Schema-driven UI · Illustration</span>
                </div>
              ) : w.coverImage ? (
                <div className={styles.cafeCover}>
                  <Image {...w.coverImage} src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${w.coverImage.src}`} alt={w.coverImage.alt} sizes="(max-width: 760px) 90vw, 660px" />
                </div>
              ) : <div className={styles.placeholder} style={{ backgroundImage: w.cover }} />}
            </Link>
            <p className={styles.summary}>{w.summary}</p>
            <Link href={`/work/${w.slug}`} className={styles.read}>View case study <span aria-hidden="true">↗</span></Link>
          </article>
        ))}
      </div>
    </div>
  );
}
