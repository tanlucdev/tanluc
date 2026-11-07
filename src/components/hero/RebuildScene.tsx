"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./RebuildScene.module.css";

const agents = [
  { name: "Text", color: "olive", selector: ".meadow-hero__copy > h1, .meadow-hero__copy > p", action: "type" },
  { name: "Layout", color: "clay", selector: ".meadow-hero__interests > span:first-child, .meadow-token", action: "place" },
  { name: "Tree", color: "moss", selector: ".meadow-tree-canvas", action: "draw" },
  { name: "Meadow", color: "sand", selector: ".meadow-ground img, .meadow-grass-canvas, .meadow-actor, .meadow-weather", action: "draw" },
  { name: "Navigation", color: "slate", selector: 'nav[aria-label="Main navigation"] > a, nav[aria-label="Main navigation"] li', action: "trace" },
] as const;
const motionQuery = "(prefers-reduced-motion: no-preference)";
type Point = { x: number; y: number };

function visibleBounds(element: HTMLElement) {
  const bounds = element.getBoundingClientRect();
  if (!(element instanceof HTMLCanvasElement)) return bounds;
  // ponytail: Sample the existing 2D artwork once; WebGL needs an explicit authored box.
  const sample = document.createElement("canvas");
  sample.width = 160;
  sample.height = Math.max(1, Math.round(160 * bounds.height / bounds.width));
  const context = sample.getContext("2d", { willReadFrequently: true });
  if (!context) return bounds;
  try {
    context.drawImage(element, 0, 0, sample.width, sample.height);
    const pixels = context.getImageData(0, 0, sample.width, sample.height).data;
    let left = sample.width, top = sample.height, right = 0, bottom = 0;
    for (let y = 0; y < sample.height; y++) {
      for (let x = 0; x < sample.width; x++) {
        if (pixels[(y * sample.width + x) * 4 + 3] < 24) continue;
        left = Math.min(left, x); top = Math.min(top, y);
        right = Math.max(right, x + 1); bottom = Math.max(bottom, y + 1);
      }
    }
    if (right <= left || bottom <= top) return bounds;
    return new DOMRect(bounds.left + left / sample.width * bounds.width, bounds.top + top / sample.height * bounds.height, (right - left) / sample.width * bounds.width, (bottom - top) / sample.height * bounds.height);
  } catch {
    return bounds;
  }
}

function grassContour(canvas: HTMLCanvasElement): Point[] {
  const bounds = canvas.getBoundingClientRect();
  const sample = document.createElement("canvas");
  sample.width = 96;
  sample.height = Math.max(1, Math.round(96 * bounds.height / bounds.width));
  const context = sample.getContext("2d", { willReadFrequently: true });
  if (!context) return [];
  try {
    context.drawImage(canvas, 0, 0, sample.width, sample.height);
    const pixels = context.getImageData(0, 0, sample.width, sample.height).data;
    const points: Point[] = [];
    for (let column = 0; column <= 12; column++) {
      const x = Math.round(column / 12 * (sample.width - 1));
      for (let y = 0; y < sample.height; y++) {
        if (pixels[(y * sample.width + x) * 4 + 3] < 80) continue;
        points.push({ x: bounds.left + x / (sample.width - 1) * bounds.width, y: bounds.top + y / sample.height * bounds.height - 5 });
        break;
      }
    }
    return points;
  } catch {
    return [];
  }
}

