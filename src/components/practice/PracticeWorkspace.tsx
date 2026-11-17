"use client";

import React, { useMemo, useState, useSyncExternalStore } from "react";
import {
  DEMO_SESSION_STORAGE_KEY,
  type DemoUserSession,
} from "@/components/auth/auth-config";
import {
  buildCompletedResultsSession,
  createFreshInterviewSession,
  createSeededProductDesignerSession,
  createSeededSoftwareEngineerSession,
  evaluateAnswerAndAdvance,
  type InterviewSetupConfig,
  type PracticeScreenId,
  type PracticeSessionState,
  type PracticeView,
} from "./practice-config";
import { InterviewResultsView } from "./InterviewResultsView";
import { InterviewSetupView } from "./InterviewSetupView";
import { LiveInterviewView } from "./LiveInterviewView";
import { PracticeDialogs } from "./PracticeDialogs";
import { PracticeSidebar, type SidebarUtilityModal } from "./PracticeSidebar";

interface PracticeWorkspaceProps {
  initialScreen: PracticeScreenId;
}

const SESSION_EVENT = "inlods-session-change";

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
  difficulty: "Easy",
  questionRange: "5-8",
  tone: "Witty",
};

function getInitialView(screen: PracticeScreenId): PracticeView {
  if (screen === "02" || screen === "03") return "live";
  if (screen === "04") return "results";
  return "setup";
}

/**
 * Unified 4-screen Practice workspace connecting:
 * 01 · Before the conversation (Setup)
 * 02 · Interview in progress (Live chat)
 * 03 · Live score panel open
 * 04 · Final interview results
 */
