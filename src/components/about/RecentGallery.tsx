"use client";

import { useState, type CSSProperties } from "react";
import { PhotoLightbox } from "@/components/PhotoLightbox";

const PHOTOS = [
  { file: "in-forest.jpeg", label: "Night under the stars", angle: -5 },
  { file: "D1206F12-1559-4466-808D-7528942C5269_1_201_a.png", label: "A good day to ride", angle: -4 },
  { file: "sunset.jpeg", label: "A beautiful sunset", angle: 0 },
  { file: "0B7B4AE2-F505-46AC-B4FD-3A29D8341B11_1_105_c.jpeg", label: "Out with the crew", angle: 2 },
  { file: "D820E315-C384-4352-85DF-2D7401F30A87_1_105_c.jpeg", label: "Parked for a minute", angle: -4 },
  { file: "phan-thiet-seashore.JPG", label: "Take in the whole thing", angle: 1 },
  { file: "ED31428C-CE54-494A-8E78-AF00A3B83252_1_102_o.jpeg", label: "A camping spot", angle: 2 },
  { file: "sakura.jpeg", label: "Alamo square during SF Summer", angle: -3 },
  { file: "68FC1214-C2FF-4CA9-B28D-7BF104C3393E_1_105_c.jpeg", label: "Chasing the light", angle: 1 },
  { file: "A5AD6B49-201A-444B-BD80-7B581ED4AC40_1_105_c.jpeg", label: "Bike against a red wall", angle: 0 },
  { file: "building.jpeg", label: "The city from above", angle: 5 },
];

export function RecentGallery({ basePath = "" }: { basePath?: string }) {
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
        <div className="flex items-start gap-5 min-[701px]:items-end min-[701px]:gap-0">
          {PHOTOS.map((item, index) => (
            <figure
              className="recent-print group/print relative h-[210px] w-[140px] shrink-0 snap-start min-[701px]:aspect-[2/3] min-[701px]:h-auto min-[701px]:w-[calc(9.09091%+7.27273px)] min-[701px]:-ml-2 min-[701px]:first:ml-0 min-[701px]:hover:z-20 min-[701px]:focus-within:z-20"
              key={item.label}
              data-dismissed={dismissed || undefined}
              onPointerMove={() => setDismissed(false)}
              onKeyDown={() => setDismissed(false)}
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
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
                <img alt="" className="block size-full object-cover" src={`${basePath}/images/photo/${encodeURIComponent(item.file)}`} />
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

      <PhotoLightbox active={active} onClose={() => { setDismissed(true); setHovered(null); setFocused(null); setActive(null); }} onSelect={setActive} photos={PHOTOS.map(({ file, label }) => ({ label, src: `${basePath}/images/photo/${encodeURIComponent(file)}` }))} />
    </>
  );
}