function textSteps(element: HTMLElement) {
  const bounds = element.getBoundingClientRect();
  const steps: { point: Point; clipPath: string; at: number }[] = [];
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
  let node: Node | null;
  let at = 0;
  while ((node = walker.nextNode())) {
    for (const { segment, index } of segmenter.segment(node.textContent ?? "")) {
      range.setStart(node, index);
      range.setEnd(node, index + segment.length);
      const rect = range.getBoundingClientRect();
      if (!rect.width || !rect.height) continue;
      const x = Math.min(bounds.width, rect.right - bounds.left + 1);
      const top = Math.max(0, rect.top - bounds.top - 2);
      const bottom = Math.min(bounds.height, rect.bottom - bounds.top + 2);
      const previous = steps[steps.length - 1];
      if (previous && rect.bottom - 3 > previous.point.y + 4) {
        steps.push({ ...previous, at: at + 30 });
        steps.push({ point: { x: (previous.point.x + rect.left) / 2, y: previous.point.y - 9 }, clipPath: previous.clipPath, at: at + 100 });
        steps.push({ point: { x: rect.left, y: rect.bottom - 3 }, clipPath: previous.clipPath, at: at + 180 });
        at += 180;
      }
      at += /[,.!?]/.test(segment) ? 95 : /\s/.test(segment) ? 24 : 14;
      steps.push({ point: { x: rect.right, y: rect.bottom - 3 }, clipPath: `polygon(0 0, ${bounds.width}px 0, ${bounds.width}px ${top}px, ${x}px ${top}px, ${x}px ${bottom}px, 0 ${bottom}px)`, at });
    }
  }
  return steps;
}

