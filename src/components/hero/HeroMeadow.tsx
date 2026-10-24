"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

type Activity = "photo" | "bike" | "walk";
type Pointer = { x: number; y: number; active: boolean };
type Terrain = { yAt: (x: number, width: number, height: number) => number };

const activityCube = {
  photo: { rest: "photographer.webp", selected: "photographer_corrected.webp" },
  bike: { rest: "cyclist.webp", selected: "cyclist_corrected.webp" },
  walk: { rest: "hiker.webp", selected: "hiker-corrected.webp" },
} as const;

const clamp = (value: number, minimum: number, maximum: number) => Math.max(minimum, Math.min(maximum, value));
const smootherstep = (value: number) => value * value * value * (value * (value * 6 - 15) + 10);

const actors = {
  photo: { label: "Photography", frames: Array.from({ length: 5 }, (_, index) => `/images/home/photographer-frame-${index + 1}.png`), foot: 0.98, direction: 1, nativeFacing: 1, speed: 0, speedMin: 0, speedMax: 0, turnDuration: 0, tilt: 0, cadence: 14 },
  bike: { label: "Cycling", frames: Array.from({ length: 3 }, (_, index) => `/images/home/bike-rider-frame-${index + 1}.png`), foot: 0.985, direction: 1, nativeFacing: 1, speed: 0.068, speedMin: 60, speedMax: 92, turnDuration: 260, tilt: 0.34, cadence: 9 },
  walk: { label: "Backpacking", frames: Array.from({ length: 3 }, (_, index) => `/images/home/backpacker-frame-${index + 1}.png`), foot: 0.99, direction: -1, nativeFacing: -1, speed: 0.038, speedMin: 34, speedMax: 52, turnDuration: 240, tilt: 0.07, cadence: 9 },
} as const;

function useMeadowTerrain() {
  const terrain = useRef<Terrain>({ yAt: (_x, _width, height) => height * 0.78 });

  useEffect(() => {
    const image = new Image();
    image.decoding = "async";
    image.src = "/images/home/grass.png";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) return;

      context.drawImage(image, 0, 0);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      const surface = new Float32Array(canvas.width);
      for (let x = 0; x < canvas.width; x += 1) {
        let y = Math.floor(canvas.height * 0.52);
        for (; y < canvas.height; y += 1) {
          if (pixels[(y * canvas.width + x) * 4 + 3] > 28) break;
        }
        surface[x] = y / canvas.height;
      }

      terrain.current = {
        yAt: (x, width, height) => {
          const meadowWidth = window.matchMedia("(max-width: 700px)").matches ? 680 : Math.max(width, 1280);
          const meadowHeight = meadowWidth * (canvas.height / canvas.width);
          const meadowLeft = (width - meadowWidth) / 2;
          const sourceX = clamp(Math.round(((x - meadowLeft) / meadowWidth) * (canvas.width - 1)), 0, canvas.width - 1);
          const unscaledY = height - meadowHeight + surface[sourceX] * meadowHeight;
          // Matches the original artwork registration before vertical compression.
          return clamp(height + (unscaledY + meadowHeight * 0.1505 - height) * 0.84, 0, height);
        },
      };
    };
  }, []);

  return terrain;
}

