import Link from "next/link";
import { notFound } from "next/navigation";
import CinematicWorkflow from "@/components/work/CinematicWorkflow";
import { WORK } from "@/content/work";

export function generateStaticParams() {
  return WORK.map((w) => ({ slug: w.slug }));
}

export default async function CaseStudy({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = WORK.find((w) => w.slug === slug);
  if (!study) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <Link
        href="/work"
        className="font-mono text-[11px] uppercase tracking-widest text-ink-soft hover:text-ink"
      >
        ← All work
      </Link>
      <h1 className="mt-6 font-serif text-5xl italic">{study.title}</h1>
      <p className="mt-3 font-mono text-[11px] uppercase tracking-widest text-ink-soft">
        {study.client} · {study.year} · {study.role}
      </p>
      {study.slug === "dynamic-model" ? <CinematicWorkflow /> : <div className="mt-8 h-80 w-full rounded-xl border border-ink/10" style={{ backgroundImage: study.cover }} />}
      {study.url && (
        <a
          className="mt-5 inline-flex border-b border-ink/30 pb-1 font-mono text-[11px] uppercase tracking-widest text-ink-soft transition-colors hover:border-ink hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          href={study.url}
          rel="noreferrer"
          target="_blank"
        >
          Visit project ↗
        </a>
      )}
      <p className="mt-8 font-serif text-xl italic leading-relaxed">{study.summary}</p>
      {study.sections.map((s) => (
        <section key={s.heading} className="mt-10">
          <h2 className="font-serif text-2xl italic">{s.heading}</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">{s.body}</p>
        </section>
      ))}
    </article>
  );
}
