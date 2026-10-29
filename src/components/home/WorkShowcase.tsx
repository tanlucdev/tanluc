"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { HOME_SHOWCASE, type HomeShowcaseProject } from "@/content/home-showcase";
import styles from "./WorkShowcase.module.css";

const base = "/images/work/reference";
const psychicCards = Array.from({ length: 18 }, (_, index) => `${base}/psychic-cards/card-${(index * 7) % 18}.png`);
const homepageCards = [8, 5, 2, 6, 1, 3, 7, 0, 4, 9].map((index) => `${base}/homepage-cards/homepage_cards${index ? `-${index}` : ""}.png`);
const skinFiles = ["gmail-skin.png", "slack-skin.png", "outlook-skin.png"];

function useVisibility<T extends Element>(threshold: number) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold });
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, visible] as const;
}

function useMotionPreference() {
  const [reduced, setReduced] = useState(false);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    const visibility = () => setHidden(document.hidden);
    update();
    visibility();
    media.addEventListener("change", update);
    document.addEventListener("visibilitychange", visibility);
    return () => { media.removeEventListener("change", update); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  return { reduced, hidden };
}

function MediaVideo({ src, poster, label, playing }: { src: string; poster: string; label: string; playing: boolean }) {
  const [ref, visible] = useVisibility<HTMLVideoElement>(0.2);
  const { reduced, hidden } = useMotionPreference();
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (playing && visible && !reduced && !hidden) video.play().catch(() => undefined);
    else video.pause();
    return () => video.pause();
  }, [playing, visible, reduced, hidden, ref]);
  return <video ref={ref} className={styles.video} aria-label={label} loop muted playsInline preload="metadata" poster={poster}><source src={src} type="video/mp4" /></video>;
}

function ProactiveMedia({ running }: { running: boolean }) {
  const [ref, visible] = useVisibility<HTMLDivElement>(0.1);
  const [step, setStep] = useState(0);
  const { reduced, hidden } = useMotionPreference();
  const active = running && visible && !reduced && !hidden;
  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => setStep((value) => value + 1), 3400);
    return () => window.clearInterval(timer);
  }, [active]);
  return <div className={styles.media} role="group" aria-label="Product experience media">
    <MediaVideo src={`${base}/psychic-updated.mp4`} poster={`${base}/psychic-updated-poster.jpg`} label="Product walkthrough" playing={running} />
    <div className={`${styles.panel} ${styles.popups}`}><img src={`${base}/psychic-popups-shadow.png`} alt="" /></div>
    <div ref={ref} className={styles.cards} data-running={active} role="img" aria-label="A rotating collection of product cards"><div className={styles.cardCanvas}>{psychicCards.map((src, index) => {
      const offset = (index - (step % 18) + 27) % 18 - 9;
      return <img key={src} className={styles.card} src={src} alt="" aria-hidden="true" style={{ opacity: Math.abs(offset) > 4 ? 0 : 1, transform: `translate(-50%, -50%) translateY(${offset * 16.35}cqw) perspective(600px) rotateX(${-offset * 12}deg) scale(${Math.max(.8, 1 - Math.abs(offset) * .035)})`, transition: Math.abs(offset) > 4 ? "none" : undefined }} />;
    })}</div></div>
  </div>;
}

function HomepageMedia({ running }: { running: boolean }) {
  const [ref, visible] = useVisibility<HTMLDivElement>(0.1);
  const [before, setBefore] = useState(false);
  const { reduced, hidden } = useMotionPreference();
  const active = running && visible && !reduced && !hidden;
  return <div className={styles.media} role="group" aria-label="Product experience media">
    <div className={styles.comparison} data-before={before}>
      <div className={styles.comparisonTrack}>
        <button className={styles.screen} type="button" aria-label="Show earlier product screen" aria-pressed={before} onClick={() => setBefore(true)}><img src={`${base}/homepage-before.png`} alt="Earlier product screen" /></button>
        <button className={styles.screen} type="button" aria-label="Show current product screen" aria-pressed={!before} onClick={() => setBefore(false)}><MediaVideo src={`${base}/homepage-final.mp4`} poster={`${base}/homepage-final-poster.jpg`} label="Current product screen" playing={running && !before} /></button>
      </div>
      <button className={styles.comparisonLabel} type="button" onClick={() => setBefore((value) => !value)}>{before ? "After →" : "← Before"}</button>
    </div>
    <div className={`${styles.panel} ${styles.corner}`}><img src={`${base}/homepage-company-corner.png`} alt="" /></div>
    <div ref={ref} className={styles.cards} data-running={active} tabIndex={0} role="region" aria-label="Product cards. Focus or hover pauses movement."><div className={styles.cardStream}>{[0, 1].map((group) => <div key={group} className={styles.cardGroup} aria-hidden={group === 1}>{homepageCards.map((src, index) => <img key={src} src={src} alt={group === 0 ? `Product update ${index + 1}` : ""} />)}</div>)}</div></div>
  </div>;
}

