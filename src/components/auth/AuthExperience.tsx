"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SirBotMark } from "@/components/landing/SirBotMark";
import { MOTION, REDUCED_MOTION_QUERY, gsap } from "@/lib/gsap";
import { AuthShowcasePanel } from "./AuthShowcasePanel";
import {
  AUTH_MODE_CONTENT,
  DEMO_SESSION_STORAGE_KEY,
  type AuthMode,
  type DemoUserSession,
} from "./auth-config";

interface AuthExperienceProps {
  initialMode?: AuthMode;
}

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

type FieldKey = keyof FormValues;
type FormErrors = Partial<Record<FieldKey, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INPUT_BASE_CLASS =
  "flex h-[46px] w-full items-center rounded-[10px] border bg-[#f9f7fc] px-[14px] transition-[border-color,background-color,box-shadow] duration-150 focus-within:border-[#7453a6] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#7453a6]/15";

interface AuthFieldProps {
  id: string;
  name: FieldKey;
  label: string;
  type?: "text" | "email";
  autoComplete?: string;
  placeholder: string;
  value: string;
  error?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  onChange: (field: FieldKey, value: string) => void;
}

function AuthField({
  id,
  name,
  label,
  type = "text",
  autoComplete,
  placeholder,
  value,
  error,
  inputRef,
  onChange,
}: AuthFieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-[7px]">
      <label htmlFor={id} className="text-[13px] font-medium leading-[1.4] text-[#3b3048]">
        {label}
      </label>
      <div
        className={`${INPUT_BASE_CLASS} ${
          error ? "border-[#dc2626] bg-[#fef2f2]/40" : "border-[#e3daf1]"
        }`}
      >
        <input
          ref={inputRef}
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(e) => onChange(name, e.target.value)}
          className="h-full w-full bg-transparent text-[14px] font-normal leading-[1.45] text-[#242126] outline-none placeholder:text-[#8d819c]"
        />
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-[12px] leading-[1.4] text-[#dc2626]">
          {error}
        </p>
      )}
    </div>
  );
}

