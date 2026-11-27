# Tan Luc — Portfolio

I'm Tan Luc, a software engineer based in Vietnam. I started in frontend development and now build across interfaces, backend services, and deployment. I care about dependable products and the small interactions that make software feel natural.

This repository is my personal portfolio: selected engineering work, independent products, photography, and a little of life outside the screen.

## Selected work

- **CJ CINEMA GEN at WALA ICT** — frontend development for a visual AI workflow tool: dynamic model configuration, a node-based editor, creative media tools, and real-time execution updates.
- **[Cafe Maps](https://cafemaps.net)** — a cafe discovery product for Ho Chi Minh City that I independently design, build, and run, spanning Next.js, NestJS, PostGIS, admin tools, and deployment.
- **MedicHIMS at OneMedic** — licensing, payment, and pricing flows, reusable forms, API integration, and supporting NestJS endpoints.
- **[Grateful Forum](https://grateful.forum/)** — a bilingual product for guided writing, personal journaling, habit tracking, and community sharing.

## The portfolio

The site pairs an interactive meadow with project walkthroughs, photography, and an About page covering my experience, tools, and recent moments from life.

Built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS 4. Vercel serves the site through the Next.js runtime; GitHub Pages uses a static export. Sharp generates photo variants before development and production builds.

## Getting started

```bash
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000).

## Content

- Homepage projects: `src/content/home-showcase.ts`
- Work case studies: `src/content/work.ts`
- Experience, tools, and resume link: `src/content/profile.ts`
- About introduction: `src/app/about/page.tsx`
- Recent-life photos: `public/images/about/recently/`, listed in `src/components/about/RecentGallery.tsx`

## Production build

```bash
npm run lint
npm run build
```

The default build targets the Next.js runtime on Vercel. For GitHub Pages under `/tanluc`, build with `GITHUB_PAGES=true npm run build`; the static site is generated in `out/`.

## Agent readiness

Vercel uses the Next.js runtime: `/` negotiates Markdown with `Accept: text/markdown`, while browsers keep HTML. Missing URLs return Markdown 404s to Markdown clients; existing pages and assets retain their normal responses. `/llms.txt`, `/robots.txt`, and `/sitemap.xml` describe the public site. Keep the sitemap current when adding pages.

Run `npm run build`, `npm run start -- --port 3180`, then `npm run test:agents`. Set `BASE_URL` to verify a deployed preview or production after deployment.

`GITHUB_PAGES=true npm run build` keeps the static export and `/tanluc` base path. Its `.tsx` page convention excludes the runtime proxy; GitHub Pages cannot negotiate Markdown without an additional server or edge layer. Use Vercel for the audited domain.

## Connect

[GitHub](https://github.com/tanlucdev) · [LinkedIn](https://www.linkedin.com/in/tanlucdev)
