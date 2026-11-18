# Tan Luc — Portfolio

Tan Luc’s software engineering portfolio. Next.js (App Router) + Tailwind.

## Features

- **Interactive grid hero** — hover the glowing cell to flip open a reveal, which lights up the next cell somewhere else. Eight reveals deep: work, photography, play, and trivia.
- Sections: Work (with case-study pages), Play, Photography, About.

## Getting started

```bash
npm install
npm run dev
```

## Swapping in real content

- Case studies: `src/content/work.ts`
- Play projects and photos: `src/content/misc.ts`
- Grid reveal chain (what each discovery shows): `src/components/hero/reveals.ts`

Placeholder covers are CSS gradients. Put About's recent-life images in `public/images/about/recents/`; files there are available at `/images/about/recents/<filename>`. Then replace each `cover` value in `src/components/about/RecentGallery.tsx` with `url("/images/about/recents/<filename>")`.

## Deploying

Push to GitHub and import into [Vercel](https://vercel.com).

## Agent readiness

Vercel uses the Next.js runtime: `/` negotiates Markdown with `Accept: text/markdown`, while browsers keep HTML. Missing URLs return Markdown 404s to Markdown clients; existing pages and assets retain their normal responses. `/llms.txt`, `/robots.txt`, and `/sitemap.xml` describe the public site. Keep the sitemap current when adding pages.

Run `npm run build`, `npm run start -- --port 3180`, then `npm run test:agents`. Set `BASE_URL` to verify a deployed preview or production after deployment.

`GITHUB_PAGES=true npm run build` keeps the static export and `/tanluc` base path. Its `.tsx` page convention excludes the runtime proxy; GitHub Pages cannot negotiate Markdown without an additional server or edge layer. Use Vercel for the audited domain.
