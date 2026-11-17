"use client";

import React, { useRef, useState } from "react";
import { SirBotMark } from "@/components/landing/SirBotMark";
import {
  FINE_HOVER_QUERY,
  FULL_MOTION_QUERY,
  MOTION,
  REDUCED_MOTION_QUERY,
  gsap,
  useGSAP,
} from "@/lib/gsap";
import { AUTH_MODE_CONTENT, type AuthMode } from "./auth-config";

interface AuthShowcasePanelProps {
  mode: AuthMode;
  activeStepIndex?: number;
  completedSteps?: number;
}

type ShowcaseLayer = "score" | "chat";

/**
 * Dynamic, full-viewport asymmetric left showcase panel matching Figma frames 52:3, 52:82, and 52:150.
 * Scales fluidly via desktop container-size units so 02/03 app previews and the 3-step bar
 * fill any screen cleanly, with subtle GSAP depth parallax, live telemetry pulse, and interactive layer swapping.
 */
export function AuthShowcasePanel({
  mode,
  activeStepIndex = 0,
  completedSteps = 0,
}: AuthShowcasePanelProps) {
  const asideRef = useRef<HTMLElement>(null);
  const copy = AUTH_MODE_CONTENT[mode].showcase;
  const [focusedLayer, setFocusedLayer] = useState<ShowcaseLayer>("score");

  useGSAP(
    () => {
      const root = asideRef.current;
      if (!root) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          fullMotion: FULL_MOTION_QUERY,
          reduceMotion: REDUCED_MOTION_QUERY,
          fineHover: `${FINE_HOVER_QUERY} and ${FULL_MOTION_QUERY}`,
        },
        (context) => {
          const { reduceMotion, fineHover } = context.conditions ?? {};
          if (reduceMotion) return;

          const floatPills = gsap.utils.toArray<HTMLElement>("[data-showcase-pill]", root);
          const pulseDot = root.querySelector<HTMLElement>("[data-live-pulse]");

          floatPills.forEach((pill, index) => {
            gsap.to(pill, {
              y: index === 0 ? -4 : 4,
              duration: 2.8 + index * 0.45,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
            });
          });

          if (pulseDot) {
            gsap.fromTo(
              pulseDot,
              { scale: 1, opacity: 0.7 },
              {
                scale: 2.35,
                opacity: 0,
                duration: 1.8,
                repeat: -1,
                ease: "power2.out",
              }
            );
          }

          if (!fineHover) return;

          const chatLayer = root.querySelector<HTMLElement>("[data-parallax-back]");
          const scoreLayer = root.querySelector<HTMLElement>("[data-parallax-front]");
          const pillLayer = root.querySelector<HTMLElement>("[data-parallax-pills]");

          if (!chatLayer || !scoreLayer || !pillLayer) return;

          const backX = gsap.quickTo(chatLayer, "x", { duration: 0.45, ease: MOTION.ease.out });
          const backY = gsap.quickTo(chatLayer, "y", { duration: 0.45, ease: MOTION.ease.out });
          const frontX = gsap.quickTo(scoreLayer, "x", { duration: 0.4, ease: MOTION.ease.out });
          const frontY = gsap.quickTo(scoreLayer, "y", { duration: 0.4, ease: MOTION.ease.out });
          const badgeX = gsap.quickTo(pillLayer, "x", { duration: 0.35, ease: MOTION.ease.out });
          const badgeY = gsap.quickTo(pillLayer, "y", { duration: 0.35, ease: MOTION.ease.out });

          const onPointerMove = (event: PointerEvent) => {
            const rect = root.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            const nx = (event.clientX - rect.left) / rect.width - 0.5;
            const ny = (event.clientY - rect.top) / rect.height - 0.5;

            backX(-nx * 10);
            backY(-ny * 8);
            frontX(nx * 8);
            frontY(ny * 6);
            badgeX(nx * 15);
            badgeY(ny * 11);
          };

          const onPointerLeave = () => {
            backX(0);
            backY(0);
            frontX(0);
            frontY(0);
            badgeX(0);
            badgeY(0);
          };

          root.addEventListener("pointermove", onPointerMove);
          root.addEventListener("pointerleave", onPointerLeave);

          return () => {
            root.removeEventListener("pointermove", onPointerMove);
            root.removeEventListener("pointerleave", onPointerLeave);
          };
        }
      );
    },
    { scope: asideRef }
  );

  const isScoreFocused = focusedLayer === "score";

  return (
    <aside
      ref={asideRef}
      aria-label="Interview ni Lods workspace preview"
      className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[22px] sm:rounded-[28px]"
      style={{
        background: "linear-gradient(180deg, #7a57c2 0%, #352154 46%, #0c0912 100%)",
      }}
    >
      {/* Multi-directional radial luminescence exported directly from Figma */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-19.14%] top-[-14.58%] h-[54.17%] w-[74.16%]"
      >
        <div className="absolute inset-[-76.92%_-64.52%]">
          <img
            alt=""
            src="/assets/auth/glow-top-left.svg"
            width={1420}
            height={1320}
            className="block size-full max-w-none"
          />
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[45.45%] top-[-15.63%] h-[54.17%] w-[74.16%]"
      >
        <div className="absolute inset-[-76.92%_-64.52%]">
          <img
            alt=""
            src="/assets/auth/glow-top-right.svg"
            width={1420}
            height={1320}
            className="block size-full max-w-none"
          />
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[11.96%] top-[12.5%] h-[47.92%] w-[76.56%]"
      >
        <div className="absolute inset-[-86.96%_-62.5%]">
          <img
            alt=""
            src="/assets/auth/glow-center.svg"
            width={1440}
            height={1260}
            className="block size-full max-w-none"
          />
        </div>
      </div>

      {/* Top centered brand lockup + headline + subtitle */}
      <div className="relative z-10 mx-auto flex w-full max-w-[min(88%,640px)] shrink-0 flex-col items-center px-5 pt-8 sm:px-8 sm:pt-10 lg:px-0 lg:pt-[clamp(22px,6.4dvh,74px)]">
        <div className="flex items-center justify-center gap-[10px]">
          <span aria-hidden="true" className="shrink-0">
            <SirBotMark
              className="h-[clamp(28px,3.3dvh,36px)] w-[clamp(25px,3dvh,33px)] rounded-[6px]"
              alt=""
            />
          </span>
          <span className="whitespace-nowrap text-[clamp(16px,1.8dvh,20px)] font-semibold leading-[1.35] tracking-[-0.3px] text-white">
            Interview ni Lods
          </span>
        </div>

        <h2 className="mt-[clamp(10px,1.5dvh,18px)] text-center text-[clamp(24px,min(2.5vw,3.7dvh),42px)] font-bold leading-[1.18] tracking-[-1px] text-white">
          <span className="block">{copy.headlineTop}</span>
          <span className="block">{copy.headlineBottom}</span>
        </h2>

        <p className="mt-[clamp(8px,1.3dvh,15px)] max-w-[min(92%,520px)] text-center text-[clamp(12.5px,1.45dvh,15.5px)] font-normal leading-[1.5] text-[#f5f4f8]/[0.82]">
          {copy.subtitle}
        </p>
      </div>

      {/* Fluid aspect-locked showcase stage: scales proportionally to fill exact width & height */}
      <div className="relative z-10 flex min-h-0 w-full flex-1 items-center justify-center px-4 py-6 sm:px-8 lg:px-[5.74%] lg:py-[clamp(12px,2.2dvh,26px)] lg:[container-type:size]">
        <div className="relative aspect-[736/494] w-full max-w-[736px] lg:max-w-none lg:w-[min(100cqw,calc(100cqh*736/494))]">
          {/* 02 · Interview in progress (interactive click-to-bring-forward layer) */}
          <div
            data-parallax-back=""
            className={`absolute left-0 top-0 h-[75.91%] w-[73.37%] will-change-transform transition-opacity duration-300 ease-out ${
              isScoreFocused ? "z-0 opacity-[0.92]" : "z-20 opacity-100"
            }`}
          >
            <button
              type="button"
              aria-pressed={!isScoreFocused}
              aria-label="Bring interview conversation preview to front"
              onClick={() => setFocusedLayer((prev) => (prev === "chat" ? "score" : "chat"))}
              className={`group relative block size-full cursor-pointer overflow-hidden rounded-[12px] border border-white/25 text-left shadow-[0_18px_44px_-8px_rgba(8,5,18,0.42)] transition-[transform,border-color] duration-300 ease-out hover:border-white/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:rounded-[14px] ${
                isScoreFocused ? "scale-100" : "scale-[1.03]"
              }`}
            >
              <img
                alt="Interview in progress conversation screen with Sir Bot"
                src="/assets/auth/preview-chat.png"
                width={1440}
                height={1000}
                className="pointer-events-none block size-full object-cover object-left-top"
              />
            </button>
          </div>

          {/* 03 · Live score panel (default front layer) */}
          <div
            data-parallax-front=""
            className={`absolute left-[13.04%] top-[10.12%] h-[89.88%] w-[86.96%] will-change-transform transition-opacity duration-300 ease-out ${
              isScoreFocused ? "z-10 opacity-100" : "z-0 opacity-[0.78]"
            }`}
          >
            <button
              type="button"
              aria-pressed={isScoreFocused}
              aria-label="Focus live score panel preview"
              onClick={() => setFocusedLayer("score")}
              className={`group relative block size-full cursor-pointer overflow-hidden rounded-[14px] border-[1.5px] border-white/35 text-left shadow-[0_28px_68px_-10px_rgba(6,3,14,0.62)] transition-[transform,border-color] duration-300 ease-out hover:border-white/55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:rounded-[16px] ${
                isScoreFocused ? "scale-100" : "scale-[0.97]"
              }`}
            >
              <img
                alt="Live score panel screen showing 8.2 out of 10 answer breakdown"
                src="/assets/auth/preview-score.png"
                width={1440}
                height={1000}
                className="pointer-events-none block size-full object-cover object-left-top"
              />
            </button>
          </div>

          {/* Floating callout badges on their own depth parallax layer */}
          <div
            data-parallax-pills=""
            className="pointer-events-none absolute inset-0 z-30 will-change-transform"
          >
            {/* Floating callout pill 1: Live Score · 8.2 / 10 */}
            <div
              data-showcase-pill=""
              className="absolute left-[17.66%] top-[6.88%] inline-flex items-center gap-[7px] rounded-[10px] border border-white/[0.22] bg-[rgba(25,22,34,0.94)] py-[6px] pl-[10px] pr-[12px] shadow-[0_10px_24px_rgba(0,0,0,0.35)] backdrop-blur-xs sm:py-[7px] sm:pl-[12px] sm:pr-[13px]"
            >
              <span className="relative inline-flex size-[7px] shrink-0 items-center justify-center">
                <span
                  data-live-pulse=""
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-[#c7b8fa]"
                />
                <img
                  alt=""
                  src="/assets/auth/dot-live.svg"
                  width={7}
                  height={7}
                  className="relative block size-[7px] shrink-0"
                />
              </span>
              <span className="whitespace-nowrap text-[10.5px] font-medium leading-[1.3] text-[#f5f4f8] sm:text-[11.5px]">
                Live Score · 8.2 / 10
              </span>
            </div>

            {/* Floating callout pill 2: AI STAR Feedback */}
            <div
              data-showcase-pill=""
              className="absolute right-[-2.5%] top-[27.13%] inline-flex items-center gap-[6px] rounded-[10px] border border-white/[0.22] bg-[rgba(25,22,34,0.94)] py-[6px] pl-[10px] pr-[12px] shadow-[0_10px_24px_rgba(0,0,0,0.35)] backdrop-blur-xs sm:right-[-4.2%] sm:py-[7px] sm:pl-[12px] sm:pr-[13px]"
            >
              <img
                alt=""
                src="/assets/auth/icon-sparkle.svg"
                width={13}
                height={13}
                className="block size-[12px] shrink-0 sm:size-[13px]"
              />
              <span className="whitespace-nowrap text-[10.5px] font-medium leading-[1.3] text-[#f5f4f8] sm:text-[11.5px]">
                AI STAR Feedback
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom 3-step horizontal onboarding bar (scales proportionally across all desktop widths) */}
      <div className="relative z-10 shrink-0 px-4 pb-5 sm:px-8 sm:pb-8 lg:px-[5.74%] lg:pb-[clamp(16px,3.6dvh,38px)]">
        <ol className="mx-auto flex min-h-[52px] w-full flex-wrap items-center justify-between gap-x-3 gap-y-2.5 rounded-[16px] border border-white/[0.12] bg-[rgba(18,16,23,0.92)] px-4 py-3 backdrop-blur-sm sm:h-[clamp(52px,6dvh,64px)] sm:flex-nowrap sm:px-[clamp(14px,2vw,24px)] sm:py-0">
          {copy.steps.map((label, idx) => {
            const isCompleted = idx < completedSteps;
            const isActive = !isCompleted && idx === activeStepIndex;
            return (
              <li key={label} className="flex items-center">
                <button
                  type="button"
                  onClick={() => setFocusedLayer(idx === 2 ? "score" : idx === 1 ? "chat" : "score")}
                  className="group flex cursor-pointer items-center gap-[8px] rounded-[8px] py-1 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white xl:gap-[10px]"
                >
                  <span
                    aria-current={isActive ? "step" : undefined}
                    className={`inline-flex size-[24px] shrink-0 items-center justify-center rounded-full text-[11.5px] font-semibold leading-none transition-colors duration-200 ${
                      isCompleted
                        ? "bg-[#c7b8fa] text-[#121017]"
                        : isActive
                        ? "bg-white text-[#121017]"
                        : "border border-[#3b3647] bg-[#25212f] text-[#8b8599] group-hover:border-[#5a5170]"
                    }`}
                  >
                    {isCompleted ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path
                          d="M2.5 6.2L4.9 8.5L9.5 3.6"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      idx + 1
                    )}
                  </span>
                  <span
                    className={`whitespace-nowrap text-[12px] leading-[1.35] transition-colors duration-200 sm:text-[clamp(11px,0.92vw,13.5px)] ${
                      isCompleted || isActive
                        ? "font-medium text-white"
                        : "font-normal text-[#8b8599] group-hover:text-[#c7bfd6]"
                    }`}
                  >
                    {label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </aside>
  );
}
