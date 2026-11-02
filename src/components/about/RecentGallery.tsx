"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { PhotoLightbox } from "@/components/PhotoLightbox";

const PHOTOS = [
  { file: "bike-and-sai-gon-atutum.webp", label: "Bike and Sai Gon atutum", angle: -5 },
  { file: "birthday-at-beach.webp", label: "Birthday at beach", angle: -4 },
  { file: "bu-gia-map-hiking.webp", label: "Bu Gia Map hiking", angle: 0 },
  { file: "da-lat-solo-trip.webp", label: "Da Lat solo trip", angle: 2 },
  { file: "first-half-marathon.webp", label: "First half marathon", angle: -4 },
  { file: "nam-cat-tien-trip.webp", label: "Nam Cat Tien trip", angle: 1 },
  { file: "second-half-marathon.webp", label: "Second half marathon", angle: 2 },
  { file: "trekking-bich-dam.webp", label: "Trekking Bich Dam", angle: -3 },
  { file: "trekking-dinh-moutain.webp", label: "Trekking Dinh moutain", angle: 1 },
  { file: "marathon-with-colleague.webp", label: "Marathon with colleague", angle: 0 },
  { file: "trekking-ta-hine-with-colleague.webp", label: "Trekking Ta Hine with colleague", angle: 5 },
];

export function RecentGallery({ basePath = "" }: { basePath?: string }) {
  const gallery = useRef<HTMLDivElement>(null);
  useEffect(() => {
    gallery.current?.querySelectorAll("img").forEach((image) => {
      if (image.complete && image.naturalWidth > 0) image.dataset.loaded = "true";
    });
  }, [basePath]);
  const [active, setActive] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const highlighted = dismissed ? null : hovered ?? focused;

  return (
    <>
      <h2 className={`mb-8 font-serif text-[24px] leading-[1.2] italic text-ink-soft transition-opacity duration-300 ${highlighted !== null ? "opacity-15" : ""}`}>
        Recents from life
      </h2>
      <div className="-mx-2 overflow-x-auto px-2 py-3 min-[701px]:mx-0 min-[701px]:overflow-visible min-[701px]:px-0 min-[701px]:py-2">
        <div ref={gallery} className="flex items-start gap-5 min-[701px]:items-end min-[701px]:gap-0">
          {PHOTOS.map((item, index) => (
            <figure
              className={`recent-print group/print relative h-[210px] w-[140px] shrink-0 snap-start min-[701px]:aspect-[2/3] min-[701px]:h-auto min-[701px]:w-[calc(9.09091%+7.27273px)] min-[701px]:-ml-2 min-[701px]:first:ml-0 ${highlighted === index ? "min-[701px]:z-20" : ""}`}
              key={item.label}
              style={{ "--print-index": index } as CSSProperties}
              data-dismissed={highlighted !== index || undefined}
              onKeyDown={() => setDismissed(false)}
              onMouseEnter={(event) => {
                if (dismissed && event.currentTarget.contains(document.activeElement)) return;
                setDismissed(false); setFocused(null); setHovered(index);
              }}
              onMouseLeave={() => { setHovered(null); setFocused(null); setDismissed(false); }}
            >
              <div className="size-full min-[701px]:origin-bottom min-[701px]:[transform:rotate(var(--angle))]" style={{ "--angle": `${item.angle}deg` } as CSSProperties}>
              <button
                aria-haspopup="dialog"
                aria-label={`Open ${item.label}`}
                className="recent-print__paper size-full rounded-[3px] bg-white p-[3px] shadow-sm outline-offset-4 focus-visible:outline-2 focus-visible:outline-ink"
                onBlur={() => setFocused(null)}
                onClick={() => setActive(index)}
                onFocus={() => setFocused(index)}
                type="button"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="" className="recent-print__image block size-full object-cover" onLoad={(event) => { event.currentTarget.dataset.loaded = "true"; }} src={`${basePath}/images/about/recently/${encodeURIComponent(item.file)}`} />
              </button>
              <figcaption className={`recent-print__caption pointer-events-none absolute top-[calc(4px-85%)] hidden w-max max-w-40 font-serif text-[16px] leading-[1.45] text-ink-soft opacity-0 min-[701px]:block ${index >= PHOTOS.length - 2 ? "right-[calc(142.5%+12px)] text-right" : "left-[calc(142.5%+12px)]"}`}>
                <span className="sr-only">{item.label}</span>
                <span aria-hidden="true">
                  {Array.from(item.label).map((letter, letterIndex) => (
                    <span className="recent-print__letter" key={letterIndex} style={{ "--letter-index": letterIndex } as CSSProperties}>{letter}</span>
                  ))}
                </span>
              </figcaption>
              </div>
            </figure>
          ))}
        </div>
      </div>

      <PhotoLightbox active={active} onClose={() => { setDismissed(true); setHovered(null); setFocused(null); setActive(null); }} onSelect={setActive} photos={PHOTOS.map(({ file, label }) => ({ label, src: `${basePath}/images/about/recently/${encodeURIComponent(file)}` }))} />
    </>
  );
}
