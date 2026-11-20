"use client";

import React, { useMemo, useState } from "react";
import type { InterviewSetupConfig } from "./practice-config";
import {
  INTERVIEW_GUIDES,
  type InterviewGuideItem,
  type TipCategory,
} from "./workspace-data";

interface TipsViewProps {
  mode: "library" | "detail" | "saved";
  activeGuideId: string;
  savedGuideIds: ReadonlySet<string>;
  onOpenGuide: (guideId: string) => void;
  onOpenLibrary: () => void;
  onOpenSaved: () => void;
  onToggleSaveGuide: (guideId: string) => void;
  onPracticeSkill: (config: InterviewSetupConfig) => void;
}

const CATEGORIES: ReadonlyArray<"All guides" | TipCategory> = [
  "All guides",
  "Answer structure",
  "Showing impact",
  "Confidence",
  "Asking questions",
];

const STAR_ITEMS: ReadonlyArray<{ letter: string; title: string; subtitle: string }> = [
  { letter: "S", title: "Situation", subtitle: "Set the scene in a sentence." },
  { letter: "T", title: "Task", subtitle: "Explain what you needed to do." },
  { letter: "A", title: "Action", subtitle: "Be specific about your contribution." },
  { letter: "R", title: "Result", subtitle: "Say what changed and how you know." },
];

