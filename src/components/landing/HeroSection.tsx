"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  FINE_HOVER_QUERY,
  FULL_MOTION_QUERY,
  MOTION,
  REDUCED_MOTION_QUERY,
  ScrollTrigger,
  SplitText,
  gsap,
  scrollToAnchor,
  useGSAP,
} from "@/lib/gsap";
import { LandingNavbar } from "./LandingNavbar";
import { ArrowRightStrokeIcon, HeroHrPeekLeftSvg, HeroHrPeekTopSvg } from "./MotionVectors";

interface JobPlatformItem {
  name: string;
  iconSrc: string;
}

const JOB_PLATFORMS: readonly JobPlatformItem[] = [
  { name: "Indeed", iconSrc: "/assets/logo-indeed.svg" },
  { name: "LinkedIn", iconSrc: "/assets/logo-linkedin.svg" },
  { name: "Jobstreet", iconSrc: "/assets/logo-jobstreet.svg" },
  { name: "Glassdoor", iconSrc: "/assets/logo-glassdoor.svg" },
  { name: "Kalibrr", iconSrc: "/assets/logo-kalibrr.svg" },
  { name: "Upwork", iconSrc: "/assets/logo-upwork.svg" },
  { name: "Monster", iconSrc: "/assets/logo-monster.svg" },
  { name: "ZipRecruiter", iconSrc: "/assets/logo-ziprecruiter.svg" },
] as const;

interface HeroWordTheme {
  word: string;
  bg: string;
  text: string;
  dot: string;
}

const HERO_WORD_STATES: readonly HeroWordTheme[] = [
  {
    word: "own",
    bg: "#efe6fc",
    text: "#4c2b78",
    dot: "#6d42a6",
  },
  {
    word: "nail",
    bg: "#ffedd5",
    text: "#9a3412",
    dot: "#ea580c",
  },
  {
    word: "ace",
    bg: "#dcfce7",
    text: "#14532d",
    dot: "#16a34a",
  },
  {
    word: "lead",
    bg: "#e0f2fe",
    text: "#1e3a8a",
    dot: "#2563eb",
  },
] as const;

