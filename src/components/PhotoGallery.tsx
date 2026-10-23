"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Photo } from "@/content/misc";
import { PhotoLightbox } from "@/components/PhotoLightbox";

export function PhotoGallery({ photos }: { photos: Photo[] }) {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<number | null>(null);
  const [sort, setSort] = useState("Selected work");
  const galleryRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDetailsElement>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const visible = useRef(new Set<string>());
  const filtered = useMemo(() => photos.filter((photo) => {
    const text = [photo.title, photo.place, ...(photo.tags ?? [])].join(" ").toLowerCase();
    return search.split(/\s+/).every((word) => text.includes(word));
  }).sort((a, b) => sort === "Color" ? a.color - b.color : sort === "Photography style" ? a.style.localeCompare(b.style) : 0), [photos, search, sort]);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(query.trim().toLowerCase()), 350);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (!sortRef.current?.contains(event.target as Node)) sortRef.current?.removeAttribute("open");
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, []);

  useLayoutEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery) return;
    let lastWidth = 0;
    const layout = () => {
      const width = gallery.clientWidth;
      const styles = getComputedStyle(gallery);
      const columns = Number(styles.getPropertyValue("--columns"));
      const gap = parseFloat(styles.columnGap);
      const tileWidth = (width - gap * (columns - 1)) / columns;
      const heights = Array<number>(columns).fill(0);
      const next = new Set(filtered.map((photo) => photo.src));
      const previous = new Map([...buttons.current].map(([src, button]) => [src, button.getBoundingClientRect()]));
      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const initial = !gallery.dataset.ready;
      const animate = (button: HTMLButtonElement, frames: Keyframe[], duration: number, easing: string, delay = 0) => {
        if (reduced) return;
        const animation = button.animate(frames, { duration, easing, delay, fill: "both" });
        animation.finished.then(() => animation.cancel(), () => {});
      };
      lastWidth = width;
      for (const [index, photo] of photos.entries()) {
        const button = buttons.current.get(photo.src)!;
        const wasVisible = visible.current.has(photo.src);
        button.getAnimations().forEach((animation) => animation.cancel());
        button.dataset.visible = String(next.has(photo.src));
        button.setAttribute("aria-hidden", String(!next.has(photo.src)));
        button.tabIndex = next.has(photo.src) ? 0 : -1;
        if (!next.has(photo.src) && wasVisible) {
          const rect = previous.get(photo.src)!;
          const fall = Math.max(160, innerHeight - rect.top + rect.height);
          const turn = (index % 2 ? -1 : 1) * (22 + index % 3 * 4);
          animate(button, Array.from({ length: 6 }, (_, step) => {
            const progress = step / 5;
            return { offset: progress, opacity: progress <= 0.6 ? 1 : (1 - progress) / 0.4, transform: `translate(${turn * 3 * progress ** 2}px, ${fall * progress ** 2}px) rotate(${turn * progress ** 2}deg)` };
          }), 600 + index % 3 * 45, "linear");
        }
      }
      const bounds = gallery.getBoundingClientRect();
      for (const [index, photo] of filtered.entries()) {
        const button = buttons.current.get(photo.src)!;
        const column = heights.indexOf(Math.min(...heights));
        const x = column * (tileWidth + gap);
        const y = heights[column];
        const height = tileWidth * photo.height / photo.width;
        Object.assign(button.style, { left: `${x}px`, top: `${y}px`, width: `${tileWidth}px`, height: `${height}px` });
        heights[column] += height + gap;
        const rect = previous.get(photo.src)!;
        const returning = !visible.current.has(photo.src);
        if (!initial) animate(button, [
          { opacity: returning ? 0 : 1, transform: returning ? `translateY(-100px) rotate(${index % 2 ? -8 : 8}deg)` : `translate(${rect.left - bounds.left - x}px, ${rect.top - bounds.top - y}px)` },
          { opacity: 1, transform: "none" },
        ], 650, "cubic-bezier(0.23, 1, 0.32, 1)", returning ? index % 5 * 35 : 100);
      }
      gallery.style.height = `${Math.max(0, ...heights) - (filtered.length ? gap : 0)}px`;
      gallery.dataset.ready = "true";
      visible.current = next;
    };
    layout();
    const observer = new ResizeObserver(() => { if (gallery.clientWidth !== lastWidth) layout(); });
    observer.observe(gallery);
    return () => observer.disconnect();
  }, [photos, filtered]);

  return (
    <>
      <div className="photo-search" role="search" data-empty={!query} data-viewing={active !== null}>
        <svg aria-hidden="true" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
        <div className="photo-search__field">
          <span aria-hidden="true" className="photo-search__prompt">type <span>{["nature", "city", "sunsets", "cafe"].map((word) => <span key={word}>“{word}”</span>)}</span></span>
          <input aria-controls="photo-results" aria-label="Search photographs" autoComplete="off" onChange={(event) => setQuery(event.target.value)} placeholder='type “nature”' spellCheck={false} type="search" value={query} />
        </div>
        {query && <button onClick={() => setQuery("")} type="button">Clear</button>}
        <details className="photo-sort" onKeyDown={(event) => { if (event.key === "Escape") { event.currentTarget.open = false; event.currentTarget.querySelector("summary")?.focus(); } }} ref={sortRef}>
          <summary aria-label={`Sort photos: ${sort}`}><span className="photo-sort__label">Sort by</span>{sort}<svg aria-hidden="true" width="12" height="12" fill="none" viewBox="0 0 12 12"><path d="m3 4.5 3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg></summary>
          <div className="photo-sort__options" role="group" aria-label="Sort photos">
            {["Selected work", "Color", "Photography style"].map((option) => <button aria-pressed={sort === option} key={option} onClick={() => { setSort(option); sortRef.current!.open = false; sortRef.current!.querySelector("summary")?.focus(); }} type="button">{option}<span aria-hidden="true">{sort === option ? "✓" : ""}</span></button>)}
          </div>
        </details>
      </div>
      <p aria-live="polite" className="sr-only" role="status">{filtered.length} photographs{search ? ` matching ${search}` : ""}</p>
      <div className="photo-gallery" id="photo-results" ref={galleryRef}>
        {photos.map((photo) => <button aria-haspopup="dialog" aria-label={`Open ${photo.title}`} className="photo-result" data-photo-src={photo.src} key={photo.src} onClick={() => setActive(filtered.findIndex((item) => item.src === photo.src))} ref={(button) => { if (button) buttons.current.set(photo.src, button); else buttons.current.delete(photo.src); }} type="button">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={photo.title} decoding="async" draggable={false} height={photo.height} loading="lazy" onLoad={(event) => { event.currentTarget.dataset.loaded = "true"; }} ref={(image) => { if (image?.complete && image.naturalWidth) image.dataset.loaded = "true"; }} src={photo.src} width={photo.width} />
        </button>)}
      </div>
      {!filtered.length && <p className="photo-empty">No photographs found.</p>}
      <PhotoLightbox active={active} getThumbnail={(index) => buttons.current.get(filtered[index]?.src) ?? null} onClose={() => setActive(null)} onSelect={setActive} photos={filtered.map((photo) => ({ src: photo.src, label: photo.title, ratio: String(photo.width / photo.height) }))} />
    </>
  );
}
