"use client";

import React, { useMemo, useState } from "react";
import {
  JOB_ROLE_OPTIONS,
  type InterviewSetupConfig,
  type JobRole,
} from "./practice-config";
import type { SessionHistoryRecord } from "./workspace-data";

export type SessionsUiStatus = "ready" | "empty" | "loading" | "error";

interface SessionsViewProps {
  records: ReadonlyArray<SessionHistoryRecord>;
  uiStatus: SessionsUiStatus;
  onChangeUiStatus: (status: SessionsUiStatus) => void;
  onResumeInProgress: (record: SessionHistoryRecord) => void;
  onViewResults: (record: SessionHistoryRecord) => void;
  onStartPreset: (config: InterviewSetupConfig) => void;
  onStartNewInterview: () => void;
}

type HistoryTab = "completed" | "in_progress" | "all";
type SortField = "date" | "score";

const PAGE_SIZE = 6;

const STARTER_PRESETS: ReadonlyArray<{
  role: JobRole;
  meta: string;
  config: InterviewSetupConfig;
}> = [
  {
    role: "Software Engineer",
    meta: "Behavioral · 3–5 questions · Friendly",
    config: { role: "Software Engineer", difficulty: "Easy", questionRange: "3-5", tone: "Friendly" },
  },
  {
    role: "Product Designer",
    meta: "Portfolio walkthrough · 5 questions · Witty",
    config: { role: "Product Designer", difficulty: "Normal", questionRange: "5-8", tone: "Witty" },
  },
  {
    role: "Frontend Developer",
    meta: "UI engineering · 5 questions · Direct",
    config: { role: "Frontend Developer", difficulty: "Normal", questionRange: "5-8", tone: "Direct" },
  },
];

/**
 * Sessions screen (Figma 32:749) plus Empty (240:8134), Loading (240:8216), and Error (240:8380) states.
 * Responsive table on md+ and stacked cards on mobile.
 */
