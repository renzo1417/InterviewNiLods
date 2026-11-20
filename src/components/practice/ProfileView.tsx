"use client";

import React, { useMemo, useState } from "react";
import type { InterviewSetupConfig } from "./practice-config";
import {
  AVATAR_TINT_STYLES,
  buildPracticeActivityWeeks,
  type CoachingPreferences,
  type SavedAnswerItem,
  type SavedAnswerTag,
  type UserProfileData,
} from "./workspace-data";

interface ProfileViewProps {
  mode: "overview" | "account" | "saved";
  profile: UserProfileData;
  defaults: InterviewSetupConfig;
  preferences: CoachingPreferences;
  savedAnswers: ReadonlyArray<SavedAnswerItem>;
  completedCount: number;
  averageScore: number;
  onUpdateProfile: (next: UserProfileData) => void;
  onUpdatePreferences: (next: CoachingPreferences) => void;
  onOpenEditProfileModal: () => void;
  onOpenEditDefaultsModal: () => void;
  onOpenSavedAnswers: () => void;
  onStartWithDefaults: () => void;
  onPracticeImpactFocus: () => void;
  onPracticeFromAnswer: (item: SavedAnswerItem) => void;
  onRemoveSavedAnswer: (id: string) => void;
  onExportAllTranscripts: () => void;
  onClearHistory: () => void;
  onSignOut: () => void;
}

const MONTH_LABELS = ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];

function PreferenceToggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer items-center rounded-full p-[3px] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7453a6] ${
        checked ? "bg-[#725191]" : "bg-[#e5dfec]"
      }`}
    >
      <span
        aria-hidden="true"
        className={`size-[16px] rounded-full bg-white shadow-xs transition-transform duration-200 ${
          checked ? "translate-x-[18px]" : "translate-x-0"
        }`}
      />
    </button>
  );
}

/**
 * Unified Profile experience implementing:
 * - Profile · Overview (Figma 26:2 + Mobile 246:8063)
 * - Profile · Account & preferences (Figma 242:7973)
 * - Profile · Saved answers (Figma 242:8110)
 */
export function ProfileView({
  mode,
  profile,
  defaults,
  preferences,
  savedAnswers,
  completedCount,
  averageScore,
  onUpdateProfile,
  onUpdatePreferences,
  onOpenEditProfileModal,
  onOpenEditDefaultsModal,
  onOpenSavedAnswers,
  onStartWithDefaults,
  onPracticeImpactFocus,
  onPracticeFromAnswer,
  onRemoveSavedAnswer,
  onExportAllTranscripts,
  onClearHistory,
  onSignOut,
}: ProfileViewProps) {
  const activityWeeks = useMemo(() => buildPracticeActivityWeeks(), []);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  // Account & preferences local draft state
  const [accountDraft, setAccountDraft] = useState<UserProfileData>(profile);
  const [savedToast, setSavedToast] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  // Saved answers filters
  const [tagFilter, setTagFilter] = useState<"All" | SavedAnswerTag>("All");
  const [savedSearch, setSavedSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const tint = AVATAR_TINT_STYLES[profile.avatarTint];
  const initialLetter = (profile.displayName.trim()[0] || "R").toUpperCase();

  const handleSaveAccount = (event: React.FormEvent) => {
    event.preventDefault();
    onUpdateProfile({
      ...profile,
      displayName: accountDraft.displayName.trim() || profile.displayName,
      username: accountDraft.username.trim() || profile.username,
      email: accountDraft.email.trim() || profile.email,
      headline: accountDraft.headline.trim() || profile.headline,
    });
    setSavedToast("Account details saved.");
    window.setTimeout(() => setSavedToast(null), 2400);
  };

  const handleCopyStory = async (item: SavedAnswerItem) => {
    try {
      await navigator.clipboard.writeText(item.answer);
    } catch {
      // Ignore clipboard failures in restricted environments
    }
    setCopiedId(item.id);
    window.setTimeout(() => setCopiedId(null), 2000);
  };

  // =========================================================================
  // VIEW 1: PROFILE — ACCOUNT & PREFERENCES (Figma 242:7973)
  // =========================================================================
  if (mode === "account") {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto bg-white px-4 py-6 pb-24 sm:px-8 lg:px-[48px] lg:py-[32px] lg:pb-10">
        <div className="mx-auto max-w-[1104px] space-y-6">
          <div>
            <h1 className="text-[24px] font-semibold leading-[1.25] tracking-[-0.02em] text-[#30263c] sm:text-[28px]">
              Account &amp; preferences
            </h1>
            <p className="mt-1 text-[13px] text-[#796985]">
              Manage your profile details, Sir Bot coaching behavior, and saved data.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,704fr)_minmax(0,368fr)]">
            {/* Left main column */}
            <div className="min-w-0 space-y-6">
              {/* Account details */}
              <form
                onSubmit={handleSaveAccount}
                className="rounded-[16px] border border-[#e5dfec] bg-white p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-[16px] font-semibold text-[#30263c]">Account details</h2>
                  <span className="inline-flex rounded-full bg-[#edf3e9] px-3 py-1 text-[11px] font-medium text-[#5d7850]">
                    ✓ Email verified
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block space-y-1.5">
                    <span className="block text-[12px] font-medium text-[#4d365f]">
                      Display name
                    </span>
                    <input
                      type="text"
                      value={accountDraft.displayName}
                      onChange={(e) =>
                        setAccountDraft((prev) => ({ ...prev, displayName: e.target.value }))
                      }
                      className="h-[40px] w-full rounded-[8px] border border-[#e3daf1] bg-[#f9f7fc] px-3 text-[13px] text-[#30263c] focus:border-[#7453a6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7453a6]/15"
                    />
                  </label>

                  <label className="block space-y-1.5">
                    <span className="block text-[12px] font-medium text-[#4d365f]">Username</span>
                    <input
                      type="text"
                      value={accountDraft.username}
                      onChange={(e) =>
                        setAccountDraft((prev) => ({ ...prev, username: e.target.value }))
                      }
                      className="h-[40px] w-full rounded-[8px] border border-[#e3daf1] bg-[#f9f7fc] px-3 text-[13px] text-[#30263c] focus:border-[#7453a6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7453a6]/15"
                    />
                  </label>

                  <label className="block space-y-1.5">
                    <span className="block text-[12px] font-medium text-[#4d365f]">
                      Email address
                    </span>
                    <input
                      type="email"
                      value={accountDraft.email}
                      onChange={(e) =>
                        setAccountDraft((prev) => ({ ...prev, email: e.target.value }))
                      }
                      className="h-[40px] w-full rounded-[8px] border border-[#e3daf1] bg-[#f9f7fc] px-3 text-[13px] text-[#30263c] focus:border-[#7453a6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7453a6]/15"
                    />
                  </label>

                  <label className="block space-y-1.5">
                    <span className="block text-[12px] font-medium text-[#4d365f]">
                      Current focus
                    </span>
                    <input
                      type="text"
                      value={accountDraft.headline}
                      onChange={(e) =>
                        setAccountDraft((prev) => ({ ...prev, headline: e.target.value }))
                      }
                      className="h-[40px] w-full rounded-[8px] border border-[#e3daf1] bg-[#f9f7fc] px-3 text-[13px] text-[#30263c] focus:border-[#7453a6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7453a6]/15"
                    />
                  </label>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-1">
                  <p className="text-[12px] text-[#796985]">
                    {savedToast ? (
                      <span className="font-medium text-[#5d7850]">✓ {savedToast}</span>
                    ) : (
                      "Password last changed 2 months ago"
                    )}
                  </p>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <a
                      href="/auth?mode=set-password"
                      className="inline-flex h-[36px] items-center rounded-[10px] border border-[#e5dfec] bg-white px-3.5 text-[12px] font-medium text-[#665570] hover:bg-[#faf8fd]"
                    >
                      Change password
                    </a>
                    <button
                      type="submit"
                      className="btn-tactile inline-flex h-[36px] cursor-pointer items-center rounded-[10px] bg-[#c7b8fa] px-4 text-[12px] font-semibold text-[#292331] hover:bg-[#baa9f7]"
                    >
                      Save changes
                    </button>
                  </div>
                </div>
              </form>

              {/* Coaching & workspace preferences */}
              <section className="rounded-[16px] border border-[#e5dfec] bg-white p-5 sm:p-6">
                <h2 className="text-[16px] font-semibold text-[#30263c]">
                  Coaching &amp; workspace preferences
                </h2>

                <div className="mt-4 divide-y divide-[#efebf4]">
                  {(
                    [
                      {
                        key: "autoOpenLiveScore",
                        title: "Auto-open Live score preview",
                        desc: "Keep rubric feedback visible beside chat as you answer each question.",
                      },
                      {
                        key: "showStarTips",
                        title: "Show STAR coach tips under composer",
                        desc: "Display a gentle structural hint while drafting behavioral answers.",
                      },
                      {
                        key: "voiceDictationShortcut",
                        title: "Voice dictation shortcut",
                        desc: "Enable microphone dictation inside the live answer composer.",
                      },
                      {
                        key: "dailyStreakReminder",
                        title: "Daily streak reminder",
                        desc: "Send one quiet evening nudge at 8:00 PM when you haven’t practiced yet.",
                      },
                    ] as const
                  ).map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between gap-4 py-4 first:pt-1 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-[#30263c]">{item.title}</p>
                        <p className="mt-0.5 text-[12px] leading-[1.45] text-[#796985]">
                          {item.desc}
                        </p>
                      </div>
                      <PreferenceToggle
                        checked={preferences[item.key]}
                        label={item.title}
                        onChange={(nextVal) =>
                          onUpdatePreferences({ ...preferences, [item.key]: nextVal })
                        }
                      />
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right side column */}
            <aside className="min-w-0 space-y-6">
              <section className="rounded-[16px] border border-[#e5dfec] bg-[#faf8fd] p-6">
                <p className="text-[10px] font-semibold tracking-[0.04em] text-[#73518f]">
                  DATA &amp; PRIVACY
                </p>
                <h2 className="mt-2 text-[16px] font-semibold leading-[1.35] text-[#4d365f]">
                  Your interview history belongs to you.
                </h2>
                <p className="mt-2 text-[12px] leading-[1.55] text-[#796985]">
                  Download your completed sessions, scores, and saved answers anytime. Sir Bot
                  never shares your answers externally.
                </p>

                <div className="mt-5 space-y-2.5">
                  <button
                    type="button"
                    onClick={onExportAllTranscripts}
                    className="inline-flex h-[38px] w-full cursor-pointer items-center justify-center rounded-[10px] border border-[#e5dfec] bg-white px-4 text-[12px] font-medium text-[#665570] transition-colors hover:bg-[#f3eef9] hover:text-[#30263c]"
                  >
                    Export all transcripts (JSON)
                  </button>

                  {confirmClear ? (
                    <div className="rounded-[10px] border border-[#e6b4bd] bg-[#fdf2f4] p-3 text-left">
                      <p className="text-[11px] font-medium text-[#9e3a4a]">
                        Clear all local practice sessions?
                      </p>
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onClearHistory();
                            setConfirmClear(false);
                          }}
                          className="cursor-pointer rounded-[7px] bg-[#9e3a4a] px-3 py-1 text-[11px] font-semibold text-white"
                        >
                          Yes, clear history
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmClear(false)}
                          className="cursor-pointer rounded-[7px] bg-white px-3 py-1 text-[11px] font-medium text-[#665570]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmClear(true)}
                      className="inline-flex h-[38px] w-full cursor-pointer items-center justify-center rounded-[10px] border border-[#e5dfec] bg-white px-4 text-[12px] font-medium text-[#665570] transition-colors hover:border-[#e6b4bd] hover:bg-[#fdf2f4] hover:text-[#9e3a4a]"
                    >
                      Clear practice history
                    </button>
                  )}
                </div>
              </section>

              <section className="rounded-[16px] border border-[#e5dfec] bg-white p-6">
                <p className="text-[10px] font-semibold tracking-[0.04em] text-[#796985]">
                  SESSION
                </p>
                <p className="mt-2 text-[13px] font-medium text-[#30263c]">
                  Signed in on Web Workspace
                </p>
                <p className="mt-0.5 text-[11px] text-[#796985]">
                  Active session · {profile.email}
                </p>

                <button
                  type="button"
                  onClick={onSignOut}
                  className="mt-4 inline-flex h-[38px] w-full cursor-pointer items-center justify-center rounded-[10px] border border-[#e5dfec] bg-white px-4 text-[12px] font-medium text-[#665570] transition-colors hover:bg-[#faf8fd]"
                >
                  Sign out of this device
                </button>

                <div className="my-4 h-px bg-[#efebf4]" />

                <button
                  type="button"
                  onClick={onSignOut}
                  className="flex w-full cursor-pointer items-center justify-between text-[12px] font-medium text-[#9e3a4a] hover:underline"
                >
                  <span>Delete account &amp; data</span>
                  <span aria-hidden="true">→</span>
                </button>
              </section>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: PROFILE — SAVED ANSWERS (Figma 242:8110)
  // =========================================================================
  if (mode === "saved") {
    const q = savedSearch.trim().toLowerCase();
    const visibleAnswers = savedAnswers.filter((item) => {
      if (tagFilter !== "All" && item.tag !== tagFilter) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.role.toLowerCase().includes(q) ||
        item.tag.toLowerCase().includes(q)
      );
    });

    const tags: ReadonlyArray<"All" | SavedAnswerTag> = [
      "All",
      "Ownership",
      "Problem-solving",
      "Impact",
      "Collaboration",
    ];

    return (
      <div className="min-h-0 flex-1 overflow-y-auto bg-white px-4 py-6 pb-24 sm:px-8 lg:px-[48px] lg:py-[32px] lg:pb-10">
        <div className="mx-auto max-w-[1104px] space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-[24px] font-semibold leading-[1.25] tracking-[-0.02em] text-[#30263c] sm:text-[28px]">
                Saved answers
              </h1>
              <p className="mt-1 text-[13px] text-[#796985]">
                Your strongest STAR stories kept handy for quick rehearsal before a real call.
              </p>
            </div>
            <button
              type="button"
              onClick={onStartWithDefaults}
              className="btn-tactile inline-flex h-[38px] cursor-pointer items-center gap-2 rounded-[10px] bg-[#c7b8fa] px-4 text-[12px] font-semibold text-[#292331] hover:bg-[#baa9f7]"
            >
              <span>Practice from saved</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>

          {/* Filter chips & search */}
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {tags.map((tag) => {
                const count =
                  tag === "All"
                    ? savedAnswers.length
                    : savedAnswers.filter((a) => a.tag === tag).length;
                const active = tagFilter === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setTagFilter(tag)}
                    className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[12px] transition-colors ${
                      active
                        ? "bg-[#eee6f8] font-medium text-[#73518f]"
                        : "text-[#796985] hover:bg-[#faf8fd] hover:text-[#30263c]"
                    }`}
                  >
                    <span>{tag}</span>
                    <span className="tabular-nums opacity-75">{count}</span>
                  </button>
                );
              })}
            </div>

            <input
              type="search"
              value={savedSearch}
              onChange={(e) => setSavedSearch(e.target.value)}
              placeholder="Search saved stories…"
              aria-label="Search saved answers"
              className="h-[36px] w-full rounded-[8px] border border-[#e5dfec] bg-white px-3.5 text-[12px] text-[#30263c] placeholder:text-[#796985] focus:border-[#7453a6] focus:outline-none focus:ring-2 focus:ring-[#7453a6]/15 md:w-[260px]"
            />
          </div>

          {visibleAnswers.length === 0 ? (
            <div className="rounded-[16px] border border-[#e5dfec] bg-[#faf8fd] p-10 text-center">
              <p className="text-[15px] font-semibold text-[#30263c]">No matching saved stories</p>
              <p className="mt-1 text-[13px] text-[#796985]">
                Bookmark answers from any Session transcript to build your personal STAR library.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {visibleAnswers.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-col justify-between gap-4 rounded-[16px] border border-[#e5dfec] bg-white p-5 sm:p-6"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="text-[16px] font-semibold text-[#30263c]">{item.title}</h2>
                        <p className="mt-0.5 text-[11px] text-[#796985]">
                          {item.tag} · {item.role} · {item.dateLabel}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-[#eee6f8] px-3 py-1 text-[11px] font-medium tabular-nums text-[#60427d]">
                        {item.score.toFixed(1)} / 10
                      </span>
                    </div>

                    <div className="rounded-[12px] bg-[#faf8fd] p-4">
                      <p className="text-[13px] leading-[1.6] text-[#665570]">“{item.answer}”</p>
                    </div>

                    <p className="text-[12px] font-medium leading-[1.45] text-[#73518f]">
                      Sir Bot note: {item.coachNote}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => handleCopyStory(item)}
                        className="cursor-pointer text-[12px] font-medium text-[#796985] hover:text-[#30263c]"
                      >
                        {copiedId === item.id ? "✓ Copied story" : "Copy story"}
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveSavedAnswer(item.id)}
                        className="cursor-pointer text-[12px] text-[#9b8ba8] hover:text-[#9e3a4a]"
                      >
                        Remove
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onPracticeFromAnswer(item)}
                      className="cursor-pointer text-[12px] font-semibold text-[#73518f] hover:underline"
                    >
                      Practice follow-up →
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: PROFILE — OVERVIEW (Figma 26:2 + Mobile 246:8063)
  // =========================================================================
  const answersPracticed = Math.max(completedCount * 5, 160);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-white px-4 py-6 pb-24 sm:px-8 lg:px-[48px] lg:py-[32px] lg:pb-10">
      <div className="mx-auto max-w-[1104px] space-y-7">
        {/* Identity banner */}
        <section className="flex flex-wrap items-center justify-between gap-4 border-b border-[#efebf4] pb-6">
          <div className="flex items-center gap-5">
            <div
              className={`flex size-[64px] shrink-0 items-center justify-center rounded-[16px] text-[26px] font-medium sm:size-[76px] sm:text-[30px] ${tint.bg} ${tint.text}`}
            >
              {initialLetter}
            </div>
            <div className="min-w-0">
              <h1 className="text-[24px] font-semibold leading-[1.2] text-[#30263c] sm:text-[30px]">
                {profile.displayName}
              </h1>
              <p className="mt-1 text-[13px] text-[#796985]">{profile.username}</p>
              <p className="mt-0.5 text-[13px] text-[#665570]">{profile.headline}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenEditProfileModal}
            className="inline-flex h-[38px] cursor-pointer items-center justify-center rounded-[10px] border border-[#e5dfec] bg-white px-5 text-[12px] font-medium text-[#665570] transition-colors hover:bg-[#faf8fd] hover:text-[#30263c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7453a6]"
          >
            Edit profile
          </button>
        </section>

        {/* 4-column Practice at a glance stat row (2x2 on mobile) */}
        <section
          aria-label="Practice statistics"
          className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-[#efebf4]"
        >
          {[
            {
              value: String(Math.max(completedCount, 32)),
              label: "Completed interviews",
              sub: "Your practice so far",
            },
            {
              value: String(answersPracticed),
              label: "Answers practiced",
              sub: "Five questions at a time",
            },
            {
              value: averageScore.toFixed(1),
              label: "Average score / 10",
              sub: "Across completed sessions",
            },
            {
              value: "10 days",
              label: "Current streak",
              sub: "A little practice, every day",
            },
          ].map((stat, idx) => (
            <div
              key={stat.label}
              className={`rounded-[12px] border border-[#efebf4] bg-[#faf8fd] p-4 lg:rounded-none lg:border-0 lg:bg-transparent lg:py-0 ${
                idx === 0 ? "lg:pl-0 lg:pr-6" : "lg:px-6"
              }`}
            >
              <p className="text-[24px] font-medium leading-[1.2] tabular-nums text-[#3e304a] sm:text-[30px]">
                {stat.value}
              </p>
              <p className="mt-2 text-[12px] font-medium text-[#6c597b]">{stat.label}</p>
              <p className="mt-0.5 text-[11px] text-[#796985]">{stat.sub}</p>
            </div>
          ))}
        </section>

        {/* Main 704 / 368 split grid */}
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,704fr)_minmax(0,368fr)]">
          {/* Left column: Heatmap + Saved answers preview */}
          <div className="min-w-0 space-y-8">
            {/* Practice activity heatmap */}
            <section className="space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <h2 className="text-[18px] font-semibold text-[#30263c]">Practice activity</h2>
                  <p className="mt-0.5 text-[12px] text-[#796985]">
                    {hoveredCell ?? "32 practice days. A habit you’re building."}
                  </p>
                </div>
                <span className="text-[12px] text-[#796985]">May — Nov 2026</span>
              </div>

              <div className="overflow-x-auto pb-2">
                <div className="min-w-[540px]">
                  {/* Month headers */}
                  <div className="mb-2 flex items-center justify-between pl-8 pr-2 text-[11px] text-[#796985]">
                    {MONTH_LABELS.map((m) => (
                      <span key={m}>{m}</span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    {/* Weekday labels */}
                    <div className="flex w-6 shrink-0 flex-col justify-between py-0.5 text-[10px] text-[#796985]">
                      <span>Mon</span>
                      <span>Wed</span>
                      <span>Fri</span>
                      <span className="opacity-0">Sun</span>
                    </div>

                    {/* 26 columns x 7 rows */}
                    <div className="grid flex-1 grid-cols-[repeat(26,minmax(0,1fr))] gap-[5px]">
                      {activityWeeks.map((week, wIdx) => (
                        <div key={wIdx} className="flex flex-col gap-[5px]">
                          {week.map((cell, dIdx) => (
                            <button
                              key={`${wIdx}-${dIdx}`}
                              type="button"
                              onMouseEnter={() =>
                                setHoveredCell(
                                  `${cell.dateLabel}, 2026 — ${
                                    cell.sessionsCount === 0
                                      ? "No session"
                                      : `${cell.sessionsCount} ${
                                          cell.sessionsCount === 1 ? "session" : "sessions"
                                        } practiced`
                                  }`
                                )
                              }
                              onMouseLeave={() => setHoveredCell(null)}
                              onFocus={() =>
                                setHoveredCell(
                                  `${cell.dateLabel}, 2026 — ${cell.sessionsCount} sessions`
                                )
                              }
                              aria-label={`${cell.dateLabel}: ${cell.sessionsCount} sessions`}
                              className={`aspect-square w-full min-w-[13px] cursor-pointer rounded-[4px] transition-transform hover:scale-115 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7453a6] ${
                                cell.level === 2
                                  ? "bg-[#7c56a8]"
                                  : cell.level === 1
                                    ? "bg-[#bda3dc]"
                                    : "bg-[#efebf4]"
                              }`}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#796985]">
                    <span>One square, one day.</span>
                    <div className="flex items-center gap-4">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="size-[10px] rounded-[3px] bg-[#efebf4]" />
                        No session
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="size-[10px] rounded-[3px] bg-[#bda3dc]" />
                        Practiced
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="size-[10px] rounded-[3px] bg-[#7c56a8]" />
                        Current streak
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Saved answers preview */}
            <section>
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-[18px] font-semibold text-[#30263c]">Saved answers</h2>
                <button
                  type="button"
                  onClick={onOpenSavedAnswers}
                  className="cursor-pointer text-[12px] font-medium text-[#73518f] hover:underline"
                >
                  View all →
                </button>
              </div>

              <div className="mt-3 divide-y divide-[#efebf4] border-t border-[#efebf4]">
                {savedAnswers.slice(0, 2).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={onOpenSavedAnswers}
                    className="group flex w-full cursor-pointer items-start justify-between gap-4 py-4 text-left transition-colors hover:bg-[#fcfafe]"
                  >
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium text-[#30263c] group-hover:text-[#73518f]">
                        {item.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-[12px] leading-[1.5] text-[#796985]">
                        {item.answer}
                      </p>
                      <p className="mt-1 text-[11px] text-[#9b8ba8]">
                        {item.tag} · {item.role}
                      </p>
                    </div>
                    <span className="shrink-0 text-[12px] font-medium tabular-nums text-[#73518f]">
                      {item.score.toFixed(1)} / 10
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Right column: Practice defaults + Next focus */}
          <aside className="min-w-0 space-y-6">
            <section>
              <div className="flex items-center justify-between">
                <h2 className="text-[18px] font-semibold text-[#30263c]">Practice defaults</h2>
                <button
                  type="button"
                  onClick={onOpenEditDefaultsModal}
                  className="cursor-pointer text-[12px] font-medium text-[#73518f] hover:underline"
                >
                  Edit
                </button>
              </div>

              <div className="mt-3 rounded-[16px] border border-[#e5dfec] bg-white p-5">
                <dl className="divide-y divide-[#efebf4] text-[13px]">
                  <div className="flex items-center justify-between py-2.5 first:pt-0">
                    <dt className="text-[#796985]">Target role</dt>
                    <dd className="font-medium text-[#30263c]">{defaults.role}</dd>
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <dt className="text-[#796985]">Difficulty</dt>
                    <dd className="font-medium text-[#30263c]">{defaults.difficulty}</dd>
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <dt className="text-[#796985]">Questions</dt>
                    <dd className="font-medium text-[#30263c]">{defaults.questionRange}</dd>
                  </div>
                  <div className="flex items-center justify-between py-2.5 last:pb-0">
                    <dt className="text-[#796985]">Coach’s tone</dt>
                    <dd className="font-medium text-[#30263c]">{defaults.tone}</dd>
                  </div>
                </dl>

                <button
                  type="button"
                  onClick={onStartWithDefaults}
                  className="btn-tactile group mt-5 inline-flex h-[40px] w-full cursor-pointer items-center justify-center gap-3 rounded-[10px] bg-[#c7b8fa] px-4 text-[13px] font-semibold text-[#292331] hover:bg-[#baa9f7]"
                >
                  <span>Start a session</span>
                  <span aria-hidden="true" className="hover-arrow-shift">
                    →
                  </span>
                </button>
              </div>
            </section>

            <section className="rounded-[16px] bg-[#f3eef9] p-6">
              <p className="text-[10px] font-semibold tracking-[0.04em] text-[#7c6693]">
                YOUR NEXT FOCUS
              </p>
              <h2 className="mt-2 text-[20px] font-semibold leading-[1.3] text-[#4d365f]">
                Make the outcome as clear as the story.
              </h2>
              <p className="mt-2.5 text-[12px] leading-[1.6] text-[#796985]">
                End your next answer with a number: time saved, bugs resolved, or customers
                helped. Specifics make your impact tangible.
              </p>
              <button
                type="button"
                onClick={onPracticeImpactFocus}
                className="mt-4 inline-flex cursor-pointer items-center gap-1.5 text-[12px] font-semibold text-[#73518f] hover:underline"
              >
                <span>Practice this skill</span>
                <span aria-hidden="true">→</span>
              </button>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
