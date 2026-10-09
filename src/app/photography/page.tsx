import { PHOTOS } from "@/content/misc";

export const metadata = { title: "Photography — Neel Saswade" };

export default function Photography() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="font-serif text-5xl italic">Photography</h1>
      <p className="mt-3 max-w-xl text-ink-soft">
        Mostly shot from (or near) a bike saddle. Placeholder frames until real
        photos land.
      </p>
      <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
        {PHOTOS.map((p) => (
          <figure key={p.title} className="break-inside-avoid overflow-hidden rounded-xl border border-ink/10">
            <div
              className={p.tall ? "h-80" : "h-52"}
              style={{ backgroundImage: p.cover }}
            />
            <figcaption className="flex items-baseline justify-between p-3">
              <span className="font-serif italic">{p.title}</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">
                {p.place}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