export default function RebuildScene() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stopRef = useRef<() => void>(() => {});
  const [running, setRunning] = useState(false);
  const [complete, setComplete] = useState(false);
  const [finishedCount, setFinishedCount] = useState(0);

  useEffect(() => {
    if (!running) return;
    const dialog = dialogRef.current;
    const hero = dialog?.closest(".meadow-hero");
    const media = window.matchMedia(motionQuery);
    if (!dialog || !hero || !media.matches) { setRunning(false); return; }

    const animations: Animation[] = [];
    const scrollY = window.scrollY;
    const overflow = document.documentElement.style.overflow;
    let timer = 0;
    let stopped = false;
    const stop = () => {
      if (stopped) return;
      stopped = true;
      window.clearTimeout(timer);
      animations.forEach((animation) => animation.cancel());
      animations.length = 0;
      stopRef.current = () => {};
      dialog.close();
      document.documentElement.style.overflow = overflow;
      hero.removeAttribute("data-rebuilding");
      window.scrollTo({ top: scrollY, behavior: "instant" });
      setRunning(false);
    };
    stopRef.current = stop;
    const visibility = () => { if (document.hidden) stop(); };
    window.addEventListener("resize", stop);
    window.addEventListener("pagehide", stop);
    document.addEventListener("visibilitychange", visibility);
    media.addEventListener("change", stop);

    try {
      window.dispatchEvent(new Event("portfolio:welcome-gust-stop"));
      window.scrollTo({ top: 0, behavior: "instant" });
      document.documentElement.style.overflow = "hidden";
      hero.setAttribute("data-rebuilding", "true");
      dialog.showModal();

      // ponytail: Animate the authored hero and navigation in place; other pages need their own task selectors.
      const compact = window.matchMedia("(max-width: 700px), (max-height: 599px), (pointer: coarse)").matches;
      const cursors = dialog.querySelectorAll<HTMLElement>("[data-rebuild-cursor]");
      const selections = dialog.querySelectorAll<HTMLElement>("[data-rebuild-selection]");
      const trigger = hero.querySelector("button[aria-haspopup='dialog']")!.getBoundingClientRect();
      const now = document.timeline.currentTime;
      const animate = (element: Element, frames: Keyframe[], options: KeyframeAnimationOptions) => {
        const animation = element.animate(frames, options);
        animation.startTime = now;
        animations.push(animation);
        return animation;
      };
      const lanes: { frames: Keyframe[]; labelFrames: Keyframe[]; states: { at: number; mode: "move" | "work" | "ready" }[]; position: Point; workEnd: number }[] = [];
      let finishAt = 0;
      agents.forEach((agent, index) => {
        const pieces = Array.from(document.querySelectorAll<HTMLElement>(agent.selector)).filter((piece) => {
          const style = getComputedStyle(piece);
          return style.opacity !== "0" && style.visibility !== "hidden" && piece.getBoundingClientRect().width > 0;
        });
        const originalOpacities = new Map(pieces.map((piece) => [piece, getComputedStyle(piece).opacity]));
        pieces.forEach((piece) => animate(piece, [{ opacity: originalOpacities.get(piece) }, { opacity: 0 }], { duration: 180, fill: "forwards" }));
        const tokens = pieces.filter((piece) => piece.matches(".meadow-token"));
        const tokenBounds = tokens.map((piece) => piece.getBoundingClientRect());
        const stack = tokens.length ? { x: Math.min(innerWidth - 90, tokenBounds[tokens.length - 1].right + (compact ? 24 : 62)), y: tokenBounds[0].top + 7 } : { x: 0, y: 0 };
        tokens.forEach((token, tokenIndex) => {
          const bounds = tokenBounds[tokenIndex];
          const translate = `${stack.x + tokenIndex * 4 - bounds.left}px ${stack.y + tokenIndex * 3 - bounds.top}px`;
          const rotate = `${-9 + tokenIndex * 7}deg`;
          animate(token, [{ opacity: 0, translate, rotate, scale: ".94" }, { opacity: originalOpacities.get(token), translate, rotate, scale: "1" }], { delay: 300, duration: 220, fill: "forwards" });
        });
        const cursorFrames: Keyframe[] = [];
        const labelFrames: Keyframe[] = [];
        const label = cursors[index].querySelector<HTMLElement>("[data-cursor-label]")!;
        const labelBox = { left: label.offsetLeft, top: label.offsetTop, width: label.offsetWidth, height: label.offsetHeight };
        const states: { at: number; mode: "move" | "work" | "ready" }[] = [{ at: 0, mode: "move" }];
        let position = { x: trigger.right + index * 14, y: trigger.bottom + 10 + index * 9 };
        let time = 300 + (compact ? [0, 450, 1100, 1500, 200][index] : index * 95);
        const frame = (point: Point, at: number, opacity = 1) => {
          cursorFrames.push({ transform: `translate3d(${point.x}px, ${point.y}px, 0)`, opacity, offset: at });
          const x = Math.max(8 - point.x - labelBox.left, Math.min(0, innerWidth - 8 - point.x - labelBox.left - labelBox.width));
          const y = Math.max(8 - point.y - labelBox.top, Math.min(0, innerHeight - 8 - point.y - labelBox.top - labelBox.height));
          labelFrames.push({ transform: `translate3d(${x}px, ${y}px, 0)`, offset: at });
        };
        frame(position, 0, 0);
        frame(position, time);
        const move = (target: Point) => {
          const start = position;
          const dx = target.x - start.x, dy = target.y - start.y;
          const distance = Math.hypot(dx, dy);
          const duration = Math.min(compact ? 380 : 540, 170 + distance * 0.42);
          const bend = Math.min(compact ? 24 : 85, distance * 0.16) * (index % 2 ? -1 : 1);
          const control = { x: (start.x + target.x) / 2 - dy / (distance || 1) * bend, y: (start.y + target.y) / 2 + dx / (distance || 1) * bend };
          for (let step = 1; step <= 18; step++) {
            const t = step / 18;
            const eased = 1 - Math.pow(1 - t, 3);
            const u = 1 - eased;
            frame({ x: u * u * start.x + 2 * u * eased * control.x + eased * eased * target.x, y: u * u * start.y + 2 * u * eased * control.y + eased * eased * target.y }, time + duration * t);
          }
          time += duration;
          position = target;
        };
        pieces.forEach((piece) => {
          const originalOpacity = originalOpacities.get(piece)!;
          const bounds = visibleBounds(piece);
          const elementBounds = piece.getBoundingClientRect();
          const contour = piece instanceof HTMLCanvasElement && piece.matches(".meadow-grass-canvas") ? grassContour(piece) : [];
          if (piece.matches(".meadow-token")) {
            const tokenIndex = tokens.indexOf(piece);
            const start = { x: stack.x + tokenIndex * 4 + bounds.width / 2, y: stack.y + tokenIndex * 3 + bounds.height / 2 };
            const end = { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };
            move(start);
            time += 90;
            frame(position, time);
            states.push({ at: time, mode: "work" });
            const duration = 620;
            const frames: Keyframe[] = [];
            for (let step = 0; step <= 16; step++) {
              const t = step / 16;
              const eased = 1 - Math.pow(1 - t, 3);
              const point = { x: start.x + (end.x - start.x) * eased, y: start.y + (end.y - start.y) * eased - Math.sin(Math.PI * eased) * 24 };
              frames.push({ opacity: originalOpacity, translate: `${point.x - end.x}px ${point.y - end.y}px`, rotate: `${(-9 + tokenIndex * 7) * (1 - eased)}deg`, scale: "1", offset: t });
              frame(point, time + duration * t);
            }
            animate(piece, frames, { delay: time, duration, fill: "forwards" });
            animate(dialog.querySelector("[data-icon-alignment]")!, [
              { left: `${tokenBounds[0].left}px`, top: `${bounds.bottom + 7}px`, width: `${tokenBounds[tokens.length - 1].right - tokenBounds[0].left}px`, opacity: 0 },
              { left: `${tokenBounds[0].left}px`, top: `${bounds.bottom + 7}px`, width: `${tokenBounds[tokens.length - 1].right - tokenBounds[0].left}px`, opacity: 0.65, offset: 0.3 },
              { left: `${tokenBounds[0].left}px`, top: `${bounds.bottom + 7}px`, width: `${tokenBounds[tokens.length - 1].right - tokenBounds[0].left}px`, opacity: 0 },
            ], { delay: time + duration - 100, duration: 420 });
            time += duration;
            position = end;
          } else if (contour.length > 1) {
            const svg = dialog.querySelector<SVGSVGElement>("[data-terrain]")!;
            const path = svg.querySelector("path")!;
            svg.setAttribute("viewBox", `0 0 ${innerWidth} ${innerHeight}`);
            let d = `M${contour[0].x},${contour[0].y}`;
            for (let point = 1; point < contour.length - 1; point++) {
              d += ` Q${contour[point].x},${contour[point].y} ${(contour[point].x + contour[point + 1].x) / 2},${(contour[point].y + contour[point + 1].y) / 2}`;
            }
            d += ` T${contour[contour.length - 1].x},${contour[contour.length - 1].y}`;
            path.setAttribute("d", d);
            const length = path.getTotalLength();
            const start = path.getPointAtLength(0);
            move(start);
            time += 100;
            frame(position, time);
            states.push({ at: time, mode: "work" });
            const duration = 1400;
            animate(path, [{ strokeDashoffset: "1" }, { strokeDashoffset: "0" }], { delay: time, duration, fill: "forwards" });
            animate(svg, [{ opacity: 0 }, { opacity: 0.8, offset: 0.1 }, { opacity: 0.8, offset: 0.75 }, { opacity: 0 }], { delay: time, duration: duration + 650 });
            svg.querySelectorAll("circle").forEach((anchor, anchorIndex) => {
              const point = path.getPointAtLength(length * anchorIndex / 4);
              anchor.setAttribute("cx", String(point.x));
              anchor.setAttribute("cy", String(point.y));
              animate(anchor, [{ opacity: 0 }, { opacity: 1, offset: 0.1 }, { opacity: 1 }], { delay: time + duration * anchorIndex / 4, duration: 180, fill: "forwards" });
            });
            for (let step = 0; step <= 48; step++) frame(path.getPointAtLength(length * step / 48), time + duration * step / 48);
            animate(piece, [{ opacity: originalOpacity, clipPath: "inset(0 100% 0 0)" }, { opacity: originalOpacity, clipPath: "inset(0 0 0 0)" }], { delay: time + 300, duration, fill: "forwards" });
            time += duration + 300;
            position = path.getPointAtLength(length);
          } else if (agent.action === "type") {
            const steps = textSteps(piece);
            if (!steps.length) return;
            const start = { x: bounds.left, y: steps[0].point.y };
            move(start);
            time += 110;
            frame(position, time);
            const duration = steps[steps.length - 1].at;
            states.push({ at: time, mode: "work" });
            animate(piece, [
              { opacity: originalOpacity, clipPath: "polygon(0 0, 0 0, 0 0, 0 0, 0 0, 0 0)", offset: 0, easing: "steps(1, end)" },
              ...steps.map((step) => ({ opacity: originalOpacity, clipPath: step.clipPath, offset: step.at / duration, easing: "steps(1, end)" })),
            ], { delay: time, duration, fill: "forwards" });
            for (const step of steps) frame(step.point, time + step.at);
            time += duration;
            position = steps[steps.length - 1].point;
          } else if (agent.action === "trace") {
            const baseline = Math.max(...pieces.map((item) => item.getBoundingClientRect().bottom)) + 7;
            const start = { x: bounds.left, y: baseline };
            const end = { x: bounds.right, y: baseline };
            move(start);
            time += 80;
            frame(position, time);
            states.push({ at: time, mode: "work" });
            const duration = 420 + bounds.width * 1.8;
            animate(selections[index], [
              { left: `${bounds.left}px`, top: `${baseline}px`, width: `${bounds.width}px`, height: "1px", transform: "scaleX(0)", opacity: 0.6 },
              { left: `${bounds.left}px`, top: `${baseline}px`, width: `${bounds.width}px`, height: "1px", transform: "scaleX(1)", opacity: 0.6, offset: 0.72 },
              { left: `${bounds.left}px`, top: `${baseline}px`, width: `${bounds.width}px`, height: "1px", transform: "scaleX(1)", opacity: 0 },
            ], { delay: time, duration: duration + 220 });
            animate(piece, [
              { opacity: 0, translate: "0 6px", clipPath: "inset(100% 0 0 0)" },
              { opacity: originalOpacity, translate: "0 0", clipPath: "inset(0 0 0 0)" },
            ], { delay: time + 90, duration: duration - 90, fill: "forwards", easing: "cubic-bezier(.22, 1, .36, 1)" });
            frame(end, time + duration * 0.72);
            frame(end, time + duration);
            time += duration;
            position = end;
          } else {
            const start = { x: bounds.left, y: bounds.top };
            const end = { x: Math.min(bounds.right, innerWidth - 24), y: Math.min(bounds.bottom, innerHeight - 24) };
            move(start);
            time += 100;
            frame(position, time);
            states.push({ at: time, mode: "work" });
            animate(cursors[index].querySelector("[data-cursor-click]")!, [
              { transform: "scale(.4)", opacity: 0 },
              { transform: "scale(1)", opacity: 0.45, offset: 0.3 },
              { transform: "scale(1.8)", opacity: 0 },
            ], { delay: time, duration: 240 });
            const duration = agent.action === "place" ? 380 : Math.min(1250, 500 + Math.hypot(bounds.width, bounds.height) * 0.45);
            const inset = (point: Point) => `inset(${Math.max(0, bounds.top - elementBounds.top)}px ${Math.max(0, elementBounds.right - point.x)}px ${Math.max(0, elementBounds.bottom - point.y)}px ${Math.max(0, bounds.left - elementBounds.left)}px)`;
            animate(piece, [
              { opacity: originalOpacity, clipPath: inset(start) },
              { opacity: originalOpacity, clipPath: inset(end), offset: 0.86 },
              { opacity: originalOpacity, clipPath: "inset(0 0 0 0)" },
            ], { delay: time, duration, fill: "forwards", easing: "linear" });
            animate(selections[index], [
              { left: `${bounds.left}px`, top: `${bounds.top}px`, width: `${bounds.width}px`, height: `${bounds.height}px`, clipPath: "inset(0 100% 100% 0)", opacity: 0.7, offset: 0 },
              { left: `${bounds.left}px`, top: `${bounds.top}px`, width: `${bounds.width}px`, height: `${bounds.height}px`, clipPath: "inset(0 0 0 0)", opacity: 0.7, offset: 0.7 },
              { left: `${bounds.left}px`, top: `${bounds.top}px`, width: `${bounds.width}px`, height: `${bounds.height}px`, clipPath: "inset(0 0 0 0)", opacity: 0, offset: 1 },
            ], { delay: time, duration: duration + 250, fill: "none" });
            frame(start, time);
            frame(end, time + duration * 0.86);
            frame(end, time + duration);
            time += duration;
            position = end;
          }
          states.push({ at: time, mode: "move" });
          time += 170;
          frame(position, time);
        });
        const workEnd = time;
        states.push({ at: time, mode: "ready" });
        const spacing = Math.min(125, (innerWidth - 160) / (agents.length - 1));
        move(compact
          ? { x: 16 + index * (innerWidth - 64) / agents.length, y: innerHeight - 150 + (index % 2) * 28 }
          : { x: (innerWidth - (agents.length - 1) * spacing - 130) / 2 + index * spacing, y: innerHeight - 138 - (index % 2) * 10 });
        lanes.push({ frames: cursorFrames, labelFrames, states, position, workEnd });
        finishAt = Math.max(finishAt, time);
      });
      const duration = finishAt + 450;
      lanes.forEach((lane, index) => {
        const transform = `translate3d(${lane.position.x}px, ${lane.position.y}px, 0)`;
        lane.frames.push({ transform, opacity: 1, offset: finishAt + 120 });
        lane.frames.push({ transform: `translate3d(${lane.position.x + 14}px, ${lane.position.y - 10}px, 0)`, opacity: 0, offset: duration });
        lane.labelFrames.push({ ...lane.labelFrames[lane.labelFrames.length - 1], offset: duration });
        for (const keyframe of [...lane.frames, ...lane.labelFrames]) keyframe.offset = Number(keyframe.offset) / duration;
        animate(cursors[index].querySelector("[data-cursor-label]")!, lane.labelFrames, { duration, fill: "none", easing: "linear" });
        animate(cursors[index], lane.frames, { duration, fill: "none", easing: "linear" });
        for (const mode of ["move", "work"] as const) {
          const frames = lane.states.map((state) => ({ opacity: state.mode === mode ? 1 : 0, offset: state.at / duration, easing: "steps(1, end)" }));
          frames.push({ opacity: 0, offset: 1, easing: "steps(1, end)" });
          animate(cursors[index].querySelector(`[data-cursor-state="${mode}"]`)!, frames, { duration, fill: "forwards" });
        }
        const toolFrames = lane.states.map((state) => ({ opacity: state.mode === "work" ? 1 : 0, offset: state.at / duration, easing: "steps(1, end)" }));
        toolFrames.push({ opacity: 0, offset: 1, easing: "steps(1, end)" });
        animate(cursors[index].querySelector("[data-cursor-tool]")!, toolFrames, { duration, fill: "forwards" });
        animate(cursors[index].querySelector("[data-cursor-arrow]")!, toolFrames.map((frame) => ({ ...frame, opacity: 1 - frame.opacity })), { duration, fill: "forwards" });
        void animate(cursors[index].querySelector('[data-cursor-state="ready"]')!, [{ opacity: 0 }, { opacity: 1 }], { delay: lane.workEnd, duration: 1, fill: "forwards" }).finished.then(() => {
          if (!stopped) setFinishedCount((count) => count + 1);
        }).catch(() => {});
      });
      const progress = dialog.querySelector("[data-rebuild-progress]")!;
      void animate(progress, [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: finishAt, fill: "forwards" }).finished.then(() => {
        if (stopped) return;
        setComplete(true);
        timer = window.setTimeout(stop, 1200);
      }).catch(() => {});
    } catch {
      stop();
    }

    return () => {
      stop();
      window.removeEventListener("resize", stop);
      window.removeEventListener("pagehide", stop);
      document.removeEventListener("visibilitychange", visibility);
      media.removeEventListener("change", stop);
    };
  }, [running]);

  return (
    <div className={styles.rebuild} onPointerDown={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
      <button className={styles.trigger} type="button" onClick={() => { setComplete(false); setFinishedCount(0); setRunning(true); }} aria-haspopup="dialog" aria-expanded={running}>
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M15.7 7A6 6 0 1 0 16 12M15.7 3v4h-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Rebuild this scene
      </button>
      <dialog ref={dialogRef} className={styles.dialog} aria-label="Rebuilding the introductory scene" onCancel={(event) => { event.preventDefault(); stopRef.current(); }}>
        {agents.map((agent) => <span key={agent.name} className={`${styles.cursor} ${styles[agent.color]}`} data-rebuild-cursor data-rebuild-agent={agent.name} aria-hidden="true">
          <svg className={styles.glyph} data-cursor-arrow width="22" height="27" viewBox="0 0 22 27" fill="none"><path d="M3 2v20l5-6 7 1L3 2Z" fill="currentColor" stroke="var(--paper)" strokeWidth="1.5" strokeLinejoin="round" /></svg>
          <svg className={styles.tool} data-cursor-tool width="22" height="27" viewBox="0 0 22 27" fill="none"><path d={agent.action === "type" ? "M0 -8h6M3 -8v18M0 10h6" : (agent.action === "trace" || agent.name === "Meadow") ? "M-3 9 0 -4 5 -7 8 -2 1 9ZM0 -4 8 -2M1 9 3 1" : "M3 -8v20M-7 2h20"} stroke="var(--paper)" strokeWidth="3.5" /><path d={agent.action === "type" ? "M0 -8h6M3 -8v18M0 10h6" : (agent.action === "trace" || agent.name === "Meadow") ? "M-3 9 0 -4 5 -7 8 -2 1 9ZM0 -4 8 -2M1 9 3 1" : "M3 -8v20M-7 2h20"} stroke="currentColor" strokeWidth="1.5" /></svg>
          <span className={styles.click} data-cursor-click />
          <span className={styles.cursorLabel} data-cursor-label><span>{agent.name}</span><span className={styles.activity}>
            <i data-cursor-state="move">Moving</i>
            <i data-cursor-state="work">{agent.action === "type" ? "Typing" : agent.action === "place" ? "Arranging" : agent.action === "trace" ? "Lettering" : agent.name === "Meadow" ? "Landscaping" : "Placing"}</i>
            <i data-cursor-state="ready">Ready</i>
          </span></span>
        </span>)}
        {agents.map((agent) => <span key={agent.name} className={`${styles.selection} ${styles[agent.color]} ${agent.action === "trace" ? styles.trace : ""}`} data-rebuild-selection aria-hidden="true" />)}
        <span className={`${styles.selection} ${styles.clay} ${styles.trace} ${styles.alignment}`} data-icon-alignment aria-hidden="true" />
        <svg className={styles.terrain} data-terrain aria-hidden="true"><path pathLength="1" />{[0, 1, 2, 3, 4].map((anchor) => <circle key={anchor} r="3" />)}</svg>
        <div className={styles.controls}>
          <span className={styles.agentDots} aria-hidden="true">{agents.map((agent) => <i key={agent.name} className={styles[agent.color]} />)}</span>
          <span className={styles.progress} aria-hidden="true"><i data-rebuild-progress /></span>
          <span role="status">{complete ? "Scene complete" : finishedCount === agents.length ? "Finishing the scene…" : `${agents.length - finishedCount} ${agents.length - finishedCount === 1 ? "agent" : "agents"} building this scene…`}</span>
          <button type="button" autoFocus onClick={() => stopRef.current()}>{complete ? "Done" : "Skip"} <kbd>Esc</kbd></button>
        </div>
      </dialog>
    </div>
  );
}
