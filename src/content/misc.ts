export interface PlayItem {
  title: string;
  blurb: string;
  year: string;
  cover: string;
}

export const PLAY: PlayItem[] = [
  { title: "Type sketches", blurb: "Placeholder — lettering studies and variable-font toys.", year: "2025", cover: "linear-gradient(160deg, #c46ba4, #6e2f57)" },
  { title: "Generative grids", blurb: "Placeholder — p5.js sketches riffing on graph paper.", year: "2025", cover: "linear-gradient(160deg, #2fa872, #17553a)" },
  { title: "Shader dabbling", blurb: "Placeholder — GLSL experiments and happy accidents.", year: "2024", cover: "linear-gradient(160deg, #3568c4, #142c58)" },
  { title: "Mechanical keyboard", blurb: "Placeholder — a hand-wired 40% build.", year: "2024", cover: "linear-gradient(160deg, #e8b93c, #8f6c0f)" },
  { title: "Zine: Ride Log", blurb: "Placeholder — a printed zine of century-ride notes.", year: "2023", cover: "linear-gradient(160deg, #e2574c, #7c221b)" },
  { title: "Icon set", blurb: "Placeholder — 120 hand-drawn cycling icons.", year: "2023", cover: "linear-gradient(160deg, #7a8c74, #3c4a38)" },
];

export interface Photo {
  title: string;
  place: string;
  src: string;
  thumbnail: string;
  tags?: string[];
  width: number;
  height: number;
  color: number;
  style: string;
}
