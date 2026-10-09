import { RecentGallery } from "@/components/about/RecentGallery";

export const metadata = { title: "About - Tan Luc" };

const SIDE_QUESTS = [
  {
    art: "h-[132px] w-[208px] border border-[#beab91] bg-[#e8e0d1] shadow-[0_8px_18px_rgba(47,45,40,0.1)]",
    title: "Glean Passport",
    copy: "A little record of the work and people that have shaped my practice.",
  },
  {
    art: "h-40 w-24 rounded-[18px] border-x-[3px] border-[#b77f60] bg-[#e6b08f]",
    title: "The Underwallet",
    copy: "A hands-on experiment in making something useful from a flat piece of leather.",
  },
  {
    art: "h-[148px] w-[228px] border border-[#698357] bg-[#88a96f]",
    title: "Task Valley",
    copy: "A tiny world for giving everyday work a little more character.",
  },
];

export default function About() {
  return (
    <div className="mx-auto w-[calc(100%-32px)] max-w-[740px] pb-20 pt-14 sm:w-[calc(100%-48px)] sm:pb-40 sm:pt-[clamp(128px,19vh,205px)]">
      <section className="grid items-start gap-9 md:grid-cols-[minmax(0,1fr)_248px] md:gap-14">
        <div className="order-2 max-w-none self-center md:order-1">
          <h1 className="mb-[13px] font-serif text-[30px] leading-[1.15] italic text-ink">Hello!</h1>
          <div className="space-y-[18px] font-serif text-[18px] leading-[1.55] tracking-[-0.012em] text-ink-soft">
            <p>
              I&apos;m Tan Luc, a product designer drawn to ambiguous problems, quiet
              systems, and the interactions that make technology feel natural.
            </p>
            <p>
              I found my way into design through a human-robot interaction lab.
              Watching people meet unfamiliar machines made me curious about how
              we introduce new ideas in ways that make sense.
            </p>
          </div>
          <nav aria-label="Professional links" className="mt-7 flex items-center gap-[18px] text-ink-soft">
            <button aria-label="GitHub" className="grid size-5 cursor-pointer place-items-center rounded-sm outline-offset-4 focus-visible:outline-2 focus-visible:outline-ink" type="button">
              <svg aria-hidden="true" className="size-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.18-3.37-1.18-.45-1.15-1.11-1.46-1.11-1.46-.91-.62.07-.61.07-.61 1 .07 1.54 1.04 1.54 1.04.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03A9.55 9.55 0 0 1 12 6.8c.85 0 1.7.12 2.5.34 1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.85-2.34 4.7-4.57 4.95.36.31.68.91.68 1.84v2.73c0 .26.18.57.69.48A10 10 0 0 0 12 2Z" />
              </svg>
            </button>
            <button aria-label="LinkedIn" className="grid size-5 cursor-pointer place-items-center rounded-sm outline-offset-4 focus-visible:outline-2 focus-visible:outline-ink" type="button">
              <svg aria-hidden="true" className="size-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.45 20.45H16.9v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13Zm1.78 13.02H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
              </svg>
            </button>
            <span aria-hidden="true" className="h-6 w-px bg-ink/15" />
            <button className="flex cursor-pointer items-center gap-1.5 rounded-sm font-sans text-base leading-none outline-offset-4 focus-visible:outline-2 focus-visible:outline-ink" type="button">
              <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
                <path d="M14 3H7.5A2.5 2.5 0 0 0 5 5.5v13A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V8zM14 3v3.5A1.5 1.5 0 0 0 15.5 8H19M9 13h6M9 16.5h4" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              Resume
            </button>
          </nav>
        </div>

        <div className="order-1 mx-auto w-[200px] rotate-[1.5deg] bg-white p-[10px] md:order-2 md:mx-0 md:w-[248px]">
          <div className="flex aspect-[3/4] items-center justify-center rounded-[8px] border border-dashed border-ink/20 bg-[linear-gradient(135deg,#d9c7b1,#9a765e)] p-6 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-white/85">
            Your portrait<br />goes here
          </div>
        </div>
      </section>

      <section className="mt-16 sm:mt-[100px]">
        <RecentGallery />
      </section>

      <section className="mt-16 sm:mt-24">
        <h2 className="mb-8 font-serif text-[24px] leading-[1.2] italic text-ink-soft">Side quests</h2>
        <div className="grid gap-10 sm:grid-cols-3">
          {SIDE_QUESTS.map((quest) => (
            <article key={quest.title}>
              <div className="flex aspect-[1.6] items-center justify-center">
                <div aria-label={`${quest.title} artwork placeholder`} className={quest.art} role="img" />
              </div>
              <h3 className="mt-7 mb-2 font-serif text-[20px] leading-[1.3] text-ink-soft">{quest.title}</h3>
              <p className="font-serif text-[16px] leading-[1.5] text-ink-soft/80">{quest.copy}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
