import type {
  CoachTone,
  InterviewDifficulty,
  InterviewSetupConfig,
  JobRole,
  PracticeSessionState,
} from "./practice-config";

export type WorkspaceScreenId =
  | "01"
  | "02"
  | "03"
  | "04"
  | "05"
  | "sessions"
  | "sessions-empty"
  | "sessions-loading"
  | "sessions-error"
  | "tips"
  | "tips-detail"
  | "tips-saved"
  | "profile"
  | "profile-account"
  | "profile-saved"
  | "help";

export type WorkspaceView =
  | "setup"
  | "live"
  | "results"
  | "transcript"
  | "sessions"
  | "tips"
  | "tips-detail"
  | "tips-saved"
  | "profile"
  | "profile-account"
  | "profile-saved"
  | "help";

export interface SessionHistoryRecord {
  id: string;
  role: JobRole;
  categoryLabel: string;
  questionCount: number;
  completedQuestions: number;
  dateLabel: string;
  timeLabel: string;
  timestampMs: number;
  difficulty: InterviewDifficulty;
  tone: CoachTone;
  score: number | null;
  status: "completed" | "in_progress";
  currentTopic?: string;
  sessionKey?: "software-engineer" | "product-designer";
  snapshot?: PracticeSessionState;
}

export type TipCategory =
  | "Answer structure"
  | "Showing impact"
  | "Confidence"
  | "Asking questions";

export interface InterviewGuideItem {
  id: string;
  category: TipCategory;
  readTime: string;
  title: string;
  summary: string;
  lead: string;
  beforeExample: string;
  afterExample: string;
  exampleCaption: string;
  frameworkTitle: string;
  steps: ReadonlyArray<{
    code: string;
    heading: string;
    detail: string;
  }>;
  drillConfig: InterviewSetupConfig;
  savedDateLabel?: string;
}

export type SavedAnswerTag =
  | "Ownership"
  | "Problem-solving"
  | "Impact"
  | "Collaboration";

export interface SavedAnswerItem {
  id: string;
  title: string;
  role: JobRole;
  tag: SavedAnswerTag;
  score: number;
  dateLabel: string;
  answer: string;
  coachNote: string;
  questionNumber?: string;
}

export type AvatarTintKey = "lavender" | "violet" | "sage" | "amber";

export interface UserProfileData {
  displayName: string;
  username: string;
  email: string;
  headline: string;
  avatarTint: AvatarTintKey;
}

export interface CoachingPreferences {
  autoOpenLiveScore: boolean;
  showStarTips: boolean;
  voiceDictationShortcut: boolean;
  dailyStreakReminder: boolean;
}

export interface ActivityCell {
  dateLabel: string;
  level: 0 | 1 | 2;
  sessionsCount: number;
}

export interface HelpFaqItem {
  id: string;
  question: string;
  answer: string;
  topic: "scoring" | "workflow" | "privacy" | "account";
}

export const AVATAR_TINT_STYLES: Record<
  AvatarTintKey,
  { bg: string; text: string; ring: string; label: string }
> = {
  lavender: {
    bg: "bg-[#ece5f5]",
    text: "text-[#60427d]",
    ring: "ring-[#7453a6]",
    label: "Soft lavender",
  },
  violet: {
    bg: "bg-[#c7b8fa]",
    text: "text-[#292331]",
    ring: "ring-[#57367d]",
    label: "Sir Bot violet",
  },
  sage: {
    bg: "bg-[#edf3e9]",
    text: "text-[#4c6940]",
    ring: "ring-[#5d7850]",
    label: "Calm sage",
  },
  amber: {
    bg: "bg-[#fbf5e8]",
    text: "text-[#8a6220]",
    ring: "ring-[#b4832e]",
    label: "Warm sand",
  },
};

export const DEFAULT_USER_PROFILE: UserProfileData = {
  displayName: "Renzo",
  username: "@mikua1375",
  email: "renzo.pogoy@cit.edu",
  headline: "Preparing for Software Engineer interviews",
  avatarTint: "lavender",
};

