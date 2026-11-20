"use client";

import React, { useMemo, useState } from "react";
import { ResizeHandle } from "@/components/ui/ResizeHandle";
import type {
  FinalResultsSummary,
  InterviewSetupConfig,
  QuestionResultItem,
} from "./practice-config";

interface SessionTranscriptViewProps {
  config: InterviewSetupConfig;
  results: FinalResultsSummary;
  initialFocusNumber?: string;
  savedQuestionNumbers: ReadonlySet<string>;
  onToggleSaveAnswer: (item: QuestionResultItem) => void;
  onPracticeSimilar: () => void;
}

const DEFAULT_RAIL_WIDTH = 320;
const MIN_RAIL_WIDTH = 250;
const MAX_RAIL_WIDTH = 420;

const SUGGESTED_UPGRADES: Record<string, string> = {
  "01": "“I’m a software engineer focused on reliable frontend architecture. Over the last 3 years I led checkout reliability work that cut p95 latency by 42% across 180K monthly users.”",
  "02": "“One day before launch I led bug triage, built rollback guardrails, and verified a 6-case QA suite so we shipped on schedule with 99.96% checkout success.”",
  "03": "“We validated a 6-case QA smoke suite in 90 minutes, cut checkout errors from 12% to 0.4%, and shipped on schedule with zero rollbacks.”",
  "04": "“Our QA lead uncovered an edge case in payment retries during the smoke suite, so I added an idempotency check while sharing 30-minute Slack updates with PMs.”",
  "05": "“Writing down verified facts, open unknowns, and our rollback trigger kept our 5-person launch crew calm and cut incident triage time in half.”",
};

/**
 * Screen 05 · Session transcript & answer review (Figma node 240:7964).
 * Flexible split view with drag-resizable question rail on desktop and horizontal pill selector on mobile.
 */
