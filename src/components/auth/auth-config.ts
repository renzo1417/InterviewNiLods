export type AuthMode = "signup" | "signin" | "forgot";

export interface AuthModeContent {
  documentTitle: string;
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
    showcase: {
      headlineTop: "Join Interview ni Lods",
      headlineBottom: "Practice With Confidence",
      subtitle:
        "Run realistic mock interviews with Sir Bot and get instant, structured feedback before your next call.",
      steps: ["Create your account", "Pick your target role", "Practice with Sir Bot"],
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
  signin: {
    documentTitle: "Sign In — Interview ni Lods",
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
  if (normalized === "signin" || normalized === "login") return "signin";
  if (normalized === "forgot" || normalized === "reset") return "forgot";
  return "signup";
}
