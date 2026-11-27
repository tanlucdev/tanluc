"use client";

import { useLayoutEffect, useRef, type CSSProperties } from "react";

interface LightboxPhoto {
  label: string;
  ratio: string;
  src: string;
  thumbnail: string;
}

interface PhotoLightboxProps {
  active: number | null;
  framed?: boolean;
  getReturnBounds?: (thumbnail: HTMLElement) => DOMRect | null;
  getThumbnail?: (index: number) => HTMLElement | null;
  onClose: () => void;
  onSelect: (index: number) => void;
  photos: LightboxPhoto[];
}

export function PhotoLightbox(props: PhotoLightboxProps) {
  if (props.active === null || !props.photos[props.active]) return null;
  return <OpenPhoto {...props} active={props.active} />;
}

function zoomTransform(source: DOMRect, target: DOMRect, framed: boolean) {
  const scaleX = source.width / target.width;
  const scaleY = source.height / target.height;
  if (!framed) return `translate(${source.left - target.left}px, ${source.top - target.top}px) scale(${scaleX}, ${scaleY})`;
  const scale = Math.min(scaleX, scaleY);
  const x = source.left - target.left + (source.width - target.width * scale) / 2;
  const y = source.top - target.top + (source.height - target.height * scale) / 2;
  return `translate(${x}px, ${y}px) scale(${scale})`;
}

function OpenPhoto({ active, framed = true, getReturnBounds, getThumbnail, onClose, onSelect, photos }: PhotoLightboxProps & { active: number }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const thumbnail = useRef<HTMLElement | null>(null);
  const opened = useRef(false);
  const closing = useRef(false);
  const photo = photos[active];
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

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
    if (closing.current) return;
    const media = mediaRef.current!;
    if (thumbnail.current) thumbnail.current.style.visibility = "";
    const source = getThumbnail?.(active) ?? (!opened.current ? trigger.current : null);
    thumbnail.current = source;
    media.getAnimations().forEach((animation) => animation.cancel());
    if (!reduced()) {
      media.animate([
        { transform: !opened.current && source ? zoomTransform(source.getBoundingClientRect(), media.getBoundingClientRect(), framed) : "translateY(12px) scale(0.98)", opacity: !framed && !opened.current && source ? 1 : 0 },
        { transform: "none", opacity: 1 },
      ], { duration: !opened.current ? 600 : 240, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
    }
    if (!framed) source?.style.setProperty("visibility", "hidden");
    opened.current = true;
  }, [active, framed, getThumbnail, photo.ratio]);

  const close = async () => {
    if (closing.current) return;
    closing.current = true;
    if (!reduced()) {
      const media = mediaRef.current!;
      const paper = thumbnail.current;
      const source = paper && (getReturnBounds ? getReturnBounds(paper) : paper.getBoundingClientRect());
      const { transform, opacity } = getComputedStyle(media);
      media.getAnimations().forEach((animation) => animation.cancel());
      const animation = media.animate([
        { transform, opacity },
        { transform: source ? zoomTransform(source, media.getBoundingClientRect(), framed) : "scale(0.98)", opacity: !framed && source ? 1 : 0 },
      ], { duration: 420, easing: "cubic-bezier(0.23, 1, 0.32, 1)", fill: "both" });
      dialogRef.current!.querySelectorAll(".photo-lightbox__backdrop, .photo-lightbox__controls").forEach((element) => {
        const { opacity } = getComputedStyle(element);
        element.animate([{ opacity }, { opacity: 0 }], { duration: 360, fill: "both" });
      });
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
      <div className={`photo-lightbox__media${framed ? " photo-lightbox__media--print" : ""}`} ref={mediaRef} style={{ "--photo-ratio": photo.ratio } as CSSProperties}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={photo.label} className="photo-lightbox__preview" draggable={false} src={photo.thumbnail} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" aria-hidden="true" className="photo-lightbox__full" draggable={false} key={photo.src} onLoad={(event) => {
          const image = event.currentTarget;
          void image.decode().then(() => {
            if (image.isConnected) image.dataset.decoded = "true";
          }).catch(() => {});
        }} src={photo.src} />
      </div>
      <nav aria-label="Browse photographs" className="photo-lightbox__navigation photo-lightbox__controls">
        <button aria-label="Previous photograph" disabled={active === 0} onClick={() => { if (!closing.current) onSelect(active - 1); }} type="button"><svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" viewBox="0 0 24 24"><path d="m15 5-7 7 7 7" /></svg></button>
        <button aria-label="Next photograph" disabled={active === photos.length - 1} onClick={() => { if (!closing.current) onSelect(active + 1); }} type="button"><svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" /></svg></button>
      </nav>
      <button autoFocus className="photo-lightbox__close photo-lightbox__controls" onClick={() => void close()} type="button">Close</button>
    </dialog>
  );
}