function MeadowCanvas({ pointer, terrain }: { pointer: RefObject<Pointer>; terrain: RefObject<Terrain> }) {
  const treeRef = useRef<HTMLCanvasElement>(null);
  const grassRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const treeCanvas = treeRef.current;
    const grassCanvas = grassRef.current;
    const cursor = cursorRef.current;
    if (!treeCanvas || !grassCanvas || !cursor) return;

    const tree = new Image();
    tree.decoding = "async";
    tree.src = "/images/home/tree.png";
    const grass = new Image();
    grass.decoding = "async";
    const texture = document.createElement("canvas");
    const groundCache = document.createElement("canvas");
    type Blade = { x: number; y: number; length: number; lean: number; width: number; flex: number; color: string };
    let groundBlades: Blade[] = [];
    let crest: Blade[] = [];
    let tips: Blade[] = [];
    const groundCells = new Map<string, Blade[]>();
    let contacts: { x: number; y: number; radius: number; at: number; direction: number; strength: number }[] = [];
    let contactAt = 0;
    const windField = Array.from({ length: 65 }, () => ({ bend: 0, velocity: 0 }));
    let previousTime = 0;
    let pointerAt = 0;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let pointerStrength = 0;
    let pointerDirection = 1;
    let width = 0;
    let height = 0;
    let frame = 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const mouse = { x: 0, y: 0, active: false };
    let cursorX = 0;
    let cursorY = 0;
    let cursorReady = false;
    let facing = 1;
    let phase: "off" | "arming" | "approach" | "blow" = "off";
    let phaseAt = 0;
    let blocked = false;
    let gustAt = -Infinity;
    let gustDirection = 1;
    let gustCount = 0;
    let treeBend = 0;
    let treeVelocity = 0;
    let treeTime = 0;
    const moveCursor = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !finePointer.matches || reducedMotion) return;
      if (phase === "off" || phase === "arming") {
        if (Math.abs(event.clientX - mouse.x) > 2) facing = event.clientX < mouse.x ? -1 : 1;
      }
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      mouse.active = true;
    };
    const hideCursor = () => {
      mouse.active = false;
      phase = "off";
      blocked = false;
      cursor.style.opacity = "0";
    };
    const leaveWindow = (event: PointerEvent) => { if (!event.relatedTarget) hideCursor(); };

    const paintBlade = (context: CanvasRenderingContext2D, blade: Blade, bend = 0, pressure = 0, direction = 1) => {
      const { x, y, width } = blade;
      const length = blade.length * (1 - pressure * 0.83) / (1 + Math.abs(bend) * 0.2);
      const lean = blade.lean + bend * blade.length * 0.95 + pressure * blade.length * direction * 0.85;
      context.fillStyle = blade.color;
      context.beginPath();
      context.moveTo(x - width * 0.85, y + width);
      context.quadraticCurveTo(x - width * 0.4 + lean * 0.22, y - length * 0.62, x + lean, y - length);
      context.quadraticCurveTo(x + width * 0.6, y - length * 0.25, x + width * 0.85, y + width);
      context.fill();
    };

    const seedGrass = () => {
      if (!grass.naturalWidth || !width || !height) return;
      texture.width = 720;
      texture.height = Math.round(720 * grass.naturalHeight / grass.naturalWidth);
      const context = texture.getContext("2d", { willReadFrequently: true });
      if (!context) return;
      context.drawImage(grass, 0, 0, texture.width, texture.height);
      const pixels = context.getImageData(0, 0, texture.width, texture.height).data;
      // Extend sampled ground colors through transparent gaps before growing blades.
      for (let x = 0; x < texture.width; x += 1) {
        let last = -1;
        for (let y = 0; y < texture.height; y += 1) {
          const offset = (y * texture.width + x) * 4;
          if (pixels[offset + 3] >= 235 && pixels[offset + 1] >= pixels[offset] * 0.9 && pixels[offset + 2] <= pixels[offset + 1] * 0.96) last = offset;
          else if (last >= 0) {
            pixels[offset] = pixels[last];
            pixels[offset + 1] = pixels[last + 1];
            pixels[offset + 2] = pixels[last + 2];
            pixels[offset + 3] = 255;
          } else pixels[offset + 3] = 0;
        }
      }
      const meadowWidth = window.matchMedia("(max-width: 700px)").matches ? 680 : Math.max(width, 1280);
      const meadowHeight = meadowWidth * texture.height / texture.width * 0.84;
      const left = (width - meadowWidth) / 2;
      const top = height - meadowHeight * (1 - 0.1505);
      let seed = 7419;
      const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
      const spacing = Math.max(2.1, width / 650);
      const colorAt = (x: number, y: number, shade: number, alpha = 1) => {
        const sourceX = clamp(Math.floor((x - left) / meadowWidth * texture.width), 0, texture.width - 1);
        const sourceY = clamp(Math.floor((y - top) / meadowHeight * texture.height), 0, texture.height - 1);
        const offset = (sourceY * texture.width + sourceX) * 4;
        if (pixels[offset + 3] < 235) return null;
        return `rgba(${Math.min(220, pixels[offset] * shade)},${Math.min(225, pixels[offset + 1] * shade)},${Math.min(170, pixels[offset + 2] * shade)},${alpha})`;
      };
      groundBlades = [];
      crest = [];
      for (let column = 0; column < width; column += spacing) {
        const ground = terrain.current.yAt(column, width, height);
        for (let row = ground; row < height + 28; row += spacing * 0.84) {
          const x = Math.min(width - 1, column + random() * spacing);
          const y = row + random() * spacing * 0.84;
          const color = colorAt(x, y, 0.8 + random() * 0.3);
          if (!color) continue;
          const depth = Math.max(0, y - ground);
          const flex = clamp(1 - depth / 22, 0, 1);
          const length = (0.7 + flex * 0.12) * spacing * (2.8 + random() * 3.8) * (0.6 + y / height * 0.6) * (0.8 + clamp(depth / 65, 0, 1) * 0.2);
          const blade = { x, y, length, lean: (random() - 0.3) * length * 0.45, width: spacing * (0.82 + flex * 0.18), flex, color };
          (flex > 0 ? crest : groundBlades).push(blade);
        }
      }
      groundBlades.sort((a, b) => a.y - b.y);
      crest.sort((a, b) => a.y - b.y);
      tips = [];
      for (let index = 0; index < Math.min(12000, width * 8); index += 1) {
        const x = random() * width;
        const y = random() * height;
        const color = colorAt(x, y, 0.8 + random() * 0.44, 0.78);
        if (!color || y < terrain.current.yAt(x, width, height)) continue;
        const length = 0.94 * (2.2 + random() * 6.8) * (0.45 + y / height * 0.9) * Math.min(1.2, width / 1100);
        tips.push({ x, y, length, lean: (random() - 0.5) * length * 0.6, width: 0.4 + random() * 0.45, flex: 0.9 + (Math.sin(x * 0.37 + y * 0.21) + 1) * 0.15, color });
      }
      tips.sort((a, b) => a.y - b.y);
      groundCache.width = grassCanvas.width;
      groundCache.height = grassCanvas.height;
      const cached = groundCache.getContext("2d");
      if (!cached) return;
      cached.setTransform(grassCanvas.width / width, 0, 0, grassCanvas.height / height, 0, 0);
      groundCells.clear();
      for (const blade of groundBlades) {
        paintBlade(cached, blade);
        const cell = `${Math.floor(blade.x / 64)},${Math.floor(blade.y / 32)}`;
        if (!groundCells.has(cell)) groundCells.set(cell, []);
        groundCells.get(cell)!.push(blade);
      }
      grassCanvas.dataset.groundBladeCount = String(groundBlades.length + crest.length);
      grassCanvas.dataset.bladeCount = String(tips.length);
      treeCanvas.parentElement!.dataset.grassReady = "true";
    };

    const resize = () => {
      const bounds = treeCanvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = bounds.width;
      height = bounds.height;
      for (const canvas of [treeCanvas, grassCanvas]) {
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        canvas.getContext("2d")?.setTransform(ratio, 0, 0, ratio, 0, 0);
      }
      seedGrass();
      if (reducedMotion) draw(0);
    };

    const draw = (time: number) => {
      const treeContext = treeCanvas.getContext("2d");
      const grassContext = grassCanvas.getContext("2d");
      if (!treeContext || !grassContext || !width || !height) return;

      treeContext.clearRect(0, 0, width, height);
      grassContext.clearRect(0, 0, width, height);
      const treeWidth = width < 701
        ? Math.min(Math.max(width * 0.56, 216), 232)
        : width < 901
          ? Math.min(Math.max(width * 0.31, 238), 330)
          : width >= 1800 && height >= 900
            ? Math.min(width * 0.2, height * 0.46)
            : Math.min(Math.max(width * 0.22, 240), 322);
      const treeHeight = treeWidth * (1412 / 1114);
      const treeRight = width < 701 ? -18 : width < 901 ? -10 : Math.min(Math.max(width * 0.04, 8), 64);
      const treeLeft = width - treeRight - treeWidth;
      const rootGround = Math.max(...Array.from({ length: 9 }, (_, index) => {
        const rootX = treeLeft + treeWidth * (0.393 + (0.583 - 0.393) * index / 8);
        return terrain.current.yAt(rootX, width, height);
      }));
      // The visible root ends before the transparent bottom edge of the PNG.
      const treeBase = rootGround + treeHeight * (1 - 1335 / 1412);
      const pointerX = (pointer.current.x + 0.5) * width;
      const pointerY = (pointer.current.y + 0.5) * height;
      const treeDelta = treeTime ? Math.min(0.04, (time - treeTime) / 1000) : 0.016;
      treeTime = time;
      const bounds = treeCanvas.getBoundingClientRect();
      const mouseX = (mouse.x - bounds.left) * width / Math.max(1, bounds.width);
      const mouseY = (mouse.y - bounds.top) * height / Math.max(1, bounds.height);
      const visible = mouse.active && finePointer.matches && !reducedMotion
        && treeCanvas.parentElement!.dataset.scrollState !== "hidden" && mouseY >= 0 && mouseY <= height;
      const nearTree = visible && Math.hypot(mouseX - clamp(mouseX, treeLeft, treeLeft + treeWidth), mouseY - clamp(mouseY, treeBase - treeHeight, treeBase)) <= 54;
      if (!nearTree) blocked = false;
      if (!visible || (phase === "arming" && !nearTree)) phase = "off";
      if (phase === "off" && nearTree && !blocked) { phase = "arming"; phaseAt = time; }
      if (phase === "arming" && time - phaseAt >= 480) {
        phase = "approach";
        phaseAt = time;
        facing = cursorX + 15 <= treeLeft + treeWidth / 2 ? 1 : -1;
      }
      if (phase === "approach" && time - phaseAt >= 680) { phase = "blow"; phaseAt = time; }
      if (phase === "blow" && time - phaseAt >= 280 && gustAt < phaseAt) {
        gustAt = time;
        gustDirection = facing;
        treeCanvas.dataset.gustCount = String(++gustCount);
      }
      if (phase === "blow" && time - phaseAt >= 1600) { phase = "off"; blocked = true; }
      const approaching = phase === "approach" || phase === "blow";
      const targetX = approaching ? clamp(facing === 1 ? treeLeft - 45 : treeLeft + treeWidth + 15, 9, width - 39) : mouseX - 15 - 82 * facing;
      const targetY = approaching ? treeBase - treeHeight * 0.6 - 21 : mouseY - 21;
      if (visible && !cursorReady) { cursorX = targetX; cursorY = targetY; }
      cursorReady = visible;
      const follow = 1 - Math.exp(-treeDelta / (approaching ? 0.18 : 0.3));
      cursorX += (targetX - cursorX) * follow;
      cursorY += (targetY - cursorY) * follow;
      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
      cursor.style.setProperty("--cursor-facing", String(facing));
      cursor.style.opacity = visible ? "1" : "0";
      cursor.dataset.state = phase === "blow" ? "blow" : "idle";
      cursor.dataset.phase = phase;
      const gustProgress = (time - gustAt) / 1500;
      const force = !reducedMotion && gustProgress >= 0 && gustProgress <= 1 ? Math.sin(gustProgress * Math.PI) ** 2 * 0.13 * gustDirection : 0;
      treeVelocity += ((force - treeBend) * 64 - treeVelocity * 8) * treeDelta;
      treeBend += treeVelocity * treeDelta;
      const wind = reducedMotion ? 0 : Math.sin(time / 1250) * 0.005 + treeBend;

      if (tree.complete) {
        const slices = 80;
        const sourceSliceHeight = tree.naturalHeight / slices;
        const destinationSliceHeight = treeHeight / slices + 1;
        for (let slice = 0; slice < slices; slice += 1) {
          const progress = (slice + 0.5) / slices;
          const bend = treeHeight * wind * 0.8 * (1 - progress) ** 1.7;
          treeContext.drawImage(
            tree,
            0,
            slice * sourceSliceHeight,
            tree.naturalWidth,
            sourceSliceHeight,
            treeLeft + bend,
            treeBase - treeHeight + slice * (treeHeight / slices),
            treeWidth,
            destinationSliceHeight,
          );
        }
      }

      const delta = previousTime ? Math.min(0.04, (time - previousTime) / 1000) : 0.016;
      previousTime = time;
      const pointerMoved = pointerX !== lastPointerX || pointerY !== lastPointerY;
      if (pointerMoved) {
        pointerDirection = pointerX < lastPointerX ? -1 : 1;
        pointerAt = time;
        lastPointerX = pointerX;
        lastPointerY = pointerY;
      }
      const pointerOnGrass = !reducedMotion && pointer.current.active && time - pointerAt < 160 && pointerY >= terrain.current.yAt(pointerX, width, height);
      pointerStrength += ((pointerOnGrass ? 1 : 0) - pointerStrength) * (1 - Math.exp(-delta * 14));
      grassCanvas.dataset.pointerGrass = String(pointerOnGrass);
      contacts = contacts.filter((contact) => time - contact.at < 1900);
      if (!reducedMotion && time - contactAt >= 50) {
        contactAt = time;
        const bounds = grassCanvas.getBoundingClientRect();
        if (bounds.width && bounds.height) {
          treeCanvas.parentElement!.querySelectorAll<HTMLElement>('.meadow-actor:is([data-phase="land"], [data-phase="move"], [data-phase="shoot"])').forEach((actor) => {
            const box = actor.getBoundingClientRect();
            const bike = actor.classList.contains("meadow-actor--bike");
            const walk = actor.classList.contains("meadow-actor--walk");
            const x = (box.left + box.width / 2 - bounds.left) * width / bounds.width;
            const y = (box.top + box.height * (bike ? 0.985 : walk ? 0.99 : 0.98) - bounds.top) * height / bounds.height;
            const existing = contacts.find((contact) => Math.abs(contact.x - x) < 5 && Math.abs(contact.y - y) < 5);
            if (existing) existing.at = time;
            else contacts.push({ x, y, radius: Math.max(10, box.width * (bike ? 0.28 : walk ? 0.16 : 0.2)), at: time, direction: actor.dataset.direction === "left" ? -1 : 1, strength: bike ? 0.34 : walk ? 0.28 : 1 });
          });
        }
        contacts = contacts.slice(-36);
      }
      grassCanvas.dataset.contactCount = String(contacts.length);
      const pressureAt = (blade: Blade) => {
        let pressure = 0;
        let direction = 1;
        for (const contact of contacts) {
          const distance = ((blade.x - contact.x) / contact.radius) ** 2 + ((blade.y - contact.y) / (contact.radius * 0.65)) ** 2;
          const force = Math.max(0, 1 - distance) ** 2 * (1 - (time - contact.at) / 1900) * contact.strength;
          if (force > pressure) { pressure = force; direction = contact.direction; }
        }
        return { pressure, direction };
      };
      // ponytail: authored breeze; connect weather when live observations are available.
      windField.forEach((segment, index) => {
        const phase = time / 1000 * 0.73 - index / 64 * 4.2;
        const force = reducedMotion ? 0 : 0.22 * (0.38 + Math.sin(phase * 2.1) * 0.12) + 0.28 * Math.max(0, Math.sin(phase)) ** 3 * 0.75;
        segment.velocity += ((force * 1.1 - segment.bend) * 100 - segment.velocity * 12.5) * delta;
        segment.bend += segment.velocity * delta;
      });
      const bendAt = (blade: Blade) => {
        if (reducedMotion) return 0;
        const column = clamp(blade.x / width * 64, 0, 64);
        const index = Math.min(63, Math.floor(column));
        const breeze = windField[index].bend + (windField[index + 1].bend - windField[index].bend) * (column - index);
        const distance = ((blade.x - pointerX) / 128) ** 2 + ((blade.y - pointerY) / 88) ** 2;
        const wake = Math.max(0, 1 - distance) ** 1.65 * pointerDirection * pointerStrength * (0.68 + Math.sin(time / 125 + blade.x / 21 + blade.y / 17) * 0.32) * 1.12;
        return breeze * blade.flex + wake;
      };
      if (groundCache.width && groundCache.height) grassContext.drawImage(groundCache, 0, 0, width, height);
      const zones = contacts.map((contact) => ({ x: contact.x - contact.radius - 22, y: contact.y - contact.radius - 22, width: (contact.radius + 22) * 2, height: (contact.radius + 22) * 2 }));
      if (pointerStrength > 0.02) zones.push({ x: pointerX - 146, y: pointerY - 108, width: 292, height: 216 });
      if (zones.length) {
        grassContext.save();
        grassContext.beginPath();
        const cells = new Set<string>();
        for (const zone of zones) {
          grassContext.rect(zone.x, zone.y, zone.width, zone.height);
          for (let y = Math.floor((zone.y - 40) / 32); y <= Math.floor((zone.y + zone.height + 40) / 32); y += 1) {
            for (let x = Math.floor((zone.x - 40) / 64); x <= Math.floor((zone.x + zone.width + 40) / 64); x += 1) cells.add(`${x},${y}`);
          }
        }
        grassContext.clip();
        grassContext.clearRect(0, 0, width, height);
        const affected = [...cells].flatMap((cell) => groundCells.get(cell) ?? []).sort((a, b) => a.y - b.y);
        for (const blade of affected) {
          const { pressure, direction } = pressureAt(blade);
          paintBlade(grassContext, blade, bendAt(blade), pressure, direction);
        }
        grassContext.restore();
      }
      for (const blade of crest) {
        const { pressure, direction } = pressureAt(blade);
        paintBlade(grassContext, blade, bendAt(blade), pressure, direction);
      }
      for (const blade of tips) {
        const bend = bendAt(blade);
        const { pressure, direction } = pressureAt(blade);
        const length = blade.length * (1 - pressure * 0.83);
        const lean = blade.lean + bend * length * 0.95 + pressure * blade.length * direction;
        grassContext.strokeStyle = blade.color;
        grassContext.lineWidth = blade.width;
        grassContext.beginPath();
        grassContext.moveTo(blade.x, blade.y);
        grassContext.quadraticCurveTo(blade.x + lean * 0.3, blade.y - length * 0.75, blade.x + lean, blade.y - length + Math.abs(bend) * length * 0.15);
        grassContext.stroke();
      }

      if (!reducedMotion) frame = requestAnimationFrame(draw);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(treeCanvas.parentElement!);
    grass.onload = () => { seedGrass(); if (reducedMotion) draw(0); };
    grass.src = "/images/home/grass.png";
    tree.onload = () => { if (reducedMotion) draw(0); };
    window.addEventListener("pointermove", moveCursor, { passive: true });
    window.addEventListener("pointerout", leaveWindow);
    window.addEventListener("blur", hideCursor);
    resize();
    draw(0);
    return () => {
      grass.onload = null;
      tree.onload = null;
      window.removeEventListener("pointermove", moveCursor);
      window.removeEventListener("pointerout", leaveWindow);
      window.removeEventListener("blur", hideCursor);
      delete treeCanvas.parentElement!.dataset.grassReady;
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [pointer, terrain]);

  return (
    <>
      <canvas aria-label="Interactive cypress responding to wind" className="meadow-tree-canvas" ref={treeRef} />
      <canvas aria-hidden="true" className="meadow-grass-canvas" ref={grassRef} />
      <div aria-hidden="true" className="meadow-cursor" data-state="idle" data-phase="off" ref={cursorRef}>
        <span className="meadow-cursor__direction">
          <img alt="" draggable="false" className="meadow-cursor__idle" src="/images/home/pet/idle.png" />
          <img alt="" draggable="false" className="meadow-cursor__blow" src="/images/home/pet/strained.png" />
        </span>
      </div>
    </>
  );
}

