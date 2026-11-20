"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { SirBotMark } from "@/components/landing/SirBotMark";
import type { WorkspaceView } from "./workspace-data";

interface PracticeSidebarProps {
  activeView: WorkspaceView;
  activeSessionId: string;
  softwareEngineerStatusLabel: string;
  softwareEngineerActive: boolean;
  sidebarWidth: number;
  desktopCollapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onStartNewInterview: () => void;
  onNavigateView: (view: "setup" | "sessions" | "tips" | "profile" | "help") => void;
  onSelectRecentSession: (sessionKey: "software-engineer" | "product-designer") => void;
}

export function PracticeSidebar({
  activeView,
  activeSessionId,
  softwareEngineerStatusLabel,
  softwareEngineerActive,
  sidebarWidth,
  desktopCollapsed,
  mobileOpen,
  onCloseMobile,
  onStartNewInterview,
  onNavigateView,
  onSelectRecentSession,
}: PracticeSidebarProps) {
  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseMobile();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, onCloseMobile]);

  const isPracticeActive = activeView === "setup" || activeView === "live";
  const isSessionsActive =
    activeView === "sessions" || activeView === "results" || activeView === "transcript";
  const isTipsActive =
    activeView === "tips" || activeView === "tips-detail" || activeView === "tips-saved";
  const isProfileActive =
    activeView === "profile" ||
    activeView === "profile-account" ||
    activeView === "profile-saved";
  const isHelpActive = activeView === "help";

  const isProductDesignerActive =
    activeSessionId === "session-product-designer" &&
    (activeView === "live" || activeView === "results" || activeView === "transcript");

  const renderSidebarContent = (isDrawer: boolean) => (
    <div className="flex h-full w-full flex-col bg-[#202124] px-[16px] pt-[18px] pb-[18px] text-[#f5f4f8]">
      {/* Brand header */}
      <div className="px-[4px]">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-[5px] rounded-[8px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7b8fa]"
            aria-label="Go to Interview ni Lods landing page"
          >
            <SirBotMark className="h-[41px] w-[37px] shrink-0" />
            <span className="truncate text-[15px] font-semibold leading-[1.45] text-[#f5f4f8]">
              Sir Bot
            </span>
          </Link>

          {isDrawer ? (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close navigation menu"
              className="inline-flex size-8 cursor-pointer items-center justify-center rounded-[8px] text-[#b3b2ba] hover:bg-[#2b2b30] hover:text-white"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M18 6 6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          ) : null}
        </div>
        <p className="mt-[12px] truncate text-[11px] leading-[1.45] text-[#b3b2ba]">
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
        <span className="truncate">New interview</span>
      </button>

      {/* Main Nav */}
      <nav aria-label="Workspace navigation" className="mt-[27px] space-y-[7px]">
        {(
          [
            {
              key: "setup",
              label: "Practice",
              icon: "/assets/practice/nav-practice.svg",
              active: isPracticeActive,
            },
            {
              key: "sessions",
              label: "Sessions",
              icon: "/assets/practice/nav-sessions.svg",
              active: isSessionsActive,
            },
            {
              key: "tips",
              label: "Tips",
              icon: "/assets/practice/nav-tips.svg",
              active: isTipsActive,
            },
            {
              key: "profile",
              label: "Profile",
              icon: "/assets/practice/nav-profile.svg",
              active: isProfileActive,
            },
          ] as const
        ).map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              onNavigateView(item.key);
              onCloseMobile();
            }}
            aria-current={item.active ? "page" : undefined}
            className={`flex h-[40px] w-full cursor-pointer items-center gap-[11px] rounded-[9px] px-[14px] text-left text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7b8fa] ${
              item.active
                ? "bg-[#343438] font-medium text-[#f2eefc]"
                : "font-normal text-[#c3c2ca] hover:bg-[#2b2b30] hover:text-[#f2eefc]"
            }`}
          >
            <img src={item.icon} alt="" width={19} height={19} className="shrink-0" />
            <span className="truncate">{item.label}</span>
          </button>
        ))}
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
              softwareEngineerActive ? "bg-[#2f2e35]" : "hover:bg-[#2b2b30]"
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

        <div className="mx-[4px] mt-[24px] h-px bg-[#3b3b41]" />

        <button
          type="button"
          onClick={() => {
            onNavigateView("help");
            onCloseMobile();
          }}
          aria-current={isHelpActive ? "page" : undefined}
          className={`mt-[14px] flex h-[38px] w-full cursor-pointer items-center gap-[13px] rounded-[9px] px-[10px] text-left text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7b8fa] ${
            isHelpActive
              ? "bg-[#343438] font-medium text-[#f2eefc]"
              : "text-[#c3c0cb] hover:bg-[#2b2b30] hover:text-white"
          }`}
        >
          <img src="/assets/practice/nav-help.svg" alt="" width={18} height={18} className="shrink-0" />
          <span className="truncate">Help &amp; support</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop rail (dynamically resizable width + collapsible) */}
      <aside
        aria-label="Practice sidebar"
        style={{ width: desktopCollapsed ? 0 : `${sidebarWidth}px` }}
        className="hidden shrink-0 overflow-hidden transition-[width] duration-150 ease-out motion-reduce:transition-none lg:block"
      >
        <div style={{ width: `${sidebarWidth}px` }} className="h-full">
          {renderSidebarContent(false)}
        </div>
      </aside>

      {/* Mobile slide-over drawer (Figma 245:8260) */}
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-50 flex lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Practice navigation menu"
        >
          <div
            className="fixed inset-0 bg-[#141118]/55 backdrop-blur-[2px]"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 h-full w-[min(296px,84vw)] shadow-2xl">
            {renderSidebarContent(true)}
          </div>
        </div>
      ) : null}
    </>
  );
}

