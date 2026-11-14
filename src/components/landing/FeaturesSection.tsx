"use client";

import { useRef, useState } from "react";
import {
  FULL_MOTION_QUERY,
  Flip,
  MOTION,
  REDUCED_MOTION_QUERY,
  SplitText,
  gsap,
  useGSAP,
} from "@/lib/gsap";
import {
  BriefcaseStrokeIcon,
  ChevronStrokeIcon,
  FeatureFeedbackBookIcon,
  FeatureStarGridIcon,
  FeatureToneSlidersIcon,
  RoleDocumentStrokeIcon,
  SessionHistoryClockIcon,
} from "./MotionVectors";

type CoachTone = "Friendly" | "Witty" | "Direct";
type StarLetter = "S" | "T" | "A" | "R";

const TONES: CoachTone[] = ["Friendly", "Witty", "Direct"];

const TONE_KNOB_OFFSETS: Record<CoachTone, [number, number, number]> = {
  Friendly: [-1.5, -2, 3],
  Witty: [0, 0, 0],
  Direct: [4.5, -4, 5.5],
};

const STAR_ITEMS: { letter: StarLetter; label: string }[] = [
  { letter: "S", label: "Situation" },
  { letter: "T", label: "Task" },
  { letter: "A", label: "Action" },
  { letter: "R", label: "Result" },
];

