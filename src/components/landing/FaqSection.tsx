"use client";

import { useRef, useState } from "react";
import {
  FULL_MOTION_QUERY,
  MOTION,
  REDUCED_MOTION_QUERY,
  ScrollTrigger,
  SplitText,
  gsap,
  useGSAP,
} from "@/lib/gsap";
import { FaqToggleMorphIcon } from "./MotionVectors";

interface FaqItem {
  question: string;
  answer: string[];
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What is Interview ni Lods?",
    answer: [
      "Interview ni Lods is your AI interview coach. Choose your role and settings,",
      "practice through a chat, and get feedback on your answers.",
      "No pressure. No perfect answers. Just progress.",
    ],
  },
  {
    question: "How do I customize my interview?",
    answer: [
      "Before starting a session, choose your target job role, difficulty level, number of questions, and Sir Bot’s coaching tone (Friendly, Witty, or Direct).",
    ],
  },
  {
    question: "What does the live score preview show?",
    answer: [
      "During your interview, the live score preview tracks how your current answers are landing so you can spot gaps and adjust your examples in real time.",
    ],
  },
  {
    question: "Is my live score my final session score?",
    answer: [
      "No—the live score updates while the interview is still in progress. Once you complete all questions, you receive your final session score with a rubric breakdown.",
    ],
  },
  {
    question: "What feedback do I get after an interview?",
    answer: [
      "You get a final score out of 10 across Clarity, Structure, Relevance, and Impact, along with question-by-question feedback and a clear next focus to practice.",
    ],
  },
  {
    question: "Can I review my previous sessions?",
    answer: [
      "Yes. Completed and in-progress sessions appear under your Sessions list so you can revisit transcripts, scores, and coaching notes anytime.",
    ],
  },
];

