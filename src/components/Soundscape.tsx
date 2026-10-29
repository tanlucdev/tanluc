"use client";

import { bind, setVolume } from "cuelume";
import { useEffect } from "react";

const INTERACTIVE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([type='hidden']):not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "summary",
  "[role='button']",
  "[role='link']",
  "[role='menuitem']",
  "[role='tab']",
  "[role='switch']",
].join(",");

function markInteractive(element: HTMLElement) {
  if (element.dataset.silentHover !== "true") {
    element.dataset.cuelumeHover = "tick";
    element.dataset.cuelumeAutomaticHover = "true";
  }

  element.dataset.cuelumePress = "press";
  element.dataset.cuelumeAutomaticClick = "true";
}

function markTree(node: Element) {
  if (node instanceof HTMLElement && node.matches(INTERACTIVE)) {
    markInteractive(node);
  }

  node.querySelectorAll<HTMLElement>(INTERACTIVE).forEach(markInteractive);
}

export function Soundscape() {
  useEffect(() => {
    setVolume(0.55);
    bind();
    markTree(document.body);

    const observer = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (node instanceof Element) markTree(node);
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    let wind: HTMLAudioElement | null = null;
    let startTimer = 0;
    let soundPlayed = false;
    const stopWind = () => {
      window.clearTimeout(startTimer);
      if (wind) {
        wind.pause();
        wind.currentTime = 0;
      }
      wind = null;
      window.dispatchEvent(new Event("portfolio:welcome-gust-ended"));
    };
    const playWind = (event: Event) => {
      const detail = (event as CustomEvent<{ startedAt?: number; trusted?: boolean }>).detail;
      const startedAt = detail?.startedAt;
      if (
        detail?.trusted !== true || typeof startedAt !== "number"
        || performance.now() - startedAt > 1800
        || document.hidden
        || window.matchMedia("(prefers-reduced-motion: reduce)").matches
        || !navigator.userActivation?.isActive
      ) return stopWind();
      try {
        if (sessionStorage.getItem("portfolio:welcome-gust-sound")) return stopWind();
        sessionStorage.setItem("portfolio:welcome-gust-sound", "1");
      } catch {
        if (soundPlayed) return stopWind();
      }
      soundPlayed = true;
      wind = new Audio(new URL("./audio/meadow-wind-leaves.mp3", document.baseURI).toString());
      wind.preload = "auto";
      wind.volume = 0.65;
      wind.addEventListener("ended", stopWind, { once: true });
      wind.addEventListener("playing", () => window.clearTimeout(startTimer), { once: true });
      startTimer = window.setTimeout(stopWind, 1800);
      const audio = wind;
      void audio.play().then(() => { if (wind !== audio) audio.pause(); }).catch(stopWind);
    };
    const onVisibilityChange = () => { if (document.hidden) stopWind(); };
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = () => { if (reducedMotion.matches) stopWind(); };
    window.addEventListener("portfolio:welcome-gust-sound", playWind);
    window.addEventListener("portfolio:welcome-gust-stop", stopWind);
    window.addEventListener("pagehide", stopWind);
    document.addEventListener("visibilitychange", onVisibilityChange);
    reducedMotion.addEventListener("change", onMotionChange);

    return () => {
      stopWind();
      window.removeEventListener("portfolio:welcome-gust-sound", playWind);
      window.removeEventListener("portfolio:welcome-gust-stop", stopWind);
      window.removeEventListener("pagehide", stopWind);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      reducedMotion.removeEventListener("change", onMotionChange);
      observer.disconnect();
      document
        .querySelectorAll<HTMLElement>("[data-cuelume-automatic-hover='true']")
        .forEach((element) => {
          delete element.dataset.cuelumeHover;
          delete element.dataset.cuelumeAutomaticHover;
        });
      document
        .querySelectorAll<HTMLElement>("[data-cuelume-automatic-click='true']")
        .forEach((element) => {
          delete element.dataset.cuelumePress;
          delete element.dataset.cuelumeAutomaticClick;
        });
    };
  }, []);

  return null;
}
