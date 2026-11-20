"use client";

import React, { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  DEMO_SESSION_STORAGE_KEY,
  type DemoUserSession,
} from "@/components/auth/auth-config";
import { ResizeHandle } from "@/components/ui/ResizeHandle";
import {
  buildCompletedResultsSession,
  createFreshInterviewSession,
  createSeededProductDesignerSession,
  createSeededSoftwareEngineerSession,
  evaluateAnswerAndAdvance,
  formatNowTime,
  type InterviewSetupConfig,
  type PracticeSessionState,
  type QuestionResultItem,
} from "./practice-config";
import {
  DEFAULT_COACHING_PREFERENCES,
  DEFAULT_USER_PROFILE,
  INITIAL_SAVED_ANSWERS,
  INITIAL_SESSION_HISTORY,
  INTERVIEW_GUIDES,
  screenToView,
  type CoachingPreferences,
  type SavedAnswerItem,
  type SessionHistoryRecord,
  type UserProfileData,
  type WorkspaceScreenId,
  type WorkspaceView,
} from "./workspace-data";
import { HelpSupportView } from "./HelpSupportView";
import { InterviewResultsView } from "./InterviewResultsView";
import { InterviewSetupView } from "./InterviewSetupView";
import { LiveInterviewView } from "./LiveInterviewView";
import { PracticeDialogs, type ActiveWorkspaceModal } from "./PracticeDialogs";
import { MobileBottomNav, PracticeSidebar } from "./PracticeSidebar";
import { ProfileView } from "./ProfileView";
import { SessionsView, type SessionsUiStatus } from "./SessionsView";
import { SessionTranscriptView } from "./SessionTranscriptView";
import { TipsView } from "./TipsView";

interface PracticeWorkspaceProps {
  initialScreen: WorkspaceScreenId;
}

const SESSION_EVENT = "inlods-session-change";
const DEFAULT_SIDEBAR_WIDTH = 240;
const MIN_SIDEBAR_WIDTH = 216;
const MAX_SIDEBAR_WIDTH = 320;

function subscribeToAuthSession(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(SESSION_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(SESSION_EVENT, callback);
  };
}