export function SessionsView({
  records,
  uiStatus,
  onChangeUiStatus,
  onResumeInProgress,
  onViewResults,
  onStartPreset,
  onStartNewInterview,
}: SessionsViewProps) {
  const [activeTab, setActiveTab] = useState<HistoryTab>("completed");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<JobRole | "all">("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDesc, setSortDesc] = useState(true);
  const [page, setPage] = useState(1);

  const availableRoles = useMemo(
    () => Array.from(new Set([...JOB_ROLE_OPTIONS, ...records.map((r) => r.role)])),
    [records]
  );

  const completedRecords = useMemo(
    () => records.filter((r) => r.status === "completed"),
    [records]
  );
  const inProgressRecords = useMemo(
    () => records.filter((r) => r.status === "in_progress"),
    [records]
  );
  const latestInProgress = inProgressRecords[0] ?? null;

  const effectiveStatus: SessionsUiStatus =
    uiStatus === "loading" || uiStatus === "error"
      ? uiStatus
      : uiStatus === "empty" || records.length === 0
        ? "empty"
        : "ready";

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const base =
      activeTab === "completed"
        ? completedRecords
        : activeTab === "in_progress"
          ? inProgressRecords
          : records;

    return [...base]
      .filter((r) => (roleFilter === "all" ? true : r.role === roleFilter))
      .filter((r) => {
        if (!q) return true;
        return (
          r.role.toLowerCase().includes(q) ||
          r.categoryLabel.toLowerCase().includes(q) ||
          r.difficulty.toLowerCase().includes(q) ||
          r.tone.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortField === "score") {
          const sa = a.score ?? 0;
          const sb = b.score ?? 0;
          return sortDesc ? sb - sa : sa - sb;
        }
        return sortDesc ? b.timestampMs - a.timestampMs : a.timestampMs - b.timestampMs;
      });
  }, [activeTab, completedRecords, inProgressRecords, records, roleFilter, searchQuery, sortDesc, sortField]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDesc((prev) => !prev);
    } else {
      setSortField(field);
      setSortDesc(true);
    }
    setPage(1);
  };

  const handleRetryLoading = () => {
    onChangeUiStatus("loading");
    window.setTimeout(() => {
      onChangeUiStatus(records.length === 0 ? "empty" : "ready");
    }, 550);
  };

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-white px-4 py-6 pb-24 sm:px-8 lg:px-[48px] lg:py-[32px] lg:pb-10">
      <div className="mx-auto max-w-[1104px] space-y-6">
        {/* Heading row */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-semibold leading-[1.25] tracking-[-0.02em] text-[#30263c] sm:text-[30px]">
              Your sessions
            </h1>
            <p className="mt-1 text-[13px] leading-[1.5] text-[#796985]">
              Review past interviews and put your feedback to work.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {effectiveStatus === "loading" ? (
              <span className="h-[16px] w-[144px] animate-pulse rounded-[6px] bg-[#f6f3fa]" />
            ) : (
              <p className="text-[12px] text-[#796985]">
                {effectiveStatus === "empty" ? 0 : completedRecords.length} completed
                <span className="mx-2">·</span>
                {effectiveStatus === "empty" ? 0 : inProgressRecords.length} in progress
              </p>
            )}

            <button
              type="button"
              onClick={handleRetryLoading}
              aria-label="Sync session history"
              className="inline-flex h-[32px] cursor-pointer items-center gap-1.5 rounded-[8px] border border-[#e5dfec] bg-white px-2.5 text-[11px] font-medium text-[#796985] transition-colors hover:bg-[#faf8fd] hover:text-[#30263c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7453a6]"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Sync</span>
            </button>
          </div>
        </div>

        {/* LOADING STATE (Figma 240:8216) */}
        {effectiveStatus === "loading" ? (
          <div aria-busy="true" aria-label="Loading sessions" className="space-y-6">
            <div className="flex flex-col justify-between gap-5 rounded-[16px] border border-[#efebf4] bg-[#faf8fd] p-6 sm:flex-row sm:items-center">
              <div className="space-y-2.5">
                <div className="h-[12px] w-[140px] animate-pulse rounded-[6px] bg-[#efebf5]" />
                <div className="h-[22px] w-[220px] animate-pulse rounded-[8px] bg-[#efebf5]" />
                <div className="h-[12px] w-[190px] animate-pulse rounded-[6px] bg-[#f6f3fa]" />
              </div>
              <div className="space-y-2.5">
                <div className="h-[14px] w-[110px] animate-pulse rounded-[6px] bg-[#efebf5]" />
                <div className="h-[8px] w-[210px] animate-pulse rounded-full bg-[#efebf5]" />
                <div className="h-[12px] w-[170px] animate-pulse rounded-[6px] bg-[#f6f3fa]" />
              </div>
              <div className="h-[40px] w-full animate-pulse rounded-[12px] bg-[#efebf5] sm:w-[156px]" />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <div className="h-[34px] w-[104px] animate-pulse rounded-[8px] bg-[#eee6f8]" />
                <div className="h-[34px] w-[96px] animate-pulse rounded-[8px] bg-[#f6f3fa]" />
                <div className="h-[34px] w-[96px] animate-pulse rounded-[8px] bg-[#f6f3fa]" />
              </div>
              <div className="flex gap-2">
                <div className="h-[36px] w-[220px] animate-pulse rounded-[8px] bg-[#f6f3fa]" />
                <div className="h-[36px] w-[112px] animate-pulse rounded-[8px] bg-[#f6f3fa]" />
              </div>
            </div>

            <div className="overflow-hidden rounded-[12px] border border-[#e5dfec] bg-white">
              <div className="hidden grid-cols-[1.5fr_1fr_0.9fr_0.7fr_0.8fr] bg-[#faf8fd] px-6 py-3 text-[10px] font-medium text-[#796985] md:grid">
                <span>INTERVIEW</span>
                <span>DATE ↓</span>
                <span>SETUP</span>
                <span>SCORE</span>
                <span className="text-right">ACTION</span>
              </div>
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex flex-wrap items-center justify-between gap-4 border-t border-[#efebf4] px-6 py-4"
                >
                  <div className="space-y-1.5">
                    <div className="h-[14px] w-[150px] animate-pulse rounded-[6px] bg-[#efebf5]" />
                    <div className="h-[11px] w-[184px] animate-pulse rounded-[6px] bg-[#f6f3fa]" />
                  </div>
                  <div className="hidden space-y-1.5 sm:block">
                    <div className="h-[13px] w-[88px] animate-pulse rounded-[6px] bg-[#efebf5]" />
                    <div className="h-[10px] w-[56px] animate-pulse rounded-[6px] bg-[#f6f3fa]" />
                  </div>
                  <div className="hidden space-y-1.5 md:block">
                    <div className="h-[13px] w-[54px] animate-pulse rounded-[6px] bg-[#efebf5]" />
                    <div className="h-[10px] w-[42px] animate-pulse rounded-[6px] bg-[#f6f3fa]" />
                  </div>
                  <div className="h-[18px] w-[56px] animate-pulse rounded-[6px] bg-[#efebf5]" />
                  <div className="h-[14px] w-[84px] animate-pulse rounded-[6px] bg-[#f6f3fa]" />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* ERROR STATE (Figma 240:8380) */}
        {effectiveStatus === "error" ? (
          <section
            role="alert"
            className="flex min-h-[440px] flex-col items-center justify-center rounded-[16px] border border-[#e5dfec] bg-white px-6 py-12 text-center"
          >
            <div className="flex size-[56px] items-center justify-center rounded-[16px] border border-[#e6b4bd] bg-[#fdf2f4] text-[#9e3a4a]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
                <path
                  d="M12 8v4m0 4h.01"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h2 className="mt-5 text-[22px] font-semibold leading-[1.3] text-[#30263c]">
              We couldn’t load your session history
            </h2>
            <p className="mt-2 max-w-[470px] text-[13px] leading-[1.55] text-[#796985]">
              Your saved transcripts and scores are safe. Check your connection and try again, or
              jump straight into a new mock interview.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleRetryLoading}
                className="btn-tactile inline-flex h-[42px] cursor-pointer items-center justify-center rounded-[12px] bg-[#c7b8fa] px-6 text-[13px] font-semibold text-[#292331] hover:bg-[#baa9f7]"
              >
                Retry loading
              </button>
              <button
                type="button"
                onClick={onStartNewInterview}
                className="inline-flex h-[42px] cursor-pointer items-center justify-center rounded-[12px] border border-[#e5dfec] bg-white px-5 text-[12px] font-medium text-[#665570] hover:bg-[#faf8fd]"
              >
                Start a new interview
              </button>
            </div>
            <span className="mt-6 inline-flex rounded-[8px] bg-[#faf8fd] px-4 py-2 text-[11px] text-[#796985]">
              Offline recovery ready · Error reference: SYNC-408
            </span>
          </section>
        ) : null}

        {/* EMPTY STATE (Figma 240:8134) */}
        {effectiveStatus === "empty" ? (
          <section className="flex min-h-[480px] flex-col items-center justify-center rounded-[16px] border border-[#e5dfec] bg-[#faf8fd] px-5 py-12 text-center sm:px-10">
            <div className="flex size-[56px] items-center justify-center rounded-[16px] bg-[#eee6f8] text-[#60427d]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h2 className="mt-5 text-[22px] font-semibold leading-[1.3] text-[#30263c]">
              No practice sessions yet
            </h2>
            <p className="mt-2 max-w-[480px] text-[13px] leading-[1.55] text-[#796985]">
              Start a calm 5-minute mock interview with Sir Bot. Your rubric scores, full
              transcripts, and personalized next-focus notes will automatically appear here.
            </p>

            <button
              type="button"
              onClick={onStartNewInterview}
              className="btn-tactile mt-6 inline-flex h-[44px] cursor-pointer items-center gap-2 rounded-[12px] bg-[#c7b8fa] px-6 text-[13px] font-semibold text-[#292331] hover:bg-[#baa9f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7453a6]"
            >
              <span>Start your first interview</span>
              <span aria-hidden="true">→</span>
            </button>

            <div className="mt-8 w-full max-w-[820px] space-y-3">
              <p className="text-[10px] font-semibold tracking-[0.04em] text-[#796985]">
                OR JUMP INTO A POPULAR WARM-UP
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {STARTER_PRESETS.map((preset) => (
                  <button
                    key={preset.role}
                    type="button"
                    onClick={() => onStartPreset(preset.config)}
                    className="group flex cursor-pointer flex-col items-start rounded-[12px] border border-[#e5dfec] bg-white p-4 text-left transition-colors hover:border-[#c7b8fa] hover:bg-[#fcfafe] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7453a6]"
                  >
                    <span className="text-[13px] font-semibold text-[#4d365f] group-hover:text-[#30263c]">
                      {preset.role}
                    </span>
                    <span className="mt-1 text-[11px] leading-[1.45] text-[#796985]">
                      {preset.meta}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* READY STATE (Figma 32:749 + Mobile 245:8297) */}
        {effectiveStatus === "ready" ? (
          <>
            {/* Pick up where you left off banner */}
            {latestInProgress ? (
              <section
                aria-label="Resume unfinished interview"
                className="rounded-[16px] bg-[#f3eef9] p-5 sm:px-7 sm:py-6"
              >
                <div className="grid grid-cols-1 items-center gap-5 lg:grid-cols-[1.1fr_1px_1fr_auto]">
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.04em] text-[#7c6693]">
                      PICK UP WHERE YOU LEFT OFF
                    </p>
                    <h2 className="mt-1 text-[20px] font-semibold text-[#4d365f]">
                      {latestInProgress.role}
                    </h2>
                    <p className="mt-0.5 text-[12px] text-[#796985]">
                      {latestInProgress.categoryLabel} · {latestInProgress.difficulty} ·{" "}
                      {latestInProgress.tone}
                    </p>
                  </div>

                  <div aria-hidden="true" className="hidden h-[64px] w-px bg-[#dfd4ec] lg:block" />

                  <div>
                    <p className="text-[13px] font-medium text-[#6b4e80]">
                      {latestInProgress.completedQuestions} of {latestInProgress.questionCount}{" "}
                      questions
                    </p>
                    <div className="mt-2.5 flex items-center gap-2" aria-hidden="true">
                      {Array.from({ length: latestInProgress.questionCount }, (_, idx) => (
                        <span
                          key={idx}
                          className={`h-[4px] flex-1 max-w-[44px] rounded-full ${
                            idx < latestInProgress.completedQuestions
                              ? "bg-[#9d7bc7]"
                              : "bg-[#ded4ec]"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-2 text-[11px] text-[#796985]">
                      Continue with: {latestInProgress.currentTopic ?? "Behavioral follow-up"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onResumeInProgress(latestInProgress)}
                    className="btn-tactile group inline-flex h-[40px] w-full cursor-pointer items-center justify-center gap-3 rounded-[10px] bg-[#c7b8fa] px-5 text-[12px] font-semibold text-[#423052] hover:bg-[#baa9f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7453a6] lg:w-auto"
                  >
                    <span>Resume interview</span>
                    <span aria-hidden="true" className="hover-arrow-shift">
                      →
                    </span>
                  </button>
                </div>
              </section>
            ) : null}

            {/* Tabs & filters */}
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div
                role="tablist"
                aria-label="Session status filter"
                className="flex flex-wrap items-center gap-2"
              >
                {(
                  [
                    { key: "completed", label: "Completed", count: completedRecords.length },
                    { key: "in_progress", label: "In progress", count: inProgressRecords.length },
                    { key: "all", label: "All sessions", count: records.length },
                  ] as const
                ).map((tab) => {
                  const active = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => {
                        setActiveTab(tab.key);
                        setPage(1);
                      }}
                      className={`inline-flex h-[34px] cursor-pointer items-center gap-2 rounded-[9px] px-3.5 text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7453a6] ${
                        active
                          ? "bg-[#eee6f8] font-medium text-[#73518f]"
                          : "font-normal text-[#796985] hover:bg-[#faf8fd] hover:text-[#30263c]"
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className="tabular-nums opacity-80">{tab.count}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative min-w-0 flex-1 sm:w-[240px] sm:flex-none">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search role or keyword…"
                    aria-label="Search sessions"
                    className="h-[36px] w-full rounded-[9px] border border-[#e5dfec] bg-white px-3.5 text-[12px] text-[#30263c] placeholder:text-[#796985] focus:border-[#7453a6] focus:outline-none focus:ring-2 focus:ring-[#7453a6]/15"
                  />
                </div>

                <select
                  aria-label="Filter by role"
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value as JobRole | "all");
                    setPage(1);
                  }}
                  className="h-[36px] cursor-pointer rounded-[9px] border border-[#e5dfec] bg-white px-3 text-[12px] font-medium text-[#6e597c] focus:border-[#7453a6] focus:outline-none focus:ring-2 focus:ring-[#7453a6]/15"
                >
                  <option value="all">All roles</option>
                  {availableRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Responsive History Table (md+) and Stacked Cards (< md) */}
            {paginated.length === 0 ? (
              <div className="rounded-[12px] border border-[#e5dfec] bg-[#faf8fd] px-6 py-12 text-center">
                <p className="text-[14px] font-medium text-[#4d365f]">
                  No sessions match that filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setRoleFilter("all");
                    setActiveTab("all");
                    setPage(1);
                  }}
                  className="mt-3 cursor-pointer text-[12px] font-semibold text-[#73518f] hover:underline"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <>
                {/* Desktop / Tablet table */}
                <div className="hidden overflow-hidden rounded-[12px] border border-[#e5dfec] bg-white md:block">
                  <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,0.95fr)_minmax(0,0.8fr)_minmax(0,0.7fr)_130px] items-center bg-[#fbf9fd] px-5 py-3 text-[10px] font-medium tracking-[0.03em] text-[#796985]">
                    <span>INTERVIEW</span>
                    <button
                      type="button"
                      onClick={() => handleSort("date")}
                      className="inline-flex cursor-pointer items-center gap-1 text-left hover:text-[#30263c]"
                    >
                      <span>DATE</span>
                      <span>{sortField === "date" ? (sortDesc ? "↓" : "↑") : ""}</span>
                    </button>
                    <span>SETUP</span>
                    <button
                      type="button"
                      onClick={() => handleSort("score")}
                      className="inline-flex cursor-pointer items-center gap-1 text-left hover:text-[#30263c]"
                    >
                      <span>SCORE</span>
                      <span>{sortField === "score" ? (sortDesc ? "↓" : "↑") : ""}</span>
                    </button>
                    <span className="sr-only">Action</span>
                  </div>

                  <div className="divide-y divide-[#efebf4]">
                    {paginated.map((row) => (
                      <div
                        key={row.id}
                        className="group grid grid-cols-[minmax(0,1.6fr)_minmax(0,0.95fr)_minmax(0,0.8fr)_minmax(0,0.7fr)_130px] items-center gap-3 px-5 py-3.5 transition-colors hover:bg-[#fcfafe]"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-medium text-[#30263c]">
                            {row.role}
                          </p>
                          <p className="mt-0.5 truncate text-[11px] text-[#796985]">
                            {row.categoryLabel} · {row.questionCount} questions
                          </p>
                        </div>

                        <div className="min-w-0">
                          <p className="text-[12px] text-[#4d365f]">{row.dateLabel}</p>
                          <p className="mt-0.5 text-[11px] text-[#796985]">{row.timeLabel}</p>
                        </div>

                        <div className="min-w-0">
                          <p className="text-[12px] text-[#4d365f]">{row.difficulty}</p>
                          <p className="mt-0.5 text-[11px] text-[#796985]">{row.tone}</p>
                        </div>

                        <div>
                          {row.status === "in_progress" ? (
                            <span className="inline-flex rounded-full bg-[#eee6f8] px-2.5 py-0.5 text-[11px] font-medium text-[#73518f]">
                              {row.completedQuestions}/{row.questionCount} live
                            </span>
                          ) : (
                            <span className="inline-flex items-baseline gap-1 tabular-nums">
                              <span className="text-[15px] font-semibold text-[#60427d]">
                                {(row.score ?? 8.0).toFixed(1)}
                              </span>
                              <span className="text-[11px] text-[#796985]">/ 10</span>
                            </span>
                          )}
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              row.status === "in_progress"
                                ? onResumeInProgress(row)
                                : onViewResults(row)
                            }
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-[8px] px-2.5 py-1.5 text-[12px] font-medium text-[#73518f] transition-colors hover:bg-[#f3eef9] hover:text-[#4d365f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7453a6]"
                          >
                            <span>
                              {row.status === "in_progress" ? "Resume" : "View results"}
                            </span>
                            <span aria-hidden="true" className="hover-arrow-shift">
                              →
                            </span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile stacked session cards (< md) */}
                <div className="space-y-2.5 md:hidden">
                  {paginated.map((row) => (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() =>
                        row.status === "in_progress"
                          ? onResumeInProgress(row)
                          : onViewResults(row)
                      }
                      className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-[12px] border border-[#e5dfec] bg-white p-4 text-left transition-colors hover:border-[#c7b8fa]"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-[#30263c]">
                          {row.role}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-[#796985]">
                          {row.dateLabel} · {row.difficulty} · {row.tone}
                        </p>
                      </div>
                      <span className="shrink-0 text-[12px] font-semibold tabular-nums text-[#73518f]">
                        {row.status === "in_progress"
                          ? "Resume →"
                          : `${(row.score ?? 8.0).toFixed(1)} / 10 →`}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <p className="text-[12px] text-[#796985]">
                    Showing {(safePage - 1) * PAGE_SIZE + 1}–
                    {Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} sessions
                  </p>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={safePage <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="inline-flex h-[32px] cursor-pointer items-center rounded-[8px] px-2.5 text-[12px] text-[#796985] hover:bg-[#faf8fd] hover:text-[#30263c] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ← Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setPage(num)}
                        aria-current={num === safePage ? "page" : undefined}
                        className={`inline-flex size-[32px] cursor-pointer items-center justify-center rounded-[8px] text-[12px] font-medium transition-colors ${
                          num === safePage
                            ? "bg-[#eee6f8] text-[#73518f]"
                            : "text-[#796985] hover:bg-[#faf8fd]"
                        }`}
                      >
                        {num}
                      </button>
                    ))}

                    <button
                      type="button"
                      disabled={safePage >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="inline-flex h-[32px] cursor-pointer items-center rounded-[8px] px-2.5 text-[12px] text-[#796985] hover:bg-[#faf8fd] hover:text-[#30263c] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