function MeadowActor({ activity, active, buttonRefs, sceneRef, terrain }: {
  activity: Activity;
  active: boolean;
  buttonRefs: RefObject<Record<Activity, HTMLButtonElement | null>>;
  sceneRef: RefObject<HTMLDivElement | null>;
  terrain: RefObject<Terrain>;
}) {
  const actorRef = useRef<HTMLSpanElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const profile = actors[activity];

  useEffect(() => {
    const actor = actorRef.current;
    const image = imageRef.current;
    const scene = sceneRef.current;
    if (!actor || !image || !scene) return;

    if (!active) {
      actor.style.opacity = "0";
      actor.dataset.phase = "idle";
      actor.dataset.turning = "false";
      return;
    }

    let sceneBounds = scene.getBoundingClientRect();
    const buttonBounds = buttonRefs.current[activity]?.getBoundingClientRect();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let actorWidth = actor.offsetWidth;
    let actorHeight = actor.offsetHeight;
    const startX = buttonBounds ? buttonBounds.left + buttonBounds.width / 2 - sceneBounds.left : sceneBounds.width / 2;
    let x = clamp(startX, actorWidth / 2, sceneBounds.width - actorWidth / 2);
    let y = buttonBounds ? buttonBounds.top + buttonBounds.height / 2 - sceneBounds.top - actorHeight / 2 : -actorHeight;
    let velocity = 0;
    let direction = profile.direction;
    let turnUntil = 0;
    let distance = 0;
    let phase: "spawn" | "drop" | "land" | "move" | "shoot" = reducedMotion ? (activity === "photo" ? "shoot" : "move") : "spawn";
    let phaseAt = performance.now();
    let previous = phaseAt;
    let currentFrame = -1;
    let animation = 0;

    const resize = () => {
      sceneBounds = scene.getBoundingClientRect();
      actorWidth = actor.offsetWidth;
      actorHeight = actor.offsetHeight;
      x = clamp(x, actorWidth / 2, sceneBounds.width - actorWidth / 2);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(scene);
    observer.observe(actor);

    const groundAt = (position: number) => terrain.current.yAt(position, sceneBounds.width, sceneBounds.height);
    const targetY = () => groundAt(x) - actorHeight * profile.foot;
    const setFrame = (index: number) => {
      const nextFrame = index % profile.frames.length;
      if (nextFrame === currentFrame) return;
      currentFrame = nextFrame;
      image.src = profile.frames[nextFrame];
    };
    const draw = (now: number) => {
      const elapsed = now - phaseAt;
      const delta = Math.min(0.034, Math.max(0.001, (now - previous) / 1000));
      previous = now;
      let scale = 1;
      let angle = 0;

      if (phase === "spawn") {
        scale = 0.08 + Math.min(1, elapsed / 220) * 0.92;
        if (elapsed >= 220) {
          phase = "drop";
          phaseAt = now;
          velocity = -18;
        }
      } else if (phase === "drop") {
        velocity += Math.max(980, sceneBounds.height * 2.15) * delta;
        y += velocity * delta;
        if (y >= targetY()) {
          y = targetY();
          velocity = 0;
          phase = "land";
          phaseAt = now;
        }
      } else if (phase === "land") {
        y = targetY();
        if (elapsed >= 170) {
          phase = activity === "photo" ? "shoot" : "move";
          phaseAt = now;
        }
      } else if (phase === "shoot") {
        y = targetY();
        setFrame(Math.floor((now - phaseAt) / 900));
      } else {
        const edge = actorWidth * 0.54;
        const speed = clamp(sceneBounds.width * profile.speed, profile.speedMin, profile.speedMax);
        if (turnUntil && now < turnUntil) {
          y = targetY();
        } else {
          if (turnUntil) {
            turnUntil = 0;
            actor.dataset.turning = "false";
          }
          x += direction * speed * delta;
          distance += speed * delta;
          if (x >= sceneBounds.width - edge || x <= edge) {
            x = clamp(x, edge, sceneBounds.width - edge);
            direction *= -1;
            turnUntil = now + profile.turnDuration;
            actor.dataset.turning = "true";
          }
        }
        const sample = Math.max(8, actorWidth * (activity === "bike" ? 0.18 : 0.2));
        const slope = Math.atan2(groundAt(x + sample) - groundAt(x - sample), sample * 2);
        angle = clamp(slope, -profile.tilt, profile.tilt);
        y = targetY();
        setFrame(Math.floor(distance / profile.cadence));
      }

      actor.dataset.phase = phase;
      actor.dataset.direction = direction === 1 ? "right" : "left";
      actor.style.opacity = "1";
      actor.style.transform = `translate3d(${x - actorWidth / 2}px, ${y}px, 0) rotate(${angle}rad) scale(${scale})`;
      actor.style.setProperty("--actor-facing", String(direction * profile.nativeFacing));
      if (!reducedMotion) animation = requestAnimationFrame(draw);
    };

    actor.dataset.phase = "spawn";
    actor.dataset.turning = "false";
    setFrame(0);
    if (reducedMotion) y = targetY();
    draw(phaseAt);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(animation);
    };
  }, [active, activity, buttonRefs, profile, sceneRef, terrain]);

  return (
    <span aria-hidden="true" className={`meadow-actor meadow-actor--${activity}`} ref={actorRef}>
      <span className="meadow-actor__shadow" />
      <span className="meadow-actor__direction">
        <span className="meadow-actor__sprite"><img alt="" draggable="false" ref={imageRef} src={profile.frames[0]} /></span>
      </span>
    </span>
  );
}