function StarReferenceCard() {
  return (
    <div className="rounded-[16px] border border-[#e5dfec] bg-white p-6">
      <p className="text-[10px] font-semibold tracking-[0.04em] text-[#796985]">
        THE STAR METHOD
      </p>

      <ul className="mt-4 space-y-4">
        {STAR_ITEMS.map((item) => (
          <li key={item.letter} className="flex items-start gap-3.5">
            <span className="flex size-[32px] shrink-0 items-center justify-center rounded-[8px] bg-[#ece5f5] text-[13px] font-semibold text-[#73518f]">
              {item.letter}
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-[#30263c]">{item.title}</p>
              <p className="mt-0.5 text-[11px] leading-[1.45] text-[#796985]">
                {item.subtitle}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="my-5 h-px bg-[#efebf4]" />
      <p className="text-[11px] text-[#796985]">
        A guide for your thoughts, not a script.
      </p>
    </div>
  );
}

/**
 * Unified Tips experience implementing:
 * - Tips Library (Figma 26:422)
 * - Tips · Guide detail reader (Figma 242:8247)
 * - Tips · Saved guides (Figma 242:8357)
 */
export function TipsView({
  mode,
  activeGuideId,
  savedGuideIds,
  onOpenGuide,
  onOpenLibrary,
  onOpenSaved,
  onToggleSaveGuide,
  onPracticeSkill,
}: TipsViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<"All guides" | TipCategory>(
    "All guides"
  );

  const featuredGuide = INTERVIEW_GUIDES[0];
  const activeGuide: InterviewGuideItem =
    INTERVIEW_GUIDES.find((g) => g.id === activeGuideId) ?? featuredGuide;

  const toolkitGuides = useMemo(() => {
    const list = INTERVIEW_GUIDES.slice(1);
    if (selectedCategory === "All guides") return list;
    return INTERVIEW_GUIDES.filter((g) => g.category === selectedCategory);
  }, [selectedCategory]);

  const savedGuides = useMemo(
    () => INTERVIEW_GUIDES.filter((g) => savedGuideIds.has(g.id)),
    [savedGuideIds]
  );

  const relatedGuides = useMemo(
    () => INTERVIEW_GUIDES.filter((g) => g.id !== activeGuide.id).slice(0, 3),
    [activeGuide.id]
  );

  // =========================================================================
  // VIEW 1: TIPS — GUIDE DETAIL READER (Figma 242:8247)
  // =========================================================================
  if (mode === "detail") {
    const isSaved = savedGuideIds.has(activeGuide.id);
    return (
      <div className="min-h-0 flex-1 overflow-y-auto bg-white px-4 py-6 pb-24 sm:px-8 lg:px-[48px] lg:py-[32px] lg:pb-10">
        <div className="mx-auto max-w-[1104px]">
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,704fr)_minmax(0,368fr)]">
            {/* Editorial article column */}
            <article className="min-w-0 space-y-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.04em] text-[#73518f]">
                  {activeGuide.category} · {activeGuide.readTime.toUpperCase()} READ
                </p>
                <h1 className="mt-2 text-[26px] font-semibold leading-[1.2] tracking-[-0.02em] text-[#30263c] sm:text-[30px]">
                  {activeGuide.title}
                </h1>
                <p className="mt-3 text-[14px] leading-[1.6] text-[#796985]">
                  {activeGuide.lead}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => onToggleSaveGuide(activeGuide.id)}
                    className={`inline-flex h-[34px] cursor-pointer items-center gap-1.5 rounded-[10px] px-3.5 text-[12px] font-medium transition-colors ${
                      isSaved
                        ? "bg-[#edf3e9] text-[#5d7850] hover:bg-[#e1ecd9]"
                        : "border border-[#e5dfec] bg-white text-[#665570] hover:bg-[#faf8fd]"
                    }`}
                  >
                    <span>{isSaved ? "✓ Saved guide" : "Save guide"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={onOpenLibrary}
                    className="inline-flex h-[34px] cursor-pointer items-center rounded-[10px] px-2 text-[12px] font-medium text-[#796985] hover:text-[#30263c]"
                  >
                    ← All guides
                  </button>
                </div>
              </div>

              {/* Side-by-side Before/After Example */}
              <section className="rounded-[16px] border border-[#e5dfec] bg-[#faf8fd] p-5 sm:p-6">
                <p className="text-[10px] font-semibold tracking-[0.04em] text-[#73518f]">
                  SIDE-BY-SIDE EXAMPLE
                </p>

                <div className="mt-4 space-y-1">
                  <p className="text-[11px] font-medium text-[#796985]">Instead of</p>
                  <p className="text-[14px] leading-[1.55] text-[#665570]">
                    {activeGuide.beforeExample}
                  </p>
                </div>

                <div className="mt-4 rounded-[12px] bg-[#f3eef9] p-4">
                  <p className="text-[11px] font-semibold text-[#60427d]">Show the outcome</p>
                  <p className="mt-1 text-[14px] font-medium leading-[1.55] text-[#4d365f]">
                    {activeGuide.afterExample}
                  </p>
                </div>

                <p className="mt-3 text-[11px] text-[#796985]">{activeGuide.exampleCaption}</p>
              </section>

              {/* 3-Step Practical Framework */}
              <section className="rounded-[16px] border border-[#e5dfec] bg-white p-5 sm:p-6">
                <h2 className="text-[16px] font-semibold text-[#30263c]">
                  {activeGuide.frameworkTitle}
                </h2>
                <ol className="mt-4 space-y-4">
                  {activeGuide.steps.map((step) => (
                    <li key={step.code} className="flex items-start gap-3.5">
                      <span className="flex size-[26px] shrink-0 items-center justify-center rounded-[8px] bg-[#ece5f5] text-[11px] font-semibold text-[#73518f]">
                        {step.code}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-[#4d365f]">{step.heading}</p>
                        <p className="mt-0.5 text-[12px] leading-[1.55] text-[#796985]">
                          {step.detail}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            </article>

            {/* Right Rail */}
            <aside className="min-w-0 space-y-6">
              <div className="rounded-[16px] bg-[#f3eef9] p-6">
                <p className="text-[10px] font-semibold tracking-[0.04em] text-[#73518f]">
                  TRY IT WITH SIR BOT
                </p>
                <h2 className="mt-2 text-[18px] font-semibold leading-[1.3] text-[#4d365f]">
                  Put this into practice right now.
                </h2>
                <p className="mt-2 text-[12px] leading-[1.55] text-[#665570]">
                  Start a focused {activeGuide.drillConfig.questionRange} question round tailored to{" "}
                  {activeGuide.category.toLowerCase()} with live rubric scoring.
                </p>
                <button
                  type="button"
                  onClick={() => onPracticeSkill(activeGuide.drillConfig)}
                  className="btn-tactile mt-5 inline-flex h-[40px] w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] bg-[#c7b8fa] px-5 text-[13px] font-semibold text-[#292331] hover:bg-[#baa9f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7453a6]"
                >
                  <span>Start practice drill</span>
                  <span aria-hidden="true">→</span>
                </button>
              </div>

              <div className="rounded-[16px] border border-[#e5dfec] bg-white p-6">
                <p className="text-[10px] font-semibold tracking-[0.04em] text-[#796985]">
                  UP NEXT IN TOOLKIT
                </p>
                <div className="mt-4 divide-y divide-[#efebf4]">
                  {relatedGuides.map((guide) => (
                    <button
                      key={guide.id}
                      type="button"
                      onClick={() => onOpenGuide(guide.id)}
                      className="group block w-full cursor-pointer py-3 text-left first:pt-0 last:pb-0"
                    >
                      <p className="text-[13px] font-medium text-[#4d365f] group-hover:text-[#73518f]">
                        {guide.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#796985]">
                        {guide.category} · {guide.readTime} ↗
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: TIPS — SAVED GUIDES (Figma 242:8357)
  // =========================================================================
  if (mode === "saved") {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto bg-white px-4 py-6 pb-24 sm:px-8 lg:px-[48px] lg:py-[32px] lg:pb-10">
        <div className="mx-auto max-w-[1104px] space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-[26px] font-semibold leading-[1.25] tracking-[-0.02em] text-[#30263c] sm:text-[28px]">
                Saved guides
              </h1>
              <p className="mt-1 text-[13px] text-[#796985]">
                Quick-reference coaching notes you bookmarked for interview prep.
              </p>
            </div>
            <p className="text-[12px] font-medium text-[#796985]">
              {savedGuides.length} saved {savedGuides.length === 1 ? "guide" : "guides"}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,704fr)_minmax(0,368fr)]">
            <div className="min-w-0 space-y-4">
              {savedGuides.length === 0 ? (
                <div className="rounded-[16px] border border-[#e5dfec] bg-[#faf8fd] p-8 text-center">
                  <p className="text-[15px] font-semibold text-[#30263c]">No saved guides yet</p>
                  <p className="mt-1.5 text-[13px] text-[#796985]">
                    Bookmark any interview guide to keep its examples handy before a call.
                  </p>
                  <button
                    type="button"
                    onClick={onOpenLibrary}
                    className="btn-tactile mt-4 inline-flex h-[38px] cursor-pointer items-center rounded-[10px] bg-[#c7b8fa] px-5 text-[12px] font-semibold text-[#292331]"
                  >
                    Browse all guides →
                  </button>
                </div>
              ) : (
                savedGuides.map((guide) => (
                  <article
                    key={guide.id}
                    className="rounded-[16px] border border-[#e5dfec] bg-white p-5 transition-colors hover:border-[#d5c6ea] sm:p-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.04em] text-[#73518f]">
                        {guide.category} · {guide.readTime.toUpperCase()} READ
                      </span>
                      <span className="text-[11px] text-[#796985]">
                        {guide.savedDateLabel ?? "Saved recently"}
                      </span>
                    </div>

                    <h2 className="mt-2 text-[18px] font-semibold text-[#4d365f]">
                      {guide.title}
                    </h2>
                    <p className="mt-1.5 text-[13px] leading-[1.55] text-[#796985]">
                      {guide.summary}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="flex flex-wrap items-center gap-4">
                        <button
                          type="button"
                          onClick={() => onOpenGuide(guide.id)}
                          className="cursor-pointer text-[12px] font-semibold text-[#73518f] hover:underline"
                        >
                          Read guide ↗
                        </button>
                        <button
                          type="button"
                          onClick={() => onPracticeSkill(guide.drillConfig)}
                          className="cursor-pointer text-[12px] font-medium text-[#665570] hover:text-[#30263c]"
                        >
                          Practice this skill →
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onToggleSaveGuide(guide.id)}
                        className="cursor-pointer text-[12px] text-[#796985] hover:text-[#9e3a4a]"
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>

            <aside className="min-w-0">
              <StarReferenceCard />
            </aside>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: TIPS — MAIN LIBRARY (Figma 26:422 + Mobile 246:8008)
  // =========================================================================
  const isFeaturedSaved = savedGuideIds.has(featuredGuide.id);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-white px-4 py-6 pb-24 sm:px-8 lg:px-[48px] lg:py-[32px] lg:pb-10">
      <div className="mx-auto max-w-[1104px] space-y-6">
        {/* Heading + Topic Pills */}
        <div>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-[26px] font-semibold leading-[1.25] tracking-[-0.02em] text-[#30263c] sm:text-[30px]">
                Interview tips
              </h1>
              <p className="mt-1 text-[13px] leading-[1.5] text-[#796985]">
                Practical ways to turn your experience into a stronger answer.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenSaved}
              className="cursor-pointer rounded-[8px] px-2.5 py-1.5 text-[12px] font-medium text-[#73518f] hover:bg-[#f3eef9] lg:hidden"
            >
              Saved guides ({savedGuides.length})
            </button>
          </div>

          <div
            role="tablist"
            aria-label="Guide topics"
            className="mt-4 flex gap-2 overflow-x-auto pb-1"
          >
            {CATEGORIES.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedCategory(category)}
                  className={`shrink-0 cursor-pointer rounded-[9px] px-3.5 py-1.5 text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7453a6] ${
                    active
                      ? "bg-[#eee6f8] font-medium text-[#73518f]"
                      : "font-normal text-[#796985] hover:bg-[#faf8fd] hover:text-[#30263c]"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured Guide Card */}
        <section className="rounded-[16px] border border-[#e9e1f1] bg-[#faf8fd] p-5 sm:p-7">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_1px_minmax(0,1.05fr)] lg:items-center">
            <div className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.04em] text-[#7c6693]">
                {featuredGuide.category} · {featuredGuide.readTime.toUpperCase()} READ
              </p>
              <button
                type="button"
                onClick={() => onOpenGuide(featuredGuide.id)}
                className="cursor-pointer text-left text-[22px] font-semibold leading-[1.25] text-[#493256] transition-colors hover:text-[#73518f] sm:text-[26px]"
              >
                {featuredGuide.title}
              </button>
              <p className="text-[13px] leading-[1.55] text-[#796985]">{featuredGuide.summary}</p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => onPracticeSkill(featuredGuide.drillConfig)}
                  className="btn-tactile group inline-flex h-[38px] cursor-pointer items-center gap-3 rounded-[10px] bg-[#c7b8fa] px-4 text-[12px] font-semibold text-[#423052] hover:bg-[#baa9f7]"
                >
                  <span>Practice this skill</span>
                  <span aria-hidden="true" className="hover-arrow-shift">
                    →
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleSaveGuide(featuredGuide.id)}
                  className="cursor-pointer text-[12px] font-medium text-[#7b5b94] hover:underline"
                >
                  {isFeaturedSaved ? "✓ Saved guide" : "Save guide"}
                </button>
              </div>
            </div>

            <div aria-hidden="true" className="hidden h-full min-h-[180px] w-px bg-[#e7def0] lg:block" />

            <div className="space-y-3">
              <p className="text-[10px] font-semibold tracking-[0.04em] text-[#7c6693]">
                AN EXAMPLE
              </p>
              <div>
                <p className="text-[11px] font-medium text-[#796985]">Instead of</p>
                <p className="mt-1 text-[14px] text-[#73617f]">{featuredGuide.beforeExample}</p>
              </div>
              <div className="rounded-[12px] bg-[#eee6f8] p-4">
                <p className="text-[11px] font-semibold text-[#78558f]">Show the outcome</p>
                <p className="mt-1 text-[14px] font-medium leading-[1.5] text-[#5d456f]">
                  {featuredGuide.afterExample}
                </p>
              </div>
              <p className="text-[11px] text-[#796985]">{featuredGuide.exampleCaption}</p>
            </div>
          </div>
        </section>

        {/* Bottom 2-column split: Toolkit list (704) + Keep this handy STAR card (368) */}
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,704fr)_minmax(0,368fr)]">
          <section className="min-w-0">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-[18px] font-semibold text-[#30263c]">
                Build your interview toolkit
              </h2>
              <span className="text-[12px] text-[#796985]">
                {toolkitGuides.length} short {toolkitGuides.length === 1 ? "guide" : "guides"}
              </span>
            </div>

            <div className="mt-4 divide-y divide-[#efebf4] border-t border-[#efebf4]">
              {toolkitGuides.map((guide) => (
                <button
                  key={guide.id}
                  type="button"
                  onClick={() => onOpenGuide(guide.id)}
                  className="group flex w-full cursor-pointer items-start justify-between gap-4 py-4 text-left transition-colors hover:bg-[#fcfafe] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7453a6]"
                >
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium text-[#30263c] group-hover:text-[#73518f]">
                      {guide.title}
                    </p>
                    <p className="mt-1 text-[12px] leading-[1.5] text-[#796985]">
                      {guide.summary}
                    </p>
                    <p className="mt-1 text-[11px] text-[#9b8ba8]">{guide.category}</p>
                  </div>
                  <span className="shrink-0 text-[12px] font-medium text-[#73518f]">
                    {guide.readTime} ↗
                  </span>
                </button>
              ))}
            </div>
          </section>

          <aside className="min-w-0">
            <h2 className="text-[18px] font-semibold text-[#30263c]">Keep this handy</h2>
            <div className="mt-4">
              <StarReferenceCard />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
