export type AuthMode =
  | "signup"
  | "verify-email"
  | "signin"
  | "forgot"
  | "check-email"
  | "set-password"
  | "password-updated";

export interface AuthModeContent {
  documentTitle: string;
  mobileEyebrow: string;
  showcase: {
    headlineTop: string;
    headlineBottom: string;
    subtitle: string;
    steps: readonly [string, string, string];
  };
  form: {
    title: string;
    subtitle: string;
    submitLabel: string;
    pendingLabel: string;
    footerPrompt: string;
    footerActionLabel: string;
    footerTargetMode: AuthMode;
  };
}

export const AUTH_MODE_CONTENT: Record<AuthMode, AuthModeContent> = {
  signup: {
    documentTitle: "Create Account — Interview ni Lods",
    mobileEyebrow: "JOIN INTERVIEW NI LODS",
    showcase: {
      headlineTop: "Join Interview ni Lods",
      headlineBottom: "Practice With Confidence",
      subtitle:
        "Run realistic mock interviews with Sir Bot and get instant, structured feedback before your next call.",
      steps: ["Create your account", "Verify your email", "Practice with Sir Bot"],
    },
    form: {
      title: "Sign up Account",
      subtitle: "Enter your details below to create your practice account.",
      submitLabel: "Sign up",
      pendingLabel: "Creating account...",
      footerPrompt: "Already have an account?",
      footerActionLabel: "Log in",
      footerTargetMode: "signin",
    },
  },
  "verify-email": {
    documentTitle: "Verify Email — Interview ni Lods",
    mobileEyebrow: "STEP 2 OF 3",
    showcase: {
      headlineTop: "One Last Step",
      headlineBottom: "Verify Your Practice Account",
      subtitle:
        "Confirm your inbox so we can keep your mock interview transcripts, scores, and daily streaks synced.",
      steps: ["Create your account", "Verify your email", "Practice with Sir Bot"],
    },
    form: {
      title: "Verify your email",
      subtitle: "Enter the 6-digit verification code we sent to your inbox.",
      submitLabel: "Verify & start practicing",
      pendingLabel: "Verifying code...",
      footerPrompt: "Entered the wrong address?",
      footerActionLabel: "Change email",
      footerTargetMode: "signup",
    },
  },
  signin: {
    documentTitle: "Sign In — Interview ni Lods",
    mobileEyebrow: "WELCOME BACK",
    showcase: {
      headlineTop: "Welcome Back",
      headlineBottom: "Own Your Next Interview",
      subtitle:
        "Pick up your rehearsal sessions, review live clarity scores, and refine your STAR answers with Sir Bot.",
      steps: ["Sign in cleanly", "Resume saved chats", "Review live scores"],
    },
    form: {
      title: "Sign in to Account",
      subtitle: "Enter your email and password to continue practicing.",
      submitLabel: "Sign in",
      pendingLabel: "Signing in...",
      footerPrompt: "Don't have an account?",
      footerActionLabel: "Sign up",
      footerTargetMode: "signup",
    },
  },
  forgot: {
    documentTitle: "Reset Password — Interview ni Lods",
    mobileEyebrow: "RESET ACCESS",
    showcase: {
      headlineTop: "Reset Access",
      headlineBottom: "Jump Right Back In",
      subtitle:
        "Recover your account cleanly so your saved sessions, scores, and coaching notes stay right where you left them.",
      steps: ["Enter your email", "Open reset link", "Back to practicing"],
    },
    form: {
      title: "Reset Password",
      subtitle: "Enter your email and we will send a password reset link.",
      submitLabel: "Send reset link",
      pendingLabel: "Sending link...",
      footerPrompt: "Remembered your password?",
      footerActionLabel: "Back to log in",
      footerTargetMode: "signin",
    },
  },
  "check-email": {
    documentTitle: "Check Your Inbox — Interview ni Lods",
    mobileEyebrow: "STEP 2 OF 3",
    showcase: {
      headlineTop: "Reset Access",
      headlineBottom: "Jump Right Back In",
      subtitle:
        "Recover your account cleanly so your saved sessions, scores, and coaching notes stay right where you left them.",
      steps: ["Enter your email", "Open reset link", "Back to practicing"],
    },
    form: {
      title: "Check your inbox",
      subtitle: "Open the reset link we sent to choose a new password.",
      submitLabel: "Open reset link",
      pendingLabel: "Opening...",
      footerPrompt: "Need a different address?",
      footerActionLabel: "Change email",
      footerTargetMode: "forgot",
    },
  },
  "set-password": {
    documentTitle: "Set New Password — Interview ni Lods",
    mobileEyebrow: "STEP 3 OF 3",
    showcase: {
      headlineTop: "A Fresh Start",
      headlineBottom: "Back To Practicing",
      subtitle:
        "Choose a strong new password and jump right back into your saved sessions and coaching notes.",
      steps: ["Enter your email", "Open reset link", "Back to practicing"],
    },
    form: {
      title: "Set new password",
      subtitle: "Choose a strong password for your practice account.",
      submitLabel: "Update password",
      pendingLabel: "Updating password...",
      footerPrompt: "Remembered your password?",
      footerActionLabel: "Back to sign in",
      footerTargetMode: "signin",
    },
  },
  "password-updated": {
    documentTitle: "Password Updated — Interview ni Lods",
    mobileEyebrow: "ALL SET",
    showcase: {
      headlineTop: "You’re All Set",
      headlineBottom: "Ready For Your Next Round",
      subtitle:
        "Your account access is restored. Your streak, saved answers, and coaching history are waiting.",
      steps: ["Enter your email", "Open reset link", "Back to practicing"],
    },
    form: {
      title: "Password updated",
      subtitle:
        "Your password has been updated cleanly. Sign in to pick up right where you left off.",
      submitLabel: "Continue to sign in",
      pendingLabel: "Redirecting...",
      footerPrompt: "",
      footerActionLabel: "",
      footerTargetMode: "signin",
    },
  },
};

export const DEMO_SESSION_STORAGE_KEY = "inlods_demo_user";

export interface DemoUserSession {
  firstName: string;
  lastName: string;
  email: string;
  signedInAt: string;
}

export function normalizeAuthMode(value: string | string[] | undefined): AuthMode {
  const raw = Array.isArray(value) ? value[0] : value;
  const normalized = raw?.toLowerCase().trim();
  if (normalized === "signin" || normalized === "login" || normalized === "signin-error") {
    return "signin";
  }
  if (normalized === "verify-email" || normalized === "verify") return "verify-email";
  if (normalized === "forgot" || normalized === "reset") return "forgot";
  if (normalized === "check-email" || normalized === "inbox") return "check-email";
  if (normalized === "set-password" || normalized === "new-password") return "set-password";
  if (normalized === "password-updated" || normalized === "updated") return "password-updated";
  return "signup";
}

export function isInitialSigninError(value: string | string[] | undefined): boolean {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.toLowerCase().trim() === "signin-error";
}