export const DEFAULT_COACHING_PREFERENCES: CoachingPreferences = {
  autoOpenLiveScore: false,
  showStarTips: true,
  voiceDictationShortcut: true,
  dailyStreakReminder: true,
};

export const INITIAL_SESSION_HISTORY: SessionHistoryRecord[] = [
  {
    id: "hist-in-progress-se",
    role: "Software Engineer",
    categoryLabel: "Behavioral interview",
    questionCount: 5,
    completedQuestions: 3,
    dateLabel: "Nov 13, 2026",
    timeLabel: "10:24 AM",
    timestampMs: Date.parse("2026-11-13T10:24:00Z"),
    difficulty: "Normal",
    tone: "Witty",
    score: 8.2,
    status: "in_progress",
    currentTopic: "Handling pressure",
    sessionKey: "software-engineer",
  },
  {
    id: "hist-1",
    role: "Software Engineer",
    categoryLabel: "Behavioral interview",
    questionCount: 5,
    completedQuestions: 5,
    dateLabel: "Nov 13, 2026",
    timeLabel: "10:42 AM",
    timestampMs: Date.parse("2026-11-13T10:42:00Z"),
    difficulty: "Normal",
    tone: "Witty",
    score: 8.2,
    status: "completed",
    sessionKey: "software-engineer",
  },
  {
    id: "hist-2",
    role: "Product Designer",
    categoryLabel: "Portfolio walkthrough",
    questionCount: 5,
    completedQuestions: 5,
    dateLabel: "Nov 12, 2026",
    timeLabel: "4:18 PM",
    timestampMs: Date.parse("2026-11-12T16:18:00Z"),
    difficulty: "Normal",
    tone: "Friendly",
    score: 8.4,
    status: "completed",
    sessionKey: "product-designer",
  },
  {
    id: "hist-3",
    role: "Software Engineer",
    categoryLabel: "Behavioral interview",
    questionCount: 5,
    completedQuestions: 5,
    dateLabel: "Nov 11, 2026",
    timeLabel: "11:06 AM",
    timestampMs: Date.parse("2026-11-11T11:06:00Z"),
    difficulty: "Hard",
    tone: "Direct",
    score: 7.8,
    status: "completed",
    sessionKey: "software-engineer",
  },
  {
    id: "hist-4",
    role: "Software Engineer",
    categoryLabel: "Behavioral interview",
    questionCount: 5,
    completedQuestions: 5,
    dateLabel: "Nov 10, 2026",
    timeLabel: "2:35 PM",
    timestampMs: Date.parse("2026-11-10T14:35:00Z"),
    difficulty: "Normal",
    tone: "Witty",
    score: 8.1,
    status: "completed",
    sessionKey: "software-engineer",
  },
  {
    id: "hist-5",
    role: "Product Designer",
    categoryLabel: "Portfolio walkthrough",
    questionCount: 5,
    completedQuestions: 5,
    dateLabel: "Nov 9, 2026",
    timeLabel: "5:22 PM",
    timestampMs: Date.parse("2026-11-09T17:22:00Z"),
    difficulty: "Normal",
    tone: "Friendly",
    score: 8.0,
    status: "completed",
    sessionKey: "product-designer",
  },
  {
    id: "hist-6",
    role: "Software Engineer",
    categoryLabel: "Behavioral interview",
    questionCount: 5,
    completedQuestions: 5,
    dateLabel: "Nov 8, 2026",
    timeLabel: "9:10 AM",
    timestampMs: Date.parse("2026-11-08T09:10:00Z"),
    difficulty: "Easy",
    tone: "Friendly",
    score: 7.6,
    status: "completed",
    sessionKey: "software-engineer",
  },
  {
    id: "hist-7",
    role: "Frontend Developer",
    categoryLabel: "UI engineering round",
    questionCount: 5,
    completedQuestions: 5,
    dateLabel: "Nov 6, 2026",
    timeLabel: "7:40 PM",
    timestampMs: Date.parse("2026-11-06T19:40:00Z"),
    difficulty: "Normal",
    tone: "Witty",
    score: 8.5,
    status: "completed",
    sessionKey: "software-engineer",
  },
  {
    id: "hist-8",
    role: "Product Manager",
    categoryLabel: "Product sense & trade-offs",
    questionCount: 4,
    completedQuestions: 4,
    dateLabel: "Nov 4, 2026",
    timeLabel: "3:15 PM",
    timestampMs: Date.parse("2026-11-04T15:15:00Z"),
    difficulty: "Normal",
    tone: "Direct",
    score: 8.1,
    status: "completed",
    sessionKey: "product-designer",
  },
  {
    id: "hist-9",
    role: "Data Analyst",
    categoryLabel: "Stakeholder storytelling",
    questionCount: 5,
    completedQuestions: 5,
    dateLabel: "Nov 2, 2026",
    timeLabel: "6:05 PM",
    timestampMs: Date.parse("2026-11-02T18:05:00Z"),
    difficulty: "Easy",
    tone: "Friendly",
    score: 7.9,
    status: "completed",
    sessionKey: "software-engineer",
  },
  {
    id: "hist-10",
    role: "Frontend Developer",
    categoryLabel: "Performance debugging",
    questionCount: 8,
    completedQuestions: 8,
    dateLabel: "Oct 30, 2026",
    timeLabel: "11:20 AM",
    timestampMs: Date.parse("2026-10-30T11:20:00Z"),
    difficulty: "Hard",
    tone: "Direct",
    score: 8.3,
    status: "completed",
    sessionKey: "software-engineer",
  },
  {
    id: "hist-11",
    role: "Customer Success",
    categoryLabel: "Escalation turnaround",
    questionCount: 4,
    completedQuestions: 4,
    dateLabel: "Oct 27, 2026",
    timeLabel: "4:50 PM",
    timestampMs: Date.parse("2026-10-27T16:50:00Z"),
    difficulty: "Easy",
    tone: "Friendly",
    score: 8.0,
    status: "completed",
    sessionKey: "product-designer",
  },
  {
    id: "hist-12",
    role: "Software Engineer",
    categoryLabel: "System reliability",
    questionCount: 5,
    completedQuestions: 5,
    dateLabel: "Oct 24, 2026",
    timeLabel: "10:12 AM",
    timestampMs: Date.parse("2026-10-24T10:12:00Z"),
    difficulty: "Hard",
    tone: "Direct",
    score: 8.4,
    status: "completed",
    sessionKey: "software-engineer",
  },
];

