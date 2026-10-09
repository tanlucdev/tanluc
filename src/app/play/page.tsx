import { PLAY } from "@/content/misc";

export const metadata = { title: "Play — Neel Saswade" };

export default function Play() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="font-serif text-5xl italic">Play</h1>
      <p className="mt-3 max-w-xl text-ink-soft">
        Things made for no reason other than the joy of making them.
      </p>
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PLAY.map((p) => (
          <div
            key={p.title}
            className="group overflow-hidden rounded-xl border border-ink/10"
          >
            <div
              className="h-44 transition-transform duration-500 group-hover:scale-[1.03]"
              style={{ backgroundImage: p.cover }}
            />
            <div className="p-4">
              <div className="flex items-baseline justify-between">
                <h2 className="font-serif text-xl italic">{p.title}</h2>
                <span className="font-mono text-[10px] text-ink-soft">{p.year}</span>
              </div>
              <p className="mt-1 text-sm text-ink-soft">{p.blurb}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
