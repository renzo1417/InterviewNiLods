"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  FULL_MOTION_QUERY,
  MOTION,
  REDUCED_MOTION_QUERY,
  gsap,
  scrollToAnchor,
  useGSAP,
} from "@/lib/gsap";
import { ArrowRightStrokeIcon, NavDividerLine, NavNotchFilletSvg } from "./MotionVectors";
import { SirBotMark } from "./SirBotMark";

const NAV_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Workshop", href: "#workshop" },
  { label: "Features", href: "#features" },
  { label: "FAQ", href: "#faq" },
];

export function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = headerRef.current;
      if (!root) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          fullMotion: FULL_MOTION_QUERY,
          reduceMotion: REDUCED_MOTION_QUERY,
        },
        (context) => {
          const { reduceMotion } = context.conditions ?? {};
          const notchEl = root.querySelector("[data-nav-notch]");
          const navItems = gsap.utils.toArray<HTMLElement>("[data-nav-item]", root);
          const dividerStroke = root.querySelector("[data-draw-stroke]");

          if (reduceMotion) {
            if (notchEl) gsap.set(notchEl, { autoAlpha: 1 });
            if (navItems.length) gsap.set(navItems, { autoAlpha: 1 });
            if (dividerStroke) gsap.set(dividerStroke, { autoAlpha: 1, drawSVG: "0% 100%" });
            return;
          }

          const tl = gsap.timeline({
            defaults: { ease: MOTION.ease.out },
          });

          if (notchEl) {
            tl.fromTo(
              notchEl,
              { autoAlpha: 0, y: -14 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.42,
                ease: MOTION.ease.drawer,
                clearProps: "transform",
              },
              0
            );
          }

          if (navItems.length) {
            tl.fromTo(
              navItems,
              { autoAlpha: 0, y: -6 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.34,
                stagger: 0.032,
                clearProps: "transform",
              },
              0.1
            );
          }

          if (dividerStroke) {
            tl.fromTo(
              dividerStroke,
              { drawSVG: "50% 50%" },
              {
                drawSVG: "0% 100%",
                duration: 0.44,
                ease: MOTION.ease.out,
              },
              0.14
            );
          }
        }
      );
    },
    { scope: headerRef }
  );

  useGSAP(
    () => {
      if (!mobileMenuOpen) return;
      const links = headerRef.current?.querySelectorAll("[data-mobile-nav-link]");
      if (!links?.length) return;

      const reduceMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
      gsap.fromTo(
        links,
        {
          autoAlpha: 0,
          y: reduceMotion ? 0 : -6,
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: reduceMotion ? 0.12 : 0.18,
          stagger: reduceMotion ? 0 : 0.035,
          ease: MOTION.ease.out,
          clearProps: "transform",
        }
      );
    },
    { scope: headerRef, dependencies: [mobileMenuOpen] }
  );

  const handleAnchorClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    setMobileMenuOpen(false);
    scrollToAnchor(href, href === "#top" ? 0 : 12);
  };

  return (
    <header
      ref={headerRef}
      className="relative z-20 mx-auto flex w-full max-w-[1160px] justify-center px-3 sm:px-8"
    >
      <nav
        data-nav-notch=""
        data-hero-init=""
        aria-label="Primary navigation"
        className="relative w-full rounded-b-[24px] bg-[#202124] px-4 py-3 shadow-[0_16px_36px_-10px_rgba(32,33,36,0.22),0_4px_12px_-4px_rgba(32,33,36,0.12)] sm:rounded-b-[34px] sm:px-8 sm:py-0 lg:px-10"
      >
        {/* Seamless concave notch corner fillets anchoring the bar into the top edge */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -left-[23px] top-0 hidden sm:block"
        >
          <NavNotchFilletSvg side="left" className="block size-[24px]" />
        </span>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-[23px] top-0 hidden sm:block"
        >
          <NavNotchFilletSvg side="right" className="block size-[24px]" />
        </span>

        {/* Subtle lavender-white bottom rim highlight */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-[#cab4f0]/30 to-transparent"
        />

        <div className="flex min-h-[64px] items-center justify-between gap-4 sm:h-[88px] lg:h-[94px]">
          {/* Left: Brand + Vertical Divider */}
          <div className="flex items-center gap-3 sm:gap-6">
            <a
              href="#top"
              data-nav-item=""
              onClick={(e) => handleAnchorClick(e, "#top")}
              className="group flex shrink-0 items-center gap-[10px]"
            >
              <SirBotMark className="h-[44px] w-[40px] shrink-0 transition-transform duration-200 group-hover:scale-[1.03] sm:h-[56px] sm:w-[50px]" />
              <span className="whitespace-nowrap text-[17px] font-semibold leading-[1.45] tracking-[-0.015em] text-[#f5f4f8] sm:text-[19px] lg:text-[20px]">
                Interview ni Lods
              </span>
            </a>

            <div aria-hidden="true" className="hidden h-[46px] items-center lg:flex">
              <div className="rotate-90 opacity-60">
                <NavDividerLine />
              </div>
            </div>
          </div>

          {/* Center: Nav links */}
          <div className="hidden items-center gap-6 lg:flex xl:gap-[40px]">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                data-nav-item=""
                onClick={(e) => handleAnchorClick(e, item.href)}
                className="relative whitespace-nowrap py-1.5 text-[15px] font-semibold leading-[1.4] tracking-[-0.01em] text-[#f5f4f8]/90 transition-colors duration-200 after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:origin-center after:scale-x-0 after:rounded-full after:bg-[#cab4f0] after:transition-transform after:duration-200 after:ease-[cubic-bezier(0.23,1,0.32,1)] hover:text-[#cab4f0] hover:after:scale-x-100 xl:text-[16.5px]"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Right: CTA + Mobile Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-3" data-nav-item="">
            <Link
              href="/practice"
              className="btn-tactile inline-flex h-[38px] items-center justify-center gap-[7px] rounded-[11px] bg-white px-3.5 text-[12px] font-semibold leading-[1.45] text-[#423052] shadow-[0_2px_10px_rgba(0,0,0,0.12)] hover:bg-[#f4effa] sm:h-[42px] sm:min-w-[148px] sm:px-4 sm:text-[13px]"
            >
              <span className="whitespace-nowrap">Start practice</span>
              <ArrowRightStrokeIcon
                variant="hero"
                size={14}
                color="#423052"
                className="hover-arrow-shift size-[14px] shrink-0"
              />
            </Link>

            <button
              type="button"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="btn-tactile inline-flex size-[38px] cursor-pointer items-center justify-center rounded-[10px] border border-[#3a3b40] text-[#f5f4f8] lg:hidden"
            >
              <span className="sr-only">Menu</span>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                {mobileMenuOpen ? (
                  <path
                    d="M4.5 4.5L13.5 13.5M13.5 4.5L4.5 13.5"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d="M2.5 5H15.5M2.5 9H15.5M2.5 13H15.5"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="flex flex-col gap-1 border-t border-[#323338] pb-4 pt-3 lg:hidden">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                data-mobile-nav-link=""
                onClick={(e) => handleAnchorClick(e, item.href)}
                className="rounded-lg px-3 py-2 text-[15px] font-semibold text-[#f5f4f8] transition-colors duration-150 hover:bg-[#2b2c30] hover:text-[#cab4f0]"
              >
                {item.label}
              </a>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
