"use client";

import { useRef, useState } from "react";
import Link from "next/link";
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
  ArrowRightStrokeIcon,
  CheckStrokeIcon,
  ConversationStrokeIcon,
  WorkshopBriefcaseIcon,
} from "./MotionVectors";

type WorkshopTab = "questions" | "live-score" | "results";

const TABS: { id: WorkshopTab; label: string }[] = [
  { id: "questions", label: "Personalized questions" },
  { id: "live-score", label: "Live score preview" },
  { id: "results", label: "Interview results" },
];

const CHECK_ITEMS = [
  "Choose your role, difficulty, and tone",
  "Practice with questions and follow-ups",
  "Leave with feedback you can act on",
];

const LIVE_METRICS = [
  { label: "Clarity", score: 8.5, ratio: 0.85 },
  { label: "Structure", score: 8.5, ratio: 0.85 },
  { label: "Relevance", score: 8.0, ratio: 0.8 },
  { label: "Impact", score: 7.8, ratio: 0.78 },
];

export function WorkshopSection() {
  const [activeTab, setActiveTab] = useState<WorkshopTab>("questions");
  const sectionRef = useRef<HTMLElement>(null);
  const flipStateRef = useRef<Flip.FlipState | null>(null);
  const hasSwitchedTabRef = useRef(false);

  // Scroll-triggered entrance choreography
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
          const headerEl = root.querySelector("[data-workshop-header]");
          const eyebrowEl = root.querySelector("[data-workshop-eyebrow]");
          const headingEl = root.querySelector("[data-workshop-heading]");
          const subEl = root.querySelector("[data-workshop-sub]");
          const showcaseEl = root.querySelector("[data-workshop-showcase]");
          const leftStrokes = gsap.utils.toArray<SVGGeometryElement>(
            "[data-workshop-left] [data-draw-stroke]",
            root
          );
          const checkRows = gsap.utils.toArray<HTMLElement>(
            "[data-workshop-check-item]",
            root
          );
          const glows = gsap.utils.toArray<HTMLElement>("[data-workshop-glow]", root);

          if (reduceMotion) {
            gsap.from([headerEl, showcaseEl].filter(Boolean), {
              autoAlpha: 0,
              duration: 0.2,
              stagger: 0.05,
              ease: MOTION.ease.out,
              clearProps: "opacity,visibility",
              scrollTrigger: {
                trigger: root,
                start: "top 82%",
                once: true,
                refreshPriority: MOTION.refreshPriority.workshop,
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
                    refreshPriority: MOTION.refreshPriority.workshop,
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
              refreshPriority: MOTION.refreshPriority.workshop,
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
              { autoAlpha: 0, y: 10, duration: 0.44, clearProps: "transform" },
              0.14
            );
          }

          const showcaseTl = gsap.timeline({
            defaults: { ease: MOTION.ease.out },
            scrollTrigger: {
              trigger: showcaseEl ?? root,
              start: "top 92%",
              once: true,
              refreshPriority: MOTION.refreshPriority.workshop,
            },
          });

          if (showcaseEl) {
            showcaseTl.from(
              showcaseEl,
              {
                autoAlpha: 0,
                y: 20,
                scale: 0.988,
                duration: 0.52,
                ease: MOTION.ease.drawer,
                clearProps: "opacity,visibility,transform",
              },
              0
            );
          }

          if (leftStrokes.length) {
            showcaseTl.from(
              leftStrokes,
              {
                drawSVG: 0,
                duration: 0.48,
                stagger: 0.055,
              },
              0.16
            );
          }

          if (checkRows.length) {
            showcaseTl.from(
              checkRows,
              {
                autoAlpha: 0,
                x: -6,
                duration: 0.36,
                stagger: 0.06,
                clearProps: "transform",
              },
              0.2
            );
          }

          // Subtle scrubbed atmospheric glow drift
          glows.forEach((glow, idx) => {
            gsap.to(glow, {
              y: idx % 2 === 0 ? -16 : 16,
              ease: "none",
              scrollTrigger: {
                trigger: root,
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
                refreshPriority: MOTION.refreshPriority.workshop,
              },
            });
          });
        }
      );
    },
    { scope: sectionRef }
  );

  // Interactive Flip tab pill & preview tab transitions
  useGSAP(
    () => {
      const root = sectionRef.current;
      if (!root) return;

      const reduceMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;

      // Animate Flip sliding pill if captured before state update
      if (flipStateRef.current) {
        const pillState = flipStateRef.current;
        flipStateRef.current = null;
        if (!reduceMotion) {
          Flip.from(pillState, {
            targets: "[data-flip-id='workshop-tab-pill']",
            duration: MOTION.duration.uiPanel,
            ease: MOTION.ease.inOut,
            scale: true,
            simple: true,
            prune: true,
          });
        }
      }

      if (!hasSwitchedTabRef.current) {
        hasSwitchedTabRef.current = true;
        return;
      }

      const panelBody = root.querySelector("[data-workshop-panel-body]");
      if (panelBody) {
        if (reduceMotion) {
          gsap.fromTo(
            panelBody,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.14, ease: MOTION.ease.out }
          );
        } else {
          gsap.fromTo(
            panelBody,
            { autoAlpha: 0, y: 6, filter: "blur(2px)" },
            {
              autoAlpha: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.22,
              ease: MOTION.ease.out,
              clearProps: "filter,transform",
            }
          );
        }
      }

      if (activeTab === "questions") {
        const chatStrokes = root.querySelectorAll("[data-workshop-chat] [data-draw-stroke]");
        if (chatStrokes.length && !reduceMotion) {
          gsap.from(chatStrokes, {
            drawSVG: 0,
            duration: 0.42,
            stagger: 0.06,
            ease: MOTION.ease.out,
          });
        }
      }

      if (activeTab === "live-score") {
        const bars = gsap.utils.toArray<HTMLElement>("[data-score-bar]", root);
        const counters = gsap.utils.toArray<HTMLElement>("[data-score-counter]", root);

        if (bars.length) {
          gsap.fromTo(
            bars,
            { scaleX: 0 },
            {
              scaleX: (_, el) => Number((el as HTMLElement).dataset.ratio || 0.8),
              transformOrigin: "left center",
              duration: reduceMotion ? 0 : 0.48,
              stagger: reduceMotion ? 0 : 0.055,
              ease: MOTION.ease.out,
            }
          );
        }

        if (counters.length && !reduceMotion) {
          counters.forEach((counterEl) => {
            const target = Number(counterEl.dataset.target || 0);
            const obj = { val: 0 };
            gsap.to(obj, {
              val: target,
              duration: 0.44,
              ease: MOTION.ease.out,
              onUpdate: () => {
                counterEl.textContent = obj.val.toFixed(1);
              },
            });
          });
        }
      }

      if (activeTab === "results" && !reduceMotion) {
        const resultCounter = root.querySelector<HTMLElement>("[data-results-score]");
        if (resultCounter) {
          const obj = { val: 0 };
          gsap.to(obj, {
            val: 8.2,
            duration: 0.5,
            ease: MOTION.ease.out,
            onUpdate: () => {
              resultCounter.textContent = obj.val.toFixed(1);
            },
          });
        }
      }
    },
    { scope: sectionRef, dependencies: [activeTab] }
  );

  const handleTabSelect = (nextTab: WorkshopTab) => {
    if (nextTab === activeTab) return;
    if (sectionRef.current) {
      const pill = sectionRef.current.querySelector("[data-flip-id='workshop-tab-pill']");
      if (pill) {
        flipStateRef.current = Flip.getState(pill);
      }
    }
    setActiveTab(nextTab);
  };

  return (
    <section
      ref={sectionRef}
      id="workshop"
      className="relative w-full overflow-hidden bg-white"
    >
      {/* Light, airy edge-to-edge ambient lavender mist so the workshop showcase card pops clearly */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{
          backgroundImage: [
            "radial-gradient(ellipse 56% 36% at 10% 4%, rgba(226, 214, 238, 0.42) 0%, rgba(226, 214, 238, 0.14) 52%, transparent 80%)",
            "radial-gradient(ellipse 56% 36% at 90% 4%, rgba(226, 214, 238, 0.42) 0%, rgba(226, 214, 238, 0.14) 52%, transparent 80%)",
            "radial-gradient(ellipse 46% 34% at 4% 96%, rgba(196, 174, 236, 0.22) 0%, rgba(222, 210, 248, 0.08) 50%, transparent 78%)",
            "radial-gradient(ellipse 48% 36% at 96% 96%, rgba(196, 174, 236, 0.24) 0%, rgba(222, 210, 248, 0.10) 50%, transparent 78%)",
          ].join(", "),
        }}
      >
        <div data-workshop-glow="" className="absolute left-[54%] top-[-8%] h-[28%] w-[54%] min-w-[580px] opacity-45">
          <div className="absolute inset-[-129.87%_-44.15%]">
            <img alt="" src="/assets/workshop-ellipse-9.svg" width={1706} height={1108} className="block size-full max-w-none" />
          </div>
        </div>
        <div data-workshop-glow="" className="absolute left-[-14%] top-[-11%] h-[28%] w-[54%] min-w-[580px] opacity-45">
          <div className="absolute inset-[-129.87%_-44.15%]">
            <img alt="" src="/assets/workshop-ellipse-9.svg" width={1706} height={1108} className="block size-full max-w-none" />
          </div>
        </div>
        <div data-workshop-glow="" className="absolute bottom-[-4%] left-[-12%] h-[18%] w-[24%] min-w-[280px] opacity-[0.12]">
          <div className="absolute inset-[-192.31%_-108.99%]">
            <img alt="" src="/assets/workshop-ellipse-10.svg" width={1167} height={1008} className="block size-full max-w-none" />
          </div>
        </div>
        <div data-workshop-glow="" className="absolute bottom-[-5%] left-[-11%] h-[18%] w-[32%] min-w-[380px] opacity-[0.11]">
          <div className="absolute inset-[-196.08%_-73.66%]">
            <img alt="" src="/assets/workshop-ellipse-11.svg" width={1343} height={1004} className="block size-full max-w-none" />
          </div>
        </div>
        <div data-workshop-glow="" className="absolute bottom-[-5%] right-[-14%] h-[24%] w-[40%] min-w-[460px] opacity-[0.12]">
          <div className="absolute inset-[-117.65%_-48.78%]">
            <img alt="" src="/assets/workshop-ellipse-12.svg" width={1620} height={1140} className="block size-full max-w-none" />
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 pb-[128px] pt-[80px] sm:px-8 sm:pb-[156px] sm:pt-[96px] lg:px-[clamp(32px,8.333vw,120px)] lg:pb-[180px] lg:pt-[108px]">

        {/* Heading Row */}
        <div
          data-workshop-header=""
          className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-start"
        >
          <div className="max-w-[740px]">
            <p
              data-workshop-eyebrow=""
              className="text-[12px] font-semibold leading-[18px] text-[#7453a6]"
            >
              THE WORKSHOP
            </p>
            <h2
              data-workshop-heading=""
              className="mt-[18px] text-[32px] font-semibold leading-[1.15] text-[#242126] sm:text-[42px] lg:text-[48px] lg:leading-[55.2px]"
            >
              <span className="block">Your interview.</span>
              <span className="block">Your way to practice.</span>
            </h2>
          </div>

          <div
            data-workshop-sub=""
            className="max-w-[425px] text-[15px] font-normal leading-[25.5px] text-[#716a79] sm:text-[17px] lg:mt-[74px]"
          >
            <p>Choose what feels right for this session.</p>
            <p>You can try something different next time.</p>
          </div>
        </div>

        {/* Interactive Category Tabs with Flip shared active pill */}
        <div
          role="tablist"
          aria-label="Workshop modes"
          className="relative z-10 mt-10 grid w-full max-w-[702px] grid-cols-1 gap-1 rounded-[12px] bg-[#f4f1f8] p-[5px] sm:grid-cols-3 lg:mt-[43px]"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => handleTabSelect(tab.id)}
                className={`relative flex h-[42px] cursor-pointer items-center justify-center rounded-[8px] px-4 text-left text-[14px] leading-[19.6px] transition-[color] duration-200 ease-out active:scale-[0.98] sm:justify-start sm:pl-[18px] ${
                  isActive
                    ? "font-semibold text-[#51366f]"
                    : "font-medium text-[#716a79] hover:text-[#51366f]"
                }`}
              >
                {isActive && (
                  <span
                    data-flip-id="workshop-tab-pill"
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-[8px] bg-white shadow-[0_1px_2px_rgba(32,33,36,0.05)]"
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Workshop Feature Showcase Card */}
        <div
          data-workshop-showcase=""
          className="relative z-10 mt-8 min-h-[568px] overflow-hidden rounded-[24px] border border-[#e3d9ee] bg-[#f4f0fa] shadow-[0_14px_42px_rgba(36,33,38,0.06)]"
        >
          <div className="flex flex-col lg:min-h-[568px] lg:flex-row">
            {/* Left Overview Panel */}
            <div
              data-workshop-left=""
              className="flex flex-col justify-between rounded-[24px] bg-[#ede5f6] p-7 sm:p-[36px] lg:w-[36.5%] lg:max-w-[438px] lg:shrink-0"
            >
              <div>
                <WorkshopBriefcaseIcon />
                <p className="mt-[26px] text-[11px] font-semibold leading-[16.5px] text-[#7453a6]">
                  PROGRESS, NOT PERFECTION
                </p>
                <h3 className="mt-[17px] text-[28px] font-semibold leading-[1.17] text-[#242126] sm:text-[34px] sm:leading-[39.78px]">
                  <span className="block">Clear answers.</span>
                  <span className="block">Real progress.</span>
                </h3>
                <div className="mt-[20px] text-[15px] font-normal leading-[24px] text-[#675b73] sm:text-[16px]">
                  <p>Bring your own experience. Lods helps you shape it into clear answers, one follow-up at a time.</p>
                </div>

                <ul className="mt-[32px] space-y-[14px]">
                  {CHECK_ITEMS.map((item) => (
                    <li
                      key={item}
                      data-workshop-check-item=""
                      className="flex items-center gap-[10px]"
                    >
                      <CheckStrokeIcon />
                      <span className="text-[13px] font-medium leading-[19.5px] text-[#513f61]">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/auth"
                className="btn-tactile mt-8 inline-flex h-[48px] w-[214px] items-center justify-between rounded-[10px] bg-[#242126] px-[18px] text-[13px] font-semibold leading-[18.2px] text-white"
              >
                <span>Start an interview</span>
                <ArrowRightStrokeIcon
                  variant="standard"
                  size={18}
                  color="white"
                  className="hover-arrow-shift size-[18px] shrink-0"
                />
              </Link>
            </div>

            {/* Right Interactive Preview Card */}
            <div className="flex flex-1 items-center justify-center p-5 sm:p-8 lg:px-[38px] lg:py-[34px]">
              <div className="relative w-full overflow-hidden rounded-[16px] border border-[#e3dbeb] bg-white lg:min-h-[500px]">
                <div data-workshop-panel-body="">
                  {activeTab === "questions" && (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eeeaf2] px-[25px] py-[20px]">
                        <div>
                          <p className="text-[16px] font-semibold leading-[24px] text-[#32283c]">
                            Sir Bot
                          </p>
                          <p className="mt-[3px] text-[11px] font-normal leading-[16.5px] text-[#716a79]">
                            Software Engineer · Normal difficulty · Witty
                          </p>
                        </div>
                        <div className="flex h-[30px] w-[150px] items-center justify-center rounded-[7px] bg-[#f2edf8]">
                          <span className="text-[10px] font-semibold leading-[13px] text-[#7453a6]">
                            QUESTION 03 OF 05
                          </span>
                        </div>
                      </div>

                      <div className="px-[25px] pb-[28px] pt-[25px]">
                        <h4 className="text-[21px] font-semibold leading-[1.3] text-[#242126] sm:text-[25px] sm:leading-[32.5px]">
                          <span className="block">Tell me about a time you handled</span>
                          <span className="block">pressure at work or in a project.</span>
                        </h4>
                        <p className="mt-[10px] text-[13px] font-normal leading-[19.5px] text-[#716a79]">
                          Take your time. Think about the situation, your actions, and the result.
                        </p>

                        <div className="mt-[19px] min-h-[108px] rounded-[12px] bg-[#f7f5fa] px-[18px] py-[15px]">
                          <p className="text-[10px] font-semibold leading-[15px] text-[#7453a6]">
                            YOUR ANSWER
                          </p>
                          <p className="mt-[10px] text-[14px] font-normal leading-[21px] text-[#51475d]">
                            “A day before launch, we found a critical bug. I proposed a fix, worked with QA to test it, and kept the team aligned on progress.”
                          </p>
                        </div>

                        <div
                          data-workshop-chat=""
                          className="mt-[20px] min-h-[116px] rounded-[12px] bg-[#eee7f8] px-[16px] py-[18px]"
                        >
                          <div className="flex items-center gap-[9px]">
                            <ConversationStrokeIcon color="#7453A6" strokeWidth={1.7} />
                            <span className="text-[10px] font-semibold leading-[15px] text-[#7453a6]">
                              LODS FOLLOW-UP
                            </span>
                          </div>
                          <p className="mt-[6px] pl-[33px] text-[14px] font-normal leading-[21px] text-[#513f61]">
                            What specific actions did you take, and how did you coordinate with the team?
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === "live-score" && (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eeeaf2] px-[25px] py-[20px]">
                        <div>
                          <p className="text-[16px] font-semibold leading-[24px] text-[#32283c]">
                            Live score preview
                          </p>
                          <p className="mt-[3px] text-[11px] font-normal leading-[16.5px] text-[#716a79]">
                            Updated after every answer · Software Engineer
                          </p>
                        </div>
                        <div className="flex h-[30px] items-center rounded-[7px] bg-[#f2edf8] px-3">
                          <span className="text-[12px] font-semibold tabular-nums text-[#7453a6]">
                            <span data-score-counter="" data-target="8.2">8.2</span> / 10 · Live score
                          </span>
                        </div>
                      </div>
                      <div className="px-[25px] pb-[28px] pt-[25px]">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          {LIVE_METRICS.map((metric) => (
                            <div key={metric.label} className="rounded-[12px] bg-[#f7f5fa] p-4">
                              <div className="flex items-center justify-between text-[13px] font-medium text-[#32283c]">
                                <span>{metric.label}</span>
                                <span
                                  data-score-counter=""
                                  data-target={metric.score}
                                  className="font-semibold tabular-nums text-[#7453a6]"
                                >
                                  {metric.score.toFixed(1)}
                                </span>
                              </div>
                              <div className="mt-2.5 h-[6px] w-full overflow-hidden rounded-full bg-[#e6dff0]">
                                <div
                                  data-score-bar=""
                                  data-ratio={metric.ratio}
                                  className="h-full w-full origin-left rounded-full bg-[#7453a6]"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-5 rounded-[12px] bg-[#eee7f8] p-[18px]">
                          <p className="text-[10px] font-semibold leading-[15px] text-[#7453a6]">
                            REAL-TIME GUIDANCE
                          </p>
                          <p className="mt-2 text-[14px] leading-[21px] text-[#513f61]">
                            You explained the triage clearly. Add a measurable result—like launch timing or bug reduction—to strengthen your impact score.
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === "results" && (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eeeaf2] px-[25px] py-[20px]">
                        <div>
                          <p className="text-[16px] font-semibold leading-[24px] text-[#32283c]">
                            Your interview results
                          </p>
                          <p className="mt-[3px] text-[11px] font-normal leading-[16.5px] text-[#716a79]">
                            5 of 5 questions completed · Strong performance
                          </p>
                        </div>
                        <div className="flex h-[30px] items-center rounded-[7px] bg-[#f2edf8] px-3">
                          <span className="text-[10px] font-semibold text-[#7453a6]">
                            ✓ COMPLETED
                          </span>
                        </div>
                      </div>
                      <div className="px-[25px] pb-[28px] pt-[25px]">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                          <div className="rounded-[12px] bg-[#f7f5fa] px-6 py-5 text-center sm:w-[190px]">
                            <p className="text-[10px] font-semibold text-[#7453a6]">
                              FINAL SESSION SCORE
                            </p>
                            <p className="mt-2 text-[42px] font-semibold tabular-nums leading-none text-[#242126]">
                              <span data-results-score="">8.2</span>
                              <span className="text-[16px] font-normal text-[#716a79]"> / 10</span>
                            </p>
                            <p className="mt-2 text-[12px] font-medium text-[#513f61]">
                              Strong performance
                            </p>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-[20px] font-semibold text-[#242126]">
                              A strong foundation.
                            </h4>
                            <p className="mt-2 text-[14px] leading-[21px] text-[#51475d]">
                              You told a clear story and took ownership of your actions. Make the outcome just as specific as your approach.
                            </p>
                            <p className="mt-3 text-[12px] font-semibold text-[#7453a6]">
                              Next focus: show measurable impact.
                            </p>
                          </div>
                        </div>
                        <div className="mt-5 rounded-[12px] bg-[#eee7f8] p-[18px]">
                          <p className="text-[10px] font-semibold leading-[15px] text-[#7453a6]">
                            QUESTION-BY-QUESTION BREAKDOWN
                          </p>
                          <p className="mt-2 text-[14px] leading-[21px] text-[#513f61]">
                            Review every prompt, revisit your answers, and focus your next rehearsal on your lowest-scoring rubric dimension.
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