export const INTERVIEW_GUIDES: ReadonlyArray<InterviewGuideItem> = [
  {
    id: "measurable-impact",
    category: "Showing impact",
    readTime: "2 min",
    title: "Make your impact measurable.",
    summary:
      "A clear action is good. A clear outcome is better. Help the interviewer see the difference you made.",
    lead: "A clear action is good. A clear outcome is better. Interviewers remember stories that end with what actually changed for users, the team, or the business.",
    beforeExample: "“I helped fix a bug before launch.”",
    afterExample:
      "“I coordinated a fix with QA and reduced checkout errors from 12% to 2% before launch.”",
    exampleCaption: "Example only. Use numbers you can explain and stand behind.",
    frameworkTitle: "Three quick ways to find a real number",
    steps: [
      {
        code: "01",
        heading: "Compare before and after",
        detail:
          "Latency, error rate, drop-off, or review time before your change versus after.",
      },
      {
        code: "02",
        heading: "Name the scope you owned",
        detail:
          "How many users, services, screens, or teammates depended on the work.",
      },
      {
        code: "03",
        heading: "Use time saved when metrics aren’t tracked",
        detail:
          "Even cutting a weekly 2-hour manual check down to 15 minutes proves tangible leverage.",
      },
    ],
    drillConfig: {
      role: "Software Engineer",
      difficulty: "Normal",
      questionRange: "3-5",
      tone: "Direct",
    },
    savedDateLabel: "Saved Nov 13",
  },
  {
    id: "clear-star-answer",
    category: "Answer structure",
    readTime: "2 min",
    title: "Build a clear STAR answer",
    summary:
      "Give your story a beginning, a contribution, and an outcome.",
    lead: "Structured answers keep interviewers engaged without sounding rehearsed. Spend 20% on context, 60% on your specific actions, and 20% on the measurable result.",
    beforeExample:
      "“Our API was slow during finals week and everyone was stressed, so we spent a lot of time rewriting queries until it felt faster.”",
    afterExample:
      "“Our checkout API spiked to 2.4s p95 before a campus launch. I profiled the hot SQL join, added a composite index with our backend lead, and cut p95 latency to 280ms with zero downtime.”",
    exampleCaption: "Keep Situation + Task under 20 seconds so Action shines.",
    frameworkTitle: "How to pace each STAR beat",
    steps: [
      {
        code: "01",
        heading: "Frame the stakes in one sentence",
        detail:
          "State what was at risk (launch deadline, user drop-off, reliability) and skip unnecessary backstory.",
      },
      {
        code: "02",
        heading: "Switch from “we” to “I” during Action",
        detail:
          "Clarify the exact judgment call, prototype, or coordination you drove personally.",
      },
      {
        code: "03",
        heading: "Land cleanly on Result + reflection",
        detail:
          "Close with the outcome and one short habit you carried forward to future projects.",
      },
    ],
    drillConfig: {
      role: "Software Engineer",
      difficulty: "Normal",
      questionRange: "5-8",
      tone: "Witty",
    },
    savedDateLabel: "Saved Nov 11",
  },
  {
    id: "introduce-in-60s",
    category: "Confidence",
    readTime: "3 min",
    title: "Introduce yourself in 60 seconds",
    summary:
      "Connect your background to the role—not your whole résumé.",
    lead: "“Tell me about yourself” sets the tone for the entire interview. Use a calm Present → Past → Next arc that bridges directly to the team’s needs.",
    beforeExample:
      "“I graduated in 2024, then did an internship, worked on a few school apps, learned React and Node, and now I’m looking for a good team.”",
    afterExample:
      "“I’m a software engineer focused on fast, reliable web interfaces. Most recently I owned checkout flows that cut drop-off by 18%, and I’m excited about your team’s focus on developer tooling.”",
    exampleCaption: "Aim for 4–5 crisp sentences — around 45 to 60 seconds spoken.",
    frameworkTitle: "The Present · Past · Next opener",
    steps: [
      {
        code: "01",
        heading: "Present: your headline focus",
        detail:
          "One sentence naming your craft and the kinds of problems you enjoy solving.",
      },
      {
        code: "02",
        heading: "Past: one signature proof point",
        detail:
          "Mention your strongest recent project and one tangible result it delivered.",
      },
      {
        code: "03",
        heading: "Next: why this specific role",
        detail:
          "Connect your trajectory directly to the product or engineering challenge ahead.",
      },
    ],
    drillConfig: {
      role: "Frontend Developer",
      difficulty: "Easy",
      questionRange: "3-5",
      tone: "Friendly",
    },
    savedDateLabel: "Saved Nov 9",
  },
  {
    id: "difficult-moment",
    category: "Answer structure",
    readTime: "3 min",
    title: "Talk about a difficult moment",
    summary:
      "Show your reasoning, priorities, and collaboration.",
    lead: "Questions about conflict, mistakes, or tight deadlines aren’t traps — interviewers are looking for calm self-awareness, objective trade-offs, and accountability.",
    beforeExample:
      "“A teammate disagreed with my architecture and delayed our sprint, so I had to redo parts of the module myself.”",
    afterExample:
      "“We disagreed on caching strategy two days before freeze. I prototyped both options in 40 minutes, benchmarked latency together, and we shipped the hybrid approach on time.”",
    exampleCaption: "Focus on evidence, empathy, and what you improved next.",
    frameworkTitle: "How to stay constructive under tough questions",
    steps: [
      {
        code: "01",
        heading: "Describe the tension neutrally",
        detail:
          "Frame disagreements around constraints and goals — never blame teammates.",
      },
      {
        code: "02",
        heading: "Show how you aligned on facts",
        detail:
          "Highlight user recordings, benchmarks, or a quick experiment that resolved debate.",
      },
      {
        code: "03",
        heading: "Name the guardrail you built after",
        detail:
          "Show how the setback improved your process or team rituals long-term.",
      },
    ],
    drillConfig: {
      role: "Software Engineer",
      difficulty: "Hard",
      questionRange: "5-8",
      tone: "Direct",
    },
  },
  {
    id: "ask-great-questions",
    category: "Asking questions",
    readTime: "2 min",
    title: "Ask questions that work for you",
    summary:
      "Ask about team priorities, success, and expectations.",
    lead: "The final five minutes turn an interview into a peer conversation. Ask specific questions that reveal how the team ships, measures success, and supports growth.",
    beforeExample: "“What does a typical day look like on the team?”",
    afterExample:
      "“What’s one product or reliability milestone that would make someone’s first 90 days in this role feel like a clear win?”",
    exampleCaption: "Prepare 2 role questions and 1 team-culture question ahead of time.",
    frameworkTitle: "Three high-signal closing questions",
    steps: [
      {
        code: "01",
        heading: "Ask about 90-day impact",
        detail:
          "Uncovers what matters immediately and lets you align your closing pitch.",
      },
      {
        code: "02",
        heading: "Ask how decisions get made",
        detail:
          "Shows maturity about engineering, design, and product collaboration.",
      },
      {
        code: "03",
        heading: "Ask what’s hardest right now",
        detail:
          "Invites an honest conversation about real constraints rather than surface polish.",
      },
    ],
    drillConfig: {
      role: "Product Manager",
      difficulty: "Normal",
      questionRange: "3-5",
      tone: "Friendly",
    },
  },
];

