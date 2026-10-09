"use client";

import { useEffect, useRef, type CSSProperties } from "react";

export interface LightboxPhoto {
  cover: string;
  label: string;
  ratio?: string;
}

interface PhotoLightboxProps {
  active: number | null;
  onClose: () => void;
  onSelect: (index: number) => void;
  photos: LightboxPhoto[];
}

export function PhotoLightbox({ active, onClose, onSelect, photos }: PhotoLightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const photo = active === null ? null : photos[active];

  useEffect(() => {
    if (photo) dialogRef.current?.focus();
  }, [photo]);

  if (!photo || active === null) return null;

  return (
    <dialog
      aria-label={photo.label}
      className="fixed inset-0 z-50 m-0 h-dvh max-h-none w-dvw max-w-none overflow-hidden border-0 p-0 text-ink"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
      open
      ref={dialogRef}
      style={{ backgroundColor: "transparent" }}
      tabIndex={-1}
    >
      <div aria-hidden="true" className="absolute inset-0 bg-paper" />
      <button aria-label="Close photograph" className="absolute inset-0 cursor-default" onClick={onClose} type="button" />
      <button className="absolute right-[clamp(18px,4vw,56px)] top-5 z-10 min-h-11 px-2 text-base text-ink-soft" onClick={onClose} type="button">
        Close
      </button>
      <div
        className="absolute inset-0 z-10 m-auto"
        style={{
          "--photo-ratio": photo.ratio ?? "0.75",
          aspectRatio: "var(--photo-ratio)",
          height: "min(calc((100vw - 48px) / var(--photo-ratio)), calc(100dvh - 144px))",
          width: "min(calc(100vw - 48px), calc((100dvh - 144px) * var(--photo-ratio)))",
        } as CSSProperties}
      >
        <div className="size-full border border-black/10 bg-white p-[14px] shadow-[0_24px_54px_rgba(37,35,30,0.17),0_2px_5px_rgba(37,35,30,0.09)]">
          <div className="size-full" style={{ backgroundImage: photo.cover }} />
        </div>
      </div>
      <nav aria-label="Browse photographs" className="pointer-events-none absolute left-[clamp(12px,3vw,40px)] right-[clamp(12px,3vw,40px)] top-1/2 z-10 flex -translate-y-1/2 justify-between">
        <button
          aria-label="Previous photograph"
          className="pointer-events-auto grid size-11 place-items-center rounded-full bg-white text-ink shadow-[0_4px_14px_rgba(36,35,33,0.12)] disabled:cursor-default disabled:opacity-30"
          disabled={active === 0}
          onClick={() => onSelect(active - 1)}
          type="button"
        >
          <svg aria-hidden="true" className="size-[18px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" viewBox="0 0 24 24"><path d="m15 5-7 7 7 7" /></svg>
        </button>
        <button
          aria-label="Next photograph"
          className="pointer-events-auto grid size-11 place-items-center rounded-full bg-white text-ink shadow-[0_4px_14px_rgba(36,35,33,0.12)] disabled:cursor-default disabled:opacity-30"
          disabled={active === photos.length - 1}
          onClick={() => onSelect(active + 1)}
          type="button"
        >
          <svg aria-hidden="true" className="size-[18px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" /></svg>
        </button>
      </nav>
    </dialog>
  );
}
