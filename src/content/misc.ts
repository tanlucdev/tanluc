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
  cover: string;
  tall?: boolean;
}

export const PHOTOS: Photo[] = [
  { title: "Fog line", place: "Marin Headlands", cover: "linear-gradient(180deg, #b9c3bd, #5c6b63)", tall: true },
  { title: "Descent", place: "Mt. Tam", cover: "linear-gradient(180deg, #e8b93c, #b0761c)" },
  { title: "Blue hour", place: "Embarcadero", cover: "linear-gradient(180deg, #3568c4, #101d3c)" },
  { title: "Paceline", place: "Paradise Loop", cover: "linear-gradient(180deg, #2fa872, #133f2b)", tall: true },
  { title: "Corner shop", place: "Tokyo", cover: "linear-gradient(180deg, #e2574c, #5e1a14)" },
  { title: "Switchbacks", place: "Alpe d'Huez", cover: "linear-gradient(180deg, #8b8b8b, #2e2e2e)" },
  { title: "Golden flat", place: "Ocean Beach", cover: "linear-gradient(180deg, #f0c987, #9c6b2f)", tall: true },
  { title: "Rain race", place: "Portland", cover: "linear-gradient(180deg, #7a8c74, #2f3a2c)" },
];
