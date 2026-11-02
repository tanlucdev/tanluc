export type HomeShowcaseProject = {
  slug: string;
  company: string;
  title: string;
  role?: string;
  period?: string;
  summary: string;
  stats?: readonly string[];
  url?: string;
  media: "models" | "canvas" | "tools" | "execution" | "artifacts" | "cafemaps" | "medichims";
  referenceMedia?: boolean;
};

export const HOME_SHOWCASE: readonly HomeShowcaseProject[] = [
  {
    slug: "wala-ict",
    company: "WALA ICT / CJ ENM",
    title: "Dynamic Models",
    role: "Frontend Developer",
    period: "Oct 2025-Present",
    summary: "For CJ CINEMA GEN, used by 20+ specialists, I built schema-driven configuration for 1,000+ AI models. Model properties and required inputs become dynamic controls with matching validation, so the interface adapts as users switch models without a separate hardcoded form for each one.",
    media: "models",
  },
  {
    slug: "visual-workflow-editor",
    company: "WALA ICT / CJ ENM",
    title: "Visual Workflow Editor",
    role: "Frontend Developer",
    period: "Oct 2025-Present",
    summary: "Within the same CJ CINEMA GEN workspace, I worked on the node-based workflow editor: canvas interactions, connecting nodes, and bringing model configuration into the creative flow. The walkthrough follows a scene direction through model setup to two video results, kept together on the canvas.",
    media: "canvas",
  },
  {
    slug: "creative-media-tools",
    company: "WALA ICT / CJ ENM",
    title: "Creative & Media Tools",
    role: "Frontend Developer",
    period: "Oct 2025-Present",
    summary: "I built creative tools for CJ CINEMA GEN, including color correction, masks, compositing, and rotate and flip controls. This illustrative walkthrough uses one scene to show how individual adjustments change the image and how layers come together in a composition.",
    media: "tools",
  },
  {
    slug: "workflow-execution",
    company: "WALA ICT / CJ ENM",
    title: "Workflow Execution",
    role: "Frontend Developer",
    period: "Oct 2025-Present",
    summary: "I connected workflow validation and execution payload construction with execution handling and real-time WebSocket updates. This illustrative run follows a missing input through correction, validation, queueing, execution, and output updates, making each stage visible to the user.",
    media: "execution",
  },
  {
    slug: "cafemaps",
    company: "Independent product",
    title: "Cafe Maps",
    role: "Independent Full-stack Developer",
    summary: "From finding the right atmosphere to keeping a personal collection, I independently design, build, and run Cafe Maps, a cafe discovery product for Ho Chi Minh City. My work spans Next.js, NestJS, PostGIS, admin tools, and deployment.",
    stats: ["15,000+ visitors", "40,000+ page views"],
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
    media: "medichims",
  },

];
