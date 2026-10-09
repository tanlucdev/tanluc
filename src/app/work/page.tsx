import Link from "next/link";
import { WORK } from "@/content/work";

export const metadata = { title: "Work — Tan Luc" };

export default function WorkIndex() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="font-serif text-5xl italic">Work</h1>
      <p className="mt-3 max-w-xl text-ink-soft">
        Case studies from the last few years. Placeholder content for now — real
        stories drop in via <code className="font-mono text-sm">src/content/work.ts</code>.
      </p>
      <div className="mt-12 flex flex-col gap-10">
        {WORK.map((w, i) => (
          <Link
            key={w.slug}
            href={`/work/${w.slug}`}
            className={`group grid grid-cols-1 gap-6 md:grid-cols-2 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}
          >
            <div
              className="h-64 rounded-xl border border-ink/10 transition-transform duration-500 group-hover:scale-[1.01]"
              style={{ backgroundImage: w.cover }}
            />
            <div className="flex flex-col justify-center">
              <span className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">
                {w.client} · {w.year} · {w.role}
              </span>
              <h2 className="mt-2 font-serif text-3xl italic group-hover:underline">{w.title}</h2>
              <p className="mt-3 text-ink-soft">{w.summary}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
