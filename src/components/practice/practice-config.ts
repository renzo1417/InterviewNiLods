export type PracticeScreenId = "01" | "02" | "03" | "04";

export type PracticeView = "setup" | "live" | "results";

export type InterviewDifficulty = "Easy" | "Normal" | "Hard";

export type QuestionRange = "3-5" | "5-8" | "8-10";

export type CoachTone = "Friendly" | "Witty" | "Direct";

export type JobRole =
  | "Software Engineer"
  | "Product Designer"
  | "Product Manager"
  | "Data Analyst"
  | "Frontend Developer"
  | "Customer Success";

export interface InterviewSetupConfig {
  role: JobRole;
  difficulty: InterviewDifficulty;
  questionRange: QuestionRange;
  tone: CoachTone;
}

export interface ChatTurn {
  id: string;
  sender: "sir-bot" | "user";
  timestamp: string;
  content: string;
  topic?: string;
}

export interface RubricScores {
  clarity: number;
  structure: number;
  relevance: number;
  impact: number;
}

export interface ImprovementNote {
  code: string;
  title: string;
  detail: string;
}

export interface LiveScoreSnapshot {
  questionLabel: string;
  overallScore: number;
  verdict: string;
  verdictDetail: string;
  breakdown: RubricScores;
  workingWell: string[];
  improveNext: ImprovementNote[];
}

export interface QuestionResultItem {
  number: string;
  title: string;
  takeaway: string;
  score: number;
  prompt: string;
  userAnswer: string;
  coachFeedback: string;
}

export interface FinalResultsSummary {
  totalQuestions: number;
  completedQuestions: number;
  finalScore: number;
  ratingLabel: string;
  headline: string;
  summaryLines: [string, string];
  nextFocusLine: string;
  breakdown: RubricScores;
  questionResults: QuestionResultItem[];
  keepDoingThis: string[];
  focusOnNext: ImprovementNote[];
}

export interface PracticeSessionState {
  id: string;
  config: InterviewSetupConfig;
  status: "in_progress" | "completed";
  totalQuestions: number;
  currentQuestionIndex: number;
  currentTopic: string;
  turns: ChatTurn[];
  liveScore: LiveScoreSnapshot | null;
  finalResults: FinalResultsSummary | null;
}

export const JOB_ROLE_OPTIONS: ReadonlyArray<JobRole> = [
  "Software Engineer",
  "Product Designer",
  "Product Manager",
  "Data Analyst",
  "Frontend Developer",
  "Customer Success",
];

export const DIFFICULTY_OPTIONS: ReadonlyArray<InterviewDifficulty> = [
  "Easy",
  "Normal",
  "Hard",
];

export const QUESTION_RANGE_OPTIONS: ReadonlyArray<QuestionRange> = [
  "3-5",
  "5-8",
  "8-10",
];

export const TONE_OPTIONS: ReadonlyArray<CoachTone> = [
  "Friendly",
  "Witty",
  "Direct",
];

export const ESTIMATED_MINUTES_BY_RANGE: Record<QuestionRange, string> = {
  "3-5": "5-10 minutes interview",
  "5-8": "10-20 minutes interview",
  "8-10": "20-30 minutes interview",
};

export const QUESTION_COUNT_BY_RANGE: Record<QuestionRange, number> = {
  "3-5": 4,
  "5-8": 5,
  "8-10": 8,
};

interface PromptBlueprint {
  topic: string;
  shortTitle: string;
  question: string;
  takeawayHint: string;
}

