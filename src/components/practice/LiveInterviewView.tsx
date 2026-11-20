"use client";

import React, { useEffect, useRef, useState } from "react";
import { SirBotMark } from "@/components/landing/SirBotMark";
import { ResizeHandle } from "@/components/ui/ResizeHandle";
import {
  FULL_MOTION_QUERY,
  MOTION,
  REDUCED_MOTION_QUERY,
  gsap,
  useGSAP,
} from "@/lib/gsap";
import type { PracticeSessionState } from "./practice-config";
import { ScoreBreakdownBars } from "./ScoreBreakdownBars";

interface LiveInterviewViewProps {
  session: PracticeSessionState;
  scorePanelOpen: boolean;
  showStarTips?: boolean;
  showVoiceShortcut?: boolean;
  onToggleScorePanel: (open: boolean) => void;
  onSubmitAnswer: (answer: string) => void;
}

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  0: SpeechRecognitionAlternativeLike;
  isFinal: boolean;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

const DEFAULT_SCORE_DRAWER_WIDTH = 352;
const MIN_SCORE_DRAWER_WIDTH = 280;
const MAX_SCORE_DRAWER_WIDTH = 480;

/**
 * Screens 02 (Live conversation) & 03 (Expanded live score panel).
 * Desktop features a drag-resizable Live Score Preview panel; mobile uses a rising bottom sheet (Figma 245:8118).
 */
