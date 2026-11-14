"use client";

import { useRef } from "react";
import {
  FULL_MOTION_QUERY,
  MOTION,
  REDUCED_MOTION_QUERY,
  ScrollTrigger,
  SplitText,
  gsap,
  useGSAP,
} from "@/lib/gsap";
import {
  BriefcaseStrokeIcon,
  CheckCircleStrokeIcon,
  ConversationStrokeIcon,
} from "./MotionVectors";

const WAVEFORM_HEIGHTS = [
  8, 16, 10, 24, 18, 32, 14, 22,
  8, 16, 10, 24, 18, 32, 14, 22,
  8, 16, 10, 24, 18, 32, 14, 22,
];

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = sectionRef.current;
      if (!root) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          fullMotion: FULL_MOTION_QUERY,
          reduceMotion: REDUCED_MOTION_QUERY,
        },
        (context) => {
          const { reduceMotion } = context.conditions ?? {};

          const headerEl = root.querySelector("[data-hiw-header]");
          const eyebrowEl = root.querySelector("[data-hiw-eyebrow]");
          const headingEl = root.querySelector("[data-hiw-heading]");
          const subEl = root.querySelector("[data-hiw-sub]");
          const cardsGrid = root.querySelector("[data-hiw-cards]");
          const cardEls = gsap.utils.toArray<HTMLElement>("[data-hiw-card]", root);
          const strokePaths = gsap.utils.toArray<SVGGeometryElement>(
            "[data-hiw-card] [data-draw-stroke]",
            root
          );
          const roleDivider = root.querySelector("[data-hiw-role-divider]");
          const waveBars = gsap.utils.toArray<HTMLElement>("[data-wave-bar]", root);
          const refineSteps = gsap.utils.toArray<HTMLElement>(
            "[data-refine-step]",
            root
          );

          if (reduceMotion) {
            gsap.from([headerEl, ...cardEls].filter(Boolean), {
              autoAlpha: 0,
              duration: 0.2,
              stagger: 0.04,
              ease: MOTION.ease.out,
              clearProps: "opacity,visibility",
              scrollTrigger: {
                trigger: root,
                start: "top 82%",
                once: true,
                refreshPriority: MOTION.refreshPriority.howItWorks,
              },
            });
            return;
          }

          // Header SplitText clipped line reveal + restrained lavender highlight inside onSplit lifecycle
          if (headingEl) {
            SplitText.create(headingEl, {
              type: "lines",
              mask: "lines",
              autoSplit: true,
              aria: "auto",
              onSplit(self) {
                const splitTl = gsap.timeline({
                  scrollTrigger: {
                    trigger: headerEl ?? root,
                    start: "top 80%",
                    once: true,
                    refreshPriority: MOTION.refreshPriority.howItWorks,
                  },
                });
                splitTl.from(
                  self.lines,
                  {
                    yPercent: 108,
                    duration: MOTION.duration.textLine,
                    stagger: 0.08,
                    ease: MOTION.ease.out,
                    clearProps: "transform",
                  },
                  0
                );
                const liveAccent = headingEl.querySelector("[data-hiw-accent]");
                if (liveAccent) {
                  splitTl.fromTo(
                    liveAccent,
                    { color: "#cab4f0" },
                    {
                      color: "#ffffff",
                      duration: 0.55,
                      ease: MOTION.ease.inOut,
                      clearProps: "color",
                    },
                    0.26
                  );
                }
                return splitTl;
              },
            });
          }

          if (eyebrowEl || subEl) {
            const headerTl = gsap.timeline({
              defaults: { ease: MOTION.ease.out },
              scrollTrigger: {
                trigger: headerEl ?? root,
                start: "top 80%",
                once: true,
                refreshPriority: MOTION.refreshPriority.howItWorks,
              },
            });
            if (eyebrowEl) {
              headerTl.from(
                eyebrowEl,
                { autoAlpha: 0, y: 8, duration: 0.34, clearProps: "transform" },
                0
              );
            }
            if (subEl) {
              headerTl.from(
                subEl,
                { autoAlpha: 0, y: 12, duration: 0.44, clearProps: "transform" },
                0.14
              );
            }
          }

          // 3 Step cards + SVG stroke + waveform entrance
          const cardsTl = gsap.timeline({
            defaults: { ease: MOTION.ease.out },
            scrollTrigger: {
              trigger: cardsGrid ?? root,
              start: "top 78%",
              once: true,
              refreshPriority: MOTION.refreshPriority.howItWorks,
            },
          });

          if (cardEls.length) {
            cardsTl.from(
              cardEls,
              {
                autoAlpha: 0,
                y: 20,
                scale: 0.985,
                duration: 0.48,
                stagger: 0.08,
                clearProps: "transform",
              },
              0
            );
          }

          if (strokePaths.length) {
            cardsTl.from(
              strokePaths,
              {
                drawSVG: 0,
                duration: 0.52,
                stagger: 0.04,
                ease: MOTION.ease.out,
              },
              0.14
            );
          }

          if (roleDivider) {
            cardsTl.from(
              roleDivider,
              {
                scaleX: 0,
                transformOrigin: "left center",
                duration: 0.45,
                ease: MOTION.ease.inOut,
                clearProps: "transform",
              },
              0.24
            );
          }

          if (waveBars.length) {
            cardsTl.from(
              waveBars,
              {
                scaleY: 0.18,
                transformOrigin: "center bottom",
                duration: 0.36,
                stagger: { each: 0.012, from: "start" },
                ease: MOTION.ease.out,
              },
              0.24
            );
          }

          if (refineSteps.length) {
            cardsTl.from(
              refineSteps,
              {
                autoAlpha: 0.45,
                duration: 0.32,
                stagger: 0.09,
                ease: MOTION.ease.out,
                clearProps: "opacity",
              },
              0.32
            );
          }

          // Offscreen-safe voice waveform motion for Card 02 (paused when out of viewport)
          if (waveBars.length) {
            const waveLoop = gsap.to(waveBars, {
              scaleY: (idx) => 0.42 + ((idx * 29 + 13) % 58) / 100,
              transformOrigin: "center center",
              duration: 0.62,
              ease: "sine.inOut",
              stagger: {
                each: 0.048,
                repeat: -1,
                yoyo: true,
              },
              paused: true,
            });

            ScrollTrigger.create({
              trigger: root,
              start: "top 85%",
              end: "bottom 15%",
              refreshPriority: MOTION.refreshPriority.howItWorks,
              onEnter: () => waveLoop.play(),
              onEnterBack: () => waveLoop.play(),
              onLeave: () => waveLoop.pause(),
              onLeaveBack: () => waveLoop.pause(),
            });
          }
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative z-10 w-full overflow-hidden rounded-tl-[32px] rounded-tr-[32px] bg-[#202124] sm:rounded-tl-[40px] sm:rounded-tr-[40px]"
    >
      <div className="mx-auto w-full max-w-[1440px] px-5 pb-[88px] pt-[80px] sm:px-8 sm:pb-[120px] sm:pt-[104px] lg:px-[clamp(32px,8.333vw,120px)] lg:pb-[168px] lg:pt-[128px]">
        {/* Top Heading Row */}
        <div
          data-hiw-header=""
          className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start"
        >
          <div className="max-w-[660px]">
            <p
              data-hiw-eyebrow=""
              className="text-[12px] font-semibold leading-[18px] text-[#cab4f0]"
            >
              HOW IT WORKS
            </p>
            <h2
              data-hiw-heading=""
              className="mt-[16px] text-[32px] font-semibold leading-[1.13] text-white sm:text-[42px] lg:text-[48px] lg:leading-[54.24px]"
            >
              <span className="block">A little practice.</span>
              <span className="block">
                A lot more <span data-hiw-accent="">confidence.</span>
              </span>
            </h2>
          </div>

          <div
            data-hiw-sub=""
            className="max-w-[455px] text-[15px] font-normal leading-[25.5px] text-[#c5c3ca] sm:text-[17px] lg:mt-[64px]"
          >
            <p>Set the scene, take your time, and learn as you go.</p>
            <p>No perfect answers needed. Just a place to begin.</p>
          </div>
        </div>

        {/* 3 Step Cards */}
        <div
          data-hiw-cards=""
          className="mt-10 grid grid-cols-1 gap-[24px] lg:mt-[59px] lg:grid-cols-3"
        >
          {/* Card 01 */}
          <article
            data-hiw-card=""
            className="relative flex min-h-[380px] flex-col overflow-hidden rounded-[20px] border border-[#424147] bg-[#2b2c30] p-[23px] transition-colors duration-200 hover:border-[#5b5964] lg:min-h-[410px]"
          >
            <div className="relative min-h-[166px] w-full overflow-hidden rounded-[12px] bg-[#35363b] p-[18px]">
              <div className="flex items-center gap-[12px]">
                <BriefcaseStrokeIcon color="#D2BFFF" />
                <span className="text-[10px] font-semibold leading-[15px] text-[#d6d3dd]">
                  YOUR NEXT ROLE
                </span>
              </div>
              <p className="mt-[16px] text-[19px] font-medium leading-[28.5px] text-white">
                Software Engineer
              </p>
              <div data-hiw-role-divider="" className="mt-[11px] h-px w-full bg-[#55545b]" />
              <div className="mt-[18px] flex flex-wrap items-center gap-x-[32px] gap-y-1 text-[12px] font-normal leading-[18px] text-[#d6d3dd]">
                <span>Normal difficulty</span>
                <span>5 questions · Witty</span>
              </div>
            </div>

            <div className="mt-[29px] px-[4px]">
              <p className="text-[12px] font-semibold leading-[18px] text-[#cab4f0]">01</p>
              <h3 className="mt-[11px] text-[22px] font-semibold leading-[28.8px] text-white xl:text-[24px]">
                Make it your interview
              </h3>
              <p className="mt-[16px] text-[15px] font-normal leading-[24.8px] text-[#c5c3ca] xl:text-[16px]">
                Choose your job role, difficulty, question count, and coach’s tone. Make this round work for you.
              </p>
            </div>
          </article>

          {/* Card 02 */}
          <article
            data-hiw-card=""
            className="relative flex min-h-[380px] flex-col overflow-hidden rounded-[20px] border border-[#424147] bg-[#2b2c30] p-[23px] transition-colors duration-200 hover:border-[#5b5964] lg:min-h-[410px]"
          >
            <div className="relative min-h-[166px] w-full overflow-hidden rounded-[12px] bg-[#35363b] p-[18px]">
              <div className="flex items-center gap-[12px]">
                <ConversationStrokeIcon color="#D2BFFF" strokeWidth={1.6} />
                <span className="text-[10px] font-semibold leading-[15px] text-[#d6d3dd]">
                  SIR BOT
                </span>
              </div>
              <div className="mt-[16px] text-[17px] font-medium leading-[26.1px] text-white xl:text-[18px]">
                <p>“Tell me about a time you</p>
                <p>handled pressure at work.”</p>
              </div>
              <div
                aria-hidden="true"
                className="mt-[16px] flex h-[32px] items-center justify-between gap-[4px] overflow-hidden pl-[2px] xl:justify-start xl:gap-[9px]"
              >
                {WAVEFORM_HEIGHTS.map((height, idx) => (
                  <span
                    key={idx}
                    data-wave-bar=""
                    style={{ height: `${height}px` }}
                    className="w-[3px] shrink-0 rounded-[1.5px] bg-[#bda2ed]"
                  />
                ))}
              </div>
            </div>

            <div className="mt-[29px] px-[4px]">
              <p className="text-[12px] font-semibold leading-[18px] text-[#cab4f0]">02</p>
              <h3 className="mt-[11px] text-[22px] font-semibold leading-[28.8px] text-white xl:text-[24px]">
                Chat with Lods
              </h3>
              <p className="mt-[16px] text-[15px] font-normal leading-[24.8px] text-[#c5c3ca] xl:text-[16px]">
                Answer one question at a time. Lods follows up to help you explain your thinking and your impact.
              </p>
            </div>
          </article>

          {/* Card 03 */}
          <article
            data-hiw-card=""
            className="relative flex min-h-[380px] flex-col overflow-hidden rounded-[20px] border border-[#424147] bg-[#2b2c30] p-[23px] transition-colors duration-200 hover:border-[#5b5964] lg:min-h-[410px]"
          >
            <div className="relative min-h-[166px] w-full overflow-hidden rounded-[12px] bg-[#35363b] p-[18px]">
              <div className="flex items-center gap-[12px]">
                <CheckCircleStrokeIcon />
                <span className="text-[10px] font-semibold leading-[15px] text-[#d6d3dd]">
                  YOUR NEXT FOCUS
                </span>
              </div>
              <div className="mt-[16px] text-[17px] font-medium leading-[25.2px] text-white xl:text-[18px]">
                <p>You showed clear ownership.</p>
                <p>Now make the outcome specific.</p>
              </div>
              <p className="mt-[17px] text-[12px] font-medium leading-[18px] text-[#cab4f0]">
                <span data-refine-step="">Review</span>{" "}
                <span data-refine-step="">→ Refine</span>{" "}
                <span data-refine-step="">→ Try again</span>
              </p>
            </div>

            <div className="mt-[29px] px-[4px]">
              <p className="text-[12px] font-semibold leading-[18px] text-[#cab4f0]">03</p>
              <h3 className="mt-[11px] text-[22px] font-semibold leading-[28.8px] text-white xl:text-[24px]">
                Review. Refine. Repeat.
              </h3>
              <p className="mt-[16px] text-[15px] font-normal leading-[24.8px] text-[#c5c3ca] xl:text-[16px]">
                See your final score, review each answer, and find what to focus on in your next session.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
