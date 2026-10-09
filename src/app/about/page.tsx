export const metadata = { title: "About — Neel Saswade" };

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-serif text-5xl italic">About</h1>
      <div className="mt-8 space-y-6 leading-relaxed">
        <p>
          Hi, I&apos;m Neel — a senior product designer who believes the best
          interfaces feel like graph paper: quiet structure that lets the
          interesting things stand out. (Placeholder bio — replace with your
          real story.)
        </p>
        <p>
          I&apos;ve spent the last decade designing tools for teams, systems for
          designers, and dashboards for people working under pressure. I care
          about typography, motion that earns its keep, and details most people
          never notice but everyone feels.
        </p>
        <p>
          Off-screen I&apos;m on a bike. Road, gravel, whatever&apos;s outside.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          ["10+", "years designing"],
          ["4", "design systems"],
          ["12,000", "km ridden in 2026"],
          ["1", "bike bell on my desk"],
        ].map(([n, label]) => (
          <div key={label} className="rounded-xl border border-ink/10 p-4 text-center">
            <div className="font-serif text-3xl italic">{n}</div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-ink-soft">
              {label}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-12 font-mono text-[11px] uppercase tracking-widest text-ink-soft">
        Say hello · hello@neelsaswade.com (placeholder)
      </p>
    </div>
  );
}
