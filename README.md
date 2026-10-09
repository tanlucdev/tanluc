# Neel Saswade — Portfolio

A portfolio for a senior product designer, built on a graph-paper grid. Next.js (App Router) + Tailwind.

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

Placeholder covers are CSS gradients; replace `cover` values with image URLs and swap the `div`s for `next/image` when real assets are ready.

## Deploying

Push to GitHub and import into [Vercel](https://vercel.com).