const ROLE_PROMPTS: Record<JobRole, PromptBlueprint[]> = {
  "Software Engineer": [
    {
      topic: "Introduction",
      shortTitle: "Tell me about yourself",
      question: "Tell me about yourself and what engineering problems excite you most right now.",
      takeawayHint: "Connect your experience to the role.",
    },
    {
      topic: "Project ownership",
      shortTitle: "A project you’re proud of",
      question: "Walk me through a technical project you’re proud of and the trade-offs you made.",
      takeawayHint: "Strong ownership and clear structure.",
    },
    {
      topic: "Handling pressure",
      shortTitle: "Handling pressure",
      question: "Tell me about a time you handled pressure at work or in a project.",
      takeawayHint: "Add a measurable result to your story.",
    },
    {
      topic: "Collaboration",
      shortTitle: "Follow-up",
      question: "What specific actions did you take, and how did you coordinate with the team?",
      takeawayHint: "Make the team’s contribution more specific.",
    },
    {
      topic: "Reflection",
      shortTitle: "Final question",
      question: "What helped you stay calm and effective during that situation, and what would you repeat next time?",
      takeawayHint: "Clear reflection and a thoughtful close.",
    },
    {
      topic: "Architecture trade-offs",
      shortTitle: "System reliability",
      question: "Describe a production bottleneck you diagnosed and how you verified the fix stayed stable.",
      takeawayHint: "Mention monitoring signals and metrics.",
    },
    {
      topic: "Code review",
      shortTitle: "Constructive disagreement",
      question: "Tell me about a technical disagreement with a teammate and how you reached alignment.",
      takeawayHint: "Focus on objective evidence and empathy.",
    },
    {
      topic: "Looking ahead",
      shortTitle: "Engineering growth",
      question: "What engineering habit or skill are you intentionally sharpening over the next six months?",
      takeawayHint: "Tie personal growth to team velocity.",
    },
  ],
  "Product Designer": [
    {
      topic: "Design background",
      shortTitle: "Tell me about yourself",
      question: "Tell me about your design background and the kind of product problems you enjoy solving.",
      takeawayHint: "Bridge craft fundamentals with product impact.",
    },
    {
      topic: "Portfolio walkthrough",
      shortTitle: "A case study you’re proud of",
      question: "Walk me through a design project where user research completely shifted your early concept.",
      takeawayHint: "Highlight the user insight that changed direction.",
    },
    {
      topic: "Design constraints",
      shortTitle: "Handling tight scope",
      question: "Tell me about a time engineering or timeline constraints forced a sharp scope trade-off.",
      takeawayHint: "Show how you protected core UX quality.",
    },
    {
      topic: "Cross-functional feedback",
      shortTitle: "Design critique",
      question: "How did you bring PMs and engineers along when stakeholders pushed back on your flow?",
      takeawayHint: "Connect rationale to user goals.",
    },
    {
      topic: "Measuring impact",
      shortTitle: "Post-launch reflection",
      question: "Once the design shipped, what signal showed it worked and what did you refine next?",
      takeawayHint: "Pair qualitative feedback with conversion or task metrics.",
    },
    {
      topic: "Design systems",
      shortTitle: "System consistency",
      question: "When should a team extend an existing pattern versus introduce a custom component?",
      takeawayHint: "Explain token governance and user familiarity.",
    },
    {
      topic: "Accessibility",
      shortTitle: "Inclusive UX",
      question: "Share an accessibility improvement you championed and how you validated it.",
      takeawayHint: "Mention keyboard flows, contrast, or screen readers.",
    },
    {
      topic: "Closing reflection",
      shortTitle: "Design craft",
      question: "What separates good visual polish from genuinely thoughtful product design in your view?",
      takeawayHint: "End with a crisp principle you work by.",
    },
  ],
  "Product Manager": [
    {
      topic: "Product sense",
      shortTitle: "Background & vision",
      question: "Tell me how you moved into product management and a product experience you admire right now.",
      takeawayHint: "Explain the user loop and business moat.",
    },
    {
      topic: "Prioritization",
      shortTitle: "Roadmap trade-offs",
      question: "Walk me through a tough call where you said no to a vocal stakeholder request.",
      takeawayHint: "Ground prioritization in clear criteria.",
    },
    {
      topic: "Execution under pressure",
      shortTitle: "Launch setback",
      question: "Tell me about a launch that hit unexpected friction close to release and how you responded.",
      takeawayHint: "Quantify the recovery outcome.",
    },
    {
      topic: "Alignment",
      shortTitle: "Cross-team sync",
      question: "How did you keep engineering, design, and leadership aligned on the revised plan?",
      takeawayHint: "Show proactive communication rhythm.",
    },
    {
      topic: "Outcomes",
      shortTitle: "Metric ownership",
      question: "Looking back, which metric validated your decision and what would you track differently?",
      takeawayHint: "Balance leading and lagging indicators.",
    },
    {
      topic: "Discovery",
      shortTitle: "Validating ambiguity",
      question: "How do you validate a problem before committing an entire sprint to building a solution?",
      takeawayHint: "Reference lightweight experiments.",
    },
    {
      topic: "Pricing & growth",
      shortTitle: "Adoption friction",
      question: "Describe a drop-off in a funnel you investigated and the hypothesis that moved the needle.",
      takeawayHint: "Show structured root-cause breakdown.",
    },
    {
      topic: "Reflection",
      shortTitle: "Leadership lesson",
      question: "What hard product lesson shaped how you lead discovery today?",
      takeawayHint: "Be candid about what changed in your process.",
    },
  ],
  "Data Analyst": [
    {
      topic: "Analytical story",
      shortTitle: "Tell me about yourself",
      question: "Tell me about your analytics background and an insight that drove a real team decision.",
      takeawayHint: "Connect SQL/modeling rigor to action.",
    },
    {
      topic: "Data hygiene",
      shortTitle: "Messy dataset challenge",
      question: "Walk me through how you investigated conflicting metrics across two stakeholder dashboards.",
      takeawayHint: "Detail your validation checks.",
    },
    {
      topic: "Urgent analysis",
      shortTitle: "Fast turnaround",
      question: "Tell me about an urgent request where data was incomplete and leadership still needed direction.",
      takeawayHint: "Explain assumptions and caveats clearly.",
    },
    {
      topic: "Stakeholder storytelling",
      shortTitle: "Simplifying insights",
      question: "How did you translate a complex statistical finding into a recommendation for non-technical peers?",
      takeawayHint: "Lead with the decision, not the query.",
    },
    {
      topic: "Reflection",
      shortTitle: "Measuring lift",
      question: "How did the team track outcomes after adopting your analysis?",
      takeawayHint: "Quantify the before-and-after lift.",
    },
    {
      topic: "Experimentation",
      shortTitle: "A/B test pitfalls",
      question: "Describe a safeguard or guardrail metric you add when reading an A/B test.",
      takeawayHint: "Mention novelty effects or sample size.",
    },
    {
      topic: "Automation",
      shortTitle: "Self-serve reporting",
      question: "Share a recurring manual report you automated and how it freed analyst time.",
      takeawayHint: "Mention hours saved or error reduction.",
    },
    {
      topic: "Final reflection",
      shortTitle: "Analytical discipline",
      question: "What checklist do you run before sending any high-visibility numbers?",
      takeawayHint: "Keep it crisp and repeatable.",
    },
  ],
  "Frontend Developer": [
    {
      topic: "UI engineering",
      shortTitle: "Tell me about yourself",
      question: "Tell me about your frontend focus and a complex UI interaction you enjoyed engineering.",
      takeawayHint: "Highlight state management, motion, and accessibility.",
    },
    {
      topic: "Performance debugging",
      shortTitle: "Performance bottleneck",
      question: "Walk me through a sluggish page or render bottleneck you profiled and sped up.",
      takeawayHint: "Mention bundle size, LCP/INP, or re-render fixes.",
    },
    {
      topic: "Release pressure",
      shortTitle: "Pre-launch bug triage",
      question: "Tell me about a critical UI bug found right before shipping and how you handled it.",
      takeawayHint: "Show disciplined reproduction and testing.",
    },
    {
      topic: "Design partnership",
      shortTitle: "Design-to-code",
      question: "How do you collaborate with designers when an edge case isn’t yet specified in Figma?",
      takeawayHint: "Highlight responsive states and keyboard UX.",
    },
    {
      topic: "Quality reflection",
      shortTitle: "Final reflection",
      question: "What testing or component guardrail kept that fix solid after launch?",
      takeawayHint: "Mention regression coverage and code health.",
    },
    {
      topic: "Accessibility",
      shortTitle: "Keyboard & screen readers",
      question: "Describe an accessible custom widget you built and how you tested focus management.",
      takeawayHint: "Mention roving tabindex, ARIA, and focus return.",
    },
    {
      topic: "Architecture",
      shortTitle: "Component boundaries",
      question: "When do you extract a shared UI primitive versus keeping logic local to a page?",
      takeawayHint: "Balance DRY discipline with readability.",
    },
    {
      topic: "Next craft goal",
      shortTitle: "Looking ahead",
      question: "What frontend standard or browser capability are you excited to apply next?",
      takeawayHint: "Tie curiosity to real user value.",
    },
  ],
  "Customer Success": [
    {
      topic: "Customer empathy",
      shortTitle: "Tell me about yourself",
      question: "Tell me what draws you to Customer Success and how you build trust early with an account.",
      takeawayHint: "Connect onboarding clarity to retention.",
    },
    {
      topic: "Turning around risk",
      shortTitle: "Escalation turnaround",
      question: "Walk me through an unhappy customer escalation you turned into a confident renewal.",
      takeawayHint: "Show listening, root-cause action, and follow-through.",
    },
    {
      topic: "High pressure",
      shortTitle: "Handling peak pressure",
      question: "Tell me about a time multiple accounts needed urgent support at once.",
      takeawayHint: "Explain triage criteria and expectation setting.",
    },
    {
      topic: "Internal partnership",
      shortTitle: "Coordinating fixes",
      question: "How did you partner with Product or Support to resolve the underlying blocker?",
      takeawayHint: "Frame customer impact with concrete examples.",
    },
    {
      topic: "Impact review",
      shortTitle: "Measuring success",
      question: "What outcome confirmed the relationship was back on track?",
      takeawayHint: "Cite adoption, NPS, or renewal metrics.",
    },
    {
      topic: "QBR preparation",
      shortTitle: "Value storytelling",
      question: "How do you structure an executive business review when product usage has dipped?",
      takeawayHint: "Turn data into an action plan.",
    },
    {
      topic: "Onboarding speed",
      shortTitle: "Time to first value",
      question: "Describe a small change you made to customer onboarding that reduced early churn.",
      takeawayHint: "Highlight measurable time-to-value.",
    },
    {
      topic: "Closing question",
      shortTitle: "Coaching reflection",
      question: "What communication habit has helped you de-escalate tense calls most reliably?",
      takeawayHint: "End with calm, repeatable clarity.",
    },
  ],
};

