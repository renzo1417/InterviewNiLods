"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { SirBotMark } from "@/components/landing/SirBotMark";
import type { PracticeView } from "./practice-config";

export type SidebarUtilityModal = "tips" | "profile" | "help" | null;

interface PracticeSidebarProps {
  activeView: PracticeView;
  activeSessionId: string;
  softwareEngineerStatusLabel: string;
  softwareEngineerActive: boolean;
  desktopCollapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onStartNewInterview: () => void;
  onOpenSessions: () => void;
  onSelectRecentSession: (sessionKey: "software-engineer" | "product-designer") => void;
  onOpenUtilityModal: (modal: Exclude<SidebarUtilityModal, null>) => void;
}

export function PracticeSidebar({
  activeView,
  activeSessionId,
  softwareEngineerStatusLabel,
  softwareEngineerActive,
  desktopCollapsed,
  mobileOpen,
  onCloseMobile,
  onStartNewInterview,
  onOpenSessions,
  onSelectRecentSession,
  onOpenUtilityModal,
}: PracticeSidebarProps) {
  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseMobile();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, onCloseMobile]);

  const isPracticeHighlighted = activeView === "setup" || activeView === "live";
  const isSessionsHighlighted = activeView === "results";
  const isProductDesignerActive = activeSessionId === "session-product-designer" && activeView !== "setup";

  const sidebarContent = (
    <div className="flex h-full w-[240px] flex-col bg-[#202124] px-[16px] pt-[18px] pb-[18px] text-[#f5f4f8]">
      {/* Brand header */}
      <div className="px-[4px]">
        <Link
          href="/"
          className="inline-flex items-center gap-[5px] rounded-[8px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7b8fa]"
          aria-label="Go to Interview ni Lods landing page"
        >
          <SirBotMark className="h-[41px] w-[37px] shrink-0" />
          <span className="text-[15px] font-semibold leading-[1.45] text-[#f5f4f8]">
            Sir Bot
          </span>
        </Link>
        <p className="mt-[12px] text-[11px] leading-[1.45] text-[#b3b2ba]">
          Practice now, panic less later.
        </p>
      </div>

      {/* Primary CTA: New interview */}
      <button
        type="button"
        onClick={() => {
          onStartNewInterview();
          onCloseMobile();
        }}
        className="btn-tactile mt-[24px] flex h-[44px] w-full cursor-pointer items-center gap-[11px] rounded-[10px] bg-[#c7b8fa] px-[14px] text-left text-[13px] font-semibold text-[#292331] hover:bg-[#d3c7fc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <img src="/assets/practice/nav-new.svg" alt="" width={18} height={18} className="shrink-0" />
        <span>New interview</span>
      </button>

      {/* Main Nav */}
      <nav aria-label="Workspace navigation" className="mt-[27px] space-y-[7px]">
        <button
          type="button"
          onClick={() => {
            onStartNewInterview();
            onCloseMobile();
          }}
          aria-current={isPracticeHighlighted ? "page" : undefined}
          className={`flex h-[40px] w-full cursor-pointer items-center gap-[11px] rounded-[9px] px-[14px] text-left text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7b8fa] ${
            isPracticeHighlighted
              ? "bg-[#343438] font-medium text-[#f2eefc]"
              : "font-normal text-[#c3c2ca] hover:bg-[#2b2b30] hover:text-[#f2eefc]"
          }`}
        >
          <img
            src="/assets/practice/nav-practice.svg"
            alt=""
            width={19}
            height={19}
            className="shrink-0"
          />
          <span>Practice</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onOpenSessions();
            onCloseMobile();
          }}
          aria-current={isSessionsHighlighted ? "page" : undefined}
          className={`flex h-[40px] w-full cursor-pointer items-center gap-[11px] rounded-[9px] px-[14px] text-left text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7b8fa] ${
            isSessionsHighlighted
              ? "bg-[#343438] font-medium text-[#f2eefc]"
              : "font-normal text-[#c3c2ca] hover:bg-[#2b2b30] hover:text-[#f2eefc]"
          }`}
        >
          <img
            src="/assets/practice/nav-sessions.svg"
            alt=""
            width={19}
            height={19}
            className="shrink-0"
          />
          <span>Sessions</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onOpenUtilityModal("tips");
            onCloseMobile();
          }}
          className="flex h-[40px] w-full cursor-pointer items-center gap-[11px] rounded-[9px] px-[14px] text-left text-[13px] font-normal text-[#c3c2ca] transition-colors hover:bg-[#2b2b30] hover:text-[#f2eefc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7b8fa]"
        >
          <img src="/assets/practice/nav-tips.svg" alt="" width={19} height={19} className="shrink-0" />
          <span>Tips</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onOpenUtilityModal("profile");
            onCloseMobile();
          }}
          className="flex h-[40px] w-full cursor-pointer items-center gap-[11px] rounded-[9px] px-[14px] text-left text-[13px] font-normal text-[#c3c2ca] transition-colors hover:bg-[#2b2b30] hover:text-[#f2eefc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7b8fa]"
        >
          <img
            src="/assets/practice/nav-profile.svg"
            alt=""
            width={19}
            height={19}
            className="shrink-0"
          />
          <span>Profile</span>
        </button>
      </nav>

      {/* Divider */}
      <div className="mx-[4px] mt-[27px] h-px bg-[#3b3b41]" />

      {/* Recent sessions */}
      <div className="mt-[28px] min-h-0 flex-1 overflow-y-auto">
        <p className="px-[8px] text-[10px] font-medium tracking-[0.02em] text-[#a0a0ac]">
          RECENT SESSIONS
        </p>

        <div className="mt-[15px] space-y-[10px]">
          <button
            type="button"
            onClick={() => {
              onSelectRecentSession("software-engineer");
              onCloseMobile();
            }}
            className={`relative flex h-[60px] w-full cursor-pointer items-start gap-[11px] rounded-[10px] px-[12px] pt-[10px] text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7b8fa] ${
              softwareEngineerActive
                ? "bg-[#2f2e35]"
                : "hover:bg-[#2b2b30]"
            }`}
          >
            <img
              src={
                softwareEngineerActive
                  ? "/assets/practice/nav-session-active.svg"
                  : "/assets/practice/nav-session-item.svg"
              }
              alt=""
              width={17}
              height={17}
              className="mt-[4px] shrink-0"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] font-medium leading-[1.45] text-[#d3d2da]">
                Software Engineer
              </span>
              <span
                className={`block truncate text-[10px] leading-[1.45] ${
                  softwareEngineerActive ? "text-[#c3b2f4]" : "text-[#9d9ca7]"
                }`}
              >
                {softwareEngineerStatusLabel}
              </span>
            </span>
            {softwareEngineerActive ? (
              <span
                aria-hidden="true"
                className="mt-[7px] size-[5px] shrink-0 rounded-[3px] bg-[#c7b8fa]"
              />
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectRecentSession("product-designer");
              onCloseMobile();
            }}
            className={`relative flex h-[60px] w-full cursor-pointer items-start gap-[11px] rounded-[10px] px-[12px] pt-[10px] text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7b8fa] ${
              isProductDesignerActive ? "bg-[#2f2e35]" : "hover:bg-[#2b2b30]"
            }`}
          >
            <img
              src={
                isProductDesignerActive
                  ? "/assets/practice/nav-session-active.svg"
                  : "/assets/practice/nav-session-item.svg"
              }
              alt=""
              width={17}
              height={17}
              className="mt-[4px] shrink-0"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] font-medium leading-[1.45] text-[#d3d2da]">
                Product Designer
              </span>
              <span
                className={`block truncate text-[10px] leading-[1.45] ${
                  isProductDesignerActive ? "text-[#c3b2f4]" : "text-[#9d9ca7]"
                }`}
              >
                Portfolio walkthrough
              </span>
            </span>
            {isProductDesignerActive ? (
              <span
                aria-hidden="true"
                className="mt-[7px] size-[5px] shrink-0 rounded-[3px] bg-[#c7b8fa]"
              />
            ) : null}
          </button>
        </div>
      </div>

      {/* Bottom encouragement card & help */}
      <div className="mt-4 shrink-0">
        <div className="rounded-[12px] bg-[#2b2b30] px-[16px] py-[16px]">
          <img
            src="/assets/practice/nav-sparkle.svg"
            alt=""
            width={19}
            height={19}
            className="shrink-0"
          />
          <p className="mt-[12px] text-[12px] font-medium leading-[1.45] text-[#e4e1ec]">
            Progress, not perfection.
          </p>
          <p className="mt-[5px] text-[11px] leading-[1.45] text-[#aba8b7]">
            One answer at a time.
          </p>
        </div>

        <div className="mx-[4px] mt-[26px] h-px bg-[#3b3b41]" />

        <button
          type="button"
          onClick={() => {
            onOpenUtilityModal("help");
            onCloseMobile();
          }}
          className="mt-[16px] flex h-[34px] w-full cursor-pointer items-center gap-[13px] rounded-[8px] px-[7px] text-left text-[12px] text-[#c3c0cb] transition-colors hover:bg-[#2b2b30] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7b8fa]"
        >
          <img src="/assets/practice/nav-help.svg" alt="" width={18} height={18} className="shrink-0" />
          <span>Help &amp; support</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop rail */}
      <aside
        aria-label="Practice sidebar"
        className={`hidden shrink-0 overflow-hidden transition-[width] duration-250 ease-out motion-reduce:transition-none lg:block ${
          desktopCollapsed ? "w-0" : "w-[240px]"
        }`}
      >
        <div className="h-full w-[240px]">{sidebarContent}</div>
      </aside>

      {/* Mobile slide-over drawer */}
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-50 flex lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Practice navigation menu"
        >
          <div
            className="fixed inset-0 bg-[#141118]/50 backdrop-blur-[2px]"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 h-full shadow-2xl">{sidebarContent}</div>
        </div>
      ) : null}
    </>
  );
}