export function FeaturesSection() {
  const [selectedTone, setSelectedTone] = useState<CoachTone>("Witty");
  const [selectedStar, setSelectedStar] = useState<StarLetter>("A");
  const sectionRef = useRef<HTMLElement>(null);
  const toneFlipRef = useRef<Flip.FlipState | null>(null);
  const starFlipRef = useRef<Flip.FlipState | null>(null);
  const hasToneInteracted = useRef(false);
  const hasStarInteracted = useRef(false);

  // Scroll entrance + DrawSVG icons
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
          const headerEl = root.querySelector("[data-features-header]");
          const eyebrowEl = root.querySelector("[data-features-eyebrow]");
          const headingEl = root.querySelector("[data-features-heading]");
          const subEl = root.querySelector("[data-features-sub]");
          const gridEl = root.querySelector("[data-features-grid]");
          const cardEls = gsap.utils.toArray<HTMLElement>("[data-feature-card]", root);
          const strokePaths = gsap.utils.toArray<SVGGeometryElement>(
            "[data-feature-card] [data-draw-stroke]",
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
                refreshPriority: MOTION.refreshPriority.features,
              },
            });
            return;
          }

          if (headingEl) {
            SplitText.create(headingEl, {
              type: "lines",
              mask: "lines",
              autoSplit: true,
              aria: "auto",
              onSplit(self) {
                return gsap.from(self.lines, {
                  yPercent: 108,
                  duration: MOTION.duration.textLine,
                  stagger: 0.08,
                  ease: MOTION.ease.out,
                  clearProps: "transform",
                  scrollTrigger: {
                    trigger: headerEl ?? root,
                    start: "top 80%",
                    once: true,
                    refreshPriority: MOTION.refreshPriority.features,
                  },
                });
              },
            });
          }

          const headerTl = gsap.timeline({
            defaults: { ease: MOTION.ease.out },
            scrollTrigger: {
              trigger: headerEl ?? root,
              start: "top 80%",
              once: true,
              refreshPriority: MOTION.refreshPriority.features,
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
              { autoAlpha: 0, y: 10, duration: 0.42, clearProps: "transform" },
              0.14
            );
          }

          const cardsTl = gsap.timeline({
            defaults: { ease: MOTION.ease.out },
            scrollTrigger: {
              trigger: gridEl ?? root,
              start: "top 78%",
              once: true,
              refreshPriority: MOTION.refreshPriority.features,
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
                stagger: 0.075,
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
                duration: 0.5,
                stagger: 0.025,
                ease: MOTION.ease.out,
              },
              0.16
            );
          }

          // Highlight default active STAR quadrant subtly once on reveal
          const initialStarQuad = root.querySelector(
            `[data-star-quadrant="${selectedStar}"]`
          );
          if (initialStarQuad) {
            gsap.set(initialStarQuad, { fill: "rgba(116, 83, 166, 0.18)" });
          }
        }
      );
    },
    { scope: sectionRef }
  );

  // Interactive Tone Selector: Flip pill + SVG slider knobs + Card 1 live sync
  useGSAP(
    () => {
      const root = sectionRef.current;
      if (!root) return;
      const reduceMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;

      if (toneFlipRef.current) {
        const state = toneFlipRef.current;
        toneFlipRef.current = null;
        if (!reduceMotion) {
          Flip.from(state, {
            targets: "[data-flip-id='features-tone-pill']",
            duration: 0.22,
            ease: MOTION.ease.inOut,
            scale: true,
            simple: true,
            prune: true,
          });
        }
      }

      const offsets = TONE_KNOB_OFFSETS[selectedTone];
      [0, 1, 2].forEach((idx) => {
        const knob = root.querySelector(`[data-tone-knob="${idx}"]`);
        if (knob) {
          gsap.to(knob, {
            x: offsets[idx],
            duration: reduceMotion ? 0 : 0.24,
            ease: MOTION.ease.inOut,
          });
        }
      });

      if (!hasToneInteracted.current) {
        hasToneInteracted.current = true;
        return;
      }

      const syncedToneEl = root.querySelector("[data-feature-synced-tone]");
      if (syncedToneEl && !reduceMotion) {
        gsap.fromTo(
          syncedToneEl,
          { autoAlpha: 0.3, y: 3, filter: "blur(1.5px)" },
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.18,
            ease: MOTION.ease.out,
            clearProps: "filter,transform",
          }
        );
      }
    },
    { scope: sectionRef, dependencies: [selectedTone] }
  );

  // Interactive STAR Selector: Flip tile + SVG 2x2 grid quadrant highlight
  useGSAP(
    () => {
      const root = sectionRef.current;
      if (!root) return;
      const reduceMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;

      if (starFlipRef.current) {
        const state = starFlipRef.current;
        starFlipRef.current = null;
        if (!reduceMotion) {
          Flip.from(state, {
            targets: "[data-flip-id='features-star-pill']",
            duration: 0.2,
            ease: MOTION.ease.inOut,
            scale: true,
            simple: true,
            prune: true,
          });
        }
      }

      if (!hasStarInteracted.current) {
        hasStarInteracted.current = true;
        return;
      }

      STAR_ITEMS.forEach(({ letter }) => {
        const quad = root.querySelector(`[data-star-quadrant="${letter}"]`);
        if (!quad) return;
        const active = letter === selectedStar;
        gsap.to(quad, {
          fill: active ? "rgba(116, 83, 166, 0.2)" : "rgba(116, 83, 166, 0)",
          duration: reduceMotion ? 0 : 0.2,
          ease: MOTION.ease.out,
        });
        if (active && !reduceMotion) {
          gsap.fromTo(
            quad,
            { scale: 1.08, transformOrigin: "center center" },
            { scale: 1, duration: 0.22, ease: MOTION.ease.out }
          );
        }
      });
    },
    { scope: sectionRef, dependencies: [selectedStar] }
  );

  const handleToneSelect = (tone: CoachTone) => {
    if (tone === selectedTone) return;
    const pill = sectionRef.current?.querySelector("[data-flip-id='features-tone-pill']");
    if (pill) {
      toneFlipRef.current = Flip.getState(pill);
    }
    setSelectedTone(tone);
  };

  const handleStarSelect = (letter: StarLetter) => {
    if (letter === selectedStar) return;
    const pill = sectionRef.current?.querySelector("[data-flip-id='features-star-pill']");
    if (pill) {
      starFlipRef.current = Flip.getState(pill);
    }
    setSelectedStar(letter);
  };

  return (
    <section
      ref={sectionRef}
      id="features"
      className="relative w-full bg-white"
    >
      <div className="mx-auto w-full max-w-[1440px] px-5 pb-[128px] pt-[72px] sm:px-8 sm:pb-[156px] sm:pt-[88px] lg:px-[clamp(32px,8.333vw,120px)] lg:pb-[180px] lg:pt-[88px]">
        {/* Centered Header */}
        <div data-features-header="" className="mx-auto max-w-[1200px] text-center">
          <p
            data-features-eyebrow=""
            className="text-[12px] font-semibold leading-[18px] text-[#7453a6]"
          >
            PERSONALIZED PRACTICE. ACTIONABLE FEEDBACK.
          </p>
          <h2
            data-features-heading=""
            className="mt-[17px] text-[30px] font-semibold leading-[1.2] text-[#242126] sm:text-[38px] lg:text-[clamp(36px,3.0556vw,44px)] lg:leading-[1.2]"
          >
            Support for every part of your practice.
          </h2>
          <p
            data-features-sub=""
            className="mt-[15px] text-[15px] font-normal leading-[25.5px] text-[#716a79] sm:text-[16px] lg:text-[17px]"
          >
            From your first question to your next focus, Interview ni Lods helps you see what to work on.
          </p>
        </div>

        {/* 2x2 Feature Cards Grid */}
        <div
          data-features-grid=""
          className="mt-10 grid grid-cols-1 gap-[24px] sm:mt-12 lg:mt-[61px] lg:grid-cols-2"
        >
          {/* Card 1: An interview that fits you */}
          <article
            data-feature-card=""
            className="flex min-h-[270px] flex-col justify-between overflow-hidden rounded-[20px] border border-[#e7e1ed] bg-white p-[27px] lg:min-h-[290px]"
          >
            <div>
              <BriefcaseStrokeIcon color="#7453A6" />
              <h3 className="mt-[18px] text-[23px] font-semibold leading-[28.75px] text-[#242126]">
                An interview that fits you
              </h3>
              <div className="mt-[13px] text-[15px] font-normal leading-[23.25px] text-[#716a79]">
                <p>Set your job role, difficulty, and number of questions.</p>
                <p>Practice at a pace that feels right for you.</p>
              </div>
            </div>

            <div className="mt-6 flex h-[74px] items-center gap-[14px] overflow-hidden rounded-[10px] bg-[#f3eff8] px-[16px]">
              <RoleDocumentStrokeIcon />
              <div className="min-w-0">
                <p className="truncate text-[15px] font-medium leading-[22.5px] text-[#513f61]">
                  Software Engineer
                </p>
                <p className="truncate text-[12px] font-normal leading-[18px] text-[#716a79]">
                  Normal difficulty · 5 questions ·{" "}
                  <span data-feature-synced-tone="" className="inline-block font-medium text-[#513f61]">
                    {selectedTone}
                  </span>
                </p>
              </div>
            </div>
          </article>

          {/* Card 2: Choose your coach's tone */}
          <article
            data-feature-card=""
            className="flex min-h-[270px] flex-col justify-between overflow-hidden rounded-[20px] border border-[#e7e1ed] bg-white p-[27px] lg:min-h-[290px]"
          >
            <div>
              <FeatureToneSlidersIcon />
              <h3 className="mt-[18px] text-[23px] font-semibold leading-[28.75px] text-[#242126]">
                Choose your coach’s tone
              </h3>
              <div className="mt-[13px] text-[15px] font-normal leading-[23.25px] text-[#716a79]">
                <p>Friendly, Witty, or Direct—choose how Lods responds.</p>
                <p>Set the tone without changing what makes you, you.</p>
              </div>
            </div>

            <div
              role="group"
              aria-label="Coach tone preview"
              className="mt-6 grid h-[66px] grid-cols-3 gap-[2px] rounded-[10px] bg-[#f3eff8] p-[6px]"
            >
              {TONES.map((tone) => {
                const isSelected = selectedTone === tone;
                return (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => handleToneSelect(tone)}
                    aria-pressed={isSelected}
                    className={`relative flex h-[54px] cursor-pointer items-center justify-center rounded-[8px] text-[13px] font-medium leading-[19.5px] transition-[color] duration-200 active:scale-[0.97] ${
                      isSelected
                        ? "text-white"
                        : "text-[#716a79] hover:text-[#513f61]"
                    }`}
                  >
                    {isSelected && (
                      <span
                        data-flip-id="features-tone-pill"
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 rounded-[8px] bg-[#7453a6]"
                      />
                    )}
                    <span className="relative z-10">{tone}</span>
                  </button>
                );
              })}
            </div>
          </article>

          {/* Card 3: Find the shape of your answer */}
          <article
            data-feature-card=""
            className="flex min-h-[270px] flex-col justify-between overflow-hidden rounded-[20px] border border-[#e7e1ed] bg-white p-[27px] lg:min-h-[290px]"
          >
            <div>
              <FeatureStarGridIcon />
              <h3 className="mt-[18px] text-[23px] font-semibold leading-[28.75px] text-[#242126]">
                Find the shape of your answer
              </h3>
              <div className="mt-[13px] text-[15px] font-normal leading-[23.25px] text-[#716a79]">
                <p>Use STAR: Situation, Task, Action, Result. Give your</p>
                <p>story structure while keeping it in your own words.</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-4 gap-2 sm:gap-[12px]">
              {STAR_ITEMS.map((item) => {
                const isSelected = selectedStar === item.letter;
                return (
                  <button
                    key={item.letter}
                    type="button"
                    onClick={() => handleStarSelect(item.letter)}
                    aria-pressed={isSelected}
                    className="relative flex h-[70px] cursor-pointer flex-col justify-between overflow-hidden rounded-[9px] bg-[#f4f1f8] px-2 py-[9px] text-left transition-[background-color,transform] duration-150 hover:bg-[#ece5f6] active:scale-[0.97] sm:px-[12px]"
                  >
                    {isSelected && (
                      <span
                        data-flip-id="features-star-pill"
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 rounded-[9px] bg-[#e5daf4]"
                      />
                    )}
                    <span className="relative z-10 text-[18px] font-semibold leading-[27px] text-[#7453a6]">
                      {item.letter}
                    </span>
                    <span className="relative z-10 text-[11px] font-normal leading-[16.5px] text-[#675b73]">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </article>

          {/* Card 4: Feedback, during and after (borderless in Figma) */}
          <article
            data-feature-card=""
            className="flex min-h-[270px] flex-col justify-between overflow-hidden rounded-[20px] bg-white p-[28px] lg:min-h-[290px]"
          >
            <div>
              <FeatureFeedbackBookIcon />
              <h3 className="mt-[18px] text-[23px] font-semibold leading-[28.75px] text-[#242126]">
                Feedback, during and after
              </h3>
              <div className="mt-[13px] text-[15px] font-normal leading-[23.25px] text-[#716a79]">
                <p>See a live score preview, then review your final score,</p>
                <p>question-by-question feedback, and next steps.</p>
              </div>
            </div>

            <div className="group mt-6 flex h-[74px] items-center justify-between overflow-hidden rounded-[10px] bg-[#f3eff8] px-[16px]">
              <div className="flex min-w-0 items-center gap-[14px]">
                <SessionHistoryClockIcon />
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-medium leading-[22.5px] text-[#513f61]">
                    Final session score · 8.2 / 10
                  </p>
                  <p className="truncate text-[12px] font-normal leading-[18px] text-[#716a79]">
                    5 of 5 questions completed
                  </p>
                </div>
              </div>
              <ChevronStrokeIcon className="hover-arrow-shift size-[20px] shrink-0" />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
