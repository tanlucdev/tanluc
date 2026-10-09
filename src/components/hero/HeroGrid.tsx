"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { COLS, ROWS, REVEALS, type Reveal } from "./reveals";

export function HeroGrid() {
  const [discovered, setDiscovered] = useState<number[]>([]);
  const nextStep = discovered.length < REVEALS.length ? discovered.length : -1;

  /* per-cell lookup: which discovered reveal (if any) covers this cell */
  const cellReveal = useMemo(() => {
    const map = new Map<string, Reveal>();
    for (const idx of discovered) {
      const r = REVEALS[idx];
      for (let row = r.region.row; row < r.region.row + r.region.h; row++) {
        for (let col = r.region.col; col < r.region.col + r.region.w; col++) {
          map.set(`${row}-${col}`, r);
        }
      }
    }
    return map;
  }, [discovered]);

  const discover = (idx: number) => {
    if (idx === nextStep) setDiscovered((d) => [...d, idx]);
  };

  const cells = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const reveal = cellReveal.get(`${row}-${col}`);
      const isHint =
        nextStep >= 0 &&
        REVEALS[nextStep].trigger.row === row &&
        REVEALS[nextStep].trigger.col === col;
      /* stagger the flip diagonally within its region */
      const delay = reveal
        ? (row - reveal.region.row + (col - reveal.region.col)) * 45
        : 0;
      cells.push(
        <div
          key={`${row}-${col}`}
          className={`flip-cell relative border-[0.5px] border-ink/5 ${isHint ? "hint-cell" : ""}`}
          onMouseEnter={isHint ? () => discover(nextStep) : undefined}
          onFocus={isHint ? () => discover(nextStep) : undefined}
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
                      backgroundSize: `${reveal.region.w * 100}% ${reveal.region.h * 100}%`,
                      backgroundPosition: `${
                        reveal.region.w > 1
                          ? ((col - reveal.region.col) / (reveal.region.w - 1)) * 100
                          : 0
                      }% ${
                        reveal.region.h > 1
                          ? ((row - reveal.region.row) / (reveal.region.h - 1)) * 100
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
      className="relative overflow-hidden"
      style={{ height: "calc(100vh - 57px)" }}
      aria-label="Interactive introduction grid — hover the glowing squares to explore"
    >
      <div
        className="grid h-full w-full"
        style={{
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        }}
      >
        {cells}
      </div>

      {/* labels for discovered reveals */}
      {discovered.map((idx) => {
        const r = REVEALS[idx];
        return (
          <Link
            key={idx}
            href={r.href}
            className="group absolute z-10 flex flex-col items-start justify-end p-3 text-paper"
            style={{
              left: `${(r.region.col / COLS) * 100}%`,
              top: `${(r.region.row / ROWS) * 100}%`,
              width: `${(r.region.w / COLS) * 100}%`,
              height: `${(r.region.h / ROWS) * 100}%`,
              animation: "fadeIn 0.4s 0.5s both",
            }}
          >
            <span className="font-serif text-lg italic leading-tight drop-shadow group-hover:underline">
              {r.label}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest opacity-80">
              {r.sub}
            </span>
          </Link>
        );
      })}

      {/* center identity — always visible */}
      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-8 text-center">
        <div>
          <h1 className="font-serif text-5xl italic md:text-6xl">Neel Saswade</h1>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.3em] text-ink-soft">
            Senior Product Designer
          </p>
        </div>
      </div>

      {/* progress + scroll hints */}
      <div className="absolute bottom-3 left-4 z-20 font-mono text-[10px] uppercase tracking-widest text-ink-soft">
        {discovered.length === 0
          ? "psst — hover the glowing square"
          : discovered.length === REVEALS.length
            ? "all 8 found. you really get me"
            : `${discovered.length}/${REVEALS.length} found`}
      </div>
      <div className="absolute bottom-3 right-4 z-20 animate-bounce font-mono text-[10px] uppercase tracking-widest text-ink-soft">
        scroll for work ↓
      </div>

    </section>
  );
}