function artifactKeyframes(index: number) {
  const frames: Keyframe[] = [];
  for (let step = 0; step < 3; step += 1) {
    const front = (index - step + 3) % 3;
    const next = (index - step + 2) % 3;
    const stacked = (depth: number) => `translate(-50%, ${24 - depth * 9}cqw) scale(${1 - depth * .06})`;
    const frontTransform = "translate(-50%, 7cqw) scale(1)";
    const push = (offset: number, transform: string, opacity: number, zIndex: number) => frames.push({ offset: (step * 5 + offset) / 15, transform, opacity, zIndex, easing: "cubic-bezier(.77, 0, .175, 1)" });
    push(0, stacked(front), 1, 3 - front); push(.9, stacked(front), 1, 3 - front);
    push(1.5, front === 0 ? frontTransform : stacked(front), Number(front === 0), 3 - front);
    push(3.8, front === 0 ? frontTransform : stacked(front), Number(front === 0), 3 - front);
    push(4.4, stacked(front), 1, 3 - front); push(5, stacked(next), 1, 3 - next);
  }
  return frames;
}

function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.dataset.revealReady = "true";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { node.classList.add(styles.isVisible); return; }
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { node.classList.add(styles.isVisible); observer.unobserve(node); } }, { rootMargin: "0px 0px -12% 0px", threshold: .08 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={styles.reveal}>{children}</div>;
}

function ArtifactMedia({ running }: { running: boolean }) {
  const [ref, visible] = useVisibility<HTMLDivElement>(0.15);
  const skinsRef = ref;
  const animations = useRef<Animation[]>([]);
  const { reduced, hidden } = useMotionPreference();
  const active = running && visible && !reduced && !hidden;
  useEffect(() => {
    const skins = skinsRef.current;
    if (!skins) return;
    animations.current = Array.from(skins.querySelectorAll("img")).map((image, index) => {
      const animation = image.animate(artifactKeyframes(index), { duration: 15000, iterations: Infinity, fill: "both" });
      animation.pause();
      return animation;
    });
    return () => animations.current.forEach((animation) => animation.cancel());
  }, [skinsRef]);
  useEffect(() => {
    animations.current.forEach((animation) => {
      if (reduced) { animation.pause(); animation.currentTime = 0; }
      else if (active) animation.play();
      else animation.pause();
    });
  }, [active, reduced]);
  return <div className={`${styles.media} ${styles.artifactMedia}`} role="group" aria-label="Product experience media">
    <div className={`${styles.panel} ${styles.document}`}><img src={`${base}/artifacts/document.png`} alt="Document experience" /></div>
    <div className={`${styles.panel} ${styles.edit}`}><img src={`${base}/artifacts/edit-with-ai.png`} alt="Editing tools" /></div>
    <div ref={skinsRef} className={styles.skins} aria-label="Gmail, Slack, and Outlook skins">{skinFiles.map((file, index) => <img key={file} className={styles.skin} src={`${base}/artifacts/${file}`} alt={`${["Gmail", "Slack", "Outlook"][index]} skin`} style={{ transform: `translate(-50%, ${24 - index * 9}cqw) scale(${1 - index * .06})`, zIndex: 3 - index }} />)}</div>
  </div>;
}

function ProjectMedia({ project, running }: { project: HomeShowcaseProject; running: boolean }) {
  if (project.media === "proactive") return <ProactiveMedia running={running} />;
  if (project.media === "homepage") return <HomepageMedia running={running} />;
  return <ArtifactMedia running={running} />;
}