export function LiveInterviewView({
  session,
  scorePanelOpen,
  showStarTips = true,
  showVoiceShortcut = true,
  onToggleScorePanel,
  onSubmitAnswer,
}: LiveInterviewViewProps) {
  const [draft, setDraft] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [micHint, setMicHint] = useState<string | null>(null);
  const [scoreDrawerWidth, setScoreDrawerWidth] = useState<number>(DEFAULT_SCORE_DRAWER_WIDTH);

  const threadEndRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia(REDUCED_MOTION_QUERY).matches;
    threadEndRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "end",
    });
  }, [session.turns.length]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  useGSAP(
    () => {
      if (!scorePanelOpen || !drawerRef.current) return;
      const drawer = drawerRef.current;

      const mm = gsap.matchMedia();
      mm.add(
        {
          fullMotion: FULL_MOTION_QUERY,
          reduceMotion: REDUCED_MOTION_QUERY,
        },
        (context) => {
          const { reduceMotion } = context.conditions ?? {};
          const pulseDot = drawer.querySelector<HTMLElement>("[data-live-pulse]");

          if (reduceMotion) return;

          gsap.fromTo(
            drawer,
            { opacity: 0, x: 18 },
            {
              opacity: 1,
              x: 0,
              duration: MOTION.duration.uiPanel,
              ease: MOTION.ease.out,
              clearProps: "transform",
            }
          );

          if (pulseDot) {
            gsap.fromTo(
              pulseDot,
              { scale: 1, opacity: 0.75 },
              {
                scale: 2.3,
                opacity: 0,
                duration: 1.7,
                repeat: -1,
                ease: "power2.out",
              }
            );
          }
        }
      );
    },
    { dependencies: [scorePanelOpen, session.liveScore?.questionLabel], scope: drawerRef }
  );

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSubmitAnswer(trimmed);
    setDraft("");
    setMicHint(null);
    composerRef.current?.focus();
  };

  const handleComposerKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleToggleMic = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const win = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const Recognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!Recognition) {
      setMicHint("Voice dictation is unavailable in this browser — type your response directly.");
      return;
    }

    try {
      const recognition = new Recognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((res) => res[0]?.transcript ?? "")
          .join(" ")
          .trim();
        if (transcript) {
          setDraft((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };
      recognition.onerror = () => {
        setIsRecording(false);
        setMicHint("Microphone access was paused — feel free to type your answer instead.");
      };
      recognition.onend = () => {
        setIsRecording(false);
      };
      recognitionRef.current = recognition;
      setMicHint("Listening… speak naturally.");
      setIsRecording(true);
      recognition.start();
    } catch {
      setIsRecording(false);
      setMicHint("Could not start voice dictation — please type your answer.");
    }
  };

  const { config, totalQuestions, currentQuestionIndex, currentTopic, turns, liveScore } =
    session;

  const renderScorePanelBody = (isMobileSheet: boolean) => (
    <div className="flex h-full flex-col overflow-y-auto px-[24px] pt-[12px] pb-[20px]">
      {isMobileSheet ? (
        <div className="mb-3 flex justify-center">
          <span aria-hidden="true" className="h-[4px] w-[40px] rounded-full bg-[#e5dfec]" />
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => onToggleScorePanel(false)}
            aria-label="Collapse live score preview"
            className="-ml-2 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-[8px] text-[14px] text-[#82728f] transition-colors hover:bg-[#f1ebf9] hover:text-[#4d3c5d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7453a6]"
          >
            ←
          </button>
          <span className="text-[10px] text-[#9b8ba8]">Drag edge to resize</span>
        </div>
      )}

      <div className="mt-1 flex items-center justify-between gap-2">
        <h2 className="text-[19px] font-semibold leading-[1.4] text-[#3d304d]">
          Live score preview
        </h2>
        <span className="inline-flex h-[24px] items-center gap-[8px] rounded-[12px] bg-[#eee6fa] px-[10px] text-[10px] font-medium text-[#6d4e91]">
          <span className="relative flex size-[5px] items-center justify-center">
            <span
              data-live-pulse
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-[#9772c0]/60"
            />
            <span className="relative size-[5px] rounded-[3px] bg-[#9772c0]" />
          </span>
          Live
        </span>
      </div>

      <p className="mt-[2px] text-[12px] leading-[1.5] text-[#796985]">
        Feedback on your latest answer
      </p>

      {liveScore ? (
        <>
          <p className="mt-[18px] text-[11px] font-medium leading-[1.5] text-[#796985]">
            {liveScore.questionLabel}
          </p>

          <div className="mt-[10px] rounded-[16px] bg-[#eee6fa] p-[20px]">
            <div className="flex items-baseline gap-[10px]">
              <span className="text-[48px] font-semibold leading-[1.08] tracking-[-0.02em] text-[#5d3f7f] tabular-nums sm:text-[52px]">
                {liveScore.overallScore.toFixed(1)}
              </span>
              <span className="text-[18px] font-medium leading-[1.5] text-[#79608f]">
                / 10
              </span>
            </div>
            <p className="mt-[10px] text-[15px] font-semibold leading-[1.5] text-[#5d3f7f]">
              {liveScore.verdict}
            </p>
            <p className="mt-[4px] text-[12px] leading-[1.5] text-[#766085]">
              {liveScore.verdictDetail}
            </p>
          </div>

          <h3 className="mt-[22px] text-[14px] font-semibold leading-[1.5] text-[#4d3c5d]">
            Answer breakdown
          </h3>
          <div className="mt-[14px]">
            <ScoreBreakdownBars breakdown={liveScore.breakdown} />
          </div>

          <div className="my-[22px] h-px bg-[#e7dfef]" />

          <h3 className="text-[14px] font-semibold leading-[1.5] text-[#4d3c5d]">
            What’s working well
          </h3>
          <ul className="mt-[10px] space-y-[8px]">
            {liveScore.workingWell.map((item) => (
              <li
                key={item}
                className="flex items-center gap-[10px] text-[12px] leading-[1.5] text-[#70617b]"
              >
                <span aria-hidden="true" className="text-[13px] font-semibold text-[#6b835f]">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <h3 className="mt-[20px] text-[14px] font-semibold leading-[1.5] text-[#4d3c5d]">
            Improve next
          </h3>
          <ul className="mt-[12px] space-y-[14px]">
            {liveScore.improveNext.map((note) => (
              <li key={note.code} className="flex items-start gap-[12px]">
                <span className="flex size-[24px] shrink-0 items-center justify-center rounded-[8px] bg-[#efe8f7] text-[9px] font-medium text-[#88679f]">
                  {note.code}
                </span>
                <div className="min-w-0">
                  <p className="text-[12px] font-medium leading-[1.5] text-[#665071]">
                    {note.title}
                  </p>
                  <p className="mt-[2px] text-[11px] leading-[1.5] text-[#796985]">
                    {note.detail}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="mt-[22px] rounded-[16px] border border-dashed border-[#ddd1ed] bg-white p-[20px]">
          <p className="text-[14px] font-semibold text-[#4d3c5d]">Ready when you are</p>
          <p className="mt-2 text-[12px] leading-[1.55] text-[#796985]">
            Send your first response and Sir Bot will score clarity, structure, relevance, and
            measurable impact in real time.
          </p>
        </div>
      )}

      {isMobileSheet ? (
        <button
          type="button"
          onClick={() => onToggleScorePanel(false)}
          className="mt-6 inline-flex h-[42px] w-full shrink-0 cursor-pointer items-center justify-center rounded-[12px] border border-[#e5dfec] bg-white text-[13px] font-medium text-[#4d3c5d] hover:bg-[#faf8fd]"
        >
          Back to chat
        </button>
      ) : (
        <p className="mt-auto pt-6 text-[10px] leading-[1.5] text-[#796985]">
          A preview, not your final session score.
        </p>
      )}
    </div>
  );

  return (
    <div className="relative flex min-h-0 flex-1 overflow-hidden bg-white">
      {/* Main conversation column */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
        <div
          className={`mx-auto flex min-h-full w-full flex-col px-4 pt-[22px] pb-[20px] transition-[max-width] duration-250 ease-out sm:px-10 sm:pt-[26px] ${
            scorePanelOpen ? "max-w-[848px]" : "max-w-[984px]"
          }`}
        >
          {/* Conversation header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-[5px]">
                <SirBotMark className="h-[36px] w-[33px] shrink-0 sm:h-[41px] sm:w-[37px]" />
                <h1 className="text-[20px] font-semibold leading-[1.35] text-[#2c2834] sm:text-[25px]">
                  Chat with Sir Bot
                </h1>
              </div>
              <p className="mt-[3px] text-[12px] leading-[1.55] text-[#796985]">
                {config.role}
                <span className="mx-2">/</span>
                {config.difficulty} difficulty
                <span className="mx-2">/</span>
                {config.tone}
              </p>
            </div>

            {!scorePanelOpen ? (
              <button
                type="button"
                onClick={() => onToggleScorePanel(true)}
                className="btn-tactile group inline-flex h-[42px] cursor-pointer items-center gap-[10px] rounded-[12px] bg-[#f4f1fb] px-[14px] text-left hover:bg-[#ebe5f9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7453a6]"
              >
                <img
                  src="/assets/practice/conv-score-bars.svg"
                  alt=""
                  width={18}
                  height={18}
                  className="shrink-0"
                />
                <span className="text-[19px] font-semibold leading-[1.2] text-[#594274] tabular-nums">
                  {liveScore ? liveScore.overallScore.toFixed(1) : "—"}
                </span>
                <span className="text-[11px] leading-[1.55] text-[#82728f]">
                  /10 · Live score
                </span>
                <span
                  aria-hidden="true"
                  className="hover-arrow-shift ml-1 text-[12px] text-[#82728f]"
                >
                  →
                </span>
              </button>
            ) : null}
          </div>

          {/* Progress indicator row */}
          <div className="mt-[20px] flex flex-wrap items-center justify-between gap-3 border-b border-[#efecf3] pb-[12px]">
            <div className="flex flex-wrap items-center gap-[16px]">
              <div className="flex items-center gap-[8px]" aria-hidden="true">
                {Array.from({ length: totalQuestions }, (_, idx) => {
                  const active = idx < currentQuestionIndex;
                  return (
                    <span
                      key={idx}
                      className={`h-[4px] w-[26px] rounded-[2px] transition-colors sm:w-[30px] ${
                        active ? "bg-[#ac91dd]" : "bg-[#eeebf3]"
                      }`}
                    />
                  );
                })}
              </div>
              <p className="text-[12px] font-medium leading-[1.55] text-[#706776]">
                Question {currentQuestionIndex} of {totalQuestions}
                <span className="mx-2">·</span>
                {currentTopic}
              </p>
            </div>

            <span className="text-[11px] leading-[1.55] text-[#796985]">
              Interview in progress
            </span>
          </div>

          {/* Conversation thread */}
          <div aria-label="Interview transcript" className="flex-1 space-y-[24px] py-[24px]">
            {turns.map((turn) => {
              if (turn.sender === "sir-bot") {
                return (
                  <article key={turn.id} className="space-y-[10px]">
                    <div className="flex items-center gap-[8px] pl-[4px]">
                      <SirBotMark className="h-[21px] w-[19px] shrink-0" />
                      <span className="text-[12px] font-semibold leading-[1.55] text-[#51425e]">
                        Sir Bot
                      </span>
                      <span className="text-[10px] leading-[1.55] text-[#796985]">
                        {turn.timestamp}
                      </span>
                    </div>
                    <p className="pl-[28px] text-[14px] leading-[1.55] text-[#3a3344] sm:pl-[31px] sm:text-[15px]">
                      {turn.content}
                    </p>
                  </article>
                );
              }

              return (
                <article key={turn.id} className="flex flex-col items-end space-y-[8px]">
                  <div className="flex items-center gap-[14px] pr-[6px]">
                    <span className="text-[12px] font-medium leading-[1.55] text-[#655273]">
                      You
                    </span>
                    <span className="text-[10px] leading-[1.55] text-[#796985]">
                      {turn.timestamp}
                    </span>
                  </div>
                  <div className="w-full max-w-[700px] rounded-[14px] bg-[#f2edf9] px-[18px] py-[14px] sm:px-[20px] sm:py-[15px]">
                    <p className="whitespace-pre-wrap text-[14px] leading-[1.55] text-[#51465b]">
                      {turn.content}
                    </p>
                  </div>
                </article>
              );
            })}
            <div ref={threadEndRef} />
          </div>

          {/* Answer composer & coaching hint */}
          <div className="mt-auto shrink-0 pt-2">
            <div className="rounded-[16px] border border-[#e6e1ed] bg-[#f8f7fa] px-[16px] pt-[14px] pb-[12px] transition-colors focus-within:border-[#bda5db] focus-within:bg-[#fbfafd] sm:px-[19px]">
              <label htmlFor="interview-answer-input" className="sr-only">
                Your interview answer
              </label>
              <textarea
                id="interview-answer-input"
                ref={composerRef}
                rows={2}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleComposerKeyDown}
                placeholder="Take your time. Type your answer…"
                className="w-full resize-none bg-transparent text-[14px] leading-[1.55] text-[#3a3344] placeholder:text-[#796985] focus:outline-none"
              />

              <div className="mt-[6px] flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-[10px]">
                  {showVoiceShortcut ? (
                    <button
                      type="button"
                      onClick={handleToggleMic}
                      aria-pressed={isRecording}
                      aria-label={
                        isRecording ? "Stop voice dictation" : "Dictate answer by voice"
                      }
                      className={`-ml-1.5 inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[8px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7453a6] ${
                        isRecording ? "bg-[#e7dbf8]" : "hover:bg-[#ece6f5]"
                      }`}
                    >
                      <img
                        src="/assets/practice/conv-mic.svg"
                        alt=""
                        width={19}
                        height={19}
                        className="shrink-0"
                      />
                    </button>
                  ) : null}
                  <span className="truncate text-[10px] leading-[1.55] text-[#796985]">
                    {micHint ?? "Shift + Enter for a new line"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!draft.trim()}
                  className="btn-tactile group inline-flex h-[34px] min-w-[96px] shrink-0 cursor-pointer items-center justify-between gap-3 rounded-[10px] bg-[#ccbdf4] px-[16px] text-[12px] font-semibold text-[#3a2a50] hover:bg-[#bea9ee] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7453a6] disabled:cursor-not-allowed disabled:opacity-55 sm:min-w-[100px] sm:px-[18px]"
                >
                  <span>Send</span>
                  <img
                    src="/assets/practice/conv-send-arrow.svg"
                    alt=""
                    width={16}
                    height={16}
                    className="hover-arrow-shift shrink-0"
                  />
                </button>
              </div>
            </div>

            {showStarTips ? (
              <div className="mt-[12px] flex items-center gap-[10px] pl-[6px]">
                <img
                  src="/assets/practice/conv-tip-bulb.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="shrink-0"
                />
                <p className="text-[11px] leading-[1.55] text-[#796985]">
                  Coach tip: Use STAR — Situation, Task, Action, Result.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Screen 03 Desktop Drag-Resizable Live Score Preview Panel */}
      {scorePanelOpen ? (
        <>
          <ResizeHandle
            ariaLabel="Resize live score preview panel"
            value={scoreDrawerWidth}
            min={MIN_SCORE_DRAWER_WIDTH}
            max={MAX_SCORE_DRAWER_WIDTH}
            defaultValue={DEFAULT_SCORE_DRAWER_WIDTH}
            growDirection="left"
            onChange={setScoreDrawerWidth}
            className="-mr-[3px]"
          />

          <aside
            ref={drawerRef}
            aria-label="Live score preview"
            style={{ width: `${scoreDrawerWidth}px` }}
            className="hidden h-full shrink-0 border-l border-[#e8e1f0] bg-[#fcfafe] lg:flex lg:flex-col"
          >
            {renderScorePanelBody(false)}
          </aside>

          {/* Mobile / Tablet Rising Bottom Sheet (Figma 245:8118) */}
          <div
            className="fixed inset-0 z-40 flex items-end justify-center lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Live score preview"
          >
            <div
              className="fixed inset-0 bg-[#141118]/50 backdrop-blur-[2px]"
              onClick={() => onToggleScorePanel(false)}
            />
            <div className="relative z-10 max-h-[86dvh] w-full max-w-[540px] overflow-hidden rounded-t-[24px] border-t border-[#e8e1f0] bg-white shadow-2xl">
              {renderScorePanelBody(true)}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