export function SessionTranscriptView({
  config,
  results,
  initialFocusNumber,
  savedQuestionNumbers,
  onToggleSaveAnswer,
  onPracticeSimilar,
}: SessionTranscriptViewProps) {
  const [selectedNumber, setSelectedNumber] = useState<string>(
    () => initialFocusNumber || results.questionResults[2]?.number || results.questionResults[0]?.number || "01"
  );
  const [railWidth, setRailWidth] = useState<number>(DEFAULT_RAIL_WIDTH);
  const [exportedFeedback, setExportedFeedback] = useState(false);

  const selectedIndex = useMemo(() => {
    const idx = results.questionResults.findIndex((q) => q.number === selectedNumber);
    return idx >= 0 ? idx : 0;
  }, [results.questionResults, selectedNumber]);

  const activeItem = results.questionResults[selectedIndex] ?? results.questionResults[0];

  const questionRubric = useMemo(() => {
    const delta = activeItem ? activeItem.score - results.finalScore : 0;
    const adjust = (base: number) =>
      Math.round(Math.min(9.8, Math.max(5.5, base + delta * 0.6)) * 10) / 10;
    return [
      { label: "Clarity", score: adjust(results.breakdown.clarity) },
      { label: "Structure", score: adjust(results.breakdown.structure) },
      { label: "Relevance", score: adjust(results.breakdown.relevance) },
      { label: "Impact", score: adjust(results.breakdown.impact) },
    ];
  }, [activeItem, results.breakdown, results.finalScore]);

  const wordCount = useMemo(() => {
    if (!activeItem) return 0;
    return activeItem.userAnswer.trim().split(/\s+/).filter(Boolean).length;
  }, [activeItem]);

  const spokenSeconds = Math.max(12, Math.round((wordCount / 2.2) * 1.4));
  const isSaved = activeItem ? savedQuestionNumbers.has(activeItem.number) : false;

  const handleDownloadSummary = () => {
    const lines = [
      `INTERVIEW NI LODS — SESSION TRANSCRIPT`,
      `Role: ${config.role} | Difficulty: ${config.difficulty} | Tone: ${config.tone}`,
      `Final Score: ${results.finalScore.toFixed(1)} / 10 (${results.ratingLabel})`,
      `------------------------------------------------------------`,
      ...results.questionResults.flatMap((q) => [
        `\nQuestion ${q.number}: ${q.title} (${q.score.toFixed(1)} / 10)`,
        `Prompt: ${q.prompt}`,
        `Your answer: ${q.userAnswer}`,
        `Coach note: ${q.coachFeedback}`,
      ]),
    ].join("\n");

    try {
      const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `interview-ni-lods-${config.role.toLowerCase().replace(/\s+/g, "-")}-transcript.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // Fallback gracefully if downloads are blocked
    }
    setExportedFeedback(true);
    window.setTimeout(() => setExportedFeedback(false), 2400);
  };

  if (!activeItem) return null;

  const suggestedClosing =
    SUGGESTED_UPGRADES[activeItem.number] ??
    "“Adding one concrete metric—time saved, error reduction, or users helped—anchors your contribution immediately.”";

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-white px-4 py-6 pb-24 sm:px-8 lg:px-[48px] lg:py-[32px] lg:pb-10">
      <div className="mx-auto max-w-[1160px] space-y-6">
        {/* Heading row */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[24px] font-semibold leading-[1.25] tracking-[-0.02em] text-[#30263c] sm:text-[28px]">
              Session transcript
            </h1>
            <p className="mt-1 text-[12px] leading-[1.5] text-[#796985]">
              {config.role}
              <span className="mx-2">/</span>
              {config.difficulty} difficulty
              <span className="mx-2">/</span>
              {config.tone}
              <span className="mx-2">·</span>
              Nov 13, 2026
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-2 rounded-[12px] bg-[#f3eef9] px-4 py-2">
              <span className="text-[11px] font-medium text-[#796985]">Final score</span>
              <span className="text-[16px] font-semibold tabular-nums text-[#60427d]">
                {results.finalScore.toFixed(1)}
              </span>
              <span className="text-[12px] font-medium text-[#796985]">/ 10</span>
            </div>

            <button
              type="button"
              onClick={() => onToggleSaveAnswer(activeItem)}
              className={`btn-tactile inline-flex h-[36px] cursor-pointer items-center gap-1.5 rounded-[10px] px-3.5 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7453a6] ${
                isSaved
                  ? "bg-[#edf3e9] text-[#5d7850] hover:bg-[#e3eedc]"
                  : "border border-[#e5dfec] bg-white text-[#665570] hover:bg-[#faf8fd]"
              }`}
            >
              <span>{isSaved ? "✓ Answer saved" : "Save answer"}</span>
            </button>

            <button
              type="button"
              onClick={onPracticeSimilar}
              className="btn-tactile inline-flex h-[36px] cursor-pointer items-center gap-1.5 rounded-[10px] bg-[#c7b8fa] px-4 text-[12px] font-semibold text-[#292331] hover:bg-[#baa9f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7453a6]"
            >
              <span>Practice similar</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        {/* Mobile/tablet horizontal question pill switcher (< lg) */}
        <div
          role="tablist"
          aria-label="Session questions"
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:hidden"
        >
          {results.questionResults.map((q) => {
            const active = q.number === activeItem.number;
            return (
              <button
                key={q.number}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedNumber(q.number)}
                className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-[10px] border px-3 py-2 text-left transition-colors ${
                  active
                    ? "border-[#e3daf1] bg-[#f3eef9] text-[#30263c]"
                    : "border-[#e5dfec] bg-white text-[#665570]"
                }`}
              >
                <span
                  className={`inline-flex size-[22px] items-center justify-center rounded-[6px] text-[10px] font-semibold ${
                    active ? "bg-[#c7b8fa] text-[#292331]" : "bg-[#ece5f5] text-[#73518f]"
                  }`}
                >
                  {q.number}
                </span>
                <span className="max-w-[140px] truncate text-[12px] font-medium">{q.title}</span>
                <span className="text-[11px] font-semibold tabular-nums text-[#60427d]">
                  {q.score.toFixed(1)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Flexible split layout: drag-resizable question rail on desktop + fluid detail column */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-0">
          {/* Desktop Question Rail */}
          <aside
            aria-label="Questions list"
            style={{ width: `${railWidth}px` }}
            className="hidden shrink-0 flex-col gap-2 rounded-[16px] border border-[#e5dfec] bg-white p-4 lg:flex"
          >
            <div className="flex items-center justify-between px-2 py-1 text-[10px] font-semibold tracking-[0.03em] text-[#796985]">
              <span>QUESTIONS ({results.questionResults.length})</span>
              <span>SCORE</span>
            </div>

            <div className="space-y-1.5" role="tablist" aria-orientation="vertical">
              {results.questionResults.map((q) => {
                const active = q.number === activeItem.number;
                return (
                  <button
                    key={q.number}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSelectedNumber(q.number)}
                    className={`flex w-full cursor-pointer items-start justify-between gap-3 rounded-[12px] border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7453a6] ${
                      active
                        ? "border-[#e3daf1] bg-[#f3eef9]"
                        : "border-transparent bg-white hover:bg-[#faf8fd]"
                    }`}
                  >
                    <div className="flex min-w-0 items-start gap-2.5">
                      <span
                        className={`mt-0.5 flex size-[24px] shrink-0 items-center justify-center rounded-[8px] text-[10px] font-semibold ${
                          active
                            ? "bg-[#c7b8fa] text-[#292331]"
                            : "bg-[#ece5f5] text-[#73518f]"
                        }`}
                      >
                        {q.number}
                      </span>
                      <div className="min-w-0">
                        <p
                          className={`text-[13px] leading-[1.35] ${
                            active
                              ? "font-semibold text-[#30263c]"
                              : "font-medium text-[#4d365f]"
                          }`}
                        >
                          {q.title}
                        </p>
                        <p className="mt-0.5 text-[11px] leading-[1.4] text-[#796985]">
                          {q.takeaway}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 text-[13px] font-semibold tabular-nums ${
                        active ? "text-[#60427d]" : "text-[#73518f]"
                      }`}
                    >
                      {q.score.toFixed(1)}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-2 rounded-[12px] border border-[#efebf4] bg-[#faf8fd] p-4">
              <p className="text-[10px] font-semibold tracking-[0.03em] text-[#73518f]">
                EXPORT TRANSCRIPT
              </p>
              <p className="mt-1.5 text-[11px] leading-[1.45] text-[#796985]">
                Save all {results.questionResults.length} answers and Sir Bot coaching notes as a
                clean study sheet.
              </p>
              <button
                type="button"
                onClick={handleDownloadSummary}
                className="mt-3 inline-flex h-[34px] w-full cursor-pointer items-center justify-center rounded-[10px] border border-[#e5dfec] bg-white px-3 text-[12px] font-medium text-[#665570] transition-colors hover:bg-[#f3eef9] hover:text-[#30263c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7453a6]"
              >
                {exportedFeedback ? "✓ Downloaded summary" : "Download study summary"}
              </button>
            </div>
          </aside>

          {/* Drag-resizable divider between Question Rail and Detail Pane */}
          <ResizeHandle
            ariaLabel="Resize question rail"
            value={railWidth}
            min={MIN_RAIL_WIDTH}
            max={MAX_RAIL_WIDTH}
            defaultValue={DEFAULT_RAIL_WIDTH}
            growDirection="right"
            onChange={setRailWidth}
            className="mx-3 self-stretch"
          />

          {/* Right Answer Deep-Dive Column */}
          <div className="min-w-0 flex-1 space-y-5">
            {/* QA Exchange Card */}
            <section className="rounded-[16px] border border-[#e5dfec] bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[10px] font-semibold tracking-[0.04em] text-[#73518f]">
                  QUESTION {activeItem.number} · {activeItem.title.toUpperCase()}
                </p>
                <span className="inline-flex items-center rounded-full bg-[#eee6f8] px-3 py-1 text-[11px] font-medium text-[#60427d] tabular-nums">
                  {activeItem.score.toFixed(1)} / 10 ·{" "}
                  {activeItem.score >= 8.2 ? "Strong answer" : "Solid answer"}
                </span>
              </div>

              <div className="mt-4 space-y-1.5">
                <p className="text-[11px] font-medium text-[#796985]">Sir Bot asked</p>
                <h2 className="text-[15px] font-semibold leading-[1.45] text-[#30263c] sm:text-[16px]">
                  “{activeItem.prompt}”
                </h2>
              </div>

              <div className="mt-4 rounded-[12px] border border-[#efebf4] bg-[#faf8fd] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-[#60427d]">Your answer</span>
                  <span className="text-[11px] text-[#796985]">
                    {wordCount} words · ~{spokenSeconds}s spoken equiv.
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-[13px] leading-[1.6] text-[#665570]">
                  {activeItem.userAnswer}
                </p>
              </div>
            </section>

            {/* Per-Question Rubric & Coaching Upgrade */}
            <section className="space-y-4 rounded-[16px] bg-[#f2ecfb] p-5 sm:p-6">
              <p className="text-[10px] font-semibold tracking-[0.04em] text-[#73518f]">
                SIR BOT ANSWER BREAKDOWN
              </p>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {questionRubric.map((metric) => {
                  const pct = Math.min(100, Math.max(0, (metric.score / 10) * 100));
                  return (
                    <div
                      key={metric.label}
                      className="rounded-[12px] bg-white px-3.5 py-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[12px] text-[#796985]">{metric.label}</span>
                        <span className="text-[13px] font-semibold tabular-nums text-[#60427d]">
                          {metric.score.toFixed(1)}
                        </span>
                      </div>
                      <div className="mt-2 h-[5px] w-full overflow-hidden rounded-full bg-[#e2d7ee]">
                        <div
                          className="h-full rounded-full bg-[#a782c9] transition-[width] duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-[12px] border border-[#e3daf1] bg-white p-4 sm:p-5">
                <p className="text-[10px] font-semibold tracking-[0.04em] text-[#73518f]">
                  MAKE THE RESULT MEASURABLE · COACHING NOTE
                </p>
                <p className="mt-1.5 text-[12px] leading-[1.55] text-[#796985]">
                  {activeItem.coachFeedback}
                </p>

                <div className="mt-3.5 rounded-[10px] bg-[#f3eef9] px-4 py-3">
                  <p className="text-[11px] font-semibold text-[#60427d]">Try closing with:</p>
                  <p className="mt-1 text-[13px] font-medium leading-[1.55] text-[#4d365f]">
                    {suggestedClosing}
                  </p>
                </div>
              </div>
            </section>

            {/* Footer Prev / Next + Mobile Export */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                type="button"
                disabled={selectedIndex <= 0}
                onClick={() => {
                  const prev = results.questionResults[selectedIndex - 1];
                  if (prev) setSelectedNumber(prev.number);
                }}
                className="inline-flex h-[38px] cursor-pointer items-center rounded-[10px] border border-[#e5dfec] bg-white px-4 text-[12px] font-medium text-[#665570] transition-colors hover:bg-[#faf8fd] hover:text-[#30263c] disabled:cursor-not-allowed disabled:opacity-45"
              >
                ← Previous question
              </button>

              <button
                type="button"
                onClick={handleDownloadSummary}
                className="inline-flex h-[38px] cursor-pointer items-center rounded-[10px] border border-[#e5dfec] bg-white px-3.5 text-[12px] font-medium text-[#665570] hover:bg-[#faf8fd] lg:hidden"
              >
                {exportedFeedback ? "✓ Downloaded" : "Download summary"}
              </button>

              <button
                type="button"
                disabled={selectedIndex >= results.questionResults.length - 1}
                onClick={() => {
                  const next = results.questionResults[selectedIndex + 1];
                  if (next) setSelectedNumber(next.number);
                }}
                className="inline-flex h-[38px] cursor-pointer items-center rounded-[10px] border border-[#e5dfec] bg-white px-4 text-[12px] font-medium text-[#665570] transition-colors hover:bg-[#faf8fd] hover:text-[#30263c] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Next question →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