/**
 * Exact Figma seeded session matching frames 3:2 (02), 2:622 (03), and 15:2 (04).
 */
export function createSeededSoftwareEngineerSession(
  status: "in_progress" | "completed" = "in_progress"
): PracticeSessionState {
  const questionResults: QuestionResultItem[] = [
    {
      number: "01",
      title: "Tell me about yourself",
      takeaway: "Connect your experience to the role.",
      score: 8.0,
      prompt: "Tell me about yourself and what engineering problems excite you most right now.",
      userAnswer:
        "I’m a software engineer focused on reliable frontend architecture and user-facing developer tools. Over the past three years I’ve led core checkout and workflow improvements that cut latency while keeping releases steady.",
      coachFeedback: "Clear trajectory; naming a concrete metric up front would make your opener even punchier.",
    },
    {
      number: "02",
      title: "A project you’re proud of",
      takeaway: "Strong ownership and clear structure.",
      score: 8.4,
      prompt: "Tell me about a project you’re especially proud of owning end-to-end.",
      userAnswer:
        "During a product release, we discovered a critical bug one day before launch. It risked breaking a key user flow, so we had to quickly triage, fix, and retest it to avoid delaying the release.",
      coachFeedback: "Well-paced problem framing; interviewers immediately understand the stakes and urgency.",
    },
    {
      number: "03",
      title: "Handling pressure",
      takeaway: "Add a measurable result to your story.",
      score: 8.2,
      prompt: "Tell me about a time you handled pressure at work or in a project.",
      userAnswer:
        "I assessed the issue to understand the root cause, proposed a fix, and worked closely with QA to validate it through a focused test run. I also kept the team aligned on progress and risks, which helped us ship on time.",
      coachFeedback: "Strong ownership and calm coordination. Quantify release uptime or customer impact for a 9+ answer.",
    },
    {
      number: "04",
      title: "Follow-up",
      takeaway: "Make the team’s contribution more specific.",
      score: 8.1,
      prompt: "What specific actions did you take, and how did you coordinate with the team?",
      userAnswer:
        "I paired with our QA lead on a 6-case smoke suite while another engineer reviewed my rollback guardrails, keeping Slack updates every 30 minutes so PMs could green-light launch confidently.",
      coachFeedback: "Great coordination rhythm; highlight how QA’s test findings shaped your final guardrail.",
    },
    {
      number: "05",
      title: "Final question",
      takeaway: "Clear reflection and a thoughtful close.",
      score: 8.3,
      prompt: "What helped you stay calm and effective during that situation?",
      userAnswer:
        "Writing down what we knew, what we needed to verify, and our fallback rollback path removed guesswork so the whole team stayed focused on facts instead of urgency noise.",
      coachFeedback: "Composed, practical takeaway that shows engineering maturity under deadline pressure.",
    },
  ];

  const seededTurns: ChatTurn[] = [
    {
      id: "seed-1",
      sender: "sir-bot",
      timestamp: "10:24 AM",
      topic: "Handling pressure",
      content: "Tell me about a time you handled pressure at work or in a project.",
    },
    {
      id: "seed-2",
      sender: "user",
      timestamp: "10:26 AM",
      content:
        "During a product release, we discovered a critical bug one day before launch. It risked breaking a key user flow, so we had to quickly triage, fix, and retest it to avoid delaying the release.",
    },
    {
      id: "seed-3",
      sender: "sir-bot",
      timestamp: "10:27 AM",
      topic: "Handling pressure",
      content: "What specific actions did you take, and how did you coordinate with the team?",
    },
    {
      id: "seed-4",
      sender: "user",
      timestamp: "10:29 AM",
      content:
        "I assessed the issue to understand the root cause, proposed a fix, and worked closely with QA to validate it through a focused test run. I also kept the team aligned on progress and risks, which helped us ship on time.",
    },
    {
      id: "seed-5",
      sender: "sir-bot",
      timestamp: "10:31 AM",
      topic: "Handling pressure",
      content: "What helped you stay calm and effective during that situation?",
    },
  ];

  const breakdown: RubricScores = {
    clarity: 8.5,
    structure: 8.5,
    relevance: 8.0,
    impact: 7.8,
  };

  const workingWell = ["Clear structure", "Ownership", "Problem-solving"];
  const improveNext: ImprovementNote[] = [
    {
      code: "01",
      title: "Quantify impact",
      detail: "Add a result, number, or outcome.",
    },
    {
      code: "02",
      title: "Highlight collaboration",
      detail: "Show how you brought others in.",
    },
  ];

  return {
    id: "session-software-engineer",
    config: {
      role: "Software Engineer",
      difficulty: "Normal",
      questionRange: "5-8",
      tone: "Witty",
    },
    status,
    totalQuestions: 5,
    currentQuestionIndex: status === "completed" ? 5 : 3,
    currentTopic: "Handling pressure",
    turns: seededTurns,
    liveScore: {
      questionLabel: "Q3 · Handling pressure",
      overallScore: 8.2,
      verdict: "Strong answer",
      verdictDetail: "Clear ownership and a logical approach.",
      breakdown,
      workingWell,
      improveNext,
    },
    finalResults:
      status === "completed"
        ? {
            totalQuestions: 5,
            completedQuestions: 5,
            finalScore: 8.2,
            ratingLabel: "Strong performance",
            headline: "A strong foundation.",
            summaryLines: [
              "You told a clear story and took ownership of your actions.",
              "Make the outcome just as specific as your approach.",
            ],
            nextFocusLine: "Next focus: show measurable impact.",
            breakdown,
            questionResults,
            keepDoingThis: workingWell,
            focusOnNext: [
              {
                code: "01",
                title: "Quantify your impact",
                detail: "Add a result, number, or outcome.",
              },
              {
                code: "02",
                title: "Highlight collaboration",
                detail: "Show how you brought others in.",
              },
            ],
          }
        : null,
  };
}

