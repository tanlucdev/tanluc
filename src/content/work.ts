export interface CaseStudy {
  slug: string;
  title: string;
  client: string;
  year: string;
  role: string;
  summary: string;
  url?: string;
  /* CSS gradient used as a placeholder cover until real imagery drops in */
  cover: string;
  sections: { heading: string; body: string }[];
}

export const WORK: CaseStudy[] = [
  {
    slug: "dynamic-model",
    title: "Cinematic AI",
    client: "Cinematic AI",
    year: "2026",
    role: "Frontend Engineer",
    summary:
      "Making AI workflows more flexible — so new models can be added without rebuilding their interfaces.",
    cover: "linear-gradient(135deg, #2fa872 0%, #1c5e44 100%)",
    sections: [
      {
        heading: "The problem",
        body: "The workflow editor initially supported a fixed set of models, each with predefined configuration forms. As the model catalog grew to over 1,000 models, maintaining these forms became increasingly difficult and limited how easily new models could be introduced.",
      },
      {
        heading: "The approach",
        body: "I built a dynamic configuration system that turns model schemas into UI controls, allowing each model to display its own properties and requirements. I also connected the configuration to validation and workflow execution, so users could configure different models within the same editor.",
      },
      {
        heading: "The outcome",
        body: "Replaced hardcoded model configurations with a schema-driven system that can adapt to a growing model catalog. This made the configuration experience more flexible and reduced the need to build individual forms for new models.",
      },
    ],
  },
  {
    slug: "cafe-maps",
    title: "CafeMaps",
    client: "CafeMaps",
    year: "2026",
    role: "Full-stack Engineer",
    summary:
      "Making it easier to find a cafe that feels right for the day — whether it's for work, study, or simply slowing down.",
    url: "https://cafemaps.net",
    cover: "linear-gradient(135deg, #3568c4 0%, #1d3a6e 100%)",
    sections: [
      {
        heading: "The problem",
        body: "Finding a cafe in Ho Chi Minh City often means going through scattered reviews, photos, and maps. I wanted to make that experience simpler, helping people find places based not just on location, but on what they actually need from a cafe.",
      },
      {
        heading: "The approach",
        body: "I built CafeMaps around the way people choose cafes, combining places I've personally visited with filters for location, atmosphere, purpose, price, and amenities. The goal was to make discovering a cafe feel more personal and less like searching through a directory.",
      },
      {
        heading: "The outcome",
        body: "What started as a personal project has grown to 10,000+ visitors, 30,000+ page views, and 200+ registered users, helping more people discover cafes across Ho Chi Minh City.",
      },
    ],
  },
  {
    slug: "grateful-forum",
    title: "Grateful Forum",
    client: "Grateful Forum",
    year: "2026",
    role: "Full-stack Engineer",
    summary:
      "Turning everyday gratitude into a habit through a personal journal and a shared community.",
    cover: "linear-gradient(135deg, #e8b93c 0%, #a67c14 100%)",
    url: "https://grateful.forum",
    sections: [
      {
        heading: "The problem",
        body: "Life's pressures often overshadow the good. Small moments pass unnoticed, while journaling can feel difficult to start and maintain. I wanted to make reflection easier to practice and meaningful to revisit, without losing the personal nature of the experience.",
      },
      {
        heading: "The approach",
        body: "I built Grateful with React, Next.js, and TypeScript, bringing guided writing, personal journaling, daily streaks, visual history, and community sharing into one responsive, bilingual experience. The implementation combines authentication, journal management, and habit-tracking features in a mobile-first interface, allowing users to move between private reflection and shared experiences within the same application.",
      },
      {
        heading: "The outcome",
        body: "Delivered a complete application that brings personal journaling, habit tracking, and community interaction together in one experience. The project demonstrates end-to-end frontend development across a multi-feature application, from responsive UI and authentication flows to structured user interactions. While Grateful has not launched publicly, the completed product establishes a foundation for future user testing and validation.",
      },
    ],
  },
];