/**
 * Compact dark bottom tab bar on mobile viewports (< lg), matching Figma mobile screens.
 */
export function MobileBottomNav({
  activeView,
  onNavigateView,
}: {
  activeView: WorkspaceView;
  onNavigateView: (view: "setup" | "sessions" | "tips" | "profile") => void;
}) {
  const isPractice = activeView === "setup" || activeView === "live";
  const isSessions =
    activeView === "sessions" || activeView === "results" || activeView === "transcript";
  const isTips =
    activeView === "tips" || activeView === "tips-detail" || activeView === "tips-saved";
  const isProfile =
    activeView === "profile" ||
    activeView === "profile-account" ||
    activeView === "profile-saved";

  const tabs = [
    {
      key: "setup" as const,
      label: "Practice",
      active: isPractice,
      icon: (
        <path
          d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ),
    },
    {
      key: "sessions" as const,
      label: "Sessions",
      active: isSessions,
      icon: (
        <>
          <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.7" />
          <path d="M8 2v4M16 2v4M3 10h18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </>
      ),
    },
    {
      key: "tips" as const,
      label: "Tips",
      active: isTips,
      icon: (
        <path
          d="M9 18h6m-5 3h4M12 2a7 7 0 0 0-4 12.7V16h8v-1.3A7 7 0 0 0 12 2Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ),
    },
    {
      key: "profile" as const,
      label: "Profile",
      active: isProfile,
      icon: (
        <>
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.7" />
          <path d="M5 20a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </>
      ),
    },
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-30 flex h-[66px] items-center justify-around border-t border-[#343438] bg-[#202124] px-3 pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onNavigateView(tab.key)}
          aria-current={tab.active ? "page" : undefined}
          className={`flex min-w-[68px] cursor-pointer flex-col items-center justify-center gap-1 rounded-[10px] px-3 py-1.5 transition-colors ${
            tab.active
              ? "bg-[#343438] text-[#c7b8fa]"
              : "text-[#b3b2ba] hover:text-[#f5f4f8]"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {tab.icon}
          </svg>
          <span
            className={`text-[10px] leading-none ${
              tab.active ? "font-semibold text-[#f5f4f8]" : "font-normal"
            }`}
          >
            {tab.label}
          </span>
        </button>
      ))}
    </nav>
  );
}
