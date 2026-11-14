"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CustomEase } from "gsap/CustomEase";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Flip } from "gsap/Flip";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(
    useGSAP,
    ScrollTrigger,
    SplitText,
    DrawSVGPlugin,
    MorphSVGPlugin,
    Flip,
    ScrollToPlugin,
    CustomEase
  );

  // Calibrated custom curves aligned across Emil Kowalski guide, gsap.com, and pangulo-ai
  CustomEase.create("inlOut", "0.23, 1, 0.32, 1");
  CustomEase.create("inlDrawer", "0.32, 0.72, 0, 1");
  CustomEase.create("inlInOut", "0.77, 0, 0.175, 1");
}

export const MOTION = {
  ease: {
    out: "inlOut",
    drawer: "inlDrawer",
    inOut: "inlInOut",
  },
  duration: {
    uiPress: 0.14,
    uiFast: 0.2,
    uiPanel: 0.24,
    reveal: 0.5,
    textLine: 0.54,
    svgDraw: 0.56,
  },
  stagger: {
    tight: 0.04,
    card: 0.075,
  },
  refreshPriority: {
    hero: 1,
    howItWorks: 2,
    workshop: 3,
    features: 4,
    stories: 5,
    faq: 6,
    startPracticing: 7,
    footer: 8,
  },
} as const;

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
export const FULL_MOTION_QUERY = "(prefers-reduced-motion: no-preference)";
export const FINE_HOVER_QUERY = "(hover: hover) and (pointer: fine)";

/**
 * Smoothly scrolls window to an anchor selector or ID while honoring prefers-reduced-motion.
 */
export function scrollToAnchor(target: string, offsetY = 16) {
  if (typeof window === "undefined") return;
  const reduceMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
  const destination =
    target === "#top"
      ? 0
      : { y: target, offsetY };

  gsap.to(window, {
    duration: reduceMotion ? 0 : 0.65,
    scrollTo: destination,
    ease: "power3.out",
    autoKill: true,
    overwrite: "auto",
  });
}

export { gsap, useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin, MorphSVGPlugin, Flip };