export function createSeededProductDesignerSession(): PracticeSessionState {
  const breakdown: RubricScores = {
    clarity: 8.4,
    structure: 8.1,
    relevance: 8.6,
    impact: 7.9,
  };

  return {
    id: "session-product-designer",
    config: {
      role: "Product Designer",
      difficulty: "Normal",
      questionRange: "5-8",
      tone: "Friendly",
    },
    status: "completed",
    totalQuestions: 5,
    currentQuestionIndex: 5,
    currentTopic: "Portfolio walkthrough",
    turns: [
      {
        id: "pd-1",
        sender: "sir-bot",
        timestamp: "Yesterday",
        topic: "Portfolio walkthrough",
        content: "Walk me through a design project where user research completely shifted your early concept.",
      },
      {
        id: "pd-2",
        sender: "user",
        timestamp: "Yesterday",
        content:
          "During our onboarding redesign, 5 out of 7 interviewees stalled on account setup before seeing sample templates. I flipped the flow to preview a live template first and reduced drop-off by 28%.",
      },
    ],
    liveScore: {
      questionLabel: "Q2 · Portfolio walkthrough",
      overallScore: 8.3,
      verdict: "Thoughtful storytelling",
      verdictDetail: "User evidence drove your layout decision clearly.",
      breakdown,
      workingWell: ["User empathy", "Concrete insight", "Measured lift"],
      improveNext: [
        {
          code: "01",
          title: "Name rejected ideas",
          detail: "Briefly share what alternatives you ruled out.",
        },
        {
          code: "02",
          title: "Partner handoff",
          detail: "Mention how you aligned specs with engineers.",
        },
      ],
    },
    finalResults: {
      totalQuestions: 5,
      completedQuestions: 5,
      finalScore: 8.3,
      ratingLabel: "Strong performance",
      headline: "Clear product thinking.",
      summaryLines: [
        "Your portfolio narrative connects user research directly to design changes.",
        "Go one step deeper on constraints and engineering trade-offs.",
      ],
      nextFocusLine: "Next focus: explain rejected directions and handoff rigor.",
      breakdown,
      questionResults: [
        {
          number: "01",
          title: "Design background",
          takeaway: "Clear craft positioning and product sense.",
          score: 8.1,
          prompt: ROLE_PROMPTS["Product Designer"][0].question,
          userAnswer: "I specialize in simplifying complex workflows into calm, high-trust consumer experiences.",
          coachFeedback: "Crisp opener; tie your specialization to a signature product challenge.",
        },
        {
          number: "02",
          title: "Portfolio walkthrough",
          takeaway: "Research evidence changed the onboarding flow.",
          score: 8.6,
          prompt: ROLE_PROMPTS["Product Designer"][1].question,
          userAnswer:
            "Watching 5 of 7 users pause on setup convinced us to move live templates ahead of signup, lifting activation by 28%.",
          coachFeedback: "Strongest answer — clear research insight paired with measurable impact.",
        },
        {
          number: "03",
          title: "Handling tight scope",
          takeaway: "Protected core usability under timeline pressure.",
          score: 8.2,
          prompt: ROLE_PROMPTS["Product Designer"][2].question,
          userAnswer: "We cut secondary filters for v1 so engineers could polish inline keyboard navigation before beta.",
          coachFeedback: "Smart trade-off logic; mention how you tracked skipped edge cases afterward.",
        },
        {
          number: "04",
          title: "Design critique",
          takeaway: "Anchored pushback in usability recordings.",
          score: 8.2,
          prompt: ROLE_PROMPTS["Product Designer"][3].question,
          userAnswer: "Sharing 2-minute user clips during critique turned debate into shared problem solving.",
          coachFeedback: "Concrete collaboration technique that earns stakeholder buy-in.",
        },
        {
          number: "05",
          title: "Post-launch reflection",
          takeaway: "Good balance of metrics and qualitative follow-ups.",
          score: 8.4,
          prompt: ROLE_PROMPTS["Product Designer"][4].question,
          userAnswer: "We paired activation funnel tracking with 14-day support ticket tagging to refine microcopy.",
          coachFeedback: "Strong closing loop between analytics and ongoing craft.",
        },
      ],
      keepDoingThis: ["User empathy", "Evidence-backed decisions", "Measured outcomes"],
      focusOnNext: [
        {
          code: "01",
          title: "Compare trade-offs",
          detail: "Mention 1–2 alternatives you tested and set aside.",
        },
        {
          code: "02",
          title: "System handoff notes",
          detail: "Describe token or edge-case specs shared with engineers.",
        },
      ],
    },
  };
}

