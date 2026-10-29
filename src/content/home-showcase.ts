// Temporary reference media from neelsaswade.com; it is not Tan Luc's work and copy will be replaced.
export const HOME_SHOWCASE = [
  {
    slug: "wala-ict",
    company: "WALA ICT",
    title: "Digital products at WALA ICT",
    summary: "Placeholder project description. Final project context, outcomes, and supporting details will be supplied later.",
    media: "artifacts",
  },
  {
    slug: "isb-corp",
    company: "ISB Corp",
    title: "Building for ISB Corp",
    summary: "Placeholder project description. Final project context, outcomes, and supporting details will be supplied later.",
    media: "homepage",
  },
  {
    slug: "onemedic",
    company: "Onemedic",
    title: "Product experiences at Onemedic",
    summary: "Placeholder project description. Final project context, outcomes, and supporting details will be supplied later.",
    media: "proactive",
  },
] as const;

export type HomeShowcaseProject = (typeof HOME_SHOWCASE)[number];
