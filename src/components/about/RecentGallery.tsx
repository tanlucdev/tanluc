"use client";

import { useCallback, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { PhotoLightbox } from "@/components/PhotoLightbox";

const PHOTOS = [
  { file: "bike-and-sai-gon-atutum.webp", label: "Bike and Sai Gon atutum", angle: -5, ratio: 2268 / 4032 },
  { file: "birthday-at-beach.webp", label: "Birthday at beach", angle: -4, ratio: 2268 / 4032 },
  { file: "bu-gia-map-hiking.webp", label: "Bu Gia Map hiking", angle: 0, ratio: 4032 / 2268 },
  { file: "da-lat-solo-trip.webp", label: "Da Lat solo trip", angle: 2, ratio: 900 / 1600 },
  { file: "first-half-marathon.webp", label: "First half marathon", angle: -4, ratio: 1086 / 724 },
  { file: "nam-cat-tien-trip.webp", label: "Nam Cat Tien trip", angle: 1, ratio: 2268 / 4032 },
  { file: "second-half-marathon.webp", label: "Second half marathon", angle: 2, ratio: 2268 / 4032 },
  { file: "trekking-bich-dam.webp", label: "Trekking Bich Dam", angle: -3, ratio: 1284 / 699 },
  { file: "trekking-dinh-moutain.webp", label: "Trekking Dinh moutain", angle: 1, ratio: 2268 / 4032 },
  { file: "marathon-with-colleague.webp", label: "Marathon with colleague", angle: 0, ratio: 3693 / 2076 },
  { file: "trekking-ta-hine-with-colleague.webp", label: "Trekking Ta Hine with colleague", angle: 5, ratio: 2160 / 3840 },
];

const getReturnBounds = (paper: HTMLElement) => {
  const bounds = (paper.parentElement ?? paper).getBoundingClientRect();
  return bounds.right > 0 && bounds.left < innerWidth && bounds.bottom > 0 && bounds.top < innerHeight ? bounds : null;
};

export function RecentGallery({ basePath = "" }: { basePath?: string }) {
  const gallery = useRef<HTMLDivElement>(null);
  const papers = useRef(new Map<number, HTMLButtonElement>());
  const getThumbnail = useCallback((index: number) => papers.current.get(index) ?? null, []);
  const imagePath = `${basePath}/images/about/recently`;
  useLayoutEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const strip = gallery.current!;
    strip.dataset.reveal = "pending";
    let timer: number | undefined;
    let cancelled = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const { left, right } = strip.parentElement!.getBoundingClientRect();
      const images = [...strip.querySelectorAll("img")].filter((image) => {
        const bounds = image.getBoundingClientRect();
        return bounds.right > left && bounds.left < right;
      });
      // ponytail: One deadline for the initial reveal. Late thumbnails appear as they load.
      timer = window.setTimeout(() => { strip.dataset.reveal = "settled"; }, 650);
      void Promise.allSettled(images.map((image) => image.decode())).then((results) => {
        if (cancelled || strip.dataset.reveal !== "pending") return;
        window.clearTimeout(timer);
        images.forEach((image, index) => {
          if (results[index].status !== "fulfilled") return;
          image.style.setProperty("--print-index", String(index));
          image.dataset.revealPhoto = "true";
        });
        strip.dataset.reveal = "ready";
      });
    });
    observer.observe(strip);
    return () => { cancelled = true; observer.disconnect(); window.clearTimeout(timer); };
  }, [basePath]);
  const [active, setActive] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const highlighted = dismissed || active !== null ? null : hovered ?? focused;
  const hoverPrint = (index: number) => {
    setDismissed(false);
    setFocused(null);
    setHovered(index);
  };

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
              data-dismissed={highlighted !== index || undefined}
              data-hovered={hovered === index || undefined}
              onKeyDown={() => { setDismissed(false); setHovered(null); setFocused(index); }}
              onMouseEnter={(event) => {
                if (dismissed && event.currentTarget.contains(document.activeElement)) return;
                hoverPrint(index);
              }}
              onMouseMove={() => { if (dismissed) hoverPrint(index); }}
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
                ref={(button) => { if (button) papers.current.set(index, button); else papers.current.delete(index); }}
                type="button"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="" className="recent-print__image block size-full object-cover" decoding="async" loading="lazy" src={`${imagePath}/generated/${encodeURIComponent(item.file)}`} />
              </button>
              <figcaption className="recent-print__caption pointer-events-none absolute hidden w-max max-w-40 font-serif text-[16px] leading-[1.45] text-ink-soft opacity-0 min-[701px]:block" data-caption-before={index >= Math.ceil(PHOTOS.length / 2) || undefined}>
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

      {active !== null && <PhotoLightbox active={active} getReturnBounds={getReturnBounds} getThumbnail={getThumbnail} onClose={() => { setDismissed(true); setHovered(null); setFocused(null); setActive(null); }} onSelect={setActive} photos={PHOTOS.map(({ file, label, ratio }) => ({
        label,
        ratio: String(ratio),
        src: `${imagePath}/${encodeURIComponent(file)}`,
        thumbnail: `${imagePath}/generated/${encodeURIComponent(file)}`,
      }))} />}
    </>
  );
}
