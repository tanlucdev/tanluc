export const COLS = 24;
export const ROWS = 13;

export interface Reveal {
  /* cell that must be hovered to trigger this reveal */
  trigger: { row: number; col: number };
  /* block of cells that flips over */
  region: { row: number; col: number; w: number; h: number };
  kind: "work" | "photo" | "play" | "fact";
  label: string;
  sub: string;
  href: string;
  gradient: string;
}

/**
 * The rabbit hole. Step 0 is triggered from the central column; completing
 * step n makes step n+1's trigger cell glow somewhere else on the grid.
 */
export const REVEALS: Reveal[] = [
  {
    trigger: { row: 6, col: 11 },
    region: { row: 1, col: 1, w: 6, h: 4 },
    kind: "work",
    label: "Wayfinder",
    sub: "Fintech case study · 2025",
    href: "/work/wayfinder",
    gradient: "linear-gradient(135deg, #2fa872, #1c5e44)",
  },
  {
    trigger: { row: 2, col: 20 },
    region: { row: 1, col: 16, w: 4, h: 6 },
    kind: "photo",
    label: "Fog line",
    sub: "Photography · Marin Headlands",
    href: "/photography",
    gradient: "linear-gradient(180deg, #b9c3bd, #5c6b63)",
  },
  {
    trigger: { row: 10, col: 3 },
    region: { row: 8, col: 1, w: 3, h: 4 },
    kind: "work",
    label: "Atlas",
    sub: "Design system · 2024",
    href: "/work/atlas-design-system",
    gradient: "linear-gradient(135deg, #3568c4, #1d3a6e)",
  },
  {
    trigger: { row: 11, col: 18 },
    region: { row: 8, col: 17, w: 3, h: 4 },
    kind: "play",
    label: "Generative grids",
    sub: "Play · p5.js sketches",
    href: "/play",
    gradient: "linear-gradient(160deg, #c46ba4, #6e2f57)",
  },
  {
    trigger: { row: 0, col: 8 },
    region: { row: 0, col: 6, w: 2, h: 4 },
    kind: "fact",
    label: "12,000 km",
    sub: "Ridden this year, and counting",
    href: "/about",
    gradient: "linear-gradient(180deg, #e8b93c, #a67c14)",
  },
  {
    trigger: { row: 12, col: 8 },
    region: { row: 10, col: 5, w: 4, h: 2 },
    kind: "photo",
    label: "Paceline",
    sub: "Photography · Paradise Loop",
    href: "/photography",
    gradient: "linear-gradient(180deg, #2fa872, #133f2b)",
  },
  {
    trigger: { row: 4, col: 14 },
    region: { row: 3, col: 13, w: 3, h: 3 },
    kind: "work",
    label: "Night Shift",
    sub: "Health · 2023",
    href: "/work/night-shift",
    gradient: "linear-gradient(135deg, #e8b93c, #a67c14)",
  },
  {
    trigger: { row: 8, col: 22 },
    region: { row: 6, col: 21, w: 3, h: 4 },
    kind: "fact",
    label: "About",
    sub: "You found it all",
    href: "/about",
    gradient: "linear-gradient(135deg, #1c1b18, #4d4a42)",
  },
];