export function AuthExperience({ initialMode = "signup" }: AuthExperienceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const baseId = useId();
  const formBodyRef = useRef<HTMLDivElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const signinTabRef = useRef<HTMLButtonElement>(null);
  const signupTabRef = useRef<HTMLButtonElement>(null);

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [values, setValues] = useState<FormValues>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSentTo, setResetSentTo] = useState<string | null>(null);

  const content = AUTH_MODE_CONTENT[mode];

  useEffect(() => {
    document.title = AUTH_MODE_CONTENT[mode].documentTitle;
  }, [mode]);

  const animateFormSwap = () => {
    const el = formBodyRef.current;
    if (!el) return;
    const reduceMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: reduceMotion ? 0 : 8 },
      {
        autoAlpha: 1,
        y: 0,
        duration: reduceMotion ? 0.12 : 0.24,
        ease: MOTION.ease.out,
        clearProps: "opacity,visibility,transform",
      }
    );
  };

  const syncUrlForMode = (nextMode: AuthMode) => {
    if (typeof window === "undefined") return;
    const routeUrl =
      pathname === "/auth"
        ? `/auth?mode=${nextMode}`
        : nextMode === "signup"
        ? "/signup"
        : nextMode === "signin"
        ? "/login"
        : "/forgot-password";
    window.history.replaceState(null, "", routeUrl);
  };

  const switchMode = (nextMode: AuthMode) => {
    if (nextMode === mode && !resetSentTo) return;
    setMode(nextMode);
    setErrors({});
    setShowPassword(false);
    setResetSentTo(null);
    setIsSubmitting(false);
    syncUrlForMode(nextMode);
    requestAnimationFrame(animateFormSwap);
  };

  const handleFieldChange = (field: FieldKey, nextValue: string) => {
    setValues((prev) => ({ ...prev, [field]: nextValue }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};
    if (mode === "signup") {
      if (!values.firstName.trim()) {
        nextErrors.firstName = "First name is required.";
      }
      if (!values.lastName.trim()) {
        nextErrors.lastName = "Last name is required.";
      }
    }

    const emailTrimmed = values.email.trim();
    if (!emailTrimmed) {
      nextErrors.email = "Email is required.";
    } else if (!EMAIL_PATTERN.test(emailTrimmed)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (mode === "signup") {
      if (values.password.length < 8) {
        nextErrors.password = "Password must be at least 8 characters.";
      }
    } else if (mode === "signin" && !values.password) {
      nextErrors.password = "Password is required.";
    }

    return nextErrors;
  };

  const focusFirstError = (nextErrors: FormErrors) => {
    const order: Array<[FieldKey, React.RefObject<HTMLInputElement | null>]> = [
      ["firstName", firstNameRef],
      ["lastName", lastNameRef],
      ["email", emailRef],
      ["password", passwordRef],
    ];
    for (const [key, ref] of order) {
      if (nextErrors[key]) {
        ref.current?.focus();
        return;
      }
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      focusFirstError(nextErrors);
      return;
    }

    setIsSubmitting(true);

    window.setTimeout(() => {
      if (mode === "forgot") {
        setIsSubmitting(false);
        setResetSentTo(values.email.trim());
        requestAnimationFrame(animateFormSwap);
        return;
      }

      const fallbackFirst = values.email.trim().split("@")[0] || "Learner";
      const session: DemoUserSession = {
        firstName: values.firstName.trim() || fallbackFirst,
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        signedInAt: new Date().toISOString(),
      };

      try {
        window.localStorage.setItem(DEMO_SESSION_STORAGE_KEY, JSON.stringify(session));
      } catch {
        // Ignore storage errors in restricted browsing contexts
      }

      router.push("/practice");
    }, 320);
  };

  const activeStepIndex = mode === "forgot" && resetSentTo ? 1 : 0;
  const isSignupFormReady =
    mode === "signup" &&
    values.firstName.trim().length > 0 &&
    values.lastName.trim().length > 0 &&
    EMAIL_PATTERN.test(values.email.trim()) &&
    values.password.length >= 8;
  const isSigninFormReady =
    mode === "signin" &&
    EMAIL_PATTERN.test(values.email.trim()) &&
    values.password.length > 0;
  const completedSteps =
    mode === "forgot" && resetSentTo
      ? 1
      : isSignupFormReady || isSigninFormReady
      ? 1
      : 0;
  const effectiveActiveStep = completedSteps === 1 ? 1 : activeStepIndex;

  const emailId = `${baseId}-email`;
  const passwordId = `${baseId}-password`;
  const passwordErrorId = `${passwordId}-error`;
  const passwordHintId = `${passwordId}-hint`;

  return (
    <main className="flex min-h-dvh w-full flex-col bg-white lg:h-dvh lg:flex-row lg:overflow-hidden [@media(max-height:600px)]:h-auto [@media(max-height:600px)]:overflow-visible">
      {/* Left: Asymmetric larger showcase panel (exact 836/1440 ratio, fills 100dvh cleanly across displays) */}
      <div className="order-2 w-full p-3 sm:p-5 lg:order-1 lg:h-full lg:w-[59.4444%] lg:shrink-0 lg:p-[clamp(12px,1.4vw,20px)] lg:pr-0">
        <AuthShowcasePanel
          mode={mode}
          activeStepIndex={effectiveActiveStep}
          completedSteps={completedSteps}
        />
      </div>

      {/* Right: Clean borderless auth canvas (no card container) */}
      <section
        aria-label={content.form.title}
        className="order-1 flex flex-1 flex-col justify-between bg-white px-5 py-6 sm:px-10 sm:py-8 lg:order-2 lg:h-full lg:overflow-y-auto lg:px-[clamp(28px,2.8vw,48px)] lg:py-[clamp(20px,3.2dvh,36px)]"
      >
        {/* Top bar matching Figma 52:37: Back link + Sign in / Sign up mode toggle */}
        <header className="flex w-full items-center justify-between gap-4">
          <Link
            href="/"
            className="group inline-flex items-center gap-[6px] rounded-[7px] py-1 pr-2 text-[12.5px] font-medium leading-[1.4] text-[#796985] transition-colors duration-150 hover:text-[#4c2b78] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7453a6]"
          >
            <img
              alt=""
              src="/assets/auth/icon-back-arrow.svg"
              width={14}
              height={14}
              className="hover-arrow-shift block size-[14px] shrink-0 transition-transform group-hover:-translate-x-[2px]"
            />
            <span className="whitespace-nowrap">Back to landing</span>
          </Link>

          {(mode === "signin" || mode === "signup") && (
            <div
              role="tablist"
              aria-label="Authentication mode"
              className="inline-flex items-center gap-[2px] rounded-[9px] bg-[#f4effa] p-[3px]"
            >
              {(
                [
                  { key: "signin", label: "Sign in", ref: signinTabRef },
                  { key: "signup", label: "Sign up", ref: signupTabRef },
                ] as const
              ).map((tab) => {
                const isActive = mode === tab.key;
                return (
                  <button
                    key={tab.key}
                    ref={tab.ref}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => switchMode(tab.key)}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                        e.preventDefault();
                        const next = tab.key === "signin" ? "signup" : "signin";
                        switchMode(next);
                        requestAnimationFrame(() => {
                          (next === "signin" ? signinTabRef : signupTabRef).current?.focus();
                        });
                      }
                    }}
                    className={`cursor-pointer rounded-[7px] border px-[12px] py-[5px] text-[12px] leading-[1.35] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#7453a6] ${
                      isActive
                        ? "border-[#ddd1ed] bg-white font-semibold text-[#4c2b78] shadow-[0_1px_2px_rgba(32,33,36,0.04)]"
                        : "border-transparent font-medium text-[#796985] hover:text-[#4c2b78]"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}
        </header>

        {/* Centered borderless form stack directly on white canvas */}
        <div className="flex flex-1 items-center justify-center py-8 lg:py-4">
          <div
            ref={formBodyRef}
            className="w-full max-w-[clamp(360px,27.5vw,440px)] lg:pt-[8px]"
          >
            {/* Mobile-only compact brand emblem so users on small viewports see brand identity above fold */}
            <div className="mb-5 flex items-center justify-center gap-2 lg:hidden">
              <span aria-hidden="true" className="shrink-0">
                <SirBotMark className="h-[28px] w-[25px] rounded-[5px]" alt="" />
              </span>
              <span className="text-[15px] font-semibold tracking-[-0.015em] text-[#242126]">
                Interview ni Lods
              </span>
            </div>

            {mode === "forgot" && resetSentTo ? (
              <div className="flex flex-col items-center gap-[24px] text-center">
                <div className="flex flex-col items-center gap-[8px]">
                  <div className="mb-1 inline-flex size-[44px] items-center justify-center rounded-full bg-[#f4effa] text-[#57367d]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M5 13L9 17L19 7"
                        stroke="currentColor"
                        strokeWidth="2.1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h1 className="text-[28px] font-semibold leading-[1.22] tracking-[-0.7px] text-[#17151a]">
                    Check your inbox
                  </h1>
                  <p className="text-[14px] font-normal leading-[1.45] text-[#6a5e78]">
                    We sent a password reset link to{" "}
                    <span className="font-medium text-[#242126]">{resetSentTo}</span>.
                  </p>
                </div>

                <div className="flex w-full flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => switchMode("signin")}
                    className="btn-tactile inline-flex h-[46px] w-full cursor-pointer items-center justify-center rounded-[10px] bg-[#57367d] text-[14px] font-semibold leading-[1.4] text-white hover:bg-[#492c6b]"
                  >
                    Back to log in
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setResetSentTo(null);
                      requestAnimationFrame(animateFormSwap);
                    }}
                    className="cursor-pointer py-1 text-[13px] font-medium text-[#796985] hover:text-[#57367d]"
                  >
                    Use a different email
                  </button>
                </div>
              </div>
            ) : (
              <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-[24px]">
                {/* Centered Heading + Subtitle */}
                <div className="flex flex-col gap-[8px] text-center">
                  <h1 className="text-[28px] font-semibold leading-[1.22] tracking-[-0.7px] text-[#17151a]">
                    {content.form.title}
                  </h1>
                  <p className="text-[14px] font-normal leading-[1.45] text-[#6a5e78]">
                    {content.form.subtitle}
                  </p>
                </div>

                {/* Borderless Form Inputs */}
                <div className="flex flex-col gap-[16px]">
                  {mode === "signup" && (
                    <div className="grid grid-cols-2 gap-[12px]">
                      <AuthField
                        id={`${baseId}-first-name`}
                        name="firstName"
                        label="First Name"
                        autoComplete="given-name"
                        placeholder="Alex"
                        value={values.firstName}
                        error={errors.firstName}
                        inputRef={firstNameRef}
                        onChange={handleFieldChange}
                      />
                      <AuthField
                        id={`${baseId}-last-name`}
                        name="lastName"
                        label="Last Name"
                        autoComplete="family-name"
                        placeholder="Rivera"
                        value={values.lastName}
                        error={errors.lastName}
                        inputRef={lastNameRef}
                        onChange={handleFieldChange}
                      />
                    </div>
                  )}

                  <AuthField
                    id={emailId}
                    name="email"
                    label="Email"
                    type="email"
                    autoComplete="email"
                    placeholder="alex.rivera@gmail.com"
                    value={values.email}
                    error={errors.email}
                    inputRef={emailRef}
                    onChange={handleFieldChange}
                  />

                  {mode !== "forgot" && (
                    <div className="flex flex-col gap-[7px]">
                      <div className="flex items-center justify-between gap-2">
                        <label
                          htmlFor={passwordId}
                          className="text-[13px] font-medium leading-[1.4] text-[#3b3048]"
                        >
                          Password
                        </label>
                        {mode === "signin" && (
                          <button
                            type="button"
                            onClick={() => switchMode("forgot")}
                            className="cursor-pointer text-[12.5px] font-medium leading-[1.4] text-[#57367d] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7453a6]"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>

                      <div
                        className={`${INPUT_BASE_CLASS} gap-[10px] ${
                          errors.password
                            ? "border-[#dc2626] bg-[#fef2f2]/40"
                            : "border-[#e3daf1]"
                        }`}
                      >
                        <input
                          ref={passwordRef}
                          id={passwordId}
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete={mode === "signup" ? "new-password" : "current-password"}
                          placeholder="Enter your password"
                          value={values.password}
                          aria-invalid={errors.password ? true : undefined}
                          aria-describedby={
                            mode === "signup"
                              ? passwordHintId
                              : errors.password
                              ? passwordErrorId
                              : undefined
                          }
                          onChange={(e) => handleFieldChange("password", e.target.value)}
                          className="h-full min-w-0 flex-1 bg-transparent text-[14px] font-normal leading-[1.45] text-[#242126] outline-none placeholder:text-[#8d819c]"
                        />

                        <button
                          type="button"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          aria-pressed={showPassword}
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="relative inline-flex size-[24px] shrink-0 cursor-pointer items-center justify-center rounded-[6px] transition-opacity hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#7453a6]"
                        >
                          <img
                            alt=""
                            src="/assets/auth/icon-eye.svg"
                            width={17}
                            height={17}
                            className="block size-[17px] shrink-0"
                          />
                          {showPassword && (
                            <svg
                              aria-hidden="true"
                              width="17"
                              height="17"
                              viewBox="0 0 17 17"
                              fill="none"
                              className="pointer-events-none absolute inset-0 m-auto"
                            >
                              <path
                                d="M3 14L14 3"
                                stroke="#796985"
                                strokeWidth="1.35"
                                strokeLinecap="round"
                              />
                            </svg>
                          )}
                        </button>
                      </div>

                      {mode === "signup" && (
                        <p
                          id={passwordHintId}
                          role={errors.password ? "alert" : undefined}
                          className={`text-[12px] font-normal leading-[1.4] ${
                            errors.password ? "text-[#dc2626]" : "text-[#796985]"
                          }`}
                        >
                          {errors.password || "Must be at least 8 characters."}
                        </p>
                      )}

                      {errors.password && mode === "signin" && (
                        <p
                          id={passwordErrorId}
                          role="alert"
                          className="text-[12px] leading-[1.4] text-[#dc2626]"
                        >
                          {errors.password}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Primary CTA Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-[46px] w-full cursor-pointer items-center justify-center rounded-[10px] bg-[#57367d] px-4 text-[14px] font-semibold leading-[1.4] text-white transition-[background-color,transform] duration-150 hover:bg-[#492c6b] active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7453a6] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? content.form.pendingLabel : content.form.submitLabel}
                </button>

                {/* Bottom account switch link */}
                <p className="flex items-center justify-center gap-[5px] text-[13px] leading-[1.4]">
                  <span className="font-normal text-[#796985]">{content.form.footerPrompt}</span>
                  <button
                    type="button"
                    onClick={() => switchMode(content.form.footerTargetMode)}
                    className="cursor-pointer font-semibold text-[#57367d] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7453a6]"
                  >
                    {content.form.footerActionLabel}
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Minimal visual balance spacer at bottom on desktop so vertical centering matches 1000px Figma frame */}
        <div aria-hidden="true" className="hidden h-[20px] lg:block" />
      </section>
    </main>
  );
}
