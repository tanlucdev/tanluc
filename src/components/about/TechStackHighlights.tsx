"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function TechStackHighlights({ children }: { children: ReactNode }) {
  const stack = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!stack.current || !("IntersectionObserver" in window)) return;
    const tools = Array.from(stack.current.querySelectorAll("[data-stack-tool]"));
    const visible = new Set<Element>();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let current = -1;
    let timer: number | undefined;

    const advance = () => {
      const next = tools.findIndex((tool, index) => index > current && visible.has(tool));
      const index = next >= 0 ? next : tools.findIndex((tool) => visible.has(tool));
      if (index === current) return;
      tools[current]?.removeAttribute("data-stack-highlight");
      tools[index]?.setAttribute("data-stack-highlight", "");
      current = index;
    };

    const stop = () => {
      window.clearTimeout(timer);
      timer = undefined;
      tools[current]?.removeAttribute("data-stack-highlight");
      current = -1;
    };

    // ponytail: One cadence for every group, with a longer hold before the loop wraps.
    const sync = () => {
      if (document.hidden || reduced.matches || !visible.size) {
        stop();
        return;
      }
      if (!visible.has(tools[current])) advance();
      if (timer === undefined && visible.size > 1) {
        const atEnd = !tools.some((tool, index) => index > current && visible.has(tool));
        timer = window.setTimeout(() => {
          timer = undefined;
          advance();
          sync();
        }, atEnd ? 1100 : 600);
      }
    };

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.intersectionRatio >= .6) visible.add(entry.target);
        else visible.delete(entry.target);
      }
      sync();
    }, { threshold: .6 });
    tools.forEach((tool) => observer.observe(tool));
    reduced.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      reduced.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      stop();
    };
  }, []);

  return <div ref={stack}>{children}</div>;
}
