"use client";

import React from "react";
import type { InterviewSetupConfig, FinalResultsSummary, QuestionResultItem } from "./practice-config";
import { ScoreBreakdownBars } from "./ScoreBreakdownBars";

interface InterviewResultsViewProps {
  config: InterviewSetupConfig;
  results: FinalResultsSummary;
  onViewTranscript: (focusQuestionNumber?: string) => void;
  onBackToSessions: () => void;
  onPracticeAgain: () => void;
}

/**
 * Screen 04 · Final interview results (Figma node 15:2).
 * Presents overall performance rubric, question-by-question breakdown, coaching notes, and next actions.
 */
export function InterviewResultsView({
  config,
  results,
  onViewTranscript,
  onBackToSessions,
  onPracticeAgain,
}: InterviewResultsViewProps) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-white px-5 py-6 pb-24 sm:px-10 lg:px-[48px] lg:py-[32px] lg:pb-10">
      <div className="mx-auto max-w-[1104px] space-y-[24px]">
        {/* Header block */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-semibold leading-[1.35] text-[#30263c] sm:text-[28px]">
              Your interview results
            </h1>
            <p className="mt-[4px] text-[12px] leading-[1.5] text-[#796985]">
              {config.role}
              <span className="mx-2">/</span>
              {config.difficulty} difficulty
              <span className="mx-2">/</span>
              {config.tone}
            </p>
          </div>
          <p className="text-[12px] font-medium leading-[1.5] text-[#796985]">
            {results.completedQuestions} of {results.totalQuestions} questions completed
          </p>
        </div>

        {/* Overall performance purple banner card */}
        <section
          aria-label="Overall performance summary"
          className="rounded-[18px] bg-[#f2ecfb] p-6 sm:px-[28px] sm:py-[24px]"
        >
          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[192px_1px_1fr_1px_314px]">
            {/* Score block */}
            <div>
              <p className="text-[10px] font-semibold tracking-[0.02em] text-[#7c6693]">
                FINAL SESSION SCORE
              </p>
              <div className="mt-[6px] flex items-baseline gap-[8px]">
                <span className="text-[54px] font-semibold leading-[1.1] tracking-[-0.02em] text-[#60427d] tabular-nums sm:text-[60px]">
                  {results.finalScore.toFixed(1)}
                </span>
                <span className="text-[20px] font-medium leading-[1.5] text-[#79628c]">
                  / 10
                </span>
              </div>
              <span className="mt-[14px] inline-flex h-[27px] items-center rounded-[14px] bg-[#e5dbf3] px-[13px] text-[11px] font-medium text-[#684983]">
                {results.ratingLabel}
              </span>
            </div>

            <div aria-hidden="true" className="hidden h-[140px] w-px bg-[#e0d4ef] lg:block" />

            {/* Narrative block */}
            <div>
              <h2 className="text-[20px] font-semibold leading-[1.45] text-[#4d365f] sm:text-[22px]">
                {results.headline}
              </h2>
              <p className="mt-[8px] max-w-[450px] text-[13px] leading-[1.5] text-[#796289]">
                {results.summaryLines[0]}
                <br className="hidden sm:inline" /> {results.summaryLines[1]}
              </p>
              <p className="mt-[16px] text-[12px] font-medium leading-[1.5] text-[#6d4c86]">
                {results.nextFocusLine}
              </p>
            </div>

            <div aria-hidden="true" className="hidden h-[140px] w-px bg-[#e0d4ef] lg:block" />

            {/* 4-bar rubric summary */}
            <div>
              <ScoreBreakdownBars
                breakdown={results.breakdown}
                trackColorClass="bg-[#e2d7ee]"
                fillColorClass="bg-[#a782c9]"
                impactFillColorClass="bg-[#b89bcd]"
                labelColorClass="text-[#796289]"
                valueColorClass="text-[#614278]"
                rowSpacingClass="space-y-[10px]"
              />
            </div>
          </div>
        </section>

        {/* Question by question & From Sir Bot two-column grid */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,704fr)_minmax(0,376fr)]">
          {/* Question by question */}
          <section aria-label="Question by question breakdown" className="min-w-0">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-[18px] font-semibold leading-[1.5] text-[#3f324c]">
                Question by question
              </h2>
              <button
                type="button"
                onClick={() => onViewTranscript()}
                className="cursor-pointer rounded-[6px] px-1.5 py-1 text-[11px] font-medium leading-[1.5] text-[#7e5d9c] transition-colors hover:bg-[#f6f1fc] hover:text-[#5d3f7f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7453a6]"
              >
                View transcript ↗
              </button>
            </div>

            <div className="mt-[17px] overflow-hidden rounded-[14px] border border-[#e9e2f0] bg-white">
              <div className="flex items-center justify-between bg-[#fbf9fd] px-[19px] py-[13px] text-[10px] font-medium leading-[1.5] text-[#796985]">
                <span>QUESTION</span>
                <span className="pr-8">SCORE / 10</span>
              </div>

              <div className="divide-y divide-[#efebf4]">
                {results.questionResults.map((row: QuestionResultItem) => (
                  <button
                    key={row.number}
                    type="button"
                    onClick={() => onViewTranscript(row.number)}
                    className="group flex w-full cursor-pointer items-center justify-between gap-4 px-[19px] py-[11px] text-left transition-colors hover:bg-[#fcfafe] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#7453a6]"
                  >
                    <div className="flex min-w-0 items-center gap-[18px]">
                      <span className="w-[20px] shrink-0 text-[11px] font-medium text-[#8b739d]">
                        {row.number}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium leading-[1.5] text-[#584367]">
                          {row.title}
                        </p>
                        <p className="truncate text-[11px] leading-[1.5] text-[#796985]">
                          {row.takeaway}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-[28px]">
                      <span className="text-[14px] font-semibold leading-[1.5] text-[#79569a] tabular-nums">
                        {row.score.toFixed(1)}
                      </span>
                      <span
                        aria-hidden="true"
                        className="hover-arrow-shift text-[14px] text-[#8b739d]"
                      >
                        →
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* From Sir Bot */}
          <section aria-label="Coaching takeaways from Sir Bot" className="min-w-0">
            <h2 className="text-[18px] font-semibold leading-[1.5] text-[#3f324c]">
              From Sir Bot
            </h2>

            <div className="mt-[17px] rounded-[14px] border border-[#e9e2f0] bg-[#fbf9fd] p-[21px]">
              <p className="text-[10px] font-semibold leading-[1.5] text-[#796985]">
                KEEP DOING THIS
              </p>

              <ul className="mt-[12px] space-y-[8px]">
                {results.keepDoingThis.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-[11px] text-[12px] leading-[1.5] text-[#6a5878]"
                  >
                    <span aria-hidden="true" className="text-[13px] font-semibold text-[#667f58]">
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="my-[20px] h-px bg-[#e7dfef]" />

              <p className="text-[10px] font-semibold leading-[1.5] text-[#796985]">
                FOCUS ON NEXT
              </p>

              <ul className="mt-[16px] space-y-[18px]">
                {results.focusOnNext.map((item) => (
                  <li key={item.code} className="flex items-start gap-[12px]">
                    <span className="flex size-[25px] shrink-0 items-center justify-center rounded-[8px] bg-[#ece5f5] text-[10px] font-medium text-[#7d5c96]">
                      {item.code}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12px] font-medium leading-[1.5] text-[#624674]">
                        {item.title}
                      </p>
                      <p className="mt-[2px] text-[11px] leading-[1.5] text-[#796985]">
                        {item.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        {/* Bottom CTA strip */}
        <section
          aria-label="Next practice actions"
          className="flex flex-col items-start justify-between gap-4 rounded-[16px] bg-[#faf8fd] px-6 py-[24px] sm:flex-row sm:items-center"
        >
          <div>
            <h2 className="text-[18px] font-semibold leading-[1.5] text-[#4d365f]">
              Turn feedback into your next win.
            </h2>
            <p className="mt-[2px] text-[12px] leading-[1.5] text-[#796985]">
              Try another session with measurable outcomes in mind.
            </p>
          </div>

          <div className="flex w-full flex-wrap items-center gap-[16px] sm:w-auto">
            <button
              type="button"
              onClick={onBackToSessions}
              className="btn-tactile flex h-[40px] flex-1 cursor-pointer items-center justify-center rounded-[10px] border border-[#e3d9ed] bg-white px-[19px] text-[12px] font-medium text-[#796985] hover:bg-[#f6f1fc] hover:text-[#4d365f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7453a6] sm:w-[154px] sm:flex-none"
            >
              Back to sessions
            </button>

            <button
              type="button"
              onClick={onPracticeAgain}
              className="btn-tactile group flex h-[40px] flex-1 cursor-pointer items-center justify-between gap-4 rounded-[10px] bg-[#c7b6f0] px-[24px] text-[13px] font-semibold text-[#423052] hover:bg-[#bba7ec] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7453a6] sm:w-[186px] sm:flex-none"
            >
              <span>Practice again</span>
              <span aria-hidden="true" className="hover-arrow-shift text-[16px] font-normal">
                →
              </span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