const PLUS_VERTICAL_PATH = "M10 4.16667V15.8333";
const MINUS_COLLAPSED_PATH = "M4.16667 10H15.8333";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const sectionRef = useRef<HTMLElement>(null);
  const hasToggledFaqRef = useRef(false);

  // Scroll entrance choreography
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
          const leftCol = root.querySelector("[data-faq-left]");
          const headingEl = root.querySelector("[data-faq-heading]");
          const faqRows = gsap.utils.toArray<HTMLElement>("[data-faq-item]", root);

          if (reduceMotion) {
            gsap.from([leftCol, ...faqRows].filter(Boolean), {
              autoAlpha: 0,
              duration: 0.2,
              stagger: 0.03,
              ease: MOTION.ease.out,
              clearProps: "opacity,visibility",
              scrollTrigger: {
                trigger: root,
                start: "top 80%",
                once: true,
                refreshPriority: MOTION.refreshPriority.faq,
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
                    trigger: leftCol ?? root,
                    start: "top 78%",
                    once: true,
                    refreshPriority: MOTION.refreshPriority.faq,
                  },
                });
              },
            });
          }

          if (leftCol) {
            const leftDetails = gsap.utils.toArray<HTMLElement>(
              "[data-faq-left-fade]",
              root
            );
            gsap.from(leftDetails, {
              autoAlpha: 0,
              y: 12,
              duration: 0.44,
              stagger: 0.07,
              ease: MOTION.ease.out,
              clearProps: "transform",
              scrollTrigger: {
                trigger: leftCol,
                start: "top 78%",
                once: true,
                refreshPriority: MOTION.refreshPriority.faq,
              },
            });
          }

          if (faqRows.length) {
            gsap.from(faqRows, {
              autoAlpha: 0,
              y: 14,
              duration: 0.42,
              stagger: 0.045,
              ease: MOTION.ease.out,
              clearProps: "transform",
              scrollTrigger: {
                trigger: root.querySelector("[data-faq-list]") ?? root,
                start: "top 78%",
                once: true,
                refreshPriority: MOTION.refreshPriority.faq,
              },
            });
          }
        }
      );
    },
    { scope: sectionRef }
  );

  // MorphSVG '+' <-> '−' indicator sync on openIndex change
  useGSAP(
    () => {
      const root = sectionRef.current;
      if (!root) return;
      if (!hasToggledFaqRef.current) {
        hasToggledFaqRef.current = true;
        return;
      }

      const reduceMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
      const items = gsap.utils.toArray<HTMLElement>("[data-faq-item]", root);

      items.forEach((item, idx) => {
        const verticalStroke = item.querySelector<SVGPathElement>("[data-faq-vertical]");
        if (!verticalStroke) return;
        const isOpen = openIndex === idx;
        gsap.to(verticalStroke, {
          morphSVG: isOpen ? MINUS_COLLAPSED_PATH : PLUS_VERTICAL_PATH,
          duration: reduceMotion ? 0 : 0.2,
          ease: MOTION.ease.inOut,
          overwrite: "auto",
        });
      });
    },
    { scope: sectionRef, dependencies: [openIndex] }
  );

  return (
    <section
      ref={sectionRef}
      id="faq"
      className="relative w-full bg-white"
    >
      <div className="mx-auto w-full max-w-[1440px] px-5 pt-[72px] pb-[88px] sm:px-8 sm:pt-[88px] sm:pb-[104px] lg:min-h-[800px] lg:px-[clamp(32px,8.333vw,120px)] lg:pt-[106px] lg:pb-[120px]">
        <div className="flex flex-col justify-between gap-10 lg:flex-row lg:gap-12">
          {/* Left Column */}
          <div
            data-faq-left=""
            className="w-full max-w-[430px] lg:w-[35.8%] lg:min-w-[310px] lg:shrink-0 lg:pt-[4px]"
          >
            <p
              data-faq-left-fade=""
              className="text-[12px] font-semibold leading-[18px] text-[#7453a6]"
            >
              A FEW THINGS TO KNOW
            </p>
            <h2
              data-faq-heading=""
              className="mt-[22px] text-[32px] font-semibold leading-[1.18] text-[#242126] sm:text-[38px] lg:text-[clamp(34px,3.0556vw,44px)] lg:leading-[1.18]"
            >
              <span className="block">Good questions.</span>
              <span className="block">Straight answers.</span>
            </h2>
            <div
              data-faq-left-fade=""
              className="mt-[26px] text-[15px] font-normal leading-[25.5px] text-[#716a79] sm:text-[16px] lg:text-[17px]"
            >
              <p>A few helpful things to know</p>
              <p>about setting up your interview</p>
              <p>and learning from your feedback.</p>
            </div>

            <div
              data-faq-left-fade=""
              className="mt-[48px] min-h-[120px] w-full max-w-[352px] rounded-[12px] bg-[#f4f1f8] px-[20px] py-[18px] lg:mt-[61px]"
            >
              <p className="text-[15px] font-semibold leading-[22.5px] text-[#513f61]">
                Guidance, not a guarantee.
              </p>
              <div className="mt-[8px] text-[13px] font-normal leading-[19.5px] text-[#716a79]">
                <p>Use AI feedback to guide your practice,</p>
                <p>not to predict a hiring decision.</p>
              </div>
            </div>
          </div>

          {/* Right Accordion Column */}
          <div data-faq-list="" className="w-full max-w-[732px] flex-1 space-y-[4px]">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={item.question}
                  data-faq-item=""
                  className={`overflow-hidden rounded-[12px] transition-colors duration-200 ${
                    isOpen ? "bg-[#f5f1fa]" : "bg-white"
                  }`}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className={`flex w-full cursor-pointer items-center justify-between px-[24px] text-left transition-[padding] duration-200 active:scale-[0.995] ${
                      isOpen ? "pb-[20px] pt-[24px]" : "pb-[35px] pt-[24px]"
                    }`}
                  >
                    <span className="pr-4 text-[17px] font-semibold leading-[23.8px] text-[#32283c]">
                      {item.question}
                    </span>
                    <FaqToggleMorphIcon initialOpen={idx === 0} />
                  </button>

                  {/* CSS Grid 0fr -> 1fr accordion drawer (pangulo-ai pattern) synced to ScrollTrigger */}
                  <div
                    className="faq-grid-panel"
                    data-open={isOpen ? "true" : "false"}
                    aria-hidden={!isOpen}
                    inert={!isOpen || undefined}
                    onTransitionEnd={(e) => {
                      if (
                        e.target === e.currentTarget &&
                        e.propertyName === "grid-template-rows"
                      ) {
                        ScrollTrigger.refresh();
                      }
                    }}
                  >
                    <div className="faq-grid-inner">
                      <div className="px-[24px] pb-[32px] text-[15px] font-normal leading-[22.5px] text-[#716a79]">
                        {item.answer.map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`mx-[24px] h-px bg-[#e8e2ed] transition-opacity duration-200 ${
                      isOpen ? "opacity-0" : "opacity-100"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