function ease(progress: number) {
  const cubic = (time: number, p1: number, p2: number) => 3 * (1 - time) ** 2 * time * p1 + 3 * (1 - time) * time ** 2 * p2 + time ** 3;
  let low = 0;
  let high = 1;
  for (let index = 0; index < 14; index += 1) { const mid = (low + high) / 2; if (cubic(mid, .77, .175) < progress) low = mid; else high = mid; }
  return cubic((low + high) / 2, 0, 1);
}

export default function WorkShowcase() {
  const navRef = useRef<HTMLElement>(null);
  const stopScrollRef = useRef<() => void>(() => undefined);
  const [active, setActive] = useState<string>(HOME_SHOWCASE[0].slug);
  const [navRevealed, setNavRevealed] = useState(false);
  const [motionPaused, setMotionPaused] = useState(false);

  useLayoutEffect(() => {
    const nav = navRef.current;
    const link = nav?.querySelector<HTMLAnchorElement>(`a[aria-current="location"]`);
    const dot = nav?.querySelector<HTMLElement>(`[data-work-dot]`);
    if (!nav || !link || !dot) return;
    const position = () => { dot.style.transform = `translate3d(${link.offsetLeft}px, ${link.offsetTop + parseFloat(getComputedStyle(link).fontSize) * .55}px, 0)`; dot.dataset.positioned = "true"; };
    position();
    const observer = new ResizeObserver(position);
    observer.observe(nav);
    nav.querySelectorAll("a").forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [active]);

  useEffect(() => {
    const targets = HOME_SHOWCASE.map(({ slug }) => document.getElementById(`work-${slug}`)).filter((item): item is HTMLElement => Boolean(item));
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) setActive(entry.target.id.replace("work-", "")); }), { rootMargin: "-20% 0px -65% 0px", threshold: 0 });
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    const media = document.querySelector(`.${styles.media}`);
    if (!nav || !media) return;
    nav.dataset.ready = "true";
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setNavRevealed(true); observer.disconnect(); } }, { rootMargin: "0px 0px -45% 0px", threshold: 0 });
    observer.observe(media);
    return () => observer.disconnect();
  }, []);

  const moveTo = (target: HTMLElement, animated: boolean, duration = 560, ignoreWheel = false, onStop?: () => void) => {
    stopScrollRef.current();
    const destination = window.scrollY + target.getBoundingClientRect().top - Math.max(32, (window.innerHeight - target.getBoundingClientRect().height) / 2);
    if (!animated || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { window.scrollTo({ top: destination, behavior: "instant" }); return; }
    const initial = window.scrollY;
    const started = performance.now();
    let frame = 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stop = (event?: Event) => { if (ignoreWheel && event?.type === "wheel") return; cancelAnimationFrame(frame); window.removeEventListener("wheel", stop); window.removeEventListener("touchstart", stop); window.removeEventListener("pointerdown", stop); window.removeEventListener("keydown", stop); window.removeEventListener("resize", stop); reducedMotion.removeEventListener("change", stop); onStop?.(); };
    const tick = (now: number) => { const progress = Math.min(1, (now - started) / duration); window.scrollTo({ top: initial + (destination - initial) * ease(progress), behavior: "instant" }); if (progress < 1) frame = requestAnimationFrame(tick); else stop(); };
    ["wheel", "touchstart", "pointerdown", "keydown", "resize"].forEach((event) => window.addEventListener(event, stop, { once: true, passive: true }));
    reducedMotion.addEventListener("change", stop, { once: true });
    stopScrollRef.current = stop;
    frame = requestAnimationFrame(tick);
  };

  useEffect(() => {
    const scrollHash = () => { const hash = window.location.hash; const target = hash === "#work" ? document.getElementById(`work-${HOME_SHOWCASE[0].slug}`) : document.getElementById(hash.slice(1)); if (target) requestAnimationFrame(() => moveTo(target, false)); };
    scrollHash();
    window.addEventListener("hashchange", scrollHash);
    return () => { stopScrollRef.current(); window.removeEventListener("hashchange", scrollHash); };
  }, []);

  useEffect(() => {
    const firstProject = document.getElementById(`work-${HOME_SHOWCASE[0].slug}`);
    if (!firstProject) return;
    const desktop = window.matchMedia("(min-width: 1080px) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let burst = 0;
    let handoff = false;
    let scrolling = false;
    const cancel = () => { window.clearTimeout(burst); handoff = false; scrolling = false; stopScrollRef.current(); };
    const destination = () => {
      const rect = firstProject.getBoundingClientRect();
      return window.scrollY + rect.top - Math.max(32, (window.innerHeight - rect.height) / 2);
    };
    const bypassesWheelHandoff = (target: EventTarget | null) => {
      if (!(target instanceof Element) || target.closest("dialog, [role='dialog'], button, input, textarea, select, [contenteditable='true'], .meadow-settings__panel")) return true;
      for (let element: Element | null = target; element && element !== document.body; element = element.parentElement) {
        if (/(auto|scroll)/.test(getComputedStyle(element).overflowY) && element.scrollHeight > element.clientHeight + 1) return true;
      }
      return false;
    };
    const onWheel = (event: WheelEvent) => {
      const vertical = Math.abs(event.deltaY) > Math.abs(event.deltaX);
      const eligible = desktop.matches && !reducedMotion.matches && !event.ctrlKey && !event.metaKey && vertical && !bypassesWheelHandoff(event.target);
      const initial = window.scrollY <= 8 && destination() > window.innerHeight * .5;
      if (eligible && event.deltaY > 0 && (handoff || scrolling || initial)) {
        if (event.cancelable) event.preventDefault();
        if (!handoff && !scrolling) {
          if (!event.cancelable) return;
          cancel();
          moveTo(firstProject, true, 900, true, () => { scrolling = false; });
          handoff = true;
          scrolling = true;
        }
        window.clearTimeout(burst);
        burst = window.setTimeout(() => { handoff = false; }, 140);
        return;
      }
      cancel();
    };
    const onMediaChange = () => cancel();
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", cancel);
    window.addEventListener("pointerdown", cancel);
    window.addEventListener("resize", cancel);
    desktop.addEventListener("change", onMediaChange);
    reducedMotion.addEventListener("change", onMediaChange);
    return () => {
      window.clearTimeout(burst);
      cancel();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", cancel);
      window.removeEventListener("pointerdown", cancel);
      window.removeEventListener("resize", cancel);
      desktop.removeEventListener("change", onMediaChange);
      reducedMotion.removeEventListener("change", onMediaChange);
    };
  }, []);

  const running = !motionPaused;
  return <section id="work" className={`portfolio-home-work ${styles.showcase}`} aria-labelledby="work-title">
    <div className={styles.editorial}>
      <aside className={styles.rail}><nav ref={navRef} className={styles.nav} data-revealed={navRevealed} aria-label="Selected work">{HOME_SHOWCASE.map((project) => <a key={project.slug} href={`#work-${project.slug}`} aria-current={active === project.slug ? "location" : undefined} onClick={(event) => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); history.pushState(null, "", `#work-${project.slug}`); const target = document.getElementById(`work-${project.slug}`); if (target) { moveTo(target, true); target.focus({ preventScroll: true }); } }}>{project.company}</a>)}<span className={styles.dot} data-work-dot aria-hidden="true" /></nav></aside>
      <div className={styles.content}><h2 id="work-title" className={styles.label}><span className={styles.srOnly}>Work</span></h2>{HOME_SHOWCASE.map((project) => <section key={project.slug} id={`work-${project.slug}`} className={styles.project} tabIndex={-1} aria-labelledby={`work-${project.slug}-title`}><Reveal><header className={styles.header}><h3 id={`work-${project.slug}-title`} className={styles.title}>{project.title}</h3><div className={styles.meta}><span>{project.company}</span><span>—</span></div></header><ProjectMedia project={project} running={running} /><p className={styles.summary}>{project.summary}</p></Reveal></section>)}<button className={styles.motionControl} type="button" aria-pressed={motionPaused} onClick={() => setMotionPaused((value) => !value)}>{motionPaused ? "Resume motion" : "Pause motion"}</button></div>
    </div>
  </section>;
}