export function PracticeWorkspace({ initialScreen }: PracticeWorkspaceProps) {
  const [view, setView] = useState<PracticeView>(() => getInitialView(initialScreen));
  const [scorePanelOpen, setScorePanelOpen] = useState<boolean>(initialScreen === "03");
  const [setupConfig, setSetupConfig] = useState<InterviewSetupConfig>(DEFAULT_SETUP_CONFIG);

  const [softwareEngineerSession, setSoftwareEngineerSession] = useState<PracticeSessionState>(
    () => createSeededSoftwareEngineerSession(initialScreen === "04" ? "completed" : "in_progress")
  );
  const [productDesignerSession] = useState<PracticeSessionState>(() =>
    createSeededProductDesignerSession()
  );
  const [activeSession, setActiveSession] = useState<PracticeSessionState>(() =>
    createSeededSoftwareEngineerSession(initialScreen === "04" ? "completed" : "in_progress")
  );

  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [sessionsOverviewOpen, setSessionsOverviewOpen] = useState(false);
  const [utilityModal, setUtilityModal] = useState<SidebarUtilityModal>(null);
  const [transcriptModal, setTranscriptModal] = useState<{
    open: boolean;
    focusNumber?: string;
  }>({ open: false });

  const rawAuthSession = useSyncExternalStore(
    subscribeToAuthSession,
    getClientAuthSessionRaw,
    getServerAuthSessionRaw
  );

  const userSession = useMemo<DemoUserSession | null>(() => {
    if (!rawAuthSession) return null;
    try {
      return JSON.parse(rawAuthSession) as DemoUserSession;
    } catch {
      return null;
    }
  }, [rawAuthSession]);

  const syncUrlScreen = (screen: PracticeScreenId) => {
    if (typeof window === "undefined") return;
    const targetUrl = screen === "01" ? "/practice" : `/practice?screen=${screen}`;
    if (`${window.location.pathname}${window.location.search}` !== targetUrl) {
      window.history.replaceState(null, "", targetUrl);
    }
  };

  const handleGoToSetup = () => {
    setView("setup");
    setScorePanelOpen(false);
    syncUrlScreen("01");
  };

  const handleStartNewInterview = () => {
    const fresh = createFreshInterviewSession(setupConfig);
    setActiveSession(fresh);
    setView("live");
    setScorePanelOpen(false);
    syncUrlScreen("02");
  };

  const handleToggleScorePanel = (open: boolean) => {
    setScorePanelOpen(open);
    syncUrlScreen(open ? "03" : "02");
  };

  const handleSubmitAnswer = (answer: string) => {
    const next = evaluateAnswerAndAdvance(activeSession, answer);
    setActiveSession(next);
    if (next.id === "session-software-engineer") {
      setSoftwareEngineerSession(next);
    }

    if (next.status === "completed") {
      setView("results");
      setScorePanelOpen(false);
      syncUrlScreen("04");
    }
  };

  const handleEndInterview = () => {
    const completed = buildCompletedResultsSession(activeSession);
    setActiveSession(completed);
    if (completed.id === "session-software-engineer") {
      setSoftwareEngineerSession(completed);
    }
    setView("results");
    setScorePanelOpen(false);
    syncUrlScreen("04");
  };

  const handleSelectRecentSession = (key: "software-engineer" | "product-designer") => {
    if (key === "software-engineer") {
      setActiveSession(softwareEngineerSession);
      if (softwareEngineerSession.status === "completed") {
        setView("results");
        setScorePanelOpen(false);
        syncUrlScreen("04");
      } else {
        setView("live");
        setScorePanelOpen(false);
        syncUrlScreen("02");
      }
      return;
    }

    setActiveSession(productDesignerSession);
    setView("results");
    setScorePanelOpen(false);
    syncUrlScreen("04");
  };

  const handleOpenSessions = () => {
    const target =
      softwareEngineerSession.status === "completed"
        ? softwareEngineerSession
        : createSeededSoftwareEngineerSession("completed");
    setSoftwareEngineerSession(target);
    setActiveSession(target);
    setView("results");
    setScorePanelOpen(false);
    syncUrlScreen("04");
  };

  const handleSignOut = () => {
    try {
      window.localStorage.removeItem(DEMO_SESSION_STORAGE_KEY);
    } catch {
      // Ignore storage failures
    }
    window.dispatchEvent(new Event(SESSION_EVENT));
  };

  const handleToggleSidebarFromHeader = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setDesktopSidebarCollapsed((prev) => !prev);
    } else {
      setMobileSidebarOpen((prev) => !prev);
    }
  };

  const softwareEngineerActive =
    view !== "setup" && activeSession.id === "session-software-engineer";

  const softwareEngineerStatusLabel =
    view === "setup"
      ? "Behavioral practice"
      : softwareEngineerSession.status === "completed"
        ? `Completed · ${
            softwareEngineerSession.finalResults?.finalScore.toFixed(1) ?? "8.2"
          } / 10`
        : "In progress";

  const breadcrumbRoot = view === "results" ? "Sessions" : "Practice";
  const breadcrumbLeaf =
    view === "setup"
      ? "New interview"
      : view === "live"
        ? "Live interview"
        : "Interview results";

  return (
    <div className="flex min-h-dvh w-full bg-white lg:h-dvh lg:overflow-hidden [@media(max-height:600px)]:h-auto [@media(max-height:600px)]:overflow-visible">
      <PracticeSidebar
        activeView={view}
        activeSessionId={activeSession.id}
        softwareEngineerStatusLabel={softwareEngineerStatusLabel}
        softwareEngineerActive={softwareEngineerActive}
        desktopCollapsed={desktopSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onStartNewInterview={handleGoToSetup}
        onOpenSessions={handleOpenSessions}
        onSelectRecentSession={handleSelectRecentSession}
        onOpenUtilityModal={(modal) => setUtilityModal(modal)}
      />

      {/* Workspace main pane */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
        {/* Shared workspace header (80px) */}
        <header className="flex h-[80px] shrink-0 items-center justify-between gap-4 border-b border-[#efedf3] bg-white px-4 sm:px-[30px]">
          <div className="flex min-w-0 items-center gap-[12px]">
            <button
              type="button"
              onClick={handleToggleSidebarFromHeader}
              aria-label="Toggle navigation sidebar"
              aria-expanded={!desktopSidebarCollapsed || mobileSidebarOpen}
              className="-ml-2 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-[9px] transition-colors hover:bg-[#f6f3fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7453a6]"
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
              className="flex min-w-0 items-center gap-[12px] text-[14px] leading-[1.45]"
            >
              <button
                type="button"
                onClick={view === "results" ? () => setSessionsOverviewOpen(true) : handleGoToSetup}
                className="cursor-pointer truncate text-[#796985] transition-colors hover:text-[#302d39] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7453a6]"
              >
                {breadcrumbRoot}
              </button>
              <span aria-hidden="true" className="text-[#796985]">
                /
              </span>
              <span className="truncate font-medium text-[#302d39]">
                {breadcrumbLeaf}
              </span>
            </nav>
          </div>

          <div className="shrink-0">
            {view === "setup" ? (
              <button
                type="button"
                onClick={() => setHowItWorksOpen(true)}
                className="inline-flex h-[36px] min-w-[134px] cursor-pointer items-center justify-center rounded-[9px] border border-[#e4e2e9] bg-white px-[17px] text-[12px] font-medium text-[#65616f] transition-colors hover:bg-[#faf8fd] hover:text-[#302d39] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7453a6]"
              >
                How it works
              </button>
            ) : null}

            {view === "live" ? (
              <button
                type="button"
                onClick={handleEndInterview}
                className="inline-flex h-[36px] min-w-[134px] cursor-pointer items-center justify-center rounded-[9px] border border-[#e4e2e9] bg-white px-[17px] text-[12px] font-medium text-[#87515a] transition-colors hover:border-[#e6ccd1] hover:bg-[#fdf7f8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7453a6]"
              >
                End interview
              </button>
            ) : null}

            {view === "results" ? (
              <span className="inline-flex h-[36px] min-w-[134px] items-center justify-center rounded-[9px] bg-[#f2f6ee] px-[18px] text-[12px] font-medium text-[#647d58]">
                ✓ Completed
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
              onStartInterview={handleStartNewInterview}
            />
          ) : null}

          {view === "live" ? (
            <LiveInterviewView
              session={activeSession}
              scorePanelOpen={scorePanelOpen}
              onToggleScorePanel={handleToggleScorePanel}
              onSubmitAnswer={handleSubmitAnswer}
            />
          ) : null}

          {view === "results" && activeSession.finalResults ? (
            <InterviewResultsView
              config={activeSession.config}
              results={activeSession.finalResults}
              onViewTranscript={(focusNumber) =>
                setTranscriptModal({ open: true, focusNumber })
              }
              onBackToSessions={() => setSessionsOverviewOpen(true)}
              onPracticeAgain={handleGoToSetup}
            />
          ) : null}
        </main>
      </div>

      {/* Supporting modals */}
      <PracticeDialogs
        howItWorksOpen={howItWorksOpen}
        onCloseHowItWorks={() => setHowItWorksOpen(false)}
        transcriptModal={{
          open: transcriptModal.open,
          questions: activeSession.finalResults?.questionResults ?? [],
          focusNumber: transcriptModal.focusNumber,
        }}
        onCloseTranscript={() => setTranscriptModal({ open: false })}
        sessionsOverviewOpen={sessionsOverviewOpen}
        onCloseSessionsOverview={() => setSessionsOverviewOpen(false)}
        onOpenRecentSession={handleSelectRecentSession}
        utilityModal={utilityModal}
        onCloseUtilityModal={() => setUtilityModal(null)}
        userSession={userSession}
        onSignOut={handleSignOut}
      />
    </div>
  );
}
