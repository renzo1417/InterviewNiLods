"use client";

import { useRef } from "react";
import {
  FULL_MOTION_QUERY,
  MOTION,
  REDUCED_MOTION_QUERY,
  gsap,
  scrollToAnchor,
  useGSAP,
} from "@/lib/gsap";
import { SirBotMark } from "./SirBotMark";

const FOOTER_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Workshop", href: "#workshop" },
  { label: "Features", href: "#features" },
  { label: "Stories", href: "#stories" },
  { label: "FAQ", href: "#faq" },
];

export function FooterSection() {
  const footerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = footerRef.current;
      if (!root) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          fullMotion: FULL_MOTION_QUERY,
          reduceMotion: REDUCED_MOTION_QUERY,
        },
        (context) => {
          const { reduceMotion } = context.conditions ?? {};
          const items = gsap.utils.toArray<HTMLElement>("[data-footer-item]", root);
          const wordmark = root.querySelector<HTMLElement>("[data-footer-wordmark]");

          if (reduceMotion) {
            gsap.from([...items, ...(wordmark ? [wordmark] : [])], {
              autoAlpha: 0,
              duration: 0.18,
              ease: MOTION.ease.out,
              clearProps: "opacity,visibility",
              scrollTrigger: {
                trigger: root,
                start: "top 94%",
                once: true,
                refreshPriority: MOTION.refreshPriority.footer,
              },
            });
            return;
          }

          const tl = gsap.timeline({
            defaults: { ease: MOTION.ease.out },
            scrollTrigger: {
              trigger: root,
              start: "top 92%",
              once: true,
              refreshPriority: MOTION.refreshPriority.footer,
            },
          });

          if (items.length) {
            tl.from(
              items,
              {
                autoAlpha: 0,
                y: 8,
                duration: 0.36,
                stagger: 0.045,
                clearProps: "opacity,visibility,transform",
              },
              0
            );
          }

          if (wordmark) {
            tl.from(
              wordmark,
              {
                autoAlpha: 0,
                y: 26,
                duration: 0.62,
                ease: MOTION.ease.drawer,
                clearProps: "opacity,visibility,transform",
              },
              0.08
            );
          }
        }
      );
    },
    { scope: footerRef }
  );

  return (
    <footer
      ref={footerRef}
      className="relative w-full overflow-hidden border-t border-[#e8e5ef] bg-[#f5f4f7]"
    >
      {/* Top Minimal Editorial Row */}
      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 pt-[44px] sm:px-8 sm:pt-[54px] lg:px-[clamp(32px,8.333vw,120px)]">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div data-footer-item="" className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <div className="flex size-[26px] shrink-0 items-center justify-center rounded-[7px] bg-[#202124] shadow-[0_1px_2px_rgba(32,33,36,0.12)]">
              <SirBotMark className="h-[16px] w-[14px] brightness-0 invert" alt="" />
            </div>
            <span className="text-[14px] font-semibold tracking-[-0.01em] text-[#242126]">
              Interview ni Lods
            </span>
            <span className="text-[13.5px] font-normal text-[#807c88]">
              - Practice now, panic less later
            </span>
          </div>

          <nav
            aria-label="Footer navigation"
            data-footer-item=""
            className="flex flex-wrap items-center gap-x-6 gap-y-2.5 sm:gap-x-7"
          >
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToAnchor(link.href, 12);
                }}
                className="text-[13px] font-medium leading-[20px] text-[#6d6976] transition-colors duration-200 hover:text-[#242126]"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Massive Flush-Bottom Watermark Wordmark */}
      <div className="mx-auto mt-[42px] flex w-full max-w-[1440px] justify-center overflow-hidden px-3 sm:mt-[56px] sm:px-6 lg:mt-[68px] lg:px-[clamp(24px,5vw,80px)]">
        <p
          aria-hidden="true"
          data-footer-wordmark=""
          className="-mb-[0.04em] select-none whitespace-nowrap font-black uppercase leading-[0.76] tracking-[-0.045em] text-[#e2e0e7]"
          style={{ fontSize: "clamp(46px, 13.8vw, 204px)" }}
        >
          INTERVIEW
        </p>
      </div>
    </footer>
  );
}