export function HeroMeadow() {
  const [active, setActive] = useState<Record<Activity, boolean>>({ photo: false, bike: false, walk: false });
  const [clock, setClock] = useState("");
  const pointer = useRef<Pointer>({ x: 0, y: 0, active: false });
  const sceneRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<Activity, HTMLButtonElement | null>>({ photo: null, bike: null, walk: null });
  const terrain = useMeadowTerrain();

  useEffect(() => {
    const updateClock = () => setClock(new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Ho_Chi_Minh", timeZoneName: "short" }).format(new Date()));
    updateClock();
    const interval = window.setInterval(updateClock, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    const work = document.getElementById("work");
    if (!scene || !work) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let viewportHeight = Math.max(1, window.visualViewport?.height ?? window.innerHeight);
    let current = 0;
    let target = 0;
    let animation = 0;
    let previous = 0;
    let anchoredToWork = window.location.hash === "#work";

    const apply = (rawProgress: number) => {
      current = clamp(rawProgress, 0, 1);
      const eased = smootherstep(current);
      const exit = eased ** 1.08;
      const meadowFade = clamp((eased - 0.12) / 0.88, 0, 1);
      const treeFade = clamp((meadowFade - 0.16) / 0.84, 0, 1);
      const lateExit = smootherstep(clamp((current - 0.72) / 0.28, 0, 1));
      const exitDistance = viewportHeight + Math.max(120, viewportHeight * 0.18);
      const dissolveEdge = -24 + meadowFade * 150;

      scene.style.setProperty("--scene-exit-y", `${(exit * exitDistance).toFixed(2)}px`);
      scene.style.setProperty("--scene-exit-scale", (1 - exit * 0.012).toFixed(4));
      scene.style.setProperty("--scene-exit-opacity", (1 - lateExit * 0.14).toFixed(4));
      scene.style.setProperty("--meadow-layer-y", `${(exit * 22).toFixed(2)}px`);
      scene.style.setProperty("--tree-layer-y", `${(exit * -30).toFixed(2)}px`);
      scene.style.setProperty("--meadow-layer-opacity", (1 - meadowFade ** 1.72).toFixed(4));
      scene.style.setProperty("--tree-layer-opacity", (1 - treeFade ** 1.48).toFixed(4));
      scene.style.setProperty("--meadow-dissolve-blur", `${(meadowFade ** 1.3 * 2.8).toFixed(2)}px`);
      scene.style.setProperty("--tree-dissolve-blur", `${(treeFade ** 1.25 * 1.4).toFixed(2)}px`);
      [0, 4, -2, 6, 1, -4, 3, -1].forEach((offset, index) => {
        scene.style.setProperty(`--meadow-dissolve-edge-${index + 1}`, `${(dissolveEdge + offset).toFixed(2)}%`);
      });
      work.style.setProperty("--work-paper-opacity", meadowFade.toFixed(4));
      scene.dataset.scrollState = current <= 0.002 ? "hero" : current >= 0.998 ? "hidden" : "transitioning";
    };

    const measure = () => {
      viewportHeight = Math.max(1, window.visualViewport?.height ?? window.innerHeight);
      const workTop = work.getBoundingClientRect().top + window.scrollY;
      const start = Math.max(0, workTop - viewportHeight * 1.06);
      const end = Math.max(start + 1, workTop - viewportHeight * 0.2);
      if (anchoredToWork) {
        if (window.scrollY >= end) return 1;
        anchoredToWork = false;
      }
      const progress = clamp((window.scrollY - start) / (end - start), 0, 1);
      return reducedMotion.matches ? Number(progress >= 0.4) : progress;
    };

    const animate = (time: number) => {
      animation = 0;
      const elapsed = previous ? Math.min(48, time - previous) : 16;
      previous = time;
      const next = current + (target - current) * (1 - Math.exp(-elapsed / 190));
      if (Math.abs(target - next) <= 0.001) {
        apply(target);
        return;
      }
      apply(next);
      animation = requestAnimationFrame(animate);
    };

    const update = () => {
      target = measure();
      if (reducedMotion.matches) {
        cancelAnimationFrame(animation);
        animation = 0;
        apply(target);
      } else if (!animation) {
        previous = 0;
        animation = requestAnimationFrame(animate);
      }
    };

    target = anchoredToWork ? 1 : measure();
    apply(target);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.visualViewport?.addEventListener("resize", update);
    reducedMotion.addEventListener("change", update);
    return () => {
      cancelAnimationFrame(animation);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("resize", update);
      reducedMotion.removeEventListener("change", update);
      work.style.removeProperty("--work-paper-opacity");
    };
  }, []);

  return (
    <section aria-labelledby="intro-title" className="meadow-hero" onPointerLeave={() => { pointer.current.active = false; }} onPointerMove={(event) => {
      const bounds = event.currentTarget.getBoundingClientRect();
      pointer.current = { x: (event.clientX - bounds.left) / bounds.width - 0.5, y: (event.clientY - bounds.top) / bounds.height - 0.5, active: true };
    }}>
      <div className="meadow-hero__copy">
        <h1 id="intro-title">Tan Luc</h1>
        <p>I&apos;m a software engineer based in Vietnam. I build dependable, thoughtful products and care about the small interactions that make software feel natural.</p>
        <div className="meadow-hero__interests">
          <span>In my free time,</span>
          <span className="meadow-activities">
            {(Object.keys(actors) as Activity[]).map((activity) => (
              <button aria-label={`${active[activity] ? "Hide" : "Show"} ${actors[activity].label.toLowerCase()} on the meadow`} aria-pressed={active[activity]} className={`meadow-token meadow-token--${activity}`} key={activity} onClick={() => setActive((current) => ({ ...current, [activity]: !current[activity] }))} ref={(element) => { buttonRefs.current[activity] = element; }} type="button">
                <img className="meadow-token__rest" alt="" draggable="false" src={`/images/home/activities/${activityCube[activity].rest}`} />
                <img className="meadow-token__selected" alt="" draggable="false" src={`/images/home/activities/${activityCube[activity].selected}`} />
              </button>
            ))}
          </span>
        </div>
      </div>

      <div className={`meadow-scene ${active.photo ? "is-photo-active" : ""}`} ref={sceneRef}>
        <div aria-hidden="true" className="meadow-ground"><img alt="" draggable="false" src="/images/home/grass.png" /></div>
        <MeadowCanvas pointer={pointer} terrain={terrain} />
        <MeadowActor activity="photo" active={active.photo} buttonRefs={buttonRefs} sceneRef={sceneRef} terrain={terrain} />
        <MeadowActor activity="bike" active={active.bike} buttonRefs={buttonRefs} sceneRef={sceneRef} terrain={terrain} />
        <MeadowActor activity="walk" active={active.walk} buttonRefs={buttonRefs} sceneRef={sceneRef} terrain={terrain} />
        <div className="meadow-weather" aria-live="polite"><strong>Gentle breeze in Ho Chi Minh City right now</strong><span>{clock || "Local time"} · 8 km/h SW wind</span></div>
      </div>
    </section>
  );
}