export const INITIAL_SAVED_ANSWERS: SavedAnswerItem[] = [
  {
    id: "saved-1",
    title: "Handling pressure",
    role: "Software Engineer",
    tag: "Problem-solving",
    score: 8.2,
    dateLabel: "Nov 13, 2026",
    answer:
      "I assessed the issue to understand the root cause, proposed a fix, and worked closely with QA to validate it through a focused test run. I also kept the team aligned on progress and risks, which helped us ship on time.",
    coachNote: "Next tweak: name the checkout error drop (12% → 0.4%).",
    questionNumber: "03",
  },
  {
    id: "saved-2",
    title: "A project you’re proud of",
    role: "Software Engineer",
    tag: "Ownership",
    score: 8.4,
    dateLabel: "Nov 12, 2026",
    answer:
      "During a product release, we discovered a critical checkout bug one day before launch. I led triage, wrote rollback guardrails, and kept PMs updated every 30 minutes so we protected launch cleanly.",
    coachNote: "Strong ownership and calm risk framing from start to finish.",
    questionNumber: "02",
  },
  {
    id: "saved-3",
    title: "Portfolio walkthrough",
    role: "Product Designer",
    tag: "Impact",
    score: 8.6,
    dateLabel: "Nov 10, 2026",
    answer:
      "Watching 5 of 7 interviewees stall on account setup convinced us to move live templates ahead of signup, lifting first-session activation by 28% without extra engineering scope.",
    coachNote: "Top answer — clear user evidence paired with a real metric.",
  },
  {
    id: "saved-4",
    title: "Constructive disagreement",
    role: "Software Engineer",
    tag: "Collaboration",
    score: 8.3,
    dateLabel: "Nov 8, 2026",
    answer:
      "Instead of debating API design in comments, I prototyped both approaches in 40 minutes and ran latency benchmarks together so the team aligned quickly on objective evidence.",
    coachNote: "Mature, low-ego conflict resolution backed by data.",
  },
];

