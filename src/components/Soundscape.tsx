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
    return () => {
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
