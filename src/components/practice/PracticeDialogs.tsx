"use client";

import React, { useEffect, useState } from "react";
import {
  DIFFICULTY_OPTIONS,
  JOB_ROLE_OPTIONS,
  QUESTION_RANGE_OPTIONS,
  TONE_OPTIONS,
  type CoachTone,
  type InterviewDifficulty,
  type InterviewSetupConfig,
  type JobRole,
  type PracticeSessionState,
  type QuestionRange,
} from "./practice-config";
import {
  AVATAR_TINT_STYLES,
  type AvatarTintKey,
  type UserProfileData,
} from "./workspace-data";

export type ActiveWorkspaceModal =
  | "how-it-works"
  | "end-interview"
  | "edit-profile"
  | "edit-defaults"
  | null;

interface PracticeDialogsProps {
  activeModal: ActiveWorkspaceModal;
  onClose: () => void;
  activeSession: PracticeSessionState;
  onConfirmEndInterview: () => void;
  profile: UserProfileData;
  onSaveProfile: (next: UserProfileData) => void;
  defaults: InterviewSetupConfig;
  onSaveDefaults: (next: InterviewSetupConfig) => void;
}

function ModalHeader({
  eyebrow,
  title,
  onClose,
}: {
  eyebrow: string;
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.04em] text-[#73518f]">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-[20px] font-semibold leading-[1.3] text-[#30263c]">
          {title}
        </h2>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close modal"
        className="inline-flex size-[32px] shrink-0 cursor-pointer items-center justify-center rounded-[8px] bg-[#faf8fd] text-[#796985] transition-colors hover:bg-[#eee6f8] hover:text-[#30263c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7453a6]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M18 6 6 18M6 6l12 12"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

function EditProfileModalBody({
  profile,
  onSaveProfile,
  onClose,
}: {
  profile: UserProfileData;
  onSaveProfile: (next: UserProfileData) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<UserProfileData>(profile);
  const tint = AVATAR_TINT_STYLES[draft.avatarTint];
  const initial = (draft.displayName.trim()[0] || "R").toUpperCase();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSaveProfile({
      ...draft,
      displayName: draft.displayName.trim() || profile.displayName,
      username: draft.username.trim() || profile.username,
      headline: draft.headline.trim() || profile.headline,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ModalHeader eyebrow="PROFILE" title="Edit your profile" onClose={onClose} />

      <div className="flex items-center gap-4">
        <div
          className={`flex size-[64px] shrink-0 items-center justify-center rounded-[16px] text-[26px] font-medium ${tint.bg} ${tint.text}`}
        >
          {initial}
        </div>
        <div className="min-w-0 space-y-1.5">
          <p className="text-[13px] font-medium text-[#30263c]">Profile monogram</p>
          <p className="text-[12px] text-[#796985]">Pick a calm tint for your workspace avatar.</p>
          <div className="flex items-center gap-2 pt-0.5">
            {(Object.keys(AVATAR_TINT_STYLES) as AvatarTintKey[]).map((key) => {
              const style = AVATAR_TINT_STYLES[key];
              const selected = draft.avatarTint === key;
              return (
                <button
                  key={key}
                  type="button"
                  aria-label={style.label}
                  aria-pressed={selected}
                  onClick={() => setDraft((prev) => ({ ...prev, avatarTint: key }))}
                  className={`size-[22px] cursor-pointer rounded-full transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7453a6] ${style.bg} ${
                    selected ? `ring-2 ring-offset-2 ${style.ring}` : ""
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block space-y-1.5">
          <span className="block text-[12px] font-medium text-[#4d365f]">Display name</span>
          <input
            type="text"
            value={draft.displayName}
            onChange={(e) => setDraft((prev) => ({ ...prev, displayName: e.target.value }))}
            className="h-[42px] w-full rounded-[12px] border border-[#e3daf1] bg-[#f9f7fc] px-4 text-[13px] text-[#30263c] focus:border-[#7453a6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7453a6]/15"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="block text-[12px] font-medium text-[#4d365f]">Username</span>
          <input
            type="text"
            value={draft.username}
            onChange={(e) => setDraft((prev) => ({ ...prev, username: e.target.value }))}
            className="h-[42px] w-full rounded-[12px] border border-[#e3daf1] bg-[#f9f7fc] px-4 text-[13px] text-[#30263c] focus:border-[#7453a6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7453a6]/15"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="block text-[12px] font-medium text-[#4d365f]">Interview headline</span>
          <input
            type="text"
            value={draft.headline}
            onChange={(e) => setDraft((prev) => ({ ...prev, headline: e.target.value }))}
            className="h-[42px] w-full rounded-[12px] border border-[#e3daf1] bg-[#f9f7fc] px-4 text-[13px] text-[#30263c] focus:border-[#7453a6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7453a6]/15"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-[40px] cursor-pointer items-center rounded-[12px] border border-[#e5dfec] bg-white px-5 text-[12px] font-medium text-[#665570] hover:bg-[#faf8fd]"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-tactile inline-flex h-[40px] cursor-pointer items-center rounded-[12px] bg-[#c7b8fa] px-5 text-[13px] font-semibold text-[#292331] hover:bg-[#baa9f7]"
        >
          Save profile
        </button>
      </div>
    </form>
  );
}

function EditDefaultsModalBody({
  defaults,
  onSaveDefaults,
  onClose,
}: {
  defaults: InterviewSetupConfig;
  onSaveDefaults: (next: InterviewSetupConfig) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<InterviewSetupConfig>(defaults);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSaveDefaults(draft);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <ModalHeader
        eyebrow="PRACTICE DEFAULTS"
        title="Update default interview setup"
        onClose={onClose}
      />

      <label className="block space-y-1.5">
        <span className="block text-[12px] font-medium text-[#4d365f]">Target job role</span>
        <select
          value={draft.role}
          onChange={(e) => setDraft((prev) => ({ ...prev, role: e.target.value as JobRole }))}
          className="h-[42px] w-full cursor-pointer rounded-[12px] border border-[#e3daf1] bg-[#f9f7fc] px-3.5 text-[13px] text-[#30263c] focus:border-[#7453a6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7453a6]/15"
        >
          {JOB_ROLE_OPTIONS.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </label>

      {/* Difficulty segmented */}
      <div className="space-y-1.5">
        <span className="block text-[12px] font-medium text-[#4d365f]">Difficulty</span>
        <div className="grid h-[42px] grid-cols-3 gap-1 rounded-[12px] border border-[#efebf4] bg-[#faf8fd] p-1">
          {DIFFICULTY_OPTIONS.map((opt: InterviewDifficulty) => {
            const active = draft.difficulty === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setDraft((prev) => ({ ...prev, difficulty: opt }))}
                className={`cursor-pointer rounded-[8px] text-[12px] transition-colors ${
                  active
                    ? "border border-[#e3daf1] bg-white font-semibold text-[#30263c] shadow-2xs"
                    : "text-[#796985] hover:text-[#30263c]"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Questions segmented */}
      <div className="space-y-1.5">
        <span className="block text-[12px] font-medium text-[#4d365f]">Questions per round</span>
        <div className="grid h-[42px] grid-cols-3 gap-1 rounded-[12px] border border-[#efebf4] bg-[#faf8fd] p-1">
          {QUESTION_RANGE_OPTIONS.map((opt: QuestionRange) => {
            const active = draft.questionRange === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setDraft((prev) => ({ ...prev, questionRange: opt }))}
                className={`cursor-pointer rounded-[8px] text-[12px] transition-colors ${
                  active
                    ? "border border-[#e3daf1] bg-white font-semibold text-[#30263c] shadow-2xs"
                    : "text-[#796985] hover:text-[#30263c]"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tone segmented */}
      <div className="space-y-1.5">
        <span className="block text-[12px] font-medium text-[#4d365f]">Coach’s tone</span>
        <div className="grid h-[42px] grid-cols-3 gap-1 rounded-[12px] border border-[#efebf4] bg-[#faf8fd] p-1">
          {TONE_OPTIONS.map((opt: CoachTone) => {
            const active = draft.tone === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setDraft((prev) => ({ ...prev, tone: opt }))}
                className={`cursor-pointer rounded-[8px] text-[12px] transition-colors ${
                  active
                    ? "border border-[#e3daf1] bg-white font-semibold text-[#30263c] shadow-2xs"
                    : "text-[#796985] hover:text-[#30263c]"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <p className="text-[11px] text-[#796985]">Applies to new sessions only.</p>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-[40px] cursor-pointer items-center rounded-[12px] border border-[#e5dfec] bg-white px-4 text-[12px] font-medium text-[#665570] hover:bg-[#faf8fd]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-tactile inline-flex h-[40px] cursor-pointer items-center rounded-[12px] bg-[#c7b8fa] px-5 text-[13px] font-semibold text-[#292331] hover:bg-[#baa9f7]"
          >
            Save defaults
          </button>
        </div>
      </div>
    </form>
  );
}

/**
 * All 4 interactive Figma task dialogs:
 * - Modal — End interview (244:7992)
 * - Modal — How it works (244:8012)
 * - Modal — Edit profile (244:8043)
 * - Modal — Edit practice defaults (244:8080)
 */
export function PracticeDialogs({
  activeModal,
  onClose,
  activeSession,
  onConfirmEndInterview,
  profile,
  onSaveProfile,
  defaults,
  onSaveDefaults,
}: PracticeDialogsProps) {
  useEffect(() => {
    if (!activeModal) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeModal, onClose]);

  if (!activeModal) return null;

  const widthClass =
    activeModal === "how-it-works"
      ? "max-w-[540px]"
      : activeModal === "end-interview"
        ? "max-w-[480px]"
        : "max-w-[500px]";

  const answeredCount = Math.max(
    activeSession.turns.filter((t) => t.sender === "user").length,
    1
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#181320]/50 p-4 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`max-h-[88dvh] w-full overflow-y-auto rounded-[24px] border border-[#e5dfec] bg-white p-6 shadow-[0_16px_40px_rgba(36,28,56,0.14)] sm:p-8 ${widthClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {activeModal === "end-interview" ? (
          <div className="space-y-6">
            <ModalHeader
              eyebrow="LIVE INTERVIEW"
              title="End this session early?"
              onClose={onClose}
            />

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] bg-[#f3eef9] p-4">
              <div>
                <p className="text-[12px] font-semibold text-[#4d365f]">
                  {activeSession.config.role} · {activeSession.config.difficulty} ·{" "}
                  {activeSession.config.tone}
                </p>
                <p className="mt-0.5 text-[11px] text-[#796985]">
                  {Math.min(answeredCount, activeSession.totalQuestions)} of{" "}
                  {activeSession.totalQuestions} questions answered so far
                </p>
              </div>
              {activeSession.liveScore ? (
                <span className="rounded-full bg-[#eee6f8] px-3 py-1 text-[11px] font-medium tabular-nums text-[#60427d]">
                  {activeSession.liveScore.overallScore.toFixed(1)} / 10 live
                </span>
              ) : null}
            </div>

            <p className="text-[13px] leading-[1.6] text-[#665570]">
              You’ll still get your full results breakdown, rubric scores, and Sir Bot coaching
              notes for the questions you already answered. You can also save this round to resume
              later.
            </p>

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-[40px] cursor-pointer items-center rounded-[12px] border border-[#e5dfec] bg-white px-4 text-[12px] font-medium text-[#665570] hover:bg-[#faf8fd]"
              >
                Keep practicing
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirmEndInterview();
                  onClose();
                }}
                className="btn-tactile inline-flex h-[40px] cursor-pointer items-center gap-2 rounded-[12px] bg-[#c7b8fa] px-5 text-[13px] font-semibold text-[#292331] hover:bg-[#baa9f7]"
              >
                <span>End &amp; view results</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        ) : null}

        {activeModal === "how-it-works" ? (
          <div className="space-y-6">
            <ModalHeader
              eyebrow="HOW IT WORKS"
              title="Three calm steps to sharper answers"
              onClose={onClose}
            />

            <ol className="space-y-3">
              {[
                {
                  code: "01",
                  title: "Choose your setup",
                  body: "Pick a target role, difficulty level, question range, and Sir Bot’s coaching tone so the round matches your real interview.",
                },
                {
                  code: "02",
                  title: "Practice with live feedback",
                  body: "Answer naturally in chat and open Live Score Preview anytime to see rubric scoring across Clarity, Structure, Relevance, and Impact.",
                },
                {
                  code: "03",
                  title: "Review your session summary",
                  body: "Finish all questions or end early to inspect question-by-question takeaways and focused upgrades for your next run.",
                },
              ].map((step) => (
                <li
                  key={step.code}
                  className="flex items-start gap-3.5 rounded-[12px] border border-[#efebf4] bg-[#faf8fd] p-4"
                >
                  <span className="flex size-[28px] shrink-0 items-center justify-center rounded-[8px] bg-[#ece5f5] text-[11px] font-semibold text-[#73518f]">
                    {step.code}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[#30263c]">{step.title}</p>
                    <p className="mt-1 text-[12px] leading-[1.5] text-[#796985]">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <p className="text-[12px] text-[#796985]">No pressure. No perfect answers.</p>
              <button
                type="button"
                onClick={onClose}
                className="btn-tactile inline-flex h-[40px] cursor-pointer items-center rounded-[12px] bg-[#c7b8fa] px-5 text-[13px] font-semibold text-[#292331] hover:bg-[#baa9f7]"
              >
                Got it, let’s practice
              </button>
            </div>
          </div>
        ) : null}

        {activeModal === "edit-profile" ? (
          <EditProfileModalBody
            profile={profile}
            onSaveProfile={onSaveProfile}
            onClose={onClose}
          />
        ) : null}

        {activeModal === "edit-defaults" ? (
          <EditDefaultsModalBody
            defaults={defaults}
            onSaveDefaults={onSaveDefaults}
            onClose={onClose}
          />
        ) : null}
      </div>
    </div>
  );
}