export const HELP_FAQ_ITEMS: ReadonlyArray<HelpFaqItem> = [
  {
    id: "faq-end-early",
    topic: "scoring",
    question: "Does ending an interview early still show my results?",
    answer:
      "Yes. Clicking End interview scores every question you already answered and gives you a complete rubric breakdown, full transcript, and next-focus summary.",
  },
  {
    id: "faq-tone",
    topic: "workflow",
    question: "Can I switch Sir Bot’s coaching tone between sessions?",
    answer:
      "Anytime. Change Friendly, Witty, or Direct in Interview Setup before a round, or save your favorite default inside Profile → Practice defaults.",
  },
  {
    id: "faq-streak",
    topic: "account",
    question: "How is my practice streak counted?",
    answer:
      "Completing at least one full question exchange in any practice round counts toward your daily streak. Your heatmap updates automatically right on your Profile.",
  },
  {
    id: "faq-export",
    topic: "privacy",
    question: "Can I export my interview transcripts for offline prep?",
    answer:
      "Yes. You can download a single session summary from the Transcript screen, or export your entire history as JSON anytime under Profile → Account & preferences.",
  },
  {
    id: "faq-roles",
    topic: "workflow",
    question: "What roles and question counts are supported?",
    answer:
      "Interview ni Lods currently supports Software Engineer, Product Designer, Product Manager, Data Analyst, Frontend Developer, and Customer Success across 3–5, 5–8, or 8–10 question rounds.",
  },
];

