export const COLS = 24;
export const ROWS = 13;
export const MOBILE_COLS = 12;
export const MOBILE_ROWS = 13;

export interface RevealLayout {
  trigger: { row: number; col: number };
  region: { row: number; col: number; w: number; h: number };
}

export interface Reveal extends RevealLayout {
  mobile: RevealLayout;
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
    mobile: {
      trigger: { row: 6, col: 5 },
      region: { row: 1, col: 0, w: 4, h: 4 },
    },
    kind: "work",
    label: "CinematicAI",
    sub: "AI workflow platform",
    href: "/work/cinematic-ai",
    gradient: "linear-gradient(135deg, #2fa872, #1c5e44)",
  },
  {
    trigger: { row: 2, col: 20 },
    region: { row: 1, col: 16, w: 4, h: 6 },
    mobile: {
      trigger: { row: 2, col: 10 },
      region: { row: 1, col: 8, w: 3, h: 6 },
    },
    kind: "photo",
    label: "CafeMaps",
    sub: "Cafe discovery · Ho Chi Minh City",
    href: "/work/cafe-maps",
    gradient: "linear-gradient(180deg, #b9c3bd, #5c6b63)",
  },
  {
    trigger: { row: 10, col: 3 },
    region: { row: 8, col: 1, w: 3, h: 4 },
    mobile: {
      trigger: { row: 10, col: 1 },
      region: { row: 8, col: 0, w: 3, h: 4 },
    },
    kind: "work",
    label: "Study Stream",
    sub: "Realtime focus sessions",
    href: "/work/study-stream",
    gradient: "linear-gradient(135deg, #3568c4, #1d3a6e)",
  },
  {
    trigger: { row: 11, col: 18 },
    region: { row: 8, col: 17, w: 3, h: 4 },
    mobile: {
      trigger: { row: 11, col: 8 },
      region: { row: 8, col: 6, w: 3, h: 4 },
    },
    kind: "play",
    label: "How I build",
    sub: "Frontend systems · TypeScript",
    href: "/about",
    gradient: "linear-gradient(160deg, #c46ba4, #6e2f57)",
  },
  {
    trigger: { row: 0, col: 8 },
    region: { row: 0, col: 6, w: 2, h: 4 },
    mobile: {
      trigger: { row: 0, col: 4 },
      region: { row: 0, col: 4, w: 1, h: 4 },
    },
    kind: "fact",
    label: "AI workflows",
    sub: "Visible, reusable, debuggable",
    href: "/about",
    gradient: "linear-gradient(180deg, #e8b93c, #a67c14)",
  },
  {
    trigger: { row: 12, col: 8 },
    region: { row: 10, col: 5, w: 4, h: 2 },
    mobile: {
      trigger: { row: 12, col: 4 },
      region: { row: 10, col: 3, w: 2, h: 2 },
    },
    kind: "photo",
    label: "Design-led web",
    sub: "Clear systems, focused experiences",
    href: "/about",
    gradient: "linear-gradient(180deg, #2fa872, #133f2b)",
  },
  {
    trigger: { row: 4, col: 14 },
    region: { row: 3, col: 13, w: 3, h: 3 },
    mobile: {
      trigger: { row: 4, col: 7 },
      region: { row: 3, col: 5, w: 3, h: 3 },
    },
    kind: "work",
    label: "Product UX",
    sub: "Software that removes friction",
    href: "/about",
    gradient: "linear-gradient(135deg, #e8b93c, #a67c14)",
  },
  {
    trigger: { row: 8, col: 22 },
    region: { row: 6, col: 21, w: 3, h: 4 },
    mobile: {
      trigger: { row: 8, col: 10 },
      region: { row: 6, col: 9, w: 3, h: 4 },
    },
    kind: "fact",
    label: "About Tan Luc",
    sub: "tanlucdev · Vietnam",
    href: "/about",
    gradient: "linear-gradient(135deg, #1c1b18, #4d4a42)",
  },
];
