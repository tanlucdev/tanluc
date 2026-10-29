export const PROFILE = {
  resumePath: "/images/home/CV_PostCo.pdf",
  homeTeaser: {
    title: "Stack & experience",
    copy: "The tools, systems, and product work behind the projects above.",
    href: "/about#how-i-build",
  },
  stack: [
    {
      label: "Frontend",
      technologies: [
        { name: "ReactJS", icon: "react", color: "#367f91", href: "https://react.dev" },
        { name: "Next.js", icon: "next", color: "#333330", href: "https://nextjs.org" },
        { name: "TypeScript", icon: "typescript", color: "#3178c6", href: "https://www.typescriptlang.org" },
        { name: "React Flow", icon: "flow", color: "#b45169", href: "https://reactflow.dev" },
        { name: "Tailwind CSS", icon: "tailwind", color: "#268b9c", href: "https://tailwindcss.com" },
        { name: "React Hook Form", icon: "forms", color: "#b45d7b", href: "https://react-hook-form.com" },
      ],
      description: "I turn product ideas into interfaces people can work with, from everyday forms to visual workflow tools.",
    },
    {
      label: "State & data",
      technologies: [
        { name: "Redux", icon: "redux", color: "#7656a6", href: "https://redux.js.org" },
        { name: "Zustand", icon: "zustand", color: "#866447", href: "https://zustand.docs.pmnd.rs" },
        { name: "React Query", icon: "query", color: "#b96053", href: "https://tanstack.com/query" },
        { name: "WebSocket", icon: "websocket", color: "#71825f", href: "https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API" },
      ],
      description: "I keep interfaces in step with the data behind them, with clear feedback as things change.",
    },
    {
      label: "Backend",
      technologies: [
        { name: "Node.js", icon: "node", color: "#62814d", href: "https://nodejs.org" },
        { name: "NestJS", icon: "nest", color: "#b24d65", href: "https://nestjs.com" },
        { name: "PostgreSQL / PostGIS", icon: "postgres", color: "#4c7693", href: "https://postgis.net" },
        { name: "Prisma", icon: "prisma", color: "#526573", href: "https://www.prisma.io" },
        { name: "Git", icon: "git", color: "#bd624c", href: "https://git-scm.com" },
        { name: "Vercel", icon: "vercel", color: "#333330", href: "https://vercel.com" },
      ],
      description: "I follow a feature beyond the interface, through its data and backend to deployment.",
    },
    {
      label: "AI & testing",
      technologies: [
        { name: "Codex", icon: "codex", color: "#537d6e", href: "https://openai.com/codex" },
        { name: "Claude", icon: "claude", color: "#b7775e", href: "https://claude.ai" },
        { name: "Playwright", icon: "playwright", color: "#668654", href: "https://playwright.dev" },
      ],
      description: "I give coding agents context and direction, then review their changes and check how the result behaves.",
    },
  ],
  experience: [
    {
      company: "WALA ICT",
      role: "Frontend Developer",
      period: "Oct 2025 - Present",
      contributions: [
        "Helped build CJ CINEMA GEN, a visual AI workflow tool, with flexible configuration for 1,000+ models in one canvas.",
        "Connected model inputs to workflow execution and brought run status and results into the interface as they arrive.",
      ],
    },
    {
      company: "ISB Vietnam",
      role: "Frontend Developer",
      period: "Aug - Oct 2025",
      contributions: [
        "Built four production pages for a university management system, turning requirements into working interfaces.",
        "Connected the React interfaces to backend data through a BFF layer, using Redux to manage application state.",
      ],
    },
    {
      company: "OneMedic",
      role: "Fullstack Developer",
      period: "Mar - Aug 2025",
      contributions: [
        "Built licensing, payment, and pricing flows for MedicHIMS, a patient management system for hospitals and clinics.",
        "Carried features from Figma designs through API integration and supporting backend endpoints, with reusable forms and inputs across the product.",
      ],
    },
  ],
} as const;
