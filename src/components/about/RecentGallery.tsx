"use client";

import { useState, type CSSProperties } from "react";
import { PhotoLightbox } from "@/components/PhotoLightbox";

const PHOTOS = [
  { cover: "linear-gradient(135deg, #202621, #6e7d58, #d1baa1)", label: "Night under the stars", angle: -5 },
  { cover: "linear-gradient(135deg, #edc6a3, #c17b5e, #613c33)", label: "A good day to ride", angle: -4 },
  { cover: "linear-gradient(135deg, #203245, #6988a0, #d4c5ae)", label: "A beautiful sunset", angle: 0 },
  { cover: "linear-gradient(135deg, #344c2b, #8da55d, #e6d6a8)", label: "Out with the crew", angle: 2 },
  { cover: "linear-gradient(135deg, #8f6c3f, #d3a564, #c7d2b1)", label: "Parked for a minute", angle: -4 },
  { cover: "linear-gradient(135deg, #bfd1dc, #51768b, #263544)", label: "Take in the whole thing", angle: 1 },
  { cover: "linear-gradient(135deg, #64779a, #9ab8c5, #f4ddc2)", label: "A camping spot", angle: 2 },
  { cover: "linear-gradient(135deg, #d3e5db, #6b987e, #2d4f45)", label: "Alamo square during SF Summer", angle: -3 },
  { cover: "linear-gradient(135deg, #775c35, #bd8a4e, #d2d0bb)", label: "Chasing the light", angle: 1 },
  { cover: "linear-gradient(135deg, #28475c, #7895a3, #d9d2bd)", label: "Bike against a red wall", angle: 0 },
  { cover: "linear-gradient(135deg, #8099b6, #d3e2e7, #70885d)", label: "The city from above", angle: 5 },
];

export function RecentGallery() {
  const [active, setActive] = useState<number | null>(null);
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <h2 className={`mb-8 font-serif text-[24px] leading-[1.2] italic text-ink-soft transition-opacity duration-200 ${hovered ? "opacity-15" : ""}`}>
        Recents from life
      </h2>
      <div className="-mx-4 overflow-x-auto px-4 py-3 md:mx-0 md:overflow-visible md:px-0">
        <div className="flex items-start gap-8 md:items-end md:gap-0">
          {PHOTOS.map((item, index) => (
            <figure
              className="group/print relative h-[312px] w-[208px] shrink-0 snap-start md:aspect-[2/3] md:h-auto md:w-[calc(9.09091%+7.27273px)] md:-ml-2 md:first:ml-0 md:hover:z-20 md:focus-within:z-20"
              key={item.label}
            >
              <button
                aria-haspopup="dialog"
                aria-label={`Open ${item.label}`}
                className="size-full bg-white p-[4px] shadow-sm outline-offset-4 focus-visible:outline-2 focus-visible:outline-ink md:origin-bottom md:[transform:rotate(var(--angle))] md:transition-transform md:duration-200 md:group-hover/print:[transform:scale(1.85)] md:group-focus-within/print:[transform:scale(1.85)]"
                onBlur={() => setHovered(false)}
                onClick={() => setActive(index)}
                onFocus={() => setHovered(true)}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{ "--angle": `${item.angle}deg` } as CSSProperties}
                type="button"
              >
                <span className="block size-full" style={{ backgroundImage: item.cover }} />
              </button>
              <figcaption className="pointer-events-none absolute left-[calc(142.5%+12px)] top-[calc(4px-85%)] hidden w-max max-w-60 font-serif text-[18px] leading-[1.45] text-ink-soft opacity-0 md:block md:group-hover/print:opacity-100 md:group-focus-within/print:opacity-100">
                {item.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <PhotoLightbox active={active} onClose={() => setActive(null)} onSelect={setActive} photos={PHOTOS} />
    </>
  );
}