/** Aligned job-platform logo tile rendered inside the continuous hero marquee. */
function JobPlatformTile({ name, iconSrc }: JobPlatformItem) {
  return (
    <div
      data-marquee-item=""
      className="mx-2 flex h-[48px] shrink-0 items-center gap-2.5 rounded-[12px] border border-[#e3daf1] bg-white/90 px-4 shadow-[0_2px_10px_rgba(32,33,36,0.04)] transition-colors duration-200 hover:border-[#b79ee0] hover:bg-white sm:mx-2.5 sm:h-[52px] sm:px-[18px]"
    >
      <span
        data-marquee-icon=""
        className="inline-flex size-[26px] shrink-0 items-center justify-center [transform-style:preserve-3d]"
      >
        <img
          alt=""
          src={iconSrc}
          width={24}
          height={24}
          className="block size-[22px] max-w-none object-contain sm:size-[24px]"
        />
      </span>
      <span className="whitespace-nowrap text-[13.5px] font-medium tracking-[-0.01em] text-[#3b294d] sm:text-[14.5px]">
        {name}
      </span>
    </div>
  );
}

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = sectionRef.current;
      if (!root) return;

      // Release SSR FOUC opacity gate synchronously before paint
      delete document.documentElement.dataset.motionReady;

      const mm = gsap.matchMedia();

      mm.add(
        {
          fullMotion: FULL_MOTION_QUERY,
          reduceMotion: REDUCED_MOTION_QUERY,
          finePointer: `${FINE_HOVER_QUERY} and ${FULL_MOTION_QUERY}`,
        },
        (context) => {
          const { reduceMotion, finePointer } = context.conditions ?? {};

          const initNodes = root.querySelectorAll("[data-hero-init]");
          const headlineEl = root.querySelector<HTMLElement>("[data-hero-headline]");
          const l1Words = gsap.utils.toArray<HTMLElement>("[data-hero-l1-word]", root);
          const l2Words = gsap.utils.toArray<HTMLElement>("[data-hero-l2-word]", root);

          const pillEl = root.querySelector<HTMLElement>("[data-hero-pill]");
          const pillDotEl = root.querySelector<HTMLElement>("[data-hero-pill-dot]");
          const pillPulseEl = root.querySelector<HTMLElement>("[data-hero-pill-pulse]");
          const pillTrackEl = root.querySelector<HTMLElement>("[data-hero-pill-track]");
          const wordEls = gsap.utils.toArray<HTMLElement>("[data-hero-word]", root);

          const subEl = root.querySelector<HTMLElement>("[data-hero-sub]");
          const ctaItems = gsap.utils.toArray<HTMLElement>("[data-hero-cta]", root);
          const previewScrubEl = root.querySelector<HTMLElement>("[data-hero-preview-scrub]");
          const previewEl = root.querySelector<HTMLElement>("[data-hero-preview]");
          const previewImgEl = root.querySelector<HTMLElement>("[data-hero-preview-img]");
          const hrTopEl = root.querySelector<HTMLElement>("[data-hr-peek-top]");
          const hrLeftEl = root.querySelector<HTMLElement>("[data-hr-peek-left]");
          const hrTopEyesEl = root.querySelector<SVGGElement>("[data-hr-top-eyes]");
          const hrLeftEyesEl = root.querySelector<SVGGElement>("[data-hr-left-eyes]");

          const marqueeContainerEl = root.querySelector<HTMLElement>("[data-hero-marquee]");
          const marqueeViewportEl = root.querySelector<HTMLElement>("[data-marquee-viewport]");
          const marqueeTrackEl = root.querySelector<HTMLElement>("[data-marquee-track]");
          const marqueeDuplicateEl = root.querySelector<HTMLElement>("[data-marquee-duplicate]");
          const marqueeIcons = gsap.utils.toArray<HTMLElement>("[data-marquee-icon]", root);

          const spotlightIcons = gsap.utils.toArray<HTMLElement>("[data-spotlight-icon]", root);
          const spotlightNames = gsap.utils.toArray<HTMLElement>("[data-spotlight-name]", root);

          if (reduceMotion) {
            if (pillPulseEl) gsap.set(pillPulseEl, { autoAlpha: 0 });
            if (marqueeDuplicateEl) gsap.set(marqueeDuplicateEl, { display: "none" });
            if (marqueeViewportEl) {
              gsap.set(marqueeViewportEl, {
                maskImage: "none",
                webkitMaskImage: "none",
                overflow: "visible",
              });
            }
            if (marqueeTrackEl) {
              gsap.set(marqueeTrackEl, { width: "100%", justifyContent: "center" });
              const firstGroup = marqueeTrackEl.firstElementChild as HTMLElement | null;
              if (firstGroup) {
                gsap.set(firstGroup, { flexWrap: "wrap", justifyContent: "center", gap: "10px" });
              }
            }
            gsap.fromTo(
              initNodes,
              { autoAlpha: 0 },
              {
                autoAlpha: 1,
                duration: 0.2,
                stagger: 0.025,
                ease: MOTION.ease.out,
                clearProps: "visibility,opacity",
              }
            );
            return;
          }

          gsap.set([headlineEl, subEl].filter(Boolean), { autoAlpha: 1 });

          // Measure initial pill word widths without causing any SSR width pop
          const measureWordWidths = () =>
            wordEls.map((el) => Math.ceil(el.getBoundingClientRect().width) + 2);

          let wordWidths = measureWordWidths();

          if (pillTrackEl && wordEls.length > 0) {
            gsap.set(pillTrackEl, { width: wordWidths[0] });
            wordEls.forEach((wordEl, idx) => {
              gsap.set(wordEl, {
                position: "absolute",
                left: 0,
                top: "0.08em",
                autoAlpha: idx === 0 ? 1 : 0,
              });
            });
          }

          if (spotlightIcons.length && spotlightNames.length) {
            spotlightIcons.forEach((el, idx) =>
              gsap.set(el, { autoAlpha: idx === 0 ? 1 : 0, rotationY: 0 })
            );
            spotlightNames.forEach((el, idx) =>
              gsap.set(el, { autoAlpha: idx === 0 ? 1 : 0, y: 0 })
            );
          }

          // 1. Entrance Choreography (< 650ms perceptual readiness)
          const entranceTl = gsap.timeline({
            defaults: { ease: MOTION.ease.out },
          });

          if (l1Words.length) {
            entranceTl.fromTo(
              l1Words,
              { autoAlpha: 0, yPercent: 108 },
              {
                autoAlpha: 1,
                yPercent: 0,
                duration: 0.48,
                stagger: 0.045,
                clearProps: "transform,opacity,visibility",
              },
              0.04
            );
          }

          if (pillEl) {
            entranceTl.fromTo(
              pillEl,
              { autoAlpha: 0, scale: 0.9, yPercent: 60 },
              {
                autoAlpha: 1,
                scale: 1,
                yPercent: 0,
                duration: 0.46,
                ease: "back.out(1.35)",
                clearProps: "transform,opacity,visibility",
              },
              0.16
            );
          }

          if (l2Words.length) {
            entranceTl.fromTo(
              l2Words,
              { autoAlpha: 0, yPercent: 108 },
              {
                autoAlpha: 1,
                yPercent: 0,
                duration: 0.46,
                stagger: 0.042,
                clearProps: "transform,opacity,visibility",
              },
              0.14
            );
          }

          if (subEl) {
            SplitText.create(subEl, {
              type: "lines",
              mask: "lines",
              autoSplit: true,
              aria: "auto",
              onSplit(self) {
                return gsap.from(self.lines, {
                  yPercent: 105,
                  duration: 0.46,
                  stagger: 0.06,
                  delay: 0.24,
                  ease: MOTION.ease.out,
                  clearProps: "transform",
                });
              },
            });
          }

          if (ctaItems.length) {
            entranceTl.fromTo(
              ctaItems,
              { autoAlpha: 0, y: 12, scale: 0.97 },
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 0.36,
                stagger: 0.055,
                clearProps: "transform",
              },
              0.3
            );
          }

          if (previewEl) {
            entranceTl.fromTo(
              previewEl,
              { autoAlpha: 0, y: 24, scale: 0.975 },
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 0.56,
                ease: MOTION.ease.drawer,
                clearProps: "transform",
              },
              0.34
            );
          }

          if (previewImgEl) {
            entranceTl.fromTo(
              previewImgEl,
              { scale: 1.025 },
              { scale: 1, duration: 0.66, ease: MOTION.ease.out, clearProps: "transform" },
              0.34
            );
          }

          if (hrTopEl) {
            entranceTl.fromTo(
              hrTopEl,
              { autoAlpha: 0, y: 24 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.48,
                ease: "back.out(1.45)",
                clearProps: "transform",
              },
              0.48
            );
          }

          if (hrLeftEl) {
            entranceTl.fromTo(
              hrLeftEl,
              { autoAlpha: 0, x: 24, rotation: 4, transformOrigin: "100% 55%" },
              {
                autoAlpha: 1,
                x: 0,
                rotation: 0,
                duration: 0.52,
                ease: "back.out(1.35)",
                clearProps: "transform",
              },
              0.52
            );
          }

          if (marqueeContainerEl) {
            entranceTl.fromTo(
              marqueeContainerEl,
              { autoAlpha: 0, y: 16 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.44,
                ease: MOTION.ease.out,
                clearProps: "transform",
              },
              0.44
            );
          }

          // 2. Live Notion/GSAP Color-Morphing Verb Pill ("own" -> "nail" -> "ace" -> "lead")
          let wordCycleTl: gsap.core.Timeline | null = null;
          let activeWordIdx = 0;

          if (pillTrackEl && wordEls.length > 1) {
            wordCycleTl = gsap.timeline({
              repeat: -1,
              delay: 1.75,
            });

            wordEls.forEach((_, idx) => {
              const nextIdx = (idx + 1) % wordEls.length;
              const nextTheme = HERO_WORD_STATES[nextIdx];
              const currentWord = wordEls[idx];
              const nextWord = wordEls[nextIdx];
              const currentChars = gsap.utils.toArray<HTMLElement>("[data-word-char]", currentWord);
              const nextChars = gsap.utils.toArray<HTMLElement>("[data-word-char]", nextWord);

              wordCycleTl!.add(() => {
                activeWordIdx = nextIdx;
                gsap.to(pillTrackEl, {
                  width: wordWidths[nextIdx],
                  duration: 0.42,
                  ease: MOTION.ease.drawer,
                  overwrite: "auto",
                });
              });

              wordCycleTl!.set(nextWord, { autoAlpha: 1 });

              if (pillEl) {
                wordCycleTl!.to(
                  pillEl,
                  {
                    backgroundColor: nextTheme.bg,
                    color: nextTheme.text,
                    duration: 0.42,
                    ease: MOTION.ease.drawer,
                  },
                  "<"
                );
              }

              if (pillDotEl) {
                wordCycleTl!.to(
                  pillDotEl,
                  { backgroundColor: nextTheme.dot, duration: 0.42, ease: MOTION.ease.drawer },
                  "<"
                );
              }

              if (pillPulseEl) {
                wordCycleTl!.to(
                  pillPulseEl,
                  { backgroundColor: nextTheme.dot, duration: 0.42, ease: MOTION.ease.drawer },
                  "<"
                );
              }

              wordCycleTl!
                .fromTo(
                  currentChars,
                  { yPercent: 0, rotationX: 0, autoAlpha: 1 },
                  {
                    yPercent: -115,
                    rotationX: 48,
                    autoAlpha: 0,
                    duration: 0.3,
                    stagger: 0.022,
                    ease: "power2.in",
                    immediateRender: false,
                  },
                  "<"
                )
                .set(currentWord, { autoAlpha: 0 })
                .fromTo(
                  nextChars,
                  { yPercent: 115, rotationX: -56, autoAlpha: 0 },
                  {
                    yPercent: 0,
                    rotationX: 0,
                    autoAlpha: 1,
                    duration: 0.38,
                    stagger: 0.026,
                    ease: "back.out(1.35)",
                    immediateRender: false,
                    clearProps: "transform",
                  },
                  "<0.08"
                )
                .to({}, { duration: 2.15 });
            });
          }

          // Soft radar pulse on the pill dot
          const pillDotPulseTween = pillPulseEl
            ? gsap.fromTo(
                pillPulseEl,
                { scale: 1, autoAlpha: 0.65 },
                {
                  scale: 2.3,
                  autoAlpha: 0,
                  duration: 1.8,
                  ease: "power2.out",
                  repeat: -1,
                  delay: 0.8,
                }
              )
            : null;

          // Keep measured word pill widths crisp across responsive viewport changes & webfont load
          let disposed = false;
          const refreshWidths = () => {
            if (disposed || !pillTrackEl) return;
            wordWidths = measureWordWidths();
            gsap.set(pillTrackEl, { width: wordWidths[activeWordIdx] ?? wordWidths[0] });
          };
          const resizeObserver =
            pillTrackEl && typeof ResizeObserver !== "undefined"
              ? new ResizeObserver(refreshWidths)
              : null;
          if (resizeObserver && headlineEl) {
            resizeObserver.observe(headlineEl);
          }
          document.fonts?.ready.then(refreshWidths);

          // 3. Notion-style Scroll Expansion on the Sharp-Cornered Product Preview
          if (previewScrubEl) {
            gsap.to(previewScrubEl, {
              scale: 1.04,
              y: -12,
              transformOrigin: "50% 18%",
              ease: "none",
              scrollTrigger: {
                trigger: root,
                start: "top top",
                end: "bottom 35%",
                scrub: 0.75,
                refreshPriority: MOTION.refreshPriority.hero,
              },
            });
          }

          // 4. Seamless Rotating Job-Platform Logo Marquee + 3D Icon Coin Spotlight
          const marqueeTween = marqueeTrackEl
            ? gsap.to(marqueeTrackEl, {
                xPercent: -50,
                duration: 28,
                ease: "none",
                repeat: -1,
              })
            : null;

          // Subtle paired 3D coin flip glint across marquee icons so tiles never feel static
          const halfCount = JOB_PLATFORMS.length;
          const iconGlintTl = marqueeIcons.length >= halfCount
            ? gsap.timeline({ repeat: -1, delay: 1.2 })
            : null;

          if (iconGlintTl) {
            for (let idx = 0; idx < halfCount; idx += 1) {
              const paired = [marqueeIcons[idx], marqueeIcons[idx + halfCount]].filter(Boolean);
              iconGlintTl.to(
                paired,
                {
                  rotationY: 360,
                  duration: 0.68,
                  ease: "power2.inOut",
                  clearProps: "transform",
                },
                idx === 0 ? 0 : ">0.7"
              );
            }
          }

          // 3D Coin spotlight rotator synchronized beside "PRACTICE FOR ROLES ACROSS"
          let spotlightTl: gsap.core.Timeline | null = null;
          if (spotlightIcons.length > 1 && spotlightNames.length > 1) {
            spotlightTl = gsap.timeline({ repeat: -1, delay: 1.2 });

            spotlightIcons.forEach((_, idx) => {
              const nextIdx = (idx + 1) % spotlightIcons.length;
              spotlightTl!
                .to({}, { duration: 1.8 })
                .to(spotlightIcons[idx], {
                  rotationY: 90,
                  autoAlpha: 0,
                  duration: 0.18,
                  ease: "power2.in",
                })
                .to(
                  spotlightNames[idx],
                  { y: -8, autoAlpha: 0, duration: 0.16, ease: "power2.in" },
                  "<"
                )
                .fromTo(
                  spotlightIcons[nextIdx],
                  { rotationY: -90, autoAlpha: 0 },
                  {
                    rotationY: 0,
                    autoAlpha: 1,
                    duration: 0.24,
                    ease: "back.out(1.4)",
                    immediateRender: false,
                  }
                )
                .fromTo(
                  spotlightNames[nextIdx],
                  { y: 8, autoAlpha: 0 },
                  {
                    y: 0,
                    autoAlpha: 1,
                    duration: 0.22,
                    ease: MOTION.ease.out,
                    immediateRender: false,
                  },
                  "<"
                );
            });
          }

          // Natural periodic HR peeker blinks (paused when hero leaves viewport)
          const hrTopEyesTween = hrTopEyesEl
            ? gsap
                .timeline({ repeat: -1, repeatDelay: 3.8, delay: 1.9 })
                .to(hrTopEyesEl, {
                  scaleY: 0.12,
                  transformOrigin: "50% 50%",
                  duration: 0.08,
                  yoyo: true,
                  repeat: 1,
                })
            : null;
          const hrLeftEyesTween = hrLeftEyesEl
            ? gsap
                .timeline({ repeat: -1, repeatDelay: 4.4, delay: 2.6 })
                .to(hrLeftEyesEl, {
                  scaleY: 0.12,
                  transformOrigin: "50% 50%",
                  duration: 0.08,
                  yoyo: true,
                  repeat: 1,
                })
            : null;

          // Pause ambient loops whenever the hero leaves the viewport
          ScrollTrigger.create({
            trigger: root,
            start: "top bottom",
            end: "bottom top",
            refreshPriority: MOTION.refreshPriority.hero,
            onEnter: () => {
              wordCycleTl?.play();
              pillDotPulseTween?.play();
              marqueeTween?.play();
              iconGlintTl?.play();
              spotlightTl?.play();
              hrTopEyesTween?.play();
              hrLeftEyesTween?.play();
            },
            onEnterBack: () => {
              wordCycleTl?.play();
              pillDotPulseTween?.play();
              marqueeTween?.play();
              iconGlintTl?.play();
              spotlightTl?.play();
              hrTopEyesTween?.play();
              hrLeftEyesTween?.play();
            },
            onLeave: () => {
              wordCycleTl?.pause();
              pillDotPulseTween?.pause();
              marqueeTween?.pause();
              iconGlintTl?.pause();
              spotlightTl?.pause();
              hrTopEyesTween?.pause();
              hrLeftEyesTween?.pause();
            },
            onLeaveBack: () => {
              wordCycleTl?.pause();
              pillDotPulseTween?.pause();
              marqueeTween?.pause();
              iconGlintTl?.pause();
              spotlightTl?.pause();
              hrTopEyesTween?.pause();
              hrLeftEyesTween?.pause();
            },
          });

          // Smooth desktop hover deceleration on marquee strip
          const cleanups: (() => void)[] = [
            () => {
              disposed = true;
            },
          ];
          if (resizeObserver) {
            cleanups.push(() => resizeObserver.disconnect());
          }
          if (finePointer && marqueeViewportEl && marqueeTween) {
            const onMarqueeEnter = () =>
              gsap.to(marqueeTween, { timeScale: 0.22, duration: 0.35, ease: "power2.out" });
            const onMarqueeLeave = () =>
              gsap.to(marqueeTween, { timeScale: 1, duration: 0.45, ease: "power2.out" });

            marqueeViewportEl.addEventListener("pointerenter", onMarqueeEnter);
            marqueeViewportEl.addEventListener("pointerleave", onMarqueeLeave);
            cleanups.push(() => {
              marqueeViewportEl.removeEventListener("pointerenter", onMarqueeEnter);
              marqueeViewportEl.removeEventListener("pointerleave", onMarqueeLeave);
            });
          }

          return () => {
            cleanups.forEach((fn) => fn());
          };
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} id="top" className="relative w-full overflow-x-clip bg-white">
      {/* Pure crisp white upper canvas with subtle bottom-only lavender horizon glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 top-[46%] overflow-hidden"
        style={{
          backgroundImage: [
            "radial-gradient(ellipse 64% 58% at 14% 72%, rgba(204, 189, 236, 0.24) 0%, rgba(218, 206, 248, 0.08) 56%, transparent 82%)",
            "radial-gradient(ellipse 64% 58% at 86% 74%, rgba(196, 178, 238, 0.24) 0%, rgba(214, 200, 246, 0.08) 56%, transparent 82%)",
            "radial-gradient(ellipse 56% 50% at 50% 62%, rgba(184, 158, 230, 0.14) 0%, transparent 74%)",
            "linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(246, 242, 253, 0.42) 52%, rgba(238, 230, 252, 0.56) 100%)",
          ].join(", "),
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1440px]">
        {/* Top Centered Navigation Notch */}
        <LandingNavbar />

        {/* Notion-inspired Centered Hero Editorial Stage */}
        <div className="relative z-10 flex flex-col items-center px-4 pt-[40px] text-center sm:px-8 sm:pt-[56px] lg:px-10 lg:pt-[68px]">
          {/* Giant Two-Line Editorial Headline + Inline GSAP Morphing Pill */}
          <h1
            data-hero-headline=""
            data-hero-init=""
            aria-label="Practice with AI, then own the interview."
            className="flex max-w-[1260px] flex-col items-center text-center text-[clamp(36px,5.6vw,86px)] font-bold leading-[1.06] tracking-[-0.036em] text-[#17151a]"
          >
            {/* Line 1 */}
            <span aria-hidden="true" className="inline-flex flex-wrap justify-center gap-x-[0.26em]">
              {["Practice", "with", "AI,"].map((word) => (
                <span key={word} className="inline-block overflow-clip py-[0.08em] -my-[0.08em]">
                  <span data-hero-l1-word="" className="inline-block">
                    {word}
                  </span>
                </span>
              ))}
            </span>

            {/* Line 2 */}
            <span
              aria-hidden="true"
              className="mt-[6px] inline-flex flex-wrap items-baseline justify-center gap-x-[0.24em] sm:mt-[10px]"
            >
              <span className="inline-block overflow-clip py-[0.08em] -my-[0.08em]">
                <span data-hero-l2-word="" className="inline-block">
                  then
                </span>
              </span>

              {/* Notion-style color-morphing highlighted capsule cycling live verbs via GSAP */}
              <span
                data-hero-pill=""
                className="relative mx-[0.03em] inline-flex items-baseline gap-[0.2em] rounded-full bg-[#efe6fc] px-[0.36em] py-[0.06em] text-[#4c2b78]"
              >
                <span className="relative inline-flex size-[0.2em] shrink-0 self-center items-center justify-center -translate-y-[0.02em]">
                  <span
                    data-hero-pill-pulse=""
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full bg-[#6d42a6] opacity-50"
                  />
                  <span
                    data-hero-pill-dot=""
                    aria-hidden="true"
                    className="relative block size-full rounded-full bg-[#6d42a6]"
                  />
                </span>

                <span
                  data-hero-pill-track=""
                  className="relative inline-flex items-baseline overflow-hidden py-[0.08em] -my-[0.08em] [perspective:600px]"
                >
                  {/* Baseline height strut */}
                  <span aria-hidden="true" className="invisible inline-block w-0 select-none font-bold">
                    M
                  </span>
                  {HERO_WORD_STATES.map((entry, idx) => (
                    <span
                      key={entry.word}
                      data-hero-word={idx}
                      className={
                        idx === 0
                          ? "relative inline-flex whitespace-nowrap font-bold"
                          : "pointer-events-none absolute left-0 top-0 inline-flex whitespace-nowrap font-bold opacity-0"
                      }
                    >
                      {entry.word.split("").map((char, cIdx) => (
                        <span
                          key={`${entry.word}-${cIdx}`}
                          data-word-char=""
                          className="inline-block [transform-style:preserve-3d]"
                        >
                          {char}
                        </span>
                      ))}
                    </span>
                  ))}
                </span>
              </span>

              {["the", "interview."].map((word) => (
                <span key={word} className="inline-block overflow-clip py-[0.08em] -my-[0.08em]">
                  <span data-hero-l2-word="" className="inline-block">
                    {word}
                  </span>
                </span>
              ))}
            </span>
          </h1>

          {/* Subtitle preserving "Practice now, panic less later" voice */}
          <p
            data-hero-sub=""
            data-hero-init=""
            className="mt-[18px] max-w-[680px] text-center text-[16px] font-normal leading-[1.55] text-[#5b4d68] sm:mt-[22px] sm:text-[18.5px] lg:text-[20px]"
          >
            Practice now, panic less later. Run realistic mock interviews with Sir Bot and get
            instant, structured feedback before your next call.
          </p>

          {/* Distinct Primary & Secondary CTA Hierarchy */}
          <div className="mt-[26px] flex flex-wrap items-center justify-center gap-3.5 sm:mt-[30px] sm:gap-4">
            <Link
              href="/practice"
              data-hero-cta=""
              data-hero-init=""
              className="btn-tactile inline-flex h-[46px] min-w-[166px] items-center justify-between gap-3 rounded-[11px] bg-[#57367d] px-[22px] text-[14px] font-semibold leading-[1.45] text-white shadow-[0_8px_24px_-6px_rgba(87,54,125,0.45)] hover:bg-[#492c6b] sm:h-[48px] sm:min-w-[178px] sm:px-[24px] sm:text-[14.5px]"
            >
              <span className="whitespace-nowrap">START NOW</span>
              <ArrowRightStrokeIcon
                variant="hero"
                size={17}
                color="#ffffff"
                className="hover-arrow-shift size-[17px] shrink-0"
              />
            </Link>

            <a
              href="#how-it-works"
              data-hero-cta=""
              data-hero-init=""
              onClick={(e) => {
                e.preventDefault();
                scrollToAnchor("#how-it-works", 12);
              }}
              className="btn-tactile inline-flex h-[46px] min-w-[152px] items-center justify-center rounded-[11px] border border-[#ddd4ec] bg-white px-[22px] text-[14px] font-semibold leading-[1.45] text-[#423052] shadow-[0_2px_10px_rgba(32,33,36,0.05)] hover:bg-[#f7f3fc] sm:h-[48px] sm:min-w-[162px] sm:px-[24px] sm:text-[14.5px]"
            >
              How it works
            </a>
          </div>

          {/* Wide Sharp-Cornered Product Showcase + 2 Peeking HR Interviewers */}
          <div
            data-hero-preview-scrub=""
            className="relative mt-[58px] w-full max-w-full will-change-transform sm:mt-[64px] md:max-w-[min(calc(100%-130px),1160px)] lg:mt-[68px]"
          >
            {/* HR Interviewer #1: Peeking over top-right edge */}
            <div
              data-hr-peek-top=""
              data-hero-init=""
              className="pointer-events-none absolute bottom-full right-[5%] z-20 -mb-[10px] w-[82px] sm:right-[7%] sm:w-[104px]"
            >
              <HeroHrPeekTopSvg />
            </div>

            {/* HR Interviewer #2: Editorial ink figure leaning around mid-left edge */}
            <div
              data-hr-peek-left=""
              data-hero-init=""
              className="pointer-events-none absolute right-full top-[23%] z-20 -mr-[8px] hidden w-[76px] md:block lg:top-[26%] lg:w-[84px] xl:w-[90px]"
            >
              <HeroHrPeekLeftSvg />
            </div>

            <div
              data-hero-preview=""
              data-hero-init=""
              className="relative z-0 aspect-[1440/1000] w-full overflow-hidden rounded-none border border-[#dcd3eb] bg-white shadow-[0_28px_72px_-16px_rgba(32,33,36,0.16)]"
            >
              <img
                data-hero-preview-img=""
                alt="Interview ni Lods practice setup screen preview"
                src="/assets/hero-app-preview.png"
                width={1440}
                height={1000}
                className="pointer-events-none block size-full object-cover"
              />
            </div>
          </div>

          {/* Aligned Rotating Job-Platform Logo Dock (Notion-style footer bar + live 3D spotlight coin) */}
          <div
            data-hero-marquee=""
            data-hero-init=""
            className="mt-[36px] flex w-full max-w-[1260px] flex-col items-center pb-[52px] sm:mt-[46px] sm:pb-[68px] lg:pb-[78px]"
          >
            {/* Spotlight rotator header chip */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-[#e3daf2] bg-white/85 px-3.5 py-1.5 shadow-[0_2px_10px_rgba(32,33,36,0.04)] backdrop-blur-xs">
              <span
                aria-hidden="true"
                className="relative inline-flex size-[22px] shrink-0 items-center justify-center rounded-full bg-[#f3ecfc] [perspective:400px]"
              >
                {JOB_PLATFORMS.map((item, idx) => (
                  <span
                    key={item.name}
                    data-spotlight-icon=""
                    className={`absolute inset-0 flex items-center justify-center [transform-style:preserve-3d] ${
                      idx === 0 ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <img
                      alt=""
                      src={item.iconSrc}
                      width={14}
                      height={14}
                      className="block size-[14px] object-contain"
                    />
                  </span>
                ))}
              </span>

              <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#665479]">
                Practice for roles across
              </span>

              <span className="relative inline-flex h-[18px] min-w-[80px] items-center overflow-hidden text-left">
                {JOB_PLATFORMS.map((item, idx) => (
                  <span
                    key={item.name}
                    data-spotlight-name=""
                    className={`absolute left-0 whitespace-nowrap text-[12px] font-bold text-[#3b294d] ${
                      idx === 0 ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {item.name}
                  </span>
                ))}
              </span>
            </div>

            {/* Seamless Edge-Faded Infinite Logo Carousel */}
            <div
              data-marquee-viewport=""
              className="relative mt-5 w-full overflow-hidden py-1 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
            >
              <div data-marquee-track="" className="flex w-max items-center will-change-transform">
                <div className="flex shrink-0 items-center">
                  {JOB_PLATFORMS.map((platform) => (
                    <JobPlatformTile
                      key={`track-a-${platform.name}`}
                      name={platform.name}
                      iconSrc={platform.iconSrc}
                    />
                  ))}
                </div>
                <div
                  aria-hidden="true"
                  data-marquee-duplicate=""
                  className="flex shrink-0 items-center"
                >
                  {JOB_PLATFORMS.map((platform) => (
                    <JobPlatformTile
                      key={`track-b-${platform.name}`}
                      name={platform.name}
                      iconSrc={platform.iconSrc}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
