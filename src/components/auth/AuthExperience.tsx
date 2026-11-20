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
  initialSigninError?: boolean;
}

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
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
  hasBannerError?: boolean;
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
  hasBannerError,
  inputRef,
  onChange,
}: AuthFieldProps) {
  const errorId = `${id}-error`;
  const isInvalid = Boolean(error || hasBannerError);
  return (
    <div className="flex flex-col gap-[7px]">
      <label htmlFor={id} className="text-[13px] font-medium leading-[1.4] text-[#3b3048]">
        {label}
      </label>
      <div
        className={`${INPUT_BASE_CLASS} ${
          isInvalid ? "border-[#e6b4bd] bg-[#fdf2f4]" : "border-[#e3daf1]"
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
          aria-invalid={isInvalid || undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(e) => onChange(name, e.target.value)}
          className="h-full w-full bg-transparent text-[14px] font-normal leading-[1.45] text-[#242126] outline-none placeholder:text-[#8d819c]"
        />
      </div>
      {error ? (
        <p id={errorId} role="alert" className="text-[12px] leading-[1.4] text-[#9e3a4a]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Complete dynamic & responsive Auth flow implementing all Figma screens:
 * - Sign up (52:3) -> Verify email 6-digit OTP (243:8162)
 * - Sign in (52:82) & Sign in error state (243:8223)
 * - Forgot password (52:150) -> Check your email (243:7987) -> Set new password (243:8043) -> Password updated (243:8113)
 * - Compact purple gradient mobile hero banner (< lg) matching Figma Mobile Auth screens (246:8130..246:8229)
 */
export function AuthExperience({
  initialMode = "signup",
  initialSigninError = false,
}: AuthExperienceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const baseId = useId();
  const formBodyRef = useRef<HTMLDivElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const signinTabRef = useRef<HTMLButtonElement>(null);
  const signupTabRef = useRef<HTMLButtonElement>(null);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [values, setValues] = useState<FormValues>({
    firstName: "",
    lastName: "",
    email: initialSigninError ? "alex.rivera@gmail.com" : "",
    password: initialSigninError ? "wrongpass1" : "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>(
    initialSigninError
      ? { password: "Check caps lock or try resetting your password." }
      : {}
  );
  const [signinBannerError, setSigninBannerError] = useState<string | null>(
    initialSigninError
      ? "We couldn’t match that email and password. Double-check your details or reset your password."
      : null
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP state for Verify Email (243:8162)
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendSeconds, setResendSeconds] = useState<number>(42);
  const [resentNotice, setResentNotice] = useState<string | null>(null);

  const content = AUTH_MODE_CONTENT[mode];

  useEffect(() => {
    document.title = AUTH_MODE_CONTENT[mode].documentTitle;
  }, [mode]);

  useEffect(() => {
    if ((mode !== "verify-email" && mode !== "check-email") || resendSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setResendSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [mode, resendSeconds]);

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
    let routeUrl = `/auth?mode=${nextMode}`;
    if (pathname !== "/auth") {
      if (nextMode === "signup") routeUrl = "/signup";
      else if (nextMode === "signin") routeUrl = "/login";
      else if (nextMode === "forgot") routeUrl = "/forgot-password";
    }
    window.history.replaceState(null, "", routeUrl);
  };

  const switchMode = (nextMode: AuthMode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    setErrors({});
    setSigninBannerError(null);
    setOtpError(null);
    setResentNotice(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsSubmitting(false);
    if (nextMode === "verify-email" || nextMode === "check-email") {
      setResendSeconds(42);
    }
    syncUrlForMode(nextMode);
    requestAnimationFrame(animateFormSwap);
  };

  const handleFieldChange = (field: FieldKey, nextValue: string) => {
    setValues((prev) => ({ ...prev, [field]: nextValue }));
    if (signinBannerError) setSigninBannerError(null);
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const completeSignInSession = () => {
    const emailStr = values.email.trim() || "alex.rivera@gmail.com";
    const fallbackFirst = emailStr.split("@")[0] || "Learner";
    const session: DemoUserSession = {
      firstName: values.firstName.trim() || fallbackFirst,
      lastName: values.lastName.trim(),
      email: emailStr,
      signedInAt: new Date().toISOString(),
    };
    try {
      window.localStorage.setItem(DEMO_SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Ignore storage errors
    }
    router.push("/practice");
  };

  const passwordHasMinLen = values.password.length >= 8;
  const passwordHasNumOrSym = /[0-9!@#$%^&*(),.?":{}|<>_\-+=~`]/.test(values.password);
  const passwordsMatch =
    values.password.length > 0 && values.password === values.confirmPassword;

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};
    if (mode === "signup") {
      if (!values.firstName.trim()) nextErrors.firstName = "First name is required.";
      if (!values.lastName.trim()) nextErrors.lastName = "Last name is required.";
    }

    if (mode === "signup" || mode === "signin" || mode === "forgot") {
      const emailTrimmed = values.email.trim();
      if (!emailTrimmed) {
        nextErrors.email = "Email is required.";
      } else if (!EMAIL_PATTERN.test(emailTrimmed)) {
        nextErrors.email = "Enter a valid email address.";
      }
    }

    if (mode === "signup") {
      if (values.password.length < 8) {
        nextErrors.password = "Password must be at least 8 characters.";
      }
    } else if (mode === "signin") {
      if (!values.password) {
        nextErrors.password = "Password is required.";
      }
    } else if (mode === "set-password") {
      if (!passwordHasMinLen || !passwordHasNumOrSym) {
        nextErrors.password = "Use at least 8 characters with a number or symbol.";
      }
      if (!passwordsMatch) {
        nextErrors.confirmPassword = "Passwords do not match yet.";
      }
    }

    return nextErrors;
  };

  const focusFirstError = (nextErrors: FormErrors) => {
    const order: Array<[FieldKey, React.RefObject<HTMLInputElement | null>]> = [
      ["firstName", firstNameRef],
      ["lastName", lastNameRef],
      ["email", emailRef],
      ["password", passwordRef],
      ["confirmPassword", confirmPasswordRef],
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

    if (mode === "verify-email") {
      const code = otpDigits.join("");
      if (code.length < 6) {
        setOtpError("Enter all 6 digits from your verification email.");
        otpRefs.current[code.length]?.focus();
        return;
      }
      setIsSubmitting(true);
      window.setTimeout(() => {
        completeSignInSession();
      }, 300);
      return;
    }

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      if (mode === "signin") {
        setSigninBannerError(
          "We couldn’t match that email and password. Double-check your details or reset your password."
        );
      }
      focusFirstError(nextErrors);
      return;
    }

    setIsSubmitting(true);

    window.setTimeout(() => {
      if (mode === "signup") {
        setIsSubmitting(false);
        setOtpDigits(["4", "8", "2", "9", "", ""]);
        switchMode("verify-email");
        return;
      }
      if (mode === "forgot") {
        setIsSubmitting(false);
        switchMode("check-email");
        return;
      }
      if (mode === "set-password") {
        setIsSubmitting(false);
        switchMode("password-updated");
        return;
      }
      completeSignInSession();
    }, 300);
  };

  const handleOtpChange = (index: number, raw: string) => {
    const clean = raw.replace(/\D/g, "");
    if (!clean) {
      setOtpDigits((prev) => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
      return;
    }

    setOtpError(null);
    const chars = clean.slice(0, 6 - index).split("");
    setOtpDigits((prev) => {
      const next = [...prev];
      chars.forEach((ch, offset) => {
        next[index + offset] = ch;
      });
      return next;
    });
    const nextFocus = Math.min(5, index + chars.length);
    otpRefs.current[nextFocus]?.focus();
  };

  const handleOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (event.key === "ArrowLeft" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  // Compute step progression for the left showcase bar (0..3)
  let completedSteps = 0;
  let effectiveActiveStep = 0;

  if (mode === "verify-email" || mode === "check-email") {
    completedSteps = 1;
    effectiveActiveStep = 1;
  } else if (mode === "set-password") {
    completedSteps = 2;
    effectiveActiveStep = 2;
  } else if (mode === "password-updated") {
    completedSteps = 3;
    effectiveActiveStep = 3;
  } else {
    const isSignupReady =
      mode === "signup" &&
      values.firstName.trim().length > 0 &&
      values.lastName.trim().length > 0 &&
      EMAIL_PATTERN.test(values.email.trim()) &&
      values.password.length >= 8;
    const isSigninReady =
      mode === "signin" &&
      EMAIL_PATTERN.test(values.email.trim()) &&
      values.password.length > 0 &&
      !signinBannerError;
    completedSteps = isSignupReady || isSigninReady ? 1 : 0;
    effectiveActiveStep = completedSteps === 1 ? 1 : 0;
  }

  const displayEmail = values.email.trim() || "alex.rivera@gmail.com";
  const emailId = `${baseId}-email`;
  const passwordId = `${baseId}-password`;
  const confirmPasswordId = `${baseId}-confirm-password`;
  const passwordErrorId = `${passwordId}-error`;
  const passwordHintId = `${passwordId}-hint`;

  const modeSwitcherTabs = (mode === "signin" || mode === "signup") && (
    <div
      role="tablist"
      aria-label="Authentication mode"
      className="grid w-full grid-cols-2 items-center gap-[2px] rounded-[9px] bg-[#f4effa] p-[3px] lg:inline-flex lg:w-auto"
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
            className={`cursor-pointer rounded-[7px] border px-[12px] py-[6px] text-[12px] leading-[1.35] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#7453a6] lg:py-[5px] ${
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
  );

  return (
    <main className="flex min-h-dvh w-full flex-col bg-white lg:h-dvh lg:flex-row lg:overflow-hidden [@media(max-height:600px)]:h-auto [@media(max-height:600px)]:overflow-visible">
      {/* Mobile-only compact purple gradient hero banner (Figma 246:8130..246:8229) */}
      <div
        className="flex flex-col justify-between gap-6 px-5 py-6 text-white lg:hidden"
        style={{
          background: "linear-gradient(145deg, #8a6ec7 0%, #57367d 58%, #1c1726 100%)",
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SirBotMark className="h-[29px] w-[26px] rounded-[5px]" alt="" />
            <span className="text-[14px] font-semibold tracking-[-0.015em] text-white">
              Interview ni Lods
            </span>
          </div>
          <Link
            href="/"
            className="text-[12px] font-medium text-[#f5f4f8]/90 hover:text-white"
          >
            ← Landing
          </Link>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#d5cbe6]">
            {content.mobileEyebrow}
          </p>
          <h2 className="text-[22px] font-bold leading-[1.2] tracking-[-0.02em] text-white">
            {content.showcase.headlineBottom}
          </h2>
        </div>
      </div>

      {/* Desktop Left Showcase Panel */}
      <div className="hidden lg:block lg:h-full lg:w-[59.4444%] lg:shrink-0 lg:p-[clamp(12px,1.4vw,20px)] lg:pr-0">
        <AuthShowcasePanel
          mode={mode}
          activeStepIndex={effectiveActiveStep}
          completedSteps={completedSteps}
        />
      </div>

      {/* Right Auth Canvas */}
      <section
        aria-label={content.form.title}
        className="flex flex-1 flex-col justify-between bg-white px-5 py-6 sm:px-10 sm:py-8 lg:h-full lg:overflow-y-auto lg:px-[clamp(28px,2.8vw,48px)] lg:py-[clamp(20px,3.2dvh,36px)]"
      >
        {/* Desktop top bar */}
        <header className="hidden w-full items-center justify-between gap-4 lg:flex">
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

          {modeSwitcherTabs}
        </header>

        {/* Centered borderless form stack */}
        <div className="flex flex-1 items-start justify-center py-2 sm:items-center lg:py-4">
          <div
            ref={formBodyRef}
            className="w-full max-w-[clamp(340px,28vw,440px)] space-y-6 lg:pt-[8px]"
          >
            {/* Mobile mode switcher pill */}
            {(mode === "signin" || mode === "signup") ? (
              <div className="lg:hidden">{modeSwitcherTabs}</div>
            ) : null}

            {/* ============================================================
                STATE A: CHECK YOUR EMAIL (Figma 243:7987 + Mobile 246:8229)
               ============================================================ */}
            {mode === "check-email" ? (
              <div className="flex flex-col gap-6">
                <div className="inline-flex size-[52px] items-center justify-center rounded-[12px] bg-[#eee6f8] text-[#57367d]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <path
                      d="m3 7 9 6 9-6"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div className="space-y-2">
                  <h1 className="text-[26px] font-semibold leading-[1.2] tracking-[-0.6px] text-[#17151a] sm:text-[28px]">
                    Check your inbox
                  </h1>
                  <p className="text-[14px] leading-[1.55] text-[#6a5e78]">
                    We sent a password reset link to{" "}
                    <span className="font-medium text-[#242126]">{displayEmail}</span>. Open the
                    link to choose a new password.
                  </p>
                </div>

                <div className="rounded-[12px] border border-[#e5dfec] bg-[#faf8fd] p-4">
                  <p className="text-[13px] font-semibold text-[#4d365f]">
                    Not seeing the email?
                  </p>
                  <p className="mt-1 text-[12px] leading-[1.55] text-[#796985]">
                    Check your spam or promotions folder, or request a fresh link. For your
                    privacy, we show the same confirmation for every email.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => switchMode("set-password")}
                  className="btn-tactile inline-flex h-[46px] w-full cursor-pointer items-center justify-center rounded-[12px] bg-[#57367d] px-4 text-[14px] font-semibold text-white hover:bg-[#492c6b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7453a6]"
                >
                  Open reset link
                </button>

                {resentNotice ? (
                  <p className="text-center text-[12px] font-medium text-[#5d7850]">
                    ✓ {resentNotice}
                  </p>
                ) : null}

                <div className="flex items-center justify-center gap-6 text-[13px]">
                  <button
                    type="button"
                    disabled={resendSeconds > 0}
                    onClick={() => {
                      setResendSeconds(30);
                      setResentNotice("Fresh reset link sent.");
                    }}
                    className="cursor-pointer font-semibold text-[#73518f] hover:underline disabled:cursor-default disabled:opacity-60"
                  >
                    {resendSeconds > 0
                      ? `Resend link (0:${String(resendSeconds).padStart(2, "0")})`
                      : "Resend reset link"}
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode("forgot")}
                    className="cursor-pointer text-[#796985] hover:text-[#30263c]"
                  >
                    Change email
                  </button>
                </div>
              </div>
            ) : null}

            {/* ============================================================
                STATE B: PASSWORD UPDATED (Figma 243:8113)
               ============================================================ */}
            {mode === "password-updated" ? (
              <div className="flex flex-col gap-6">
                <div className="inline-flex size-[56px] items-center justify-center rounded-[16px] bg-[#edf3e9] text-[#5d7850]">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M20 6 9 17l-5-5"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div className="space-y-2">
                  <h1 className="text-[26px] font-semibold leading-[1.2] tracking-[-0.6px] text-[#17151a] sm:text-[28px]">
                    Password updated
                  </h1>
                  <p className="text-[14px] leading-[1.55] text-[#6a5e78]">
                    Your password has been updated cleanly. Sign in with your new credentials to
                    pick up right where you left off.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className="btn-tactile inline-flex h-[46px] w-full cursor-pointer items-center justify-center rounded-[12px] bg-[#57367d] px-4 text-[14px] font-semibold text-white hover:bg-[#492c6b]"
                >
                  Continue to sign in
                </button>
              </div>
            ) : null}

            {/* ============================================================
                STATE C: FORMS (Sign up, Verify email, Sign in, Forgot, Set password)
               ============================================================ */}
            {mode !== "check-email" && mode !== "password-updated" ? (
              <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-[22px]">
                <div
                  className={`flex flex-col gap-[8px] ${
                    mode === "verify-email" || mode === "set-password"
                      ? "text-left"
                      : "text-left lg:text-center"
                  }`}
                >
                  <h1 className="text-[24px] font-semibold leading-[1.22] tracking-[-0.6px] text-[#17151a] sm:text-[28px]">
                    {content.form.title}
                  </h1>
                  <p className="text-[14px] font-normal leading-[1.5] text-[#6a5e78]">
                    {mode === "verify-email" ? (
                      <>
                        Enter the 6-digit verification code we sent to{" "}
                        <span className="font-medium text-[#242126]">{displayEmail}</span>.
                      </>
                    ) : mode === "set-password" ? (
                      <>
                        Create a new password for{" "}
                        <span className="font-medium text-[#242126]">{displayEmail}</span>.
                      </>
                    ) : (
                      content.form.subtitle
                    )}
                  </p>
                </div>

                {/* Calm rose inline error banner (Figma 243:8223 Sign in error) */}
                {mode === "signin" && signinBannerError ? (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 rounded-[12px] border border-[#e6b4bd] bg-[#fdf2f4] px-4 py-3 text-[12px] font-medium leading-[1.5] text-[#9e3a4a]"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                      className="mt-0.5 shrink-0"
                    >
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
                      <path
                        d="M12 8v4m0 4h.01"
                        stroke="currentColor"
                        strokeWidth="1.9"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span>{signinBannerError}</span>
                  </div>
                ) : null}

                {/* VERIFY EMAIL: 6-Digit OTP Input Boxes (Figma 243:8162) */}
                {mode === "verify-email" ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-6 gap-2 sm:gap-3">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => {
                            otpRefs.current[idx] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          aria-label={`Verification digit ${idx + 1}`}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className={`h-[56px] w-full rounded-[12px] border text-center text-[22px] font-semibold tabular-nums text-[#30263c] transition-colors focus:border-2 focus:border-[#7453a6] focus:bg-white focus:outline-none sm:h-[60px] ${
                            otpError
                              ? "border-[#e6b4bd] bg-[#fdf2f4]"
                              : digit
                                ? "border-[#e3daf1] bg-[#f9f7fc]"
                                : "border-[#e3daf1] bg-[#f9f7fc]"
                          }`}
                        />
                      ))}
                    </div>

                    {otpError ? (
                      <p role="alert" className="text-[12px] text-[#9e3a4a]">
                        {otpError}
                      </p>
                    ) : (
                      <p className="text-[12px] text-[#796985]">
                        Demo tip: enter any 6 digits to verify and open your workspace.
                      </p>
                    )}
                  </div>
                ) : null}

                {/* STANDARD / RESET INPUT FIELDS */}
                {mode !== "verify-email" ? (
                  <div className="flex flex-col gap-[16px]">
                    {mode === "signup" ? (
                      <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-2">
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
                    ) : null}

                    {mode !== "set-password" ? (
                      <AuthField
                        id={emailId}
                        name="email"
                        label="Email"
                        type="email"
                        autoComplete="email"
                        placeholder="alex.rivera@gmail.com"
                        value={values.email}
                        error={errors.email}
                        hasBannerError={Boolean(mode === "signin" && signinBannerError)}
                        inputRef={emailRef}
                        onChange={handleFieldChange}
                      />
                    ) : null}

                    {mode !== "forgot" ? (
                      <div className="flex flex-col gap-[7px]">
                        <div className="flex items-center justify-between gap-2">
                          <label
                            htmlFor={passwordId}
                            className="text-[13px] font-medium leading-[1.4] text-[#3b3048]"
                          >
                            {mode === "set-password" ? "New password" : "Password"}
                          </label>
                          {mode === "signin" ? (
                            <button
                              type="button"
                              onClick={() => switchMode("forgot")}
                              className="cursor-pointer text-[12.5px] font-medium leading-[1.4] text-[#57367d] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7453a6]"
                            >
                              Forgot password?
                            </button>
                          ) : null}
                        </div>

                        <div
                          className={`${INPUT_BASE_CLASS} gap-[10px] ${
                            errors.password || (mode === "signin" && signinBannerError)
                              ? "border-[#e6b4bd] bg-[#fdf2f4]"
                              : "border-[#e3daf1]"
                          }`}
                        >
                          <input
                            ref={passwordRef}
                            id={passwordId}
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete={
                              mode === "signup" || mode === "set-password"
                                ? "new-password"
                                : "current-password"
                            }
                            placeholder="Enter your password"
                            value={values.password}
                            aria-invalid={
                              Boolean(errors.password || (mode === "signin" && signinBannerError)) ||
                              undefined
                            }
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
                            {showPassword ? (
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
                            ) : null}
                          </button>
                        </div>

                        {mode === "signup" ? (
                          <p
                            id={passwordHintId}
                            role={errors.password ? "alert" : undefined}
                            className={`text-[12px] font-normal leading-[1.4] ${
                              errors.password ? "text-[#9e3a4a]" : "text-[#796985]"
                            }`}
                          >
                            {errors.password || "Must be at least 8 characters."}
                          </p>
                        ) : null}

                        {errors.password && mode !== "signup" ? (
                          <p
                            id={passwordErrorId}
                            role="alert"
                            className="text-[12px] leading-[1.4] text-[#9e3a4a]"
                          >
                            {errors.password}
                          </p>
                        ) : null}
                      </div>
                    ) : null}

                    {/* SET NEW PASSWORD: Confirm password + live checklist (Figma 243:8043) */}
                    {mode === "set-password" ? (
                      <>
                        <div className="flex flex-col gap-[7px]">
                          <label
                            htmlFor={confirmPasswordId}
                            className="text-[13px] font-medium leading-[1.4] text-[#3b3048]"
                          >
                            Confirm new password
                          </label>
                          <div
                            className={`${INPUT_BASE_CLASS} gap-[10px] ${
                              errors.confirmPassword
                                ? "border-[#e6b4bd] bg-[#fdf2f4]"
                                : "border-[#e3daf1]"
                            }`}
                          >
                            <input
                              ref={confirmPasswordRef}
                              id={confirmPasswordId}
                              name="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              autoComplete="new-password"
                              placeholder="Re-enter your new password"
                              value={values.confirmPassword}
                              onChange={(e) =>
                                handleFieldChange("confirmPassword", e.target.value)
                              }
                              className="h-full min-w-0 flex-1 bg-transparent text-[14px] text-[#242126] outline-none placeholder:text-[#8d819c]"
                            />
                            <button
                              type="button"
                              aria-label={
                                showConfirmPassword ? "Hide confirmation" : "Show confirmation"
                              }
                              onClick={() => setShowConfirmPassword((prev) => !prev)}
                              className="inline-flex size-[24px] shrink-0 cursor-pointer items-center justify-center rounded-[6px] hover:opacity-75"
                            >
                              <img
                                alt=""
                                src="/assets/auth/icon-eye.svg"
                                width={17}
                                height={17}
                                className="block size-[17px]"
                              />
                            </button>
                          </div>
                          {errors.confirmPassword ? (
                            <p role="alert" className="text-[12px] text-[#9e3a4a]">
                              {errors.confirmPassword}
                            </p>
                          ) : null}
                        </div>

                        <ul className="space-y-1.5 rounded-[12px] border border-[#efebf4] bg-[#faf8fd] p-4 text-[12px]">
                          {[
                            { ok: passwordHasMinLen, text: "At least 8 characters" },
                            { ok: passwordHasNumOrSym, text: "Contains a number or symbol" },
                            { ok: passwordsMatch, text: "Both passwords match" },
                          ].map((rule) => (
                            <li
                              key={rule.text}
                              className={`flex items-center gap-2 font-medium transition-colors ${
                                rule.ok ? "text-[#5d7850]" : "text-[#796985]"
                              }`}
                            >
                              <span aria-hidden="true">{rule.ok ? "✓" : "○"}</span>
                              <span>{rule.text}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : null}
                  </div>
                ) : null}

                {/* Primary Submit CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-[46px] w-full cursor-pointer items-center justify-center rounded-[10px] bg-[#57367d] px-4 text-[14px] font-semibold leading-[1.4] text-white transition-[background-color,transform] duration-150 hover:bg-[#492c6b] active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7453a6] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? content.form.pendingLabel : content.form.submitLabel}
                </button>

                {/* Verify-email resend row OR standard footer switch */}
                {mode === "verify-email" ? (
                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[13px]">
                    <span className="text-[#796985]">Didn’t get a code?</span>
                    <button
                      type="button"
                      disabled={resendSeconds > 0}
                      onClick={() => {
                        setResendSeconds(42);
                        setResentNotice("New 6-digit code sent.");
                      }}
                      className="cursor-pointer font-semibold text-[#57367d] hover:underline disabled:cursor-default disabled:opacity-65"
                    >
                      {resendSeconds > 0
                        ? `Resend in 0:${String(resendSeconds).padStart(2, "0")}`
                        : "Resend code"}
                    </button>
                    <button
                      type="button"
                      onClick={() => switchMode("signup")}
                      className="cursor-pointer text-[#796985] hover:text-[#30263c]"
                    >
                      Change email
                    </button>
                  </div>
                ) : content.form.footerActionLabel ? (
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
                ) : null}
              </form>
            ) : null}
          </div>
        </div>

        <div aria-hidden="true" className="hidden h-[20px] lg:block" />
      </section>
    </main>
  );
}
