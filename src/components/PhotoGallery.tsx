"use client";

import { useDeferredValue, useState } from "react";
import type { Photo } from "@/content/misc";
import { PhotoLightbox } from "@/components/PhotoLightbox";

export function PhotoGallery({ photos }: { photos: Photo[] }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<number | null>(null);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sort, setSort] = useState("Photography style");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const filteredPhotos = photos.filter((photo) =>
    [photo.title, photo.place, ...(photo.tags ?? [])]
      .join(" ")
      .toLowerCase()
      .includes(deferredQuery),
  );

  return (
    <>
      <div className="flex items-center justify-between gap-6 text-[15px] tracking-[-0.03em] text-ink-soft sm:text-[17px]">
        <div className="flex min-w-0 items-center gap-3" role="search">
          <svg aria-hidden="true" className="size-[18px] shrink-0" fill="none" viewBox="0 0 24 24">
            <circle cx="10.8" cy="10.8" r="6.3" stroke="currentColor" strokeWidth="1.8" />
            <path d="m16 16 4.1 4.1" stroke="currentColor" strokeWidth="1.8" />
          </svg>
          <input
            aria-controls="photo-results"
            aria-label="Search photographs"
            className="min-w-0 bg-transparent outline-none placeholder:text-ink-soft focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink"
            onChange={(event) => setQuery(event.target.value)}
            placeholder='type “bikes”'
            type="search"
            value={query}
          />
          {query && (
            <button
              className="shrink-0 text-[13px] text-ink-soft transition-colors hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink"
              onClick={() => setQuery("")}
              type="button"
            >
              Clear
            </button>
          )}
        </div>
        <div className="relative hidden shrink-0 sm:block">
          {isSortOpen && <button aria-label="Close sort menu" className="fixed inset-0 z-10 cursor-default" onClick={() => setIsSortOpen(false)} type="button" />}
          <button
            aria-expanded={isSortOpen}
            aria-haspopup="menu"
            className="relative z-20 flex items-center gap-2 text-[16px] tracking-[-0.03em] text-ink-soft focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink"
            onClick={() => setIsSortOpen((open) => !open)}
            type="button"
          >
            <span>Sort by</span>
            <span className="text-ink">{sort}</span>
            <svg className={`size-4 transition-transform ${isSortOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24">
              <path d="m7 10 5 5 5-5" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </button>
          {isSortOpen && (
            <div className="absolute right-0 top-[calc(100%+20px)] z-20 w-[250px] rounded-[20px] border border-ink/15 bg-paper p-4 shadow-[0_18px_34px_rgba(36,35,33,0.14)]" role="menu">
              {["Selected work", "Color", "Photography style"].map((option) => (
                <button
                  className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-[16px] tracking-[-0.03em] text-ink transition-colors hover:bg-ink/5 focus-visible:outline focus-visible:outline-1 focus-visible:outline-ink"
                  key={option}
                  onClick={() => {
                    setSort(option);
                    setIsSortOpen(false);
                  }}
                  role="menuitemradio"
                  aria-checked={sort === option}
                  type="button"
                >
                  {option}
                  {sort === option && <span aria-hidden="true" className="text-[22px] leading-none">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* ponytail: menu changes its label only; add photo metadata when each option needs a real filter. */}
      </div>

      <p aria-live="polite" className="sr-only">
        {filteredPhotos.length} photographs found
      </p>
      <div
        id="photo-results"
        key={deferredQuery || "all"}
        className="mt-20 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:gap-[4.4vw]"
      >
        {Array.from({ length: 5 }, (_, column) => (
          <div className="flex flex-col gap-5 xl:gap-[4.4vw]" key={column}>
            {filteredPhotos.map((photo, index) => index % 5 === column && (
              <figure key={photo.title} className="photo-result overflow-hidden bg-[#e9e8e4]" style={{ animationDelay: `${index * 35}ms` }}>
                <button
                  aria-haspopup="dialog"
                  aria-label={`Open ${photo.title}`}
                  className="block w-full transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                  onClick={() => setActive(index)}
                  type="button"
                >
                  <span
                    aria-label={`${photo.title}, ${photo.place}`}
                    role="img"
                    className={photo.tall ? "block aspect-[3/4]" : "block aspect-[4/3]"}
                    style={{ backgroundImage: photo.cover }}
                  />
                </button>
              </figure>
            ))}
          </div>
        ))}
        {filteredPhotos.length === 0 && (
          <p className="text-[15px] tracking-[-0.03em] text-ink-soft">
            No photographs found.
          </p>
        )}
      </div>
      <PhotoLightbox
        active={active}
        onClose={() => setActive(null)}
        onSelect={setActive}
        photos={filteredPhotos.map((photo) => ({
          cover: photo.cover,
          label: `${photo.title}, ${photo.place}`,
          ratio: photo.tall ? "0.75" : "1.333333",
        }))}
      />
    </>
  );
}