export function createFreshInterviewSession(config: InterviewSetupConfig): PracticeSessionState {
  const totalQuestions = QUESTION_COUNT_BY_RANGE[config.questionRange];
  const blueprint = ROLE_PROMPTS[config.role][0];
  const toneGreeting: Record<CoachTone, string> = {
    Friendly: "Warm welcome! Take a breath — let’s ease into Question 1. ",
    Witty: "Mic check, deep breath, let’s make Sir Bot proud. Question 1: ",
    Direct: "Let’s get straight to it. Question 1: ",
  };

  return {
    id: `session-${config.role.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
    config,
    status: "in_progress",
    totalQuestions,
    currentQuestionIndex: 1,
    currentTopic: blueprint.topic,
    turns: [
      {
        id: "turn-q1",
        sender: "sir-bot",
        timestamp: formatNowTime(),
        topic: blueprint.topic,
        content: `${toneGreeting[config.tone]}${blueprint.question}`,
      },
    ],
    liveScore: null,
    finalResults: null,
  };
}

export function formatNowTime(): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date());
  } catch {
    return "Just now";
  }
}

function clampScore(value: number): number {
  return Math.round(Math.min(9.6, Math.max(5.8, value)) * 10) / 10;
}

/**
 * Evaluates a user's written answer locally using STAR structure, metrics, ownership verbs,
 * and clarity cues so interactive sessions feel responsive and realistic offline.
 */
export function evaluateAnswerAndAdvance(
  session: PracticeSessionState,
  rawAnswer: string
): PracticeSessionState {
  const answer = rawAnswer.trim();
  const words = answer.split(/\s+/).filter(Boolean).length;
  const hasMetrics = /\d+%?|\bx\b|million|thousand|hours|days|ms|seconds/i.test(answer);
  const hasOwnership = /\b(I|my|led|built|designed|proposed|owned|coordinated|fixed|analyzed|shipped)\b/i.test(
    answer
  );
  const hasCollaboration = /\b(team|qa|engineer|design|pm|stakeholder|paired|together|aligned|client)\b/i.test(
    answer
  );
  const hasOutcome = /\b(result|helped|avoid|shipped|reduced|improved|increased|saved|resolved|launched|learned)\b/i.test(
    answer
  );

  const lengthBonus = words >= 35 ? 1.4 : words >= 18 ? 0.9 : words >= 8 ? 0.4 : -0.4;
  const clarity = clampScore(7.2 + lengthBonus * 0.65 + (words >= 12 ? 0.4 : 0));
  const structure = clampScore(7.0 + (hasOwnership ? 0.7 : 0.2) + (hasOutcome ? 0.6 : 0.1) + lengthBonus * 0.35);
  const relevance = clampScore(7.4 + (words >= 10 ? 0.5 : 0) + (hasCollaboration ? 0.4 : 0.1));
  const impact = clampScore(6.9 + (hasMetrics ? 1.4 : 0.2) + (hasOutcome ? 0.6 : 0.1));
  const overallScore = clampScore((clarity + structure + relevance + impact) / 4);

  const workingWell: string[] = [];
  if (clarity >= 8.0) workingWell.push("Clear phrasing");
  else workingWell.push("Focused opener");
  if (hasOwnership) workingWell.push("Clear ownership");
  if (hasCollaboration) workingWell.push("Team alignment");
  if (hasOutcome && workingWell.length < 3) workingWell.push("Outcome mindset");
  while (workingWell.length < 3) {
    workingWell.push("Logical flow");
  }

  const improveNext: ImprovementNote[] = [];
  if (!hasMetrics) {
    improveNext.push({
      code: "01",
      title: "Quantify impact",
      detail: "Add a concrete number, metric, or timeframe.",
    });
  } else {
    improveNext.push({
      code: "01",
      title: "Sharpen constraints",
      detail: "Briefly state why this trade-off mattered most.",
    });
  }

  if (!hasCollaboration) {
    improveNext.push({
      code: "02",
      title: "Highlight collaboration",
      detail: "Show how you brought teammates along.",
    });
  } else {
    improveNext.push({
      code: "02",
      title: "Reinforce reflection",
      detail: "Close with one takeaway you still apply today.",
    });
  }

  const qNumber = session.currentQuestionIndex;
  const currentTopic = session.currentTopic;

  const verdict =
    overallScore >= 8.4
      ? "Compelling answer"
      : overallScore >= 7.7
        ? "Strong answer"
        : overallScore >= 7.0
          ? "Solid foundation"
          : "Good start — add specifics";

  const verdictDetail = hasMetrics && hasOwnership
    ? "Strong STAR structure backed by clear ownership and metrics."
    : hasOwnership
      ? "Clear ownership and a logical approach."
      : "Try anchoring sentences with your specific actions and outcome.";

  const nextSnapshot: LiveScoreSnapshot = {
    questionLabel: `Q${qNumber} · ${currentTopic}`,
    overallScore,
    verdict,
    verdictDetail,
    breakdown: { clarity, structure, relevance, impact },
    workingWell: workingWell.slice(0, 3),
    improveNext: improveNext.slice(0, 2),
  };

  const userTurn: ChatTurn = {
    id: `turn-u-${Date.now()}`,
    sender: "user",
    timestamp: formatNowTime(),
    content: answer,
  };

  const nextQuestionNum = qNumber + 1;
  const rolePool = ROLE_PROMPTS[session.config.role];

  if (nextQuestionNum > session.totalQuestions) {
    const completedSession: PracticeSessionState = {
      ...session,
      turns: [...session.turns, userTurn],
      liveScore: nextSnapshot,
    };
    return buildCompletedResultsSession(completedSession);
  }

  const nextBlueprint = rolePool[(nextQuestionNum - 1) % rolePool.length];
  const toneTransition: Record<CoachTone, string> = {
    Friendly: hasMetrics
      ? "Love the concrete detail there! "
      : "Helpful context — adding a number there will make it shine even more. ",
    Witty: hasMetrics
      ? "Ooh, numbers! Hiring managers practically frame answers like that. "
      : "Nice framing! Next round, slip in one juicy metric if you have one. ",
    Direct: hasMetrics
      ? "Clear and backed by numbers. Moving on: "
      : "Solid structure; tighten the measurable outcome next time. ",
  };

  const botTurn: ChatTurn = {
    id: `turn-b-${Date.now() + 1}`,
    sender: "sir-bot",
    timestamp: formatNowTime(),
    topic: nextBlueprint.topic,
    content: `${toneTransition[session.config.tone]}${nextBlueprint.question}`,
  };

  return {
    ...session,
    status: "in_progress",
    currentQuestionIndex: nextQuestionNum,
    currentTopic: nextBlueprint.topic,
    turns: [...session.turns, userTurn, botTurn],
    liveScore: nextSnapshot,
  };
}

/**
 * Completes an active interview session and synthesizes Screen 04 results.
 * For the seeded Software Engineer session without extra edits, returns the exact Figma 04 dataset.
 */
export function buildCompletedResultsSession(
  session: PracticeSessionState
): PracticeSessionState {
  if (
    session.id === "session-software-engineer" &&
    session.turns.filter((t) => t.sender === "user").length === 2
  ) {
    return createSeededSoftwareEngineerSession("completed");
  }

  const prompts = ROLE_PROMPTS[session.config.role];
  const userMessages = session.turns.filter((t) => t.sender === "user");
  const botMessages = session.turns.filter((t) => t.sender === "sir-bot");

  const breakdown = session.liveScore?.breakdown ?? {
    clarity: 8.1,
    structure: 8.0,
    relevance: 8.2,
    impact: 7.7,
  };
  const baseScore = session.liveScore?.overallScore ?? 8.0;

  const rowCount = Math.min(Math.max(userMessages.length, session.totalQuestions), prompts.length);
  const questionResults: QuestionResultItem[] = Array.from({ length: rowCount }, (_, idx) => {
    const bp = prompts[idx % prompts.length];
    const answered = userMessages[idx];
    const promptTurn = botMessages[idx];
    const delta = ((idx % 3) - 1) * 0.2;
    const itemScore = answered ? clampScore(baseScore + delta) : clampScore(baseScore - 0.3);

    return {
      number: String(idx + 1).padStart(2, "0"),
      title: bp.shortTitle,
      takeaway: answered ? bp.takeawayHint : "Ended before answering — try completing this prompt next round.",
      score: itemScore,
      prompt: promptTurn?.content ?? bp.question,
      userAnswer:
        answered?.content ?? "No answer recorded before the session was ended.",
      coachFeedback: answered
        ? `Strong progression on ${bp.topic.toLowerCase()}. ${bp.takeawayHint}`
        : "Run another quick practice round to capture a response for this question.",
    };
  });

  const completedQuestions = Math.max(userMessages.length, 1);

  return {
    ...session,
    status: "completed",
    currentQuestionIndex: session.totalQuestions,
    finalResults: {
      totalQuestions: rowCount,
      completedQuestions,
      finalScore: baseScore,
      ratingLabel: baseScore >= 8.0 ? "Strong performance" : "Solid foundation",
      headline: baseScore >= 8.0 ? "A strong foundation." : "Steady progress in motion.",
      summaryLines: [
        "You told a clear story and took ownership of your actions.",
        "Make the outcome just as specific as your approach.",
      ],
      nextFocusLine: "Next focus: show measurable impact.",
      breakdown,
      questionResults,
      keepDoingThis: session.liveScore?.workingWell ?? [
        "Clear structure",
        "Ownership",
        "Problem-solving",
      ],
      focusOnNext: (session.liveScore?.improveNext ?? [
        {
          code: "01",
          title: "Quantify your impact",
          detail: "Add a result, number, or outcome.",
        },
        {
          code: "02",
          title: "Highlight collaboration",
          detail: "Show how you brought others in.",
        },
      ]).map((item, idx) => ({
        ...item,
        code: String(idx + 1).padStart(2, "0"),
        title: idx === 0 && item.title === "Quantify impact" ? "Quantify your impact" : item.title,
      })),
    },
  };
}

export function normalizePracticeScreen(raw?: string | string[]): PracticeScreenId {
  const value = Array.isArray(raw) ? raw[0] : raw;
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
    default:
      return "01";
  }
}
