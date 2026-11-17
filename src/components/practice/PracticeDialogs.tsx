"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import type { DemoUserSession } from "@/components/auth/auth-config";
import type { QuestionResultItem } from "./practice-config";
import type { SidebarUtilityModal } from "./PracticeSidebar";

interface PracticeDialogsProps {
  howItWorksOpen: boolean;
  onCloseHowItWorks: () => void;
  transcriptModal: {
    open: boolean;
    questions: QuestionResultItem[];
    focusNumber?: string;
  };
  onCloseTranscript: () => void;
  sessionsOverviewOpen: boolean;
  onCloseSessionsOverview: () => void;
  onOpenRecentSession: (key: "software-engineer" | "product-designer") => void;
  utilityModal: SidebarUtilityModal;
  onCloseUtilityModal: () => void;
  userSession: DemoUserSession | null;
  onSignOut: () => void;
}

/**
 * Contextual dialogs for Practice header/footer/table actions so every visible CTA resolves meaningfully
 * without cluttering the 01-04 Figma screens at rest.
 */
export function PracticeDialogs({
  howItWorksOpen,
  onCloseHowItWorks,
  transcriptModal,
  onCloseTranscript,
  sessionsOverviewOpen,
  onCloseSessionsOverview,
  onOpenRecentSession,
  utilityModal,
  onCloseUtilityModal,
  userSession,
  onSignOut,
}: PracticeDialogsProps) {
  const isAnyOpen =
    howItWorksOpen || transcriptModal.open || sessionsOverviewOpen || utilityModal !== null;

  useEffect(() => {
    if (!isAnyOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (howItWorksOpen) onCloseHowItWorks();
      if (transcriptModal.open) onCloseTranscript();
      if (sessionsOverviewOpen) onCloseSessionsOverview();
      if (utilityModal) onCloseUtilityModal();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    isAnyOpen,
    howItWorksOpen,
    transcriptModal.open,
    sessionsOverviewOpen,
    utilityModal,
    onCloseHowItWorks,
    onCloseTranscript,
    onCloseSessionsOverview,
    onCloseUtilityModal,
  ]);

  if (!isAnyOpen) return null;

  const closeAll = () => {
    onCloseHowItWorks();
    onCloseTranscript();
    onCloseSessionsOverview();
    onCloseUtilityModal();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#181320]/50 p-4 backdrop-blur-[2px]"
      onClick={closeAll}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="max-h-[85dvh] w-full max-w-[600px] overflow-y-auto rounded-[20px] border border-[#e7e0f0] bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {howItWorksOpen ? (
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#7453a6]">
                  How it works
                </p>
                <h2 className="mt-1 text-[20px] font-semibold text-[#30263c]">
                  Three calm steps to sharper answers
                </h2>
              </div>
              <button
                type="button"
                onClick={onCloseHowItWorks}
                aria-label="Close modal"
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-[8px] text-[#796985] hover:bg-[#f4effa]"
              >
                ✕
              </button>
            </div>

            <ol className="mt-5 space-y-3 text-[13px] leading-[1.55] text-[#51465b]">
              <li className="rounded-[12px] bg-[#faf8fd] p-3.5">
                <strong className="font-semibold text-[#3d304d]">1. Choose your setup</strong>
                <p className="mt-1 text-[#796985]">
                  Pick a job role, difficulty level, question range, and Sir Bot’s coaching tone.
                </p>
              </li>
              <li className="rounded-[12px] bg-[#faf8fd] p-3.5">
                <strong className="font-semibold text-[#3d304d]">
                  2. Practice with live feedback
                </strong>
                <p className="mt-1 text-[#796985]">
                  Answer naturally in chat and expand Live Score Preview any time to see rubric scoring across Clarity, Structure, Relevance, and Impact.
                </p>
              </li>
              <li className="rounded-[12px] bg-[#faf8fd] p-3.5">
                <strong className="font-semibold text-[#3d304d]">
                  3. Review your session summary
                </strong>
                <p className="mt-1 text-[#796985]">
                  Finish your questions or end early to view per-question scores and focused improvements for your next run.
                </p>
              </li>
            </ol>
          </div>
        ) : null}

        {transcriptModal.open ? (
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#7453a6]">
                  Session Transcript
                </p>
                <h2 className="mt-1 text-[20px] font-semibold text-[#30263c]">
                  Question-by-question responses
                </h2>
              </div>
              <button
                type="button"
                onClick={onCloseTranscript}
                aria-label="Close transcript"
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-[8px] text-[#796985] hover:bg-[#f4effa]"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {transcriptModal.questions.map((item) => {
                const isFocused = transcriptModal.focusNumber === item.number;
                return (
                  <article
                    key={item.number}
                    className={`rounded-[14px] border p-4 ${
                      isFocused
                        ? "border-[#bda5db] bg-[#faf7fe]"
                        : "border-[#e9e2f0] bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] font-semibold text-[#79569a]">
                        Question {item.number} · {item.title}
                      </span>
                      <span className="rounded-[10px] bg-[#eee6fa] px-2.5 py-0.5 text-[12px] font-semibold text-[#5d3f7f]">
                        {item.score.toFixed(1)} / 10
                      </span>
                    </div>
                    <p className="mt-2 text-[13px] font-medium text-[#3a3344]">{item.prompt}</p>
                    <div className="mt-2.5 rounded-[10px] bg-[#f4f1fb] p-3 text-[12px] leading-[1.5] text-[#51465b]">
                      <strong className="font-medium text-[#655273]">Your answer: </strong>
                      {item.userAnswer}
                    </div>
                    <p className="mt-2 text-[12px] text-[#796985]">
                      <strong className="font-medium text-[#5d3f7f]">Coach note: </strong>
                      {item.coachFeedback}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        ) : null}

        {sessionsOverviewOpen ? (
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#7453a6]">
                  Sessions
                </p>
                <h2 className="mt-1 text-[20px] font-semibold text-[#30263c]">
                  Recent practice sessions
                </h2>
              </div>
              <button
                type="button"
                onClick={onCloseSessionsOverview}
                aria-label="Close sessions list"
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-[8px] text-[#796985] hover:bg-[#f4effa]"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={() => {
                  onOpenRecentSession("software-engineer");
                  onCloseSessionsOverview();
                }}
                className="flex w-full cursor-pointer items-center justify-between rounded-[14px] border border-[#e9e2f0] bg-[#fbf9fd] p-4 text-left hover:border-[#c7b6f0]"
              >
                <div>
                  <p className="text-[14px] font-semibold text-[#30263c]">Software Engineer</p>
                  <p className="mt-0.5 text-[12px] text-[#796985]">
                    Behavioral practice · Normal difficulty · Witty
                  </p>
                </div>
                <span className="text-[13px] font-semibold text-[#79569a]">Open →</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenRecentSession("product-designer");
                  onCloseSessionsOverview();
                }}
                className="flex w-full cursor-pointer items-center justify-between rounded-[14px] border border-[#e9e2f0] bg-[#fbf9fd] p-4 text-left hover:border-[#c7b6f0]"
              >
                <div>
                  <p className="text-[14px] font-semibold text-[#30263c]">Product Designer</p>
                  <p className="mt-0.5 text-[12px] text-[#796985]">
                    Portfolio walkthrough · Completed · 8.3 / 10
                  </p>
                </div>
                <span className="text-[13px] font-semibold text-[#79569a]">Results →</span>
              </button>
            </div>
          </div>
        ) : null}

        {utilityModal === "tips" ? (
          <div>
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-[20px] font-semibold text-[#30263c]">STAR Method Coach Tips</h2>
              <button
                type="button"
                onClick={onCloseUtilityModal}
                aria-label="Close tips"
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-[8px] text-[#796985] hover:bg-[#f4effa]"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { key: "S — Situation", text: "Set concise context in one or two crisp sentences." },
                { key: "T — Task", text: "Clarify your exact ownership before diving into details." },
                { key: "A — Action", text: "Explain choices, trade-offs, and how you rallied peers." },
                { key: "R — Result", text: "Anchor every story with a metric, saved time, or outcome." },
              ].map((tip) => (
                <div key={tip.key} className="rounded-[12px] bg-[#faf8fd] p-3.5">
                  <p className="text-[13px] font-semibold text-[#5d3f7f]">{tip.key}</p>
                  <p className="mt-1 text-[12px] text-[#796985]">{tip.text}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {utilityModal === "profile" ? (
          <div>
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-[20px] font-semibold text-[#30263c]">Candidate Profile</h2>
              <button
                type="button"
                onClick={onCloseUtilityModal}
                aria-label="Close profile"
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-[8px] text-[#796985] hover:bg-[#f4effa]"
              >
                ✕
              </button>
            </div>
            {userSession ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-[14px] bg-[#f4f1fb] p-4">
                  <p className="text-[15px] font-semibold text-[#3d304d]">
                    {userSession.firstName} {userSession.lastName}
                  </p>
                  <p className="text-[13px] text-[#796985]">{userSession.email}</p>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      onSignOut();
                      onCloseUtilityModal();
                    }}
                    className="h-[38px] cursor-pointer rounded-[10px] border border-[#e3d9ed] px-4 text-[12px] font-medium text-[#87515a] hover:bg-[#fcf7f8]"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <p className="text-[13px] text-[#796985]">
                  You’re practicing in guest mode. Sign in anytime to save your target role and session history.
                </p>
                <Link
                  href="/auth"
                  className="inline-flex h-[40px] items-center justify-center rounded-[10px] bg-[#c7b6f0] px-5 text-[13px] font-semibold text-[#423052] hover:bg-[#bba7ec]"
                >
                  Sign in / Sign up
                </Link>
              </div>
            )}
          </div>
        ) : null}

        {utilityModal === "help" ? (
          <div>
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-[20px] font-semibold text-[#30263c]">Help &amp; Support</h2>
              <button
                type="button"
                onClick={onCloseUtilityModal}
                aria-label="Close help"
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-[8px] text-[#796985] hover:bg-[#f4effa]"
              >
                ✕
              </button>
            </div>
            <ul className="mt-4 space-y-2.5 text-[13px] text-[#51465b]">
              <li>• Press <strong>Enter</strong> to send an answer, or <strong>Shift + Enter</strong> for a new line.</li>
              <li>• Click the <strong>Live score →</strong> pill anytime during chat to inspect rubric feedback without ending your round.</li>
              <li>• Click <strong>End interview</strong> in the top bar whenever you want to review full question-by-question results.</li>
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