/**
 * Deterministic 26-week (May – Nov 2026) activity grid matching Figma Profile heatmap (26:2),
 * ending with a 10-day current streak highlighted in deeper lavender.
 */
export function buildPracticeActivityWeeks(): ActivityCell[][] {
  const weeks: ActivityCell[][] = [];
  const start = new Date(Date.UTC(2026, 4, 18)); // Mon May 18, 2026
  const totalDays = 26 * 7;
  // Deterministic practiced indices creating ~32 practice days + 10-day final streak
  const activeOffsets = new Set([
    10, 14, 24, 30, 38, 43, 45, 50, 58, 63, 68, 72, 81, 86, 94, 102, 108, 114,
    120, 127, 134, 142, 149, 155, 162, 168,
  ]);
  const streakStart = totalDays - 10;

  const fmt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

  for (let w = 0; w < 26; w++) {
    const col: ActivityCell[] = [];
    for (let d = 0; d < 7; d++) {
      const idx = w * 7 + d;
      const dt = new Date(start.getTime() + idx * 86_400_000);
      const isStreak = idx >= streakStart;
      const isPracticed = !isStreak && activeOffsets.has(idx);
      col.push({
        dateLabel: fmt.format(dt),
        level: isStreak ? 2 : isPracticed ? 1 : 0,
        sessionsCount: isStreak ? (idx % 2 === 0 ? 2 : 1) : isPracticed ? 1 : 0,
      });
    }
    weeks.push(col);
  }
  return weeks;
}

export function normalizeWorkspaceScreen(
  raw?: string | string[]
): WorkspaceScreenId {
  const value = (Array.isArray(raw) ? raw[0] : raw)?.toLowerCase().trim();
  switch (value) {
    case "02":
    case "2":
    case "live":
    case "chat":
      return "02";
    case "03":
    case "3":
    case "score":
      return "03";
    case "04":
    case "4":
    case "results":
      return "04";
    case "05":
    case "5":
    case "transcript":
      return "05";
    case "sessions":
      return "sessions";
    case "sessions-empty":
      return "sessions-empty";
    case "sessions-loading":
      return "sessions-loading";
    case "sessions-error":
      return "sessions-error";
    case "tips":
      return "tips";
    case "tips-detail":
    case "guide":
      return "tips-detail";
    case "tips-saved":
    case "saved-guides":
      return "tips-saved";
    case "profile":
      return "profile";
    case "profile-account":
    case "account":
    case "preferences":
      return "profile-account";
    case "profile-saved":
    case "saved-answers":
      return "profile-saved";
    case "help":
    case "support":
      return "help";
    default:
      return "01";
  }
}

export function screenToView(screen: WorkspaceScreenId): WorkspaceView {
  switch (screen) {
    case "02":
    case "03":
      return "live";
    case "04":
      return "results";
    case "05":
      return "transcript";
    case "sessions":
    case "sessions-empty":
    case "sessions-loading":
    case "sessions-error":
      return "sessions";
    case "tips":
      return "tips";
    case "tips-detail":
      return "tips-detail";
    case "tips-saved":
      return "tips-saved";
    case "profile":
      return "profile";
    case "profile-account":
      return "profile-account";
    case "profile-saved":
      return "profile-saved";
    case "help":
      return "help";
    default:
      return "setup";
  }
}
