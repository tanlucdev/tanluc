"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  COLS,
  MOBILE_COLS,
  MOBILE_ROWS,
  REVEALS,
  ROWS,
  type Reveal,
  type RevealLayout,
} from "./reveals";

function layoutFor(reveal: Reveal, isMobile: boolean): RevealLayout {
  return isMobile ? reveal.mobile : reveal;
}

export function HeroGrid() {
  const [discovered, setDiscovered] = useState<number[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const nextStep = discovered.length < REVEALS.length ? discovered.length : -1;

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const cols = isMobile ? MOBILE_COLS : COLS;
  const rows = isMobile ? MOBILE_ROWS : ROWS;
  /* per-cell lookup: which discovered reveal (if any) covers this cell */
  const cellReveal = useMemo(() => {
    const map = new Map<string, { reveal: Reveal; layout: RevealLayout }>();
    for (const idx of discovered) {
      const r = REVEALS[idx];
      const layout = layoutFor(r, isMobile);
      for (let row = layout.region.row; row < layout.region.row + layout.region.h; row++) {
        for (let col = layout.region.col; col < layout.region.col + layout.region.w; col++) {
          map.set(`${row}-${col}`, { reveal: r, layout });
        }
      }
    }
    return map;
  }, [discovered, isMobile]);

  const discover = (idx: number) => {
    if (idx === nextStep) setDiscovered((d) => [...d, idx]);
  };

  const cells = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = cellReveal.get(`${row}-${col}`);
      const reveal = cell?.reveal;
      const layout = cell?.layout;
      const nextLayout =
        nextStep >= 0 ? layoutFor(REVEALS[nextStep], isMobile) : null;
      const isHint =
        nextLayout?.trigger.row === row && nextLayout.trigger.col === col;
      /* stagger the flip diagonally within its region */
      const delay = reveal
        ? (row - layout!.region.row + (col - layout!.region.col)) * 45
        : 0;
      cells.push(
        <div
          key={`${row}-${col}`}
          className={`flip-cell relative border-[0.5px] border-ink/5 ${isHint ? "hint-cell" : ""}`}
          onMouseEnter={isHint ? () => discover(nextStep) : undefined}
          onFocus={isHint ? () => discover(nextStep) : undefined}
          onClick={isHint ? () => discover(nextStep) : undefined}
          onKeyDown={
            isHint
              ? (event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    discover(nextStep);
                  }
                }
              : undefined
          }
          role={isHint ? "button" : undefined}
          tabIndex={isHint ? 0 : -1}
          aria-label={isHint ? "Something is hidden here" : undefined}
        >
          <div
            className="flip-inner"
            data-flipped={Boolean(reveal)}
            style={{ transitionDelay: `${delay}ms` }}
          >
            <div className="flip-face" />
            <div
              className="flip-face flip-back"
              style={
                reveal
                  ? {
                      backgroundImage: reveal.gradient,
                      backgroundSize: `${layout!.region.w * 100}% ${layout!.region.h * 100}%`,
                      backgroundPosition: `${
                        layout!.region.w > 1
                          ? ((col - layout!.region.col) / (layout!.region.w - 1)) * 100
                          : 0
                      }% ${
                        layout!.region.h > 1
                          ? ((row - layout!.region.row) / (layout!.region.h - 1)) * 100
                          : 0
                      }%`,
                    }
                  : undefined
              }
            />
          </div>
        </div>
      );
    }
  }

  return (
    <section
      className="relative aspect-[12/13] min-h-[600px] overflow-hidden md:aspect-auto md:h-[calc(100svh-57px)]"
      aria-label="Interactive introduction grid — hover or tap the glowing squares to explore"
    >
      <div
        className="grid h-full w-full"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {cells}
      </div>

      {/* labels for discovered reveals */}
      {discovered.map((idx) => {
        const r = REVEALS[idx];
        const layout = layoutFor(r, isMobile);
        return (
          <Link
            key={idx}
            href={r.href}
            className="group absolute z-10 flex min-w-0 flex-col items-start justify-end p-2 text-paper sm:p-3"
            style={{
              left: `${(layout.region.col / cols) * 100}%`,
              top: `${(layout.region.row / rows) * 100}%`,
              width: `${(layout.region.w / cols) * 100}%`,
              height: `${(layout.region.h / rows) * 100}%`,
              animation: "fadeIn 0.4s 0.5s both",
            }}
          >
            <span className="font-serif text-lg italic leading-tight drop-shadow group-hover:underline">
              {r.label}
            </span>
            <span className="break-words font-mono text-[10px] uppercase leading-relaxed tracking-widest opacity-80">
              {r.sub}
            </span>
          </Link>
        );
      })}

      {/* center identity — always visible */}
      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-8 text-center">
        <div>
          <h1 className="font-serif text-4xl italic sm:text-5xl md:text-6xl">Tan Luc</h1>
          <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-soft sm:text-[11px] sm:tracking-[0.3em]">
            Software Engineer · Product Builder
          </p>
        </div>
      </div>

      {/* progress + scroll hints */}
      <div className="absolute bottom-3 left-4 z-20 font-mono text-[10px] uppercase tracking-widest text-ink-soft">
        {discovered.length === 0
          ? "hover the glowing square"
          : discovered.length === REVEALS.length
            ? "all stories found"
            : `${discovered.length}/${REVEALS.length} found`}
      </div>
      <div className="absolute bottom-3 right-4 z-20 animate-bounce font-mono text-[10px] uppercase tracking-widest text-ink-soft">
        scroll for work ↓
      </div>

    </section>
  );
}
