"""Curated interview content, role presets, tips guides, and FAQ copy."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

from backend.schemas import CoachTone, InterviewDifficulty, QuestionRange

JOB_ROLE_OPTIONS: tuple[str, ...] = (
    "Software Engineer",
    "Product Designer",
    "Product Manager",
    "Data Analyst",
    "Frontend Developer",
    "Customer Success",
)

DIFFICULTY_OPTIONS: tuple[InterviewDifficulty, ...] = ("Easy", "Normal", "Hard")
QUESTION_RANGE_OPTIONS: tuple[QuestionRange, ...] = ("3-5", "5-8", "8-10")
TONE_OPTIONS: tuple[CoachTone, ...] = ("Friendly", "Witty", "Direct")

ESTIMATED_DURATION_BY_RANGE: dict[QuestionRange, str] = {
    "3-5": "5 to 10 minutes",
    "5-8": "10 to 20 minutes",
    "8-10": "20 to 30 minutes",
}

TipCategory = Literal[
    "Answer structure",
    "Showing impact",
    "Confidence",
    "Asking questions",
]

TIP_CATEGORIES: tuple[str, ...] = (
    "All guides",
    "Answer structure",
    "Showing impact",
    "Confidence",
    "Asking questions",
)

SAVED_ANSWER_TAGS: tuple[str, ...] = (
    "Ownership",
    "Problem-solving",
    "Impact",
    "Collaboration",
)


@dataclass(frozen=True)
class StarterPreset:
    role: str
    meta: str
    difficulty: InterviewDifficulty
    question_range: QuestionRange
    tone: CoachTone


STARTER_PRESETS: tuple[StarterPreset, ...] = (
    StarterPreset(
        role="Software Engineer",
        meta="Behavioral round · 3-5 questions · Friendly",
        difficulty="Easy",
        question_range="3-5",
        tone="Friendly",
    ),
    StarterPreset(
        role="Product Designer",
        meta="Portfolio walkthrough · 5-8 questions · Witty",
        difficulty="Normal",
        question_range="5-8",
        tone="Witty",
    ),
    StarterPreset(
        role="Frontend Developer",
        meta="UI engineering · 5-8 questions · Direct",
        difficulty="Normal",
        question_range="5-8",
        tone="Direct",
    ),
)

STAR_ITEMS: tuple[tuple[str, str, str], ...] = (
    ("S", "Situation", "Set the scene and constraints in one or two sentences."),
    ("T", "Task", "Name the exact responsibility or outcome you owned."),
    ("A", "Action", "Walk through the steps you personally led and why."),
    ("R", "Result", "State what changed in concrete terms and what you learned."),
)


@dataclass(frozen=True)
class GuideStep:
    code: str
    heading: str
    detail: str


@dataclass(frozen=True)
class InterviewGuide:
    id: str
    category: TipCategory
    read_time: str
    title: str
    summary: str
    lead: str
    before_example: str
    after_example: str
    example_caption: str
    framework_title: str
    steps: tuple[GuideStep, ...]
    drill_role: str
    drill_difficulty: InterviewDifficulty
    drill_range: QuestionRange
    drill_tone: CoachTone


INTERVIEW_GUIDES: tuple[InterviewGuide, ...] = (
    InterviewGuide(
        id="measurable-impact",
        category="Showing impact",
        read_time="2 min",
        title="Make your impact measurable",
        summary="A clear action is good. A clear outcome is better. Help the interviewer see what changed because of your work.",
        lead="Interviewers remember stories that end with a concrete change for users, teammates, or the business. Anchor your closing sentence in evidence you can explain comfortably.",
        before_example="I helped fix a bug before launch.",
        after_example="I led triage with QA, added a rollback guardrail, and cut checkout errors from 12% to 0.4% before launch.",
        example_caption="Example only. Always use numbers and scope you can stand behind.",
        framework_title="Three ways to find a real metric",
        steps=(
            GuideStep(
                "01",
                "Compare before and after",
                "Look at latency, error rate, drop-off, or turnaround time before your change versus after.",
            ),
            GuideStep(
                "02",
                "Name the scope you owned",
                "State how many users, workflows, accounts, or teammates relied on the change.",
            ),
            GuideStep(
                "03",
                "Use time saved when telemetry is missing",
                "Turning a weekly two-hour manual check into a fifteen-minute workflow proves real leverage.",
            ),
        ),
        drill_role="Software Engineer",
        drill_difficulty="Normal",
        drill_range="3-5",
        drill_tone="Direct",
    ),
    InterviewGuide(
        id="clear-star-answer",
        category="Answer structure",
        read_time="2 min",
        title="Build a clear STAR answer",
        summary="Give your story a crisp beginning, a personal contribution, and an unmistakable finish.",
        lead="Structured answers keep interviewers engaged without sounding scripted. Spend about twenty percent on context, sixty percent on your actions, and twenty percent on the result.",
        before_example="Our API was slow during finals week and everyone was stressed, so we rewrote queries until it felt faster.",
        after_example="Our checkout API spiked to 2.4s p95 before launch. I profiled the slow join, paired with our backend lead on a composite index, and lowered p95 latency to 280ms with zero downtime.",
        example_caption="Keep Situation and Task concise so your personal Action stands out.",
        framework_title="How to pace each STAR beat",
        steps=(
            GuideStep(
                "01",
                "Frame the stakes in one sentence",
                "State what was at risk, such as a release date or user drop-off, and skip unnecessary backstory.",
            ),
            GuideStep(
                "02",
                "Switch from we to I during Action",
                "Clarify the judgment calls, prototypes, or coordination steps you personally drove.",
            ),
            GuideStep(
                "03",
                "Land cleanly on Result and reflection",
                "Close with the measurable outcome and one habit you kept for future projects.",
            ),
        ),
        drill_role="Software Engineer",
        drill_difficulty="Normal",
        drill_range="5-8",
        drill_tone="Witty",
    ),
    InterviewGuide(
        id="introduce-in-60s",
        category="Confidence",
        read_time="3 min",
        title="Introduce yourself in 60 seconds",
        summary="Connect your background directly to the role rather than reciting your entire resume.",
        lead="Your opener sets the rhythm for the whole conversation. Use a calm Present, Past, Next arc that bridges straight to the team's current priorities.",
        before_example="I graduated in 2024, did an internship, worked on a few school projects, learned React and Python, and now I am looking for a good team.",
        after_example="I am a software engineer focused on fast, reliable user workflows. Most recently I owned checkout improvements that cut drop-off by 18%, and I am drawn to your team's focus on developer tools.",
        example_caption="Aim for four to five crisp sentences, roughly 45 to 60 seconds spoken.",
        framework_title="The Present, Past, Next opener",
        steps=(
            GuideStep(
                "01",
                "Present: state your headline focus",
                "Name your craft and the kinds of problems you enjoy solving most.",
            ),
            GuideStep(
                "02",
                "Past: share one proof point",
                "Pick your strongest recent project and one concrete outcome it delivered.",
            ),
            GuideStep(
                "03",
                "Next: connect to this role",
                "Tie your direction directly to the product or engineering challenge ahead.",
            ),
        ),
        drill_role="Frontend Developer",
        drill_difficulty="Easy",
        drill_range="3-5",
        drill_tone="Friendly",
    ),
    InterviewGuide(
        id="difficult-moment",
        category="Answer structure",
        read_time="3 min",
        title="Talk about a difficult moment",
        summary="Show calm reasoning, clear priorities, and collaborative trade-offs under pressure.",
        lead="Questions about conflict, mistakes, or tight deadlines are not traps. Interviewers look for self-awareness, objective decision-making, and accountability.",
        before_example="A teammate disagreed with my architecture and delayed our sprint, so I redid parts of the module myself.",
        after_example="We disagreed on caching strategy two days before freeze. I prototyped both options in 40 minutes, benchmarked latency together, and we shipped the hybrid design on time.",
        example_caption="Focus on shared goals, objective facts, and what improved afterward.",
        framework_title="How to stay constructive under tough questions",
        steps=(
            GuideStep(
                "01",
                "Describe the tension neutrally",
                "Frame disagreements around constraints and user goals, never blame.",
            ),
            GuideStep(
                "02",
                "Show how you aligned on facts",
                "Point to usability notes, benchmarks, or a quick test that settled the debate.",
            ),
            GuideStep(
                "03",
                "Name the guardrail you built after",
                "Explain how the setback improved your workflow or team habits long term.",
            ),
        ),
        drill_role="Software Engineer",
        drill_difficulty="Hard",
        drill_range="5-8",
        drill_tone="Direct",
    ),
    InterviewGuide(
        id="ask-great-questions",
        category="Asking questions",
        read_time="2 min",
        title="Ask questions that work for you",
        summary="Close the interview by asking about priorities, decision-making, and real success criteria.",
        lead="The final five minutes turn an evaluation into a peer conversation. Ask specific questions that reveal how the team ships and what makes someone successful early on.",
        before_example="What does a typical day look like on the team?",
        after_example="What is one product or reliability milestone that would make someone's first 90 days in this role feel like a clear win?",
        example_caption="Prepare two role-focused questions and one team-ritual question ahead of time.",
        framework_title="Three high-signal closing questions",
        steps=(
            GuideStep(
                "01",
                "Ask about 90-day impact",
                "Uncovers immediate team priorities and lets you align your closing summary.",
            ),
            GuideStep(
                "02",
                "Ask how decisions get made",
                "Signals maturity around engineering, design, and product collaboration.",
            ),
            GuideStep(
                "03",
                "Ask what is hardest right now",
                "Invites an honest discussion of real constraints rather than surface polish.",
            ),
        ),
        drill_role="Product Manager",
        drill_difficulty="Normal",
        drill_range="3-5",
        drill_tone="Friendly",
    ),
)

HELP_REFERENCE_CARDS: tuple[tuple[str, str], ...] = (
    (
        "STAR rubric scoring",
        "Every accepted answer is scored from 0.0 to 10.0 across Clarity, Structure, Relevance, and Impact using calibrated coaching anchors.",
    ),
    (
        "Resume-tailored RAG",
        "Uploaded PDF, DOCX, TXT, or MD resumes are chunked and embedded locally in ChromaDB alongside role guides to tailor questions and feedback.",
    ),
    (
        "Prompt safety guardrails",
        "Input filtering, XML isolation, and sandwich reminders keep Sir Bot in interviewer mode and ignore prompt-injection attempts inside answers or resumes.",
    ),
)

HELP_FAQ_ITEMS: tuple[tuple[str, str], ...] = (
    (
        "Does ending an interview early still generate results?",
        "Yes. Selecting End interview scores every question you have already answered and opens the full results summary, rubric averages, and downloadable transcript.",
    ),
    (
        "What happens if I upload an unrelated file instead of a resume?",
        "Sir Bot checks whether the uploaded document matches your target job role during session planning. If it looks unrelated, Sir Bot mentions it politely in the opening message and proceeds with standard role questions.",
    ),
    (
        "Can I practice for a job role that is not in the preset list?",
        "Yes. Type any custom role directly into the Job role field in Interview Setup, such as Accountant, Nurse, or Backend Engineer, and Sir Bot will tailor the question plan to it.",
    ),
    (
        "How does the Live score preview panel work?",
        "After each answer, Sir Bot evaluates your response across Clarity, Structure, Relevance, and Impact. You can toggle the Live score preview open or closed at any point during the conversation.",
    ),
    (
        "Where is my practice history stored and how can I export it?",
        "Completed sessions, saved answers, and defaults are stored locally in your workspace state file. You can download individual study sheets as plain text from Transcript or export everything as JSON from Profile.",
    ),
    (
        "What if my API key is not configured yet?",
        "You can add your AIKI_API_KEY in the project .env file for live LLM evaluation. If no key is configured or the endpoint is unreachable, you can switch to Offline demo mode to explore the full interview loop locally.",
    ),
)


@dataclass(frozen=True)
class OfflinePromptSpec:
    topic: str
    short_title: str
    question: str
    expected_signals: tuple[str, str]


OFFLINE_ROLE_PROMPTS: dict[str, tuple[OfflinePromptSpec, ...]] = {
    "Software Engineer": (
        OfflinePromptSpec(
            "Introduction",
            "Tell me about yourself",
            "Tell me about yourself and what engineering problems excite you most right now.",
            ("Relevant background", "Clear role motivation"),
        ),
        OfflinePromptSpec(
            "Project ownership",
            "A project you are proud of",
            "Walk me through a technical project you owned end to end and the key trade-offs you made.",
            ("Personal ownership", "Technical trade-offs"),
        ),
        OfflinePromptSpec(
            "Handling pressure",
            "Launch pressure",
            "Tell me about a time you handled unexpected pressure right before a release or deadline.",
            ("Calm triage", "Measurable outcome"),
        ),
        OfflinePromptSpec(
            "Collaboration",
            "Cross-team coordination",
            "Describe a technical disagreement with a teammate and how you aligned on a path forward.",
            ("Objective evidence", "Constructive alignment"),
        ),
        OfflinePromptSpec(
            "Reflection",
            "Lessons carried forward",
            "What engineering habit or guardrail did you adopt after a tough incident or project?",
            ("Self-awareness", "Repeatable guardrail"),
        ),
        OfflinePromptSpec(
            "System reliability",
            "Debugging a bottleneck",
            "Tell me about a performance or reliability bottleneck you diagnosed and how you verified the fix.",
            ("Root-cause debugging", "Verification metrics"),
        ),
        OfflinePromptSpec(
            "Prioritization",
            "Managing technical debt",
            "Share a time you balanced shipping a feature on time against cleaning up risky technical debt.",
            ("Risk assessment", "Stakeholder clarity"),
        ),
        OfflinePromptSpec(
            "Looking ahead",
            "Next craft milestone",
            "What engineering skill are you deliberately sharpening over the next six months and why?",
            ("Intentional growth", "Team impact"),
        ),
    ),
    "Product Designer": (
        OfflinePromptSpec(
            "Design background",
            "Tell me about yourself",
            "Tell me about your design background and the kinds of product problems you enjoy solving.",
            ("Craft positioning", "Product sense"),
        ),
        OfflinePromptSpec(
            "Portfolio walkthrough",
            "Research shifting direction",
            "Walk me through a design project where user research changed your initial direction.",
            ("User evidence", "Design iteration"),
        ),
        OfflinePromptSpec(
            "Design constraints",
            "Scope trade-offs",
            "Tell me about a time timeline or engineering constraints forced a sharp scope cut.",
            ("Core UX protection", "Pragmatic scope"),
        ),
        OfflinePromptSpec(
            "Design critique",
            "Stakeholder alignment",
            "How did you bring product and engineering partners along when they pushed back on your flow?",
            ("Clear rationale", "Shared alignment"),
        ),
        OfflinePromptSpec(
            "Measuring impact",
            "Post-launch outcomes",
            "After shipping a major redesign, what signals told you it worked and what did you refine next?",
            ("Post-launch metrics", "Iterative craft"),
        ),
        OfflinePromptSpec(
            "Design systems",
            "Pattern consistency",
            "How do you decide when to reuse an existing component versus introduce a new pattern?",
            ("System judgment", "User familiarity"),
        ),
        OfflinePromptSpec(
            "Accessibility",
            "Inclusive interaction",
            "Share an accessibility improvement you championed and how you validated it.",
            ("WCAG rigor", "Validation method"),
        ),
        OfflinePromptSpec(
            "Reflection",
            "Design principle",
            "What separates surface visual polish from genuinely thoughtful product design in your work?",
            ("Clear philosophy", "Concrete example"),
        ),
    ),
    "Product Manager": (
        OfflinePromptSpec(
            "Product sense",
            "Background and vision",
            "Tell me what brought you into product management and a product experience you admire today.",
            ("User loop clarity", "Product judgment"),
        ),
        OfflinePromptSpec(
            "Prioritization",
            "Saying no with data",
            "Walk me through a tough prioritization call where you said no to a vocal stakeholder.",
            ("Decision criteria", "Stakeholder trust"),
        ),
        OfflinePromptSpec(
            "Execution under pressure",
            "Launch setback",
            "Tell me about a launch that hit unexpected friction close to release and how you responded.",
            ("Risk mitigation", "Recovery result"),
        ),
        OfflinePromptSpec(
            "Alignment",
            "Cross-functional sync",
            "How did you keep engineering, design, and leadership aligned when scope changed mid-cycle?",
            ("Communication rhythm", "Shared visibility"),
        ),
        OfflinePromptSpec(
            "Outcomes",
            "Metric ownership",
            "Which metric validated one of your recent launches, and what guardrail did you watch alongside it?",
            ("Leading and lagging metrics", "Honest reflection"),
        ),
        OfflinePromptSpec(
            "Discovery",
            "Validating ambiguity",
            "Describe how you validated a risky idea before committing an entire sprint to building it.",
            ("Lightweight experiment", "Evidence threshold"),
        ),
        OfflinePromptSpec(
            "Growth",
            "Funnel drop-off",
            "Share a user drop-off you investigated and the hypothesis that moved the metric.",
            ("Root-cause breakdown", "Measured lift"),
        ),
        OfflinePromptSpec(
            "Reflection",
            "Product lesson",
            "What hard product lesson changed how you run discovery or launches today?",
            ("Accountability", "Process upgrade"),
        ),
    ),
}


def get_offline_prompts_for_role(role: str, count: int) -> list[OfflinePromptSpec]:
    """Return a clean question plan for offline demo mode for any preset or custom role."""
    clean_role = role.strip() or "Software Engineer"
    if clean_role in OFFLINE_ROLE_PROMPTS:
        pool = list(OFFLINE_ROLE_PROMPTS[clean_role])
    else:
        pool = [
            OfflinePromptSpec(
                "Introduction",
                "Tell me about yourself",
                f"Tell me about your background and what draws you to {clean_role} work right now.",
                ("Relevant background", "Role motivation"),
            ),
            OfflinePromptSpec(
                "Core ownership",
                "A project you owned",
                f"Walk me through a {clean_role} responsibility or project you owned from start to finish.",
                ("Personal ownership", "Clear execution"),
            ),
            OfflinePromptSpec(
                "Handling pressure",
                "Working under pressure",
                f"Tell me about a time you handled unexpected pressure or a tight deadline in {clean_role}.",
                ("Calm prioritization", "Concrete result"),
            ),
            OfflinePromptSpec(
                "Collaboration",
                "Aligning with others",
                "Describe a time you coordinated across teammates when priorities conflicted.",
                ("Clear communication", "Shared outcome"),
            ),
            OfflinePromptSpec(
                "Reflection",
                "Key lesson learned",
                f"What habit or lesson has made you most effective in {clean_role} work?",
                ("Self-reflection", "Practical habit"),
            ),
            OfflinePromptSpec(
                "Problem solving",
                "Unblocking a setback",
                f"Share a tricky problem you diagnosed in {clean_role} and how you verified it stayed solved.",
                ("Structured diagnosis", "Verification"),
            ),
            OfflinePromptSpec(
                "Quality standards",
                "Protecting quality",
                f"Tell me about a time you caught a risk early before it affected customers or your team.",
                ("Proactive judgment", "Risk reduction"),
            ),
            OfflinePromptSpec(
                "Looking ahead",
                "Next growth goal",
                f"What capability in {clean_role} are you actively strengthening right now?",
                ("Focused growth", "Role impact"),
            ),
        ]
    while len(pool) < count:
        idx = len(pool) + 1
        pool.append(
            OfflinePromptSpec(
                "Role reflection",
                f"Follow-up {idx}",
                f"What concrete example best shows the value you bring as a {clean_role}?",
                ("Specific example", "Measurable outcome"),
            )
        )
    return pool[:count]
