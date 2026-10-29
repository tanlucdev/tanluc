export type HomeShowcaseProject = {
  slug: string;
  company: string;
  title: string;
  role?: string;
  period?: string;
  summary: string;
  stats?: readonly string[];
  url?: string;
  media: "artifacts" | "cafemaps" | "proactive" | "homepage";
  referenceMedia?: boolean;
};

export const HOME_SHOWCASE: readonly HomeShowcaseProject[] = [
  {
    slug: "wala-ict",
    company: "WALA ICT",
    title: "Dynamic Models",
    role: "Frontend Developer",
    period: "Oct 2025-Present",
    summary: "For CJ CINEMA GEN, used by 20+ specialists, I built schema-driven Dynamic Models for 1,000+ AI models: input validation, execution payloads, and real-time WebSocket feedback. I worked in a six-person team with two frontend developers, delivered 10 canvas tools with AI coding agents, and reviewed and verified changes.",
    media: "artifacts",
    referenceMedia: true,
  },
  {
    slug: "cafemaps",
    company: "Independent product",
    title: "Cafemaps",
    role: "Independent Full-stack Developer",
    summary: "I independently build and run Cafemaps across Next.js, NestJS, PostGIS, admin tools, and deployment. The Ho Chi Minh City product helps people discover community cafes by location, while reliable fallbacks and an image-storage migration keep the experience dependable.",
    stats: ["500 registered users", "15,000 visits", "50 community-contributed cafes"],
    url: "https://cafemaps.net",
    media: "cafemaps",
  },
  {
    slug: "onemedic",
    company: "Onemedic",
    title: "MedicHIMS",
    role: "Fullstack Developer",
    period: "Mar-Aug 2025",
    summary: "I delivered licensing, payment, and pricing UI and added NestJS endpoints; billing steps followed backend state transitions. Schema-driven forms and i18n kept the healthcare information system consistent across its workflows.",
    media: "proactive",
    referenceMedia: true,
  },
  {
    slug: "isb-corp",
    company: "ISB Corp",
    title: "ISB project",
    summary: "Project details are pending verification. This story will be expanded with an accurate scope and contributions once they are available.",
    media: "homepage",
    referenceMedia: true,
  },
];