function getClientAuthSessionRaw(): string | null {
  try {
    return window.localStorage.getItem(DEMO_SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

function getServerAuthSessionRaw(): string | null {
  return null;
}

const DEFAULT_SETUP_CONFIG: InterviewSetupConfig = {
  role: "Software Engineer",
  difficulty: "Normal",
  questionRange: "5-8",
  tone: "Witty",
};

function getInitialSessionsStatus(screen: WorkspaceScreenId): SessionsUiStatus {
  if (screen === "sessions-empty") return "empty";
  if (screen === "sessions-loading") return "loading";
  if (screen === "sessions-error") return "error";
  return "ready";
}

/**
 * Unified, dynamic & drag-resizable Interview ni Lods Workspace connecting all desktop + mobile screens:
 * - Practice: 01 Setup, 02 Live interview, 03 Live score panel (resizable), 04 Results, 05 Transcript (resizable)
 * - Sessions: History + Empty / Loading / Error states
 * - Tips: Library, Guide detail reader, Saved guides
 * - Profile: Overview, Account & preferences, Saved answers
 * - Help & support
 * - 4 Task Modals: End interview, How it works, Edit profile, Edit practice defaults
 */
export function PracticeWorkspace({ initialScreen }: PracticeWorkspaceProps) {
  const router = useRouter();

  const [view, setView] = useState<WorkspaceView>(() => screenToView(initialScreen));
  const [scorePanelOpen, setScorePanelOpen] = useState<boolean>(initialScreen === "03");
  const [setupConfig, setSetupConfig] = useState<InterviewSetupConfig>(DEFAULT_SETUP_CONFIG);
  const [practiceDefaults, setPracticeDefaults] =
    useState<InterviewSetupConfig>(DEFAULT_SETUP_CONFIG);

  const [softwareEngineerSession, setSoftwareEngineerSession] =
    useState<PracticeSessionState>(() =>
      createSeededSoftwareEngineerSession(
        initialScreen === "04" || initialScreen === "05" ? "completed" : "in_progress"
      )
    );
  const [productDesignerSession] = useState<PracticeSessionState>(() =>
    createSeededProductDesignerSession()
  );
  const [activeSession, setActiveSession] = useState<PracticeSessionState>(() =>
    createSeededSoftwareEngineerSession(
      initialScreen === "04" || initialScreen === "05" ? "completed" : "in_progress"
    )
  );

  // Full dynamic workspace state
  const [sessionHistory, setSessionHistory] = useState<SessionHistoryRecord[]>(
    () => INITIAL_SESSION_HISTORY
  );
  const [sessionsUiStatus, setSessionsUiStatus] = useState<SessionsUiStatus>(() =>
    getInitialSessionsStatus(initialScreen)
  );
  const [transcriptFocusNumber, setTranscriptFocusNumber] = useState<string | undefined>(
    "03"
  );
  const [activeGuideId, setActiveGuideId] = useState<string>(INTERVIEW_GUIDES[0].id);
  const [savedGuideIds, setSavedGuideIds] = useState<Set<string>>(
    () => new Set(["measurable-impact", "clear-star-answer", "introduce-in-60s"])
  );
  const [savedAnswers, setSavedAnswers] = useState<SavedAnswerItem[]>(
    () => INITIAL_SAVED_ANSWERS
  );
  const [profileOverrides, setProfileOverrides] = useState<UserProfileData | null>(null);
  const [preferences, setPreferences] = useState<CoachingPreferences>(
    DEFAULT_COACHING_PREFERENCES
  );

  // Resizable & collapsible chrome state
  const [sidebarWidth, setSidebarWidth] = useState<number>(DEFAULT_SIDEBAR_WIDTH);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ActiveWorkspaceModal>(null);

  const rawAuthSession = useSyncExternalStore(
    subscribeToAuthSession,
    getClientAuthSessionRaw,
    getServerAuthSessionRaw
  );

  const authUser = useMemo<DemoUserSession | null>(() => {
    if (!rawAuthSession) return null;
    try {
      return JSON.parse(rawAuthSession) as DemoUserSession;
    } catch {
      return null;
    }
  }, [rawAuthSession]);

  const effectiveProfile = useMemo<UserProfileData>(() => {
    if (profileOverrides) return profileOverrides;
    if (authUser) {
      const fullName = [authUser.firstName, authUser.lastName].filter(Boolean).join(" ").trim();
      return {
        ...DEFAULT_USER_PROFILE,
        displayName: fullName || DEFAULT_USER_PROFILE.displayName,
        email: authUser.email || DEFAULT_USER_PROFILE.email,
      };
    }
    return DEFAULT_USER_PROFILE;
  }, [authUser, profileOverrides]);

  const syncUrlScreen = (screen: WorkspaceScreenId) => {
    if (typeof window === "undefined") return;
    const targetUrl = screen === "01" ? "/practice" : `/practice?screen=${screen}`;
    if (`${window.location.pathname}${window.location.search}` !== targetUrl) {
      window.history.replaceState(null, "", targetUrl);
    }
  };

  const navigateTo = (nextView: WorkspaceView, screenParam: WorkspaceScreenId) => {
    setView(nextView);
    if (nextView !== "live") setScorePanelOpen(false);
    syncUrlScreen(screenParam);
  };

  const launchInterviewWithConfig = (cfg: InterviewSetupConfig) => {
    const fresh = createFreshInterviewSession(cfg);
    setSetupConfig(cfg);
    setActiveSession(fresh);
    setView("live");
    setScorePanelOpen(preferences.autoOpenLiveScore);
    syncUrlScreen(preferences.autoOpenLiveScore ? "03" : "02");

    // Prepend live session to history
    const newRecord: SessionHistoryRecord = {
      id: fresh.id,
      role: cfg.role,
      categoryLabel: "Behavioral interview",
      questionCount: fresh.totalQuestions,
      completedQuestions: 1,
      dateLabel: "Today",
      timeLabel: formatNowTime(),
      timestampMs: Date.now(),
      difficulty: cfg.difficulty,
      tone: cfg.tone,
      score: null,
      status: "in_progress",
      currentTopic: fresh.currentTopic,
      snapshot: fresh,
    };
    setSessionHistory((prev) => [newRecord, ...prev.filter((r) => r.id !== fresh.id)]);
    if (sessionsUiStatus === "empty") setSessionsUiStatus("ready");
  };

  const recordCompletedSession = (completed: PracticeSessionState) => {
    const finalScore = completed.finalResults?.finalScore ?? 8.1;
    const completedRecord: SessionHistoryRecord = {
      id: completed.id,
      role: completed.config.role,
      categoryLabel:
        completed.config.role === "Product Designer"
          ? "Portfolio walkthrough"
          : "Behavioral interview",
      questionCount: completed.finalResults?.totalQuestions ?? completed.totalQuestions,
      completedQuestions: completed.finalResults?.completedQuestions ?? completed.totalQuestions,
      dateLabel: "Today",
      timeLabel: formatNowTime(),
      timestampMs: Date.now(),
      difficulty: completed.config.difficulty,
      tone: completed.config.tone,
      score: finalScore,
      status: "completed",
      snapshot: completed,
    };
    setSessionHistory((prev) => [
      completedRecord,
      ...prev.filter((r) => r.id !== completed.id && r.id !== "hist-in-progress-se"),
    ]);
    if (sessionsUiStatus === "empty") setSessionsUiStatus("ready");
  };

  const handleSubmitAnswer = (answer: string) => {
    const next = evaluateAnswerAndAdvance(activeSession, answer);
    setActiveSession(next);
    if (next.id === "session-software-engineer") {
      setSoftwareEngineerSession(next);
    }

    if (next.status === "completed") {
      recordCompletedSession(next);
      navigateTo("results", "04");
    } else {
      setSessionHistory((prev) =>
        prev.map((rec) =>
          rec.id === next.id || (next.id === "session-software-engineer" && rec.id === "hist-in-progress-se")
            ? {
                ...rec,
                completedQuestions: next.currentQuestionIndex,
                currentTopic: next.currentTopic,
                score: next.liveScore?.overallScore ?? rec.score,
                snapshot: next,
              }
            : rec
        )
      );
    }
  };

  const handleConfirmEndInterview = () => {
    const completed = buildCompletedResultsSession(activeSession);
    setActiveSession(completed);
    if (completed.id === "session-software-engineer") {
      setSoftwareEngineerSession(completed);
    }
    recordCompletedSession(completed);
    navigateTo("results", "04");
  };

  const handleSelectRecentSession = (key: "software-engineer" | "product-designer") => {
    if (key === "software-engineer") {
      setActiveSession(softwareEngineerSession);
      if (softwareEngineerSession.status === "completed") {
        navigateTo("results", "04");
      } else {
        setView("live");
        setScorePanelOpen(preferences.autoOpenLiveScore);
        syncUrlScreen(preferences.autoOpenLiveScore ? "03" : "02");
      }
      return;
    }

    setActiveSession(productDesignerSession);
    navigateTo("results", "04");
  };

  const handleOpenHistoryResults = (record: SessionHistoryRecord) => {
    if (record.snapshot?.finalResults) {
      setActiveSession(record.snapshot);
      navigateTo("results", "04");
      return;
    }
    if (record.sessionKey === "product-designer" || record.role === "Product Designer") {
      setActiveSession(productDesignerSession);
    } else {
      const seeded = createSeededSoftwareEngineerSession("completed");
      setActiveSession({
        ...seeded,
        config: {
          role: record.role,
          difficulty: record.difficulty,
          questionRange: record.questionCount <= 4 ? "3-5" : record.questionCount >= 8 ? "8-10" : "5-8",
          tone: record.tone,
        },
      });
    }
    navigateTo("results", "04");
  };

  const handleResumeHistorySession = (record: SessionHistoryRecord) => {
    if (record.snapshot && record.snapshot.status === "in_progress") {
      setActiveSession(record.snapshot);
    } else {
      setActiveSession(softwareEngineerSession.status === "in_progress"
        ? softwareEngineerSession
        : createSeededSoftwareEngineerSession("in_progress"));
    }
    setView("live");
    setScorePanelOpen(preferences.autoOpenLiveScore);
    syncUrlScreen(preferences.autoOpenLiveScore ? "03" : "02");
  };

  const handleToggleSaveGuide = (guideId: string) => {
    setSavedGuideIds((prev) => {
      const next = new Set(prev);
      if (next.has(guideId)) next.delete(guideId);
      else next.add(guideId);
      return next;
    });
  };

  const savedQuestionNumbers = useMemo(() => {
    const nums = new Set<string>();
    for (const item of savedAnswers) {
      if (item.questionNumber) nums.add(item.questionNumber);
    }
    return nums;
  }, [savedAnswers]);

  const handleToggleSaveAnswerFromTranscript = (item: QuestionResultItem) => {
    setSavedAnswers((prev) => {
      const exists = prev.some((a) => a.questionNumber === item.number);
      if (exists) {
        return prev.filter((a) => a.questionNumber !== item.number);
      }
      const nextItem: SavedAnswerItem = {
        id: `saved-${Date.now()}`,
        title: item.title,
        role: activeSession.config.role,
        tag: "Ownership",
        score: item.score,
        dateLabel: "Today",
        answer: item.userAnswer,
        coachNote: item.coachFeedback,
        questionNumber: item.number,
      };
      return [nextItem, ...prev];
    });
  };

  const handleExportAllTranscripts = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      profile: effectiveProfile,
      defaults: practiceDefaults,
      sessions: sessionHistory,
      savedAnswers,
    };
    try {
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "interview-ni-lods-export.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // Ignore blocked download contexts
    }
  };

  const handleClearHistory = () => {
    setSessionHistory([]);
    setSessionsUiStatus("empty");
    navigateTo("sessions", "sessions-empty");
  };

  const handleSignOut = () => {
    try {
      window.localStorage.removeItem(DEMO_SESSION_STORAGE_KEY);
    } catch {
      // Ignore storage failures
    }
    window.dispatchEvent(new Event(SESSION_EVENT));
    router.push("/auth?mode=signin");
  };

  const handleToggleSidebarFromHeader = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setDesktopSidebarCollapsed((prev) => !prev);
    } else {
      setMobileSidebarOpen((prev) => !prev);
    }
  };

  const completedHistoryCount = useMemo(
    () => sessionHistory.filter((r) => r.status === "completed").length,
    [sessionHistory]
  );

  const averageScore = useMemo(() => {
    const scored = sessionHistory.filter((r) => r.status === "completed" && r.score !== null);
    if (!scored.length) return 8.2;
    const sum = scored.reduce((acc, r) => acc + (r.score ?? 0), 0);
    return Math.round((sum / scored.length) * 10) / 10;
  }, [sessionHistory]);

  const softwareEngineerActive =
    (view === "live" || view === "results" || view === "transcript") &&
    activeSession.id === "session-software-engineer";

  const softwareEngineerStatusLabel =
    view === "setup"
      ? "Behavioral practice"
      : softwareEngineerSession.status === "completed"
        ? `Completed · ${
            softwareEngineerSession.finalResults?.finalScore.toFixed(1) ?? "8.2"
          } / 10`
        : "In progress";

  const activeGuide =
    INTERVIEW_GUIDES.find((g) => g.id === activeGuideId) ?? INTERVIEW_GUIDES[0];

  // Dynamic breadcrumb segments per screen
  const breadcrumbs = useMemo(() => {
    switch (view) {
      case "setup":
        return [
          { label: "Practice", onClick: () => navigateTo("setup", "01") },
          { label: "New interview" },
        ];
      case "live":
        return [
          { label: "Practice", onClick: () => navigateTo("setup", "01") },
          { label: "Live interview" },
        ];
      case "results":
        return [
          { label: "Sessions", onClick: () => navigateTo("sessions", "sessions") },
          { label: "Interview results" },
        ];
      case "transcript":
        return [
          { label: "Sessions", onClick: () => navigateTo("sessions", "sessions") },
          { label: "Interview results", onClick: () => navigateTo("results", "04") },
          { label: "Transcript" },
        ];
      case "sessions":
        return [{ label: "Sessions" }];
      case "tips":
        return [{ label: "Tips" }];
      case "tips-detail":
        return [
          { label: "Tips", onClick: () => navigateTo("tips", "tips") },
          { label: activeGuide.category },
        ];
      case "tips-saved":
        return [
          { label: "Tips", onClick: () => navigateTo("tips", "tips") },
          { label: "Saved guides" },
        ];
      case "profile":
      case "profile-account":
        return [{ label: "Profile" }];
      case "profile-saved":
        return [
          { label: "Profile", onClick: () => navigateTo("profile", "profile") },
          { label: "Saved answers" },
        ];
      case "help":
        return [{ label: "Help & support" }];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, activeGuide.category]);

  return (
    <div className="flex min-h-dvh w-full bg-white lg:h-dvh lg:overflow-hidden [@media(max-height:600px)]:h-auto [@media(max-height:600px)]:overflow-visible">
      <PracticeSidebar
        activeView={view}
        activeSessionId={activeSession.id}
        softwareEngineerStatusLabel={softwareEngineerStatusLabel}
        softwareEngineerActive={softwareEngineerActive}
        sidebarWidth={sidebarWidth}
        desktopCollapsed={desktopSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onStartNewInterview={() => navigateTo("setup", "01")}
        onNavigateView={(target) => {
          if (target === "setup") navigateTo("setup", "01");
          else if (target === "sessions") navigateTo("sessions", "sessions");
          else if (target === "tips") navigateTo("tips", "tips");
          else if (target === "profile") navigateTo("profile", "profile");
          else if (target === "help") navigateTo("help", "help");
        }}
        onSelectRecentSession={handleSelectRecentSession}
      />

      {/* Drag-resizable desktop sidebar edge handle */}
      {!desktopSidebarCollapsed ? (
        <ResizeHandle
          ariaLabel="Resize navigation sidebar"
          value={sidebarWidth}
          min={MIN_SIDEBAR_WIDTH}
          max={MAX_SIDEBAR_WIDTH}
          defaultValue={DEFAULT_SIDEBAR_WIDTH}
          growDirection="right"
          onChange={setSidebarWidth}
          className="-ml-[3px]"
        />
      ) : null}

      {/* Workspace main pane */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
        {/* Shared adaptive workspace header (64px mobile -> 80px desktop) */}
        <header className="flex h-[64px] shrink-0 items-center justify-between gap-3 border-b border-[#efedf3] bg-white px-4 sm:h-[80px] sm:px-[30px]">
          <div className="flex min-w-0 items-center gap-[10px] sm:gap-[12px]">
            <button
              type="button"
              onClick={handleToggleSidebarFromHeader}
              aria-label="Toggle navigation sidebar"
              aria-expanded={!desktopSidebarCollapsed || mobileSidebarOpen}
              className="-ml-2 inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[9px] transition-colors hover:bg-[#f6f3fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7453a6]"
            >
              <img
                src="/assets/practice/header-sidebar.svg"
                alt=""
                width={20}
                height={20}
                className="shrink-0"
              />
            </button>

            <nav
              aria-label="Workspace breadcrumb"
              className="flex min-w-0 items-center gap-[8px] text-[13px] leading-[1.45] sm:gap-[12px] sm:text-[14px]"
            >
              {breadcrumbs.map((seg, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={`${seg.label}-${idx}`}>
                    {idx > 0 ? (
                      <span aria-hidden="true" className="text-[#796985]">
                        /
                      </span>
                    ) : null}
                    {seg.onClick && !isLast ? (
                      <button
                        type="button"
                        onClick={seg.onClick}
                        className="cursor-pointer truncate text-[#796985] transition-colors hover:text-[#302d39] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7453a6]"
                      >
                        {seg.label}
                      </button>
                    ) : (
                      <span className="truncate font-medium text-[#302d39]">{seg.label}</span>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          </div>

          {/* Right contextual header action per screen */}
          <div className="flex shrink-0 items-center gap-3">
            {view === "setup" ? (
              <button
                type="button"
                onClick={() => setActiveModal("how-it-works")}
                className="inline-flex h-[36px] cursor-pointer items-center justify-center rounded-[9px] border border-[#e4e2e9] bg-white px-3.5 text-[12px] font-medium text-[#65616f] transition-colors hover:bg-[#faf8fd] hover:text-[#302d39] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7453a6] sm:min-w-[134px]"
              >
                How it works
              </button>
            ) : null}

            {view === "live" ? (
              <button
                type="button"
                onClick={() => setActiveModal("end-interview")}
                className="inline-flex h-[36px] cursor-pointer items-center justify-center rounded-[9px] border border-[#e4e2e9] bg-white px-3.5 text-[12px] font-medium text-[#87515a] transition-colors hover:border-[#e6ccd1] hover:bg-[#fdf7f8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7453a6] sm:min-w-[134px]"
              >
                End interview
              </button>
            ) : null}

            {view === "results" ? (
              <span className="inline-flex h-[34px] items-center justify-center rounded-[9px] bg-[#f2f6ee] px-3.5 text-[12px] font-medium text-[#647d58] sm:h-[36px] sm:min-w-[134px]">
                ✓ Completed
              </span>
            ) : null}

            {view === "sessions" ? (
              <span className="hidden text-[12px] text-[#796985] sm:inline">
                {sessionsUiStatus === "loading"
                  ? "Syncing history…"
                  : sessionsUiStatus === "error"
                    ? "Connection interrupted"
                    : "Your practice history"}
              </span>
            ) : null}

            {view === "tips" ? (
              <button
                type="button"
                onClick={() => navigateTo("tips-saved", "tips-saved")}
                className="cursor-pointer rounded-[8px] px-2.5 py-1.5 text-[12px] font-medium text-[#796985] transition-colors hover:bg-[#faf8fd] hover:text-[#60427d]"
              >
                Saved guides ({savedGuideIds.size})
              </button>
            ) : null}

            {view === "tips-saved" ? (
              <button
                type="button"
                onClick={() => navigateTo("tips", "tips")}
                className="cursor-pointer rounded-[8px] px-2.5 py-1.5 text-[12px] font-medium text-[#73518f] hover:bg-[#f3eef9]"
              >
                ← Back to all guides
              </button>
            ) : null}

            {(view === "profile" || view === "profile-account") ? (
              <div role="tablist" aria-label="Profile views" className="flex h-[64px] items-stretch gap-5 sm:h-[80px] sm:gap-7">
                {(
                  [
                    { key: "profile", label: "Overview", screen: "profile" },
                    {
                      key: "profile-account",
                      label: "Account & preferences",
                      screen: "profile-account",
                    },
                  ] as const
                ).map((tab) => {
                  const active = view === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => navigateTo(tab.key, tab.screen)}
                      className={`relative inline-flex cursor-pointer items-center text-[12px] transition-colors sm:text-[13px] ${
                        active
                          ? "font-medium text-[#725191]"
                          : "font-normal text-[#796985] hover:text-[#30263c]"
                      }`}
                    >
                      <span>{tab.label}</span>
                      {active ? (
                        <span
                          aria-hidden="true"
                          className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-[#725191]"
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {view === "profile-saved" ? (
              <span className="hidden text-[12px] font-medium text-[#796985] sm:inline">
                {savedAnswers.length} bookmarked answers
              </span>
            ) : null}

            {view === "help" ? (
              <span className="hidden items-center gap-1.5 text-[12px] font-medium text-[#5d7850] sm:inline-flex">
                <span aria-hidden="true" className="size-2 rounded-full bg-[#5d7850]" />
                All systems operational
              </span>
            ) : null}
          </div>
        </header>

        {/* Active screen body */}
        <main className="flex min-h-0 flex-1 flex-col">
          {view === "setup" ? (
            <InterviewSetupView
              config={setupConfig}
              onChangeConfig={setSetupConfig}
              onStartInterview={() => launchInterviewWithConfig(setupConfig)}
            />
          ) : null}

          {view === "live" ? (
            <LiveInterviewView
              session={activeSession}
              scorePanelOpen={scorePanelOpen}
              showStarTips={preferences.showStarTips}
              showVoiceShortcut={preferences.voiceDictationShortcut}
              onToggleScorePanel={(open) => {
                setScorePanelOpen(open);
                syncUrlScreen(open ? "03" : "02");
              }}
              onSubmitAnswer={handleSubmitAnswer}
            />
          ) : null}

          {view === "results" && activeSession.finalResults ? (
            <InterviewResultsView
              config={activeSession.config}
              results={activeSession.finalResults}
              onViewTranscript={(focusNumber) => {
                setTranscriptFocusNumber(focusNumber ?? "01");
                navigateTo("transcript", "05");
              }}
              onBackToSessions={() => navigateTo("sessions", "sessions")}
              onPracticeAgain={() => navigateTo("setup", "01")}
            />
          ) : null}

          {view === "transcript" && activeSession.finalResults ? (
            <SessionTranscriptView
              key={transcriptFocusNumber ?? "01"}
              config={activeSession.config}
              results={activeSession.finalResults}
              initialFocusNumber={transcriptFocusNumber}
              savedQuestionNumbers={savedQuestionNumbers}
              onToggleSaveAnswer={handleToggleSaveAnswerFromTranscript}
              onPracticeSimilar={() => launchInterviewWithConfig(activeSession.config)}
            />
          ) : null}

          {view === "sessions" ? (
            <SessionsView
              records={sessionHistory}
              uiStatus={sessionsUiStatus}
              onChangeUiStatus={setSessionsUiStatus}
              onResumeInProgress={handleResumeHistorySession}
              onViewResults={handleOpenHistoryResults}
              onStartPreset={(cfg) => launchInterviewWithConfig(cfg)}
              onStartNewInterview={() => navigateTo("setup", "01")}
            />
          ) : null}

          {(view === "tips" || view === "tips-detail" || view === "tips-saved") ? (
            <TipsView
              mode={
                view === "tips-detail"
                  ? "detail"
                  : view === "tips-saved"
                    ? "saved"
                    : "library"
              }
              activeGuideId={activeGuideId}
              savedGuideIds={savedGuideIds}
              onOpenGuide={(id) => {
                setActiveGuideId(id);
                navigateTo("tips-detail", "tips-detail");
              }}
              onOpenLibrary={() => navigateTo("tips", "tips")}
              onOpenSaved={() => navigateTo("tips-saved", "tips-saved")}
              onToggleSaveGuide={handleToggleSaveGuide}
              onPracticeSkill={(cfg) => launchInterviewWithConfig(cfg)}
            />
          ) : null}

          {(view === "profile" ||
            view === "profile-account" ||
            view === "profile-saved") ? (
            <ProfileView
              mode={
                view === "profile-account"
                  ? "account"
                  : view === "profile-saved"
                    ? "saved"
                    : "overview"
              }
              profile={effectiveProfile}
              defaults={practiceDefaults}
              preferences={preferences}
              savedAnswers={savedAnswers}
              completedCount={completedHistoryCount}
              averageScore={averageScore}
              onUpdateProfile={(next) => setProfileOverrides(next)}
              onUpdatePreferences={setPreferences}
              onOpenEditProfileModal={() => setActiveModal("edit-profile")}
              onOpenEditDefaultsModal={() => setActiveModal("edit-defaults")}
              onOpenSavedAnswers={() => navigateTo("profile-saved", "profile-saved")}
              onStartWithDefaults={() => launchInterviewWithConfig(practiceDefaults)}
              onPracticeImpactFocus={() =>
                launchInterviewWithConfig({
                  ...practiceDefaults,
                  questionRange: "3-5",
                  tone: "Direct",
                })
              }
              onPracticeFromAnswer={(item) =>
                launchInterviewWithConfig({
                  ...practiceDefaults,
                  role: item.role,
                })
              }
              onRemoveSavedAnswer={(id) =>
                setSavedAnswers((prev) => prev.filter((item) => item.id !== id))
              }
              onExportAllTranscripts={handleExportAllTranscripts}
              onClearHistory={handleClearHistory}
              onSignOut={handleSignOut}
            />
          ) : null}

          {view === "help" ? <HelpSupportView /> : null}
        </main>
      </div>

      {/* Mobile bottom tab bar (< lg, hidden during live chat composer focus) */}
      {view !== "live" ? (
        <MobileBottomNav
          activeView={view}
          onNavigateView={(target) => {
            if (target === "setup") navigateTo("setup", "01");
            else if (target === "sessions") navigateTo("sessions", "sessions");
            else if (target === "tips") navigateTo("tips", "tips");
            else if (target === "profile") navigateTo("profile", "profile");
          }}
        />
      ) : null}

      {/* Supporting Task Modals */}
      <PracticeDialogs
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        activeSession={activeSession}
        onConfirmEndInterview={handleConfirmEndInterview}
        profile={effectiveProfile}
        onSaveProfile={(next) => setProfileOverrides(next)}
        defaults={practiceDefaults}
        onSaveDefaults={(next) => {
          setPracticeDefaults(next);
          setSetupConfig(next);
        }}
      />
    </div>
  );
}
