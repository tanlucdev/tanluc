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

  return (
    <>
      <h2 className={`mb-8 font-serif text-[24px] leading-[1.2] italic text-ink-soft transition-opacity duration-300 ${hovered !== null ? "opacity-15" : ""}`}>
        Recents from life
      </h2>
      <div className="-mx-2 overflow-x-auto px-2 py-3 min-[701px]:mx-0 min-[701px]:overflow-visible min-[701px]:px-0 min-[701px]:py-2">
        <div className="flex items-start gap-5 min-[701px]:items-end min-[701px]:gap-0">
          {PHOTOS.map((item, index) => (
            <figure
              className={`group/print relative h-[210px] w-[140px] shrink-0 snap-start transition-opacity duration-300 min-[701px]:aspect-[2/3] min-[701px]:h-auto min-[701px]:w-[calc(9.09091%+7.27273px)] min-[701px]:-ml-2 min-[701px]:first:ml-0 min-[701px]:hover:z-20 min-[701px]:focus-within:z-20 ${hovered !== null && hovered !== index ? "min-[701px]:opacity-25" : ""}`}
              key={item.label}
            >
              <button
                aria-haspopup="dialog"
                aria-label={`Open ${item.label}`}
                className="size-full bg-white p-[3px] shadow-sm outline-offset-4 focus-visible:outline-2 focus-visible:outline-ink min-[701px]:origin-bottom min-[701px]:[transform:rotate(var(--angle))] min-[701px]:transition-transform min-[701px]:duration-200 min-[701px]:group-hover/print:[transform:scale(1.85)] min-[701px]:group-focus-within/print:[transform:scale(1.85)]"
                onBlur={() => setHovered(null)}
                onClick={() => setActive(index)}
                onFocus={() => setHovered(index)}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
                style={{ "--angle": `${item.angle}deg` } as CSSProperties}
                type="button"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="" className="block size-full object-cover" src={`${basePath}/images/photo/${encodeURIComponent(item.file)}`} />
              </button>
              <figcaption className="pointer-events-none absolute left-[calc(142.5%+12px)] top-[calc(4px-85%)] hidden w-max max-w-60 translate-y-3 font-serif text-[18px] leading-[1.45] text-ink-soft opacity-0 transition-[opacity,transform] duration-300 ease-out min-[701px]:block min-[701px]:group-hover/print:translate-y-0 min-[701px]:group-hover/print:opacity-100 min-[701px]:group-focus-within/print:translate-y-0 min-[701px]:group-focus-within/print:opacity-100">
                {item.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <PhotoLightbox active={active} onClose={() => setActive(null)} onSelect={setActive} photos={PHOTOS.map(({ file, label }) => ({ label, src: `${basePath}/images/photo/${encodeURIComponent(file)}` }))} />
    </>
  );
}
