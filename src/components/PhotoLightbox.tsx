"use client";

import { useLayoutEffect, useRef, type CSSProperties } from "react";

export interface LightboxPhoto {
  cover?: string;
  label: string;
  ratio?: string;
  src?: string;
}

interface PhotoLightboxProps {
  active: number | null;
  getThumbnail?: (index: number) => HTMLElement | null;
  onClose: () => void;
  onSelect: (index: number) => void;
  photos: LightboxPhoto[];
}

export function PhotoLightbox(props: PhotoLightboxProps) {
  if (props.active === null || !props.photos[props.active]) return null;
  return <OpenPhoto {...props} active={props.active} />;
}

function OpenPhoto({ active, getThumbnail, onClose, onSelect, photos }: PhotoLightboxProps & { active: number }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const thumbnail = useRef<HTMLElement | null>(null);
  const opened = useRef(false);
  const closing = useRef(false);
  const photo = photos[active];
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const zoomTransform = (source: DOMRect, target: DOMRect) => `translate(${source.left - target.left}px, ${source.top - target.top}px) scale(${source.width / target.width}, ${source.height / target.height})`;

  useLayoutEffect(() => {
    const dialog = dialogRef.current!;
    trigger.current = document.activeElement as HTMLElement;
    const root = document.documentElement;
    const overflow = root.style.overflow;
    const gutter = root.style.scrollbarGutter;
    root.style.scrollbarGutter = "stable";
    root.style.overflow = "hidden";
    dialog.showModal();
    return () => {
      dialog.close();
      opened.current = false;
      root.style.overflow = overflow;
      root.style.scrollbarGutter = gutter;
      if (thumbnail.current) thumbnail.current.style.visibility = "";
      if (trigger.current?.isConnected) trigger.current.focus({ preventScroll: true });
    };
  }, []);

  useLayoutEffect(() => {
    const media = mediaRef.current!;
    if (thumbnail.current) thumbnail.current.style.visibility = "";
    const source = getThumbnail?.(active) ?? (!opened.current ? trigger.current : null);
    thumbnail.current = source;
    const sourceImage = source?.querySelector("img");
    media.style.setProperty("--photo-ratio", photo.ratio ?? String(sourceImage?.naturalWidth && sourceImage.naturalHeight ? sourceImage.naturalWidth / sourceImage.naturalHeight : 0.75));
    media.getAnimations().forEach((animation) => animation.cancel());
    if (!reduced()) {
      media.animate([
        { transform: !opened.current && source ? zoomTransform(source.getBoundingClientRect(), media.getBoundingClientRect()) : "translateY(12px) scale(0.98)", opacity: !opened.current && source ? 1 : 0 },
        { transform: "none", opacity: 1 },
      ], { duration: !opened.current ? 600 : 240, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
    }
    source?.style.setProperty("visibility", "hidden");
    opened.current = true;
  }, [active, getThumbnail, photo.ratio]);

  const close = async () => {
    if (closing.current) return;
    closing.current = true;
    if (!reduced()) {
      const media = mediaRef.current!;
      const source = thumbnail.current?.getBoundingClientRect();
      media.getAnimations().forEach((animation) => animation.cancel());
      const animation = media.animate([{ transform: "none", opacity: 1 }, { transform: source ? zoomTransform(source, media.getBoundingClientRect()) : "scale(0.98)", opacity: source ? 1 : 0 }], { duration: 420, easing: "cubic-bezier(0.23, 1, 0.32, 1)", fill: "forwards" });
      dialogRef.current!.querySelectorAll(".photo-lightbox__backdrop, .photo-lightbox__controls").forEach((element) => element.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 360, fill: "forwards" }));
      await animation.finished.catch(() => {});
    }
    onClose();
  };

  return (
    <dialog aria-label={photo.label} aria-modal="true" className="photo-lightbox" onCancel={(event) => { event.preventDefault(); void close(); }} onKeyDown={(event) => {
      if (closing.current) return;
      if (event.key === "ArrowLeft" && active > 0) { event.preventDefault(); onSelect(active - 1); }
      if (event.key === "ArrowRight" && active < photos.length - 1) { event.preventDefault(); onSelect(active + 1); }
    }} ref={dialogRef} tabIndex={-1}>
      <div aria-hidden="true" className="photo-lightbox__backdrop" />
      <button aria-label="Close photograph" className="photo-lightbox__dismiss" onClick={() => void close()} tabIndex={-1} type="button" />
      <div className="photo-lightbox__media photo-lightbox__media--print" ref={mediaRef} style={{ "--photo-ratio": photo.ratio ?? "0.75" } as CSSProperties}>
        {photo.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt={photo.label} draggable={false} onLoad={(event) => {
            if (!photo.ratio) mediaRef.current?.style.setProperty("--photo-ratio", String(event.currentTarget.naturalWidth / event.currentTarget.naturalHeight));
          }} src={photo.src} />
        ) : <div className="size-full" style={{ backgroundImage: photo.cover }} />}
      </div>
      <nav aria-label="Browse photographs" className="photo-lightbox__navigation photo-lightbox__controls">
        <button aria-label="Previous photograph" disabled={active === 0} onClick={() => { if (!closing.current) onSelect(active - 1); }} type="button"><svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" viewBox="0 0 24 24"><path d="m15 5-7 7 7 7" /></svg></button>
        <button aria-label="Next photograph" disabled={active === photos.length - 1} onClick={() => { if (!closing.current) onSelect(active + 1); }} type="button"><svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" /></svg></button>
      </nav>
      <button autoFocus className="photo-lightbox__close photo-lightbox__controls" onClick={() => void close()} type="button">Close</button>
    </dialog>
  );
}
