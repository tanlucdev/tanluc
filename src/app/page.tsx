import Link from "next/link";
import { HeroGrid } from "@/components/hero/HeroGrid";
import { WORK } from "@/content/work";

export default function Home() {
  return (
    <>
      <HeroGrid />

      <section id="work" className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="font-serif text-4xl italic">Selected work</h2>
          <Link
            href="/work"
            className="font-mono text-[11px] uppercase tracking-widest text-ink-soft hover:text-ink"
          >
            All work →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {WORK.slice(0, 4).map((w) => (
            <Link
              key={w.slug}
              href={`/work/${w.slug}`}
              className="group overflow-hidden rounded-xl border border-ink/10 bg-paper transition-shadow hover:shadow-lg"
            >
              <div
                className="h-56 w-full transition-transform duration-500 group-hover:scale-[1.02]"
                style={{ backgroundImage: w.cover }}
              />
              <div className="p-5">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-serif text-2xl italic">{w.title}</h3>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">
                    {w.year}
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink-soft">{w.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-ink/10 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-center">
          <p className="font-serif italic">Neel Saswade</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">
            Designed on graph paper
          </p>
        </div>
      </footer>
    </>
  );
}
