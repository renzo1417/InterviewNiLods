"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { SirBotMark } from "@/components/landing/SirBotMark";
import {
  DIFFICULTY_OPTIONS,
  ESTIMATED_MINUTES_BY_RANGE,
  JOB_ROLE_OPTIONS,
  QUESTION_RANGE_OPTIONS,
  TONE_OPTIONS,
  type CoachTone,
  type InterviewDifficulty,
  type InterviewSetupConfig,
  type JobRole,
  type QuestionRange,
} from "./practice-config";

interface InterviewSetupViewProps {
  config: InterviewSetupConfig;
  onChangeConfig: (next: InterviewSetupConfig) => void;
  onStartInterview: () => void;
}

interface SetupDropdownProps<T extends string> {
  label: string;
  value: T;
  options: ReadonlyArray<T>;
  onSelect: (next: T) => void;
  variant?: "large" | "compact";
  leadingIconSrc?: string;
}

/**
 * Accessible custom dropdown matching Figma's rounded lavender-bordered select controls.
 */
function SetupDropdown<T extends string>({
  label,
  value,
  options,
  onSelect,
  variant = "compact",
  leadingIconSrc,
}: SetupDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonId = useId();
  const listboxId = useId();

  useEffect(() => {
    if (!open) return;
    const handleOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    window.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const isLarge = variant === "large";

  return (
    <div ref={rootRef} className="relative">
      <span
        id={buttonId}
        className="block text-[12px] font-medium leading-[1.45] text-[#776a81]"
      >
        {label}
      </span>

      <button
        type="button"
        aria-labelledby={buttonId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((prev) => !prev)}
        className={`mt-[8px] flex w-full cursor-pointer items-center justify-between transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7453a6] ${
          isLarge
            ? "h-[49px] rounded-[10px] border border-[#e7e0ef] bg-[#fcfafe] px-[14px] hover:border-[#cfc1e2]"
            : "h-[38px] rounded-[7px] border border-[#ddd1ed] bg-white px-[14px] hover:border-[#bba4db]"
        }`}
      >
        <span className="flex min-w-0 items-center gap-[12px]">
          {leadingIconSrc ? (
            <img src={leadingIconSrc} alt="" width={20} height={20} className="shrink-0" />
          ) : null}
          <span
            className={`truncate ${
              isLarge
                ? "text-[14px] font-medium text-[#4c3e59]"
                : "text-[12px] font-normal text-[#796985]"
            }`}
          >
            {value}
          </span>
        </span>
        <img
          src="/assets/practice/setup-chevron.svg"
          alt=""
          width={18}
          height={18}
          className={`shrink-0 transition-transform duration-200 motion-reduce:transition-none ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-labelledby={buttonId}
          className="absolute left-0 z-30 mt-1.5 max-h-56 w-full min-w-[140px] overflow-y-auto rounded-[10px] border border-[#ddd1ed] bg-white p-1.5 shadow-[0_12px_28px_rgba(66,48,82,0.12)]"
        >
          {options.map((option) => {
            const selected = option === value;
            return (
              <li key={option} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(option);
                    setOpen(false);
                  }}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-[7px] px-3 py-2 text-left text-[13px] transition-colors ${
                    selected
                      ? "bg-[#f3eefb] font-semibold text-[#5b3d82]"
                      : "text-[#4c3e59] hover:bg-[#faf7fe]"
                  }`}
                >
                  <span>{option}</span>
                  {selected ? (
                    <span aria-hidden="true" className="text-[12px] text-[#745396]">
                      ✓
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

/**
 * Screen 01 · Before the conversation (Figma node 5:2).
 * Configure role, difficulty, question count, and coach tone before launching a session.
 */
export function InterviewSetupView({
  config,
  onChangeConfig,
  onStartInterview,
}: InterviewSetupViewProps) {
  const toneRadioRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleToneKeyDown = (index: number, event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "Home" && event.key !== "End") {
      return;
    }
    event.preventDefault();
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % TONE_OPTIONS.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + TONE_OPTIONS.length) % TONE_OPTIONS.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = TONE_OPTIONS.length - 1;

    const nextTone = TONE_OPTIONS[nextIndex];
    onChangeConfig({ ...config, tone: nextTone });
    toneRadioRefs.current[nextIndex]?.focus();
  };

  return (
    <div
      className="relative flex min-h-full flex-1 flex-col items-center justify-center overflow-x-hidden overflow-y-auto px-4 py-7 sm:px-8 sm:py-9 [@media(max-height:800px)]:py-5"
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #f5f1fc 100%)",
      }}
    >
      {/* Ambient soft violet glow blobs matching Figma setup canvas */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[512px] top-[340px] -rotate-17">
          <img src="/assets/practice/setup-ellipse-1.svg" alt="" width={1170} height={943} />
        </div>
        <div className="absolute -left-[552px] -top-[336px] -rotate-17">
          <img src="/assets/practice/setup-ellipse-2.svg" alt="" width={1191} height={945} />
        </div>
        <div className="absolute -left-[552px] -top-[296px] -rotate-17">
          <img src="/assets/practice/setup-ellipse-4.svg" alt="" width={1191} height={862} />
        </div>
        <div className="absolute -right-[410px] -top-[460px] -rotate-29">
          <img src="/assets/practice/setup-ellipse-3.svg" alt="" width={1170} height={955} />
        </div>
      </div>

      {/* Main centered setup flow */}
      <div className="relative z-10 flex w-full max-w-[780px] flex-col items-center">
        <SirBotMark className="h-[118px] w-[108px] sm:h-[148px] sm:w-[134px] xl:h-[160px] xl:w-[145px] [@media(max-height:820px)]:h-[112px] [@media(max-height:820px)]:w-[102px]" />

        <h1 className="mt-4 text-center text-[26px] font-semibold leading-[1.2] tracking-[-0.035em] text-[#30263c] sm:text-[35px] [@media(max-height:820px)]:mt-3 [@media(max-height:820px)]:text-[30px]">
          A little practice helps build a lot more confidence.
        </h1>

        <p className="mt-3 max-w-[740px] text-center text-[14px] leading-[1.45] text-[#796985] sm:text-[16px]">
          Meet Sir Bot, your AI interview coach. Set the scene, find your words,
          <br className="hidden sm:inline" />{" "}
          and walk into your next interview feeling ready.
        </p>

        {/* Make it your interview card */}
        <section
          aria-label="Interview configuration"
          className="mt-7 w-full max-w-[760px] rounded-[20px] border border-[#e7e0f0] bg-white p-5 shadow-[0_10px_34px_0_rgba(72,48,94,0.04)] sm:p-[27px] [@media(max-height:820px)]:mt-5"
        >
          <h2 className="text-[16px] font-semibold leading-[1.45] text-[#46384f]">
            Make it your interview
          </h2>
          <p className="mt-[4px] text-[12px] leading-[1.45] text-[#796985]">
            Choose what feels right. You can try something different next time.
          </p>

          {/* Job role selector */}
          <div className="mt-[22px]">
            <SetupDropdown<JobRole>
              label="Job role"
              variant="large"
              value={config.role}
              options={JOB_ROLE_OPTIONS}
              leadingIconSrc="/assets/practice/setup-briefcase.svg"
              onSelect={(role) => onChangeConfig({ ...config, role })}
            />
          </div>

          {/* Difficulty, Questions & Coach's tone row */}
          <div className="mt-[22px] grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-[120px_120px_1fr] md:items-end md:gap-x-10 lg:gap-x-12">
            <SetupDropdown<InterviewDifficulty>
              label="Difficulty"
              value={config.difficulty}
              options={DIFFICULTY_OPTIONS}
              onSelect={(difficulty) => onChangeConfig({ ...config, difficulty })}
            />

            <SetupDropdown<QuestionRange>
              label="Questions"
              value={config.questionRange}
              options={QUESTION_RANGE_OPTIONS}
              onSelect={(questionRange) => onChangeConfig({ ...config, questionRange })}
            />

            <div className="sm:col-span-2 md:col-span-1">
              <span
                id="coach-tone-label"
                className="block text-[12px] font-medium leading-[1.45] text-[#776a81]"
              >
                Coach’s tone
              </span>
              <div
                role="radiogroup"
                aria-labelledby="coach-tone-label"
                className="mt-[8px] grid h-[44px] grid-cols-3 rounded-[10px] bg-[#f7f4fa] p-[4px]"
              >
                {TONE_OPTIONS.map((tone: CoachTone, index: number) => {
                  const isActive = config.tone === tone;
                  return (
                    <button
                      key={tone}
                      ref={(el) => {
                        toneRadioRefs.current[index] = el;
                      }}
                      type="button"
                      role="radio"
                      aria-checked={isActive}
                      tabIndex={isActive ? 0 : -1}
                      onKeyDown={(e) => handleToneKeyDown(index, e)}
                      onClick={() => onChangeConfig({ ...config, tone })}
                      className={`flex h-full cursor-pointer items-center justify-center rounded-[7px] text-[12px] leading-[1.45] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7453a6] ${
                        isActive
                          ? "border border-[#ddd1ed] bg-white font-semibold text-[#745396] shadow-[0_1px_2px_rgba(72,48,94,0.06)]"
                          : "border border-transparent font-normal text-[#796985] hover:text-[#46384f]"
                      }`}
                    >
                      {tone}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-[22px] h-px bg-[#eee8f3]" />

          {/* Bottom bar */}
          <div className="mt-[15px] flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-[9px]">
              <img src="/assets/practice/setup-clock.svg" alt="" width={17} height={17} className="shrink-0" />
              <span className="text-[11px] leading-[1.45] text-[#796985]">
                {ESTIMATED_MINUTES_BY_RANGE[config.questionRange]}
              </span>
            </div>

            <button
              type="button"
              onClick={onStartInterview}
              className="btn-tactile group flex h-[40px] w-full cursor-pointer items-center justify-between gap-4 rounded-[11px] bg-[#c7b6f0] px-[21px] text-[13px] font-semibold text-[#423052] hover:bg-[#bca9eb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7453a6] sm:w-[188px]"
            >
              <span>Start interview</span>
              <img
                src="/assets/practice/setup-arrow-right.svg"
                alt=""
                width={17}
                height={17}
                className="hover-arrow-shift shrink-0"
              />
            </button>
          </div>
        </section>

        {/* Three trust cues */}
        <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-[11px] leading-[1.45] text-[#796985] sm:gap-x-14 [@media(max-height:820px)]:mt-5">
          <li className="flex items-center gap-[10px]">
            <img src="/assets/practice/setup-check.svg" alt="" width={17} height={17} className="shrink-0" />
            <span>Personalized questions</span>
          </li>
          <li className="flex items-center gap-[10px]">
            <img src="/assets/practice/setup-chart.svg" alt="" width={17} height={17} className="shrink-0" />
            <span>Actionable feedback</span>
          </li>
          <li className="flex items-center gap-[10px]">
            <img src="/assets/practice/setup-shield.svg" alt="" width={17} height={17} className="shrink-0" />
            <span>A judgment-free space</span>
          </li>
        </ul>

        <p className="mt-6 text-center text-[12px] leading-[1.45] text-[#796985] sm:mt-8 [@media(max-height:820px)]:mt-4">
          No pressure. No perfect answers. Just progress.
        </p>
      </div>
    </div>
  );
}
