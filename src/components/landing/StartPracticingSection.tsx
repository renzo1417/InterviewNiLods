"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  FULL_MOTION_QUERY,
  MOTION,
  REDUCED_MOTION_QUERY,
  SplitText,
  gsap,
  useGSAP,
} from "@/lib/gsap";
import { ArrowRightStrokeIcon } from "./MotionVectors";
import { SirBotMark } from "./SirBotMark";

export function StartPracticingSection() {
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
          const logoEl = root.querySelector("[data-cta-logo]");
          const headingEl = root.querySelector("[data-cta-heading]");
          const fadeItems = gsap.utils.toArray<HTMLElement>("[data-cta-fade]", root);

          if (reduceMotion) {
            gsap.from([logoEl, headingEl, ...fadeItems].filter(Boolean), {
              autoAlpha: 0,
              duration: 0.2,
              stagger: 0.03,
              ease: MOTION.ease.out,
              clearProps: "opacity,visibility",
              scrollTrigger: {
                trigger: root,
                start: "top 84%",
                once: true,
                refreshPriority: MOTION.refreshPriority.startPracticing,
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
                const splitTl = gsap.timeline({
                  scrollTrigger: {
                    trigger: root,
                    start: "top 82%",
                    once: true,
                    refreshPriority: MOTION.refreshPriority.startPracticing,
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
                const liveAccent = headingEl.querySelector("[data-cta-accent]");
                if (liveAccent) {
                  splitTl.fromTo(
                    liveAccent,
                    { color: "#7453a6" },
                    {
                      color: "#32283c",
                      duration: 0.52,
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

          const tl = gsap.timeline({
            defaults: { ease: MOTION.ease.out },
            scrollTrigger: {
              trigger: root,
              start: "top 82%",
              once: true,
              refreshPriority: MOTION.refreshPriority.startPracticing,
            },
          });

          if (logoEl) {
            tl.from(
              logoEl,
              {
                autoAlpha: 0,
                scale: 0.94,
                y: 10,
                duration: 0.42,
                clearProps: "transform",
              },
              0
            );
          }

          if (fadeItems.length) {
            tl.from(
              fadeItems,
              {
                autoAlpha: 0,
                y: 12,
                duration: 0.42,
                stagger: 0.055,
                clearProps: "transform",
              },
              0.08
            );
          }
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden bg-[#eae3f7]">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-[64px] sm:px-8 sm:py-[76px] lg:min-h-[440px] lg:px-[clamp(32px,8.333vw,120px)] lg:pt-[82px] lg:pb-[105px]">
        <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-start">
          {/* Left Column */}
          <div className="max-w-[750px]">
            <div data-cta-logo="">
              <SirBotMark className="h-[76px] w-[69px]" />
            </div>
            <p
              data-cta-fade=""
              className="mt-[32px] text-[12px] font-semibold leading-[18px] text-[#7453a6]"
            >
              ONE ANSWER AT A TIME.
            </p>
            <h2
              data-cta-heading=""
              className="mt-[16px] text-[32px] font-semibold leading-[1.15] text-[#32283c] sm:text-[40px] lg:text-[clamp(36px,3.3333vw,48px)] lg:leading-[1.15]"
            >
              <span className="block">Turn feedback into</span>
              <span className="block">
                your next <span data-cta-accent="">win.</span>
              </span>
            </h2>
          </div>

          {/* Right Column */}
          <div className="w-full max-w-[400px] shrink-0 lg:pt-[60px]">
            <div
              data-cta-fade=""
              className="text-[16px] font-normal leading-[25.5px] text-[#675b73] lg:text-[17px]"
            >
              <p>Set the scene. Find your words.</p>
              <p>Start your next practice with Lods.</p>
            </div>

            <Link
              href="/practice"
              data-cta-fade=""
              className="btn-tactile mt-[28px] inline-flex h-[54px] w-[238px] items-center justify-between rounded-[10px] bg-[#242126] px-[22px] text-[15px] font-semibold leading-[21px] text-white lg:mt-[51px]"
            >
              <span>Start interview</span>
              <span className="size-[20px] shrink-0">
                <ArrowRightStrokeIcon
                  variant="cta"
                  size={20}
                  color="white"
                  className="hover-arrow-shift block size-full max-w-none"
                />
              </span>
            </Link>

            <p
              data-cta-fade=""
              className="mt-[18px] text-[13px] font-normal leading-[19.5px] text-[#675b73]"
            >
              No pressure. Just progress.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
