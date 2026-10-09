export interface CaseStudy {
  slug: string;
  title: string;
  client: string;
  year: string;
  role: string;
  summary: string;
  /* CSS gradient used as a placeholder cover until real imagery drops in */
  cover: string;
  sections: { heading: string; body: string }[];
}

export const WORK: CaseStudy[] = [
  {
    slug: "cinematic-ai",
    title: "CinematicAI",
    client: "Placeholder Fintech Co.",
    year: "2025",
    role: "Lead Product Designer",
    summary:
      "Reimagining how small teams understand their cash flow — from a wall of tables to a narrative, glanceable system.",
    cover: "linear-gradient(135deg, #2fa872 0%, #1c5e44 100%)",
    sections: [
      {
        heading: "The problem",
        body: "Placeholder copy. Describe the business context, the user pain, and why the status quo was failing. Swap this for your real case study narrative.",
      },
      {
        heading: "The approach",
        body: "Placeholder copy. Research, framing, explorations, and the key design decision that unlocked the project.",
      },
      {
        heading: "The outcome",
        body: "Placeholder copy. Shipped results, metrics, and what you learned.",
      },
    ],
  },
  {
    slug: "cafe-maps",
    title: "CafeMaps",
    client: "Placeholder SaaS Inc.",
    year: "2024",
    role: "Design Systems Lead",
    summary:
      "A token-first design system that let four product teams ship consistent UI twice as fast.",
    cover: "linear-gradient(135deg, #3568c4 0%, #1d3a6e 100%)",
    sections: [
      { heading: "The problem", body: "Placeholder copy for the design system origin story." },
      { heading: "The approach", body: "Placeholder copy for tokens, components, governance." },
      { heading: "The outcome", body: "Placeholder copy for adoption and impact." },
    ],
  },
  {
    slug: "study-stream",
    title: "Study Stream",
    client: "Placeholder Health Co.",
    year: "2023",
    role: "Senior Product Designer",
    summary:
      "Designing a calm, error-proof dashboard for nurses working 12-hour overnight shifts.",
    cover: "linear-gradient(135deg, #e8b93c 0%, #a67c14 100%)",
    sections: [
      { heading: "The problem", body: "Placeholder copy for the clinical context." },
      { heading: "The approach", body: "Placeholder copy for shadowing, prototyping, night-mode design." },
      { heading: "The outcome", body: "Placeholder copy for error-rate reduction and rollout." },
    ],
  },
];
