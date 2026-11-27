"""Workspace state, cached backend engine/RAG bootstrap, local persistence, and exporters."""

from __future__ import annotations

from datetime import datetime, timezone
import json
from pathlib import Path
import re
import time
from typing import Any, Literal
from uuid import uuid4

from pydantic import BaseModel, Field
import streamlit as st

from backend.interview_engine import InterviewEngine
from backend.llm_client import API_KEY, LLMClient, LLMResponseError, MODEL
from backend.prompts import check_input_filter
from backend.rag import InterviewRAG, extract_resume_text
from backend.schemas import (
    ChatTurn,
    EvaluatedAnswer,
    FinalResultsSummary,
    ImprovementNote,
    InterviewQuestion,
    InterviewSetupConfig,
    LiveScoreSnapshot,
    PracticeSessionState,
    QUESTION_COUNT_BY_RANGE,
    QuestionResultItem,
    RubricScores,
    SessionRecord,
)
from ui.content import get_offline_prompts_for_role

WORKSPACE_DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "workspace_state.json"

WorkspaceView = Literal[
    "landing",
    "setup",
    "live",
    "results",
    "transcript",
    "sessions",
    "tips",
    "tips_detail",
    "profile",
    "help",
]

VALID_VIEWS: frozenset[str] = frozenset(
    {
        "landing",
        "setup",
        "live",
        "results",
        "transcript",
        "sessions",
        "tips",
        "tips_detail",
        "profile",
        "help",
    }
)


class UserProfile(BaseModel):
    display_name: str = "Candidate"
    headline: str = "Preparing for behavioral and role interviews"


class CoachingPreferences(BaseModel):
    auto_open_live_score: bool = True
    show_star_hints: bool = True


class SavedAnswerItem(BaseModel):
    id: str
    title: str
    role: str
    tag: str = "Ownership"
    score: float
    date_label: str
    answer: str
    coach_note: str
    session_id: str | None = None
    question_number: str | None = None


class StoredSession(BaseModel):
    record: SessionRecord
    created_at_iso: str
    updated_at_iso: str
    category_label: str = "Behavioral interview"
    is_sample: bool = False
    is_offline_demo: bool = False


class WorkspaceSnapshot(BaseModel):
    profile: UserProfile = Field(default_factory=UserProfile)
    defaults: InterviewSetupConfig = Field(default_factory=InterviewSetupConfig)
    preferences: CoachingPreferences = Field(default_factory=CoachingPreferences)
    sessions: list[StoredSession] = Field(default_factory=list)
    saved_answers: list[SavedAnswerItem] = Field(default_factory=list)
    saved_guide_ids: list[str] = Field(default_factory=list)


class UploadedResumeMeta(BaseModel):
    resume_id: str
    filename: str
    char_count: int
    chunk_count: int
    preview: str


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _now_clock() -> str:
    return datetime.now().strftime("%-I:%M %p")


def format_session_date(iso_str: str) -> tuple[str, str]:
    """Return (date_label, time_label) in clean human format from an ISO timestamp."""
    try:
        dt = datetime.fromisoformat(iso_str).astimezone()
        return dt.strftime("%b %-d, %Y"), dt.strftime("%-I:%M %p")
    except ValueError:
        return "Recently", ""


def load_workspace_snapshot(path: Path | None = None) -> WorkspaceSnapshot:
    """Load persisted workspace state or return an honest empty initial snapshot (0 sessions)."""
    target = path if path is not None else WORKSPACE_DATA_PATH
    if not target.is_file():
        return WorkspaceSnapshot()
    try:
        raw = json.loads(target.read_text(encoding="utf-8"))
        return WorkspaceSnapshot.model_validate(raw)
    except Exception:
        return WorkspaceSnapshot()


def save_workspace_snapshot(
    snapshot: WorkspaceSnapshot, path: Path | None = None
) -> None:
    """Persist workspace state atomically to local JSON."""
    target = path if path is not None else WORKSPACE_DATA_PATH
    target.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = target.with_suffix(".tmp")
    tmp_path.write_text(
        json.dumps(snapshot.model_dump(mode="json"), indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    tmp_path.replace(target)


class OfflineInterviewEngine:
    """Deterministic local evaluator for offline demo mode when no LLM API key is available."""

    def __init__(self, rag: InterviewRAG | None = None) -> None:
        self.rag = rag

    def start_session(
        self,
        config: InterviewSetupConfig,
        resume_id: str | None = None,
        resume_filename: str | None = None,
    ) -> SessionRecord:
        total = config.question_count or QUESTION_COUNT_BY_RANGE[config.question_range]
        prompts = get_offline_prompts_for_role(config.role, total)
        questions = [
            InterviewQuestion(
                number=f"{idx:02d}",
                topic=spec.topic,
                shortTitle=spec.short_title,
                question=spec.question,
                expectedSignals=list(spec.expected_signals),
            )
            for idx, spec in enumerate(prompts, start=1)
        ]

        sources: list[str] = []
        if self.rag:
            ctx = self.rag.retrieve_context(
                f"{config.role} projects experience impact", config.role, resume_id
            )
            sources = ctx["sources"]

        tone_openers = {
            "Friendly": "Welcome to your practice round. Take a breath and answer naturally.",
            "Witty": "Mic check complete. Let us turn your experience into a sharp story.",
            "Direct": "Let us begin right away with your first question.",
        }
        first = questions[0]
        opening = f"{tone_openers[config.tone]}\n\n{first.question}"
        slug = re.sub(r"[^a-z0-9]+", "-", config.role.lower()).strip("-") or "role"

        state = PracticeSessionState(
            id=f"session-{slug}-{int(time.time() * 1000)}",
            config=config,
            status="in_progress",
            totalQuestions=len(questions),
            currentQuestionIndex=1,
            currentTopic=first.topic,
            turns=[
                ChatTurn(
                    id="turn-q1",
                    sender="sir-bot",
                    timestamp=_now_clock(),
                    topic=first.topic,
                    content=opening,
                )
            ],
            resumeFilename=resume_filename,
            ragSources=sources,
        )
        return SessionRecord(
            state=state,
            questions=questions,
            resume_id=resume_id,
            resume_matches_role=True,
        )

    def submit_answer(
        self, record: SessionRecord, raw_answer: str
    ) -> tuple[SessionRecord, bool, str | None]:
        if record.state.status == "completed":
            raise ValueError("This interview session is already completed.")
        answer = raw_answer.strip()
        if not answer:
            return record, False, "empty_input"

        q_idx = record.state.current_question_index
        curr_q = record.questions[q_idx - 1]
        next_q = record.questions[q_idx] if q_idx < len(record.questions) else None
        now_ms = int(time.time() * 1000)
        user_turn = ChatTurn(
            id=f"turn-u-{now_ms}", sender="user", timestamp=_now_clock(), content=answer
        )

        if check_input_filter(answer):
            bot_turn = ChatTurn(
                id=f"turn-b-{now_ms + 1}",
                sender="sir-bot",
                timestamp=_now_clock(),
                topic=curr_q.topic,
                content=f'I stay strictly in interviewer mode. How would you answer: "{curr_q.question}"',
            )
            updated_state = record.state.model_copy(
                update={"turns": [*record.state.turns, user_turn, bot_turn]}
            )
            return record.model_copy(update={"state": updated_state}), False, "prompt_injection"

        words = answer.split()
        if len(words) < 3:
            bot_turn = ChatTurn(
                id=f"turn-b-{now_ms + 1}",
                sender="sir-bot",
                timestamp=_now_clock(),
                topic=curr_q.topic,
                content=f'Give me a bit more context to evaluate. Walk through your situation and actions for: "{curr_q.question}"',
            )
            updated_state = record.state.model_copy(
                update={"turns": [*record.state.turns, user_turn, bot_turn]}
            )
            return record.model_copy(update={"state": updated_state}), False, "non_interview_input"

        lower = answer.lower()
        has_metric = bool(re.search(r"\d+(?:\.\d+)?\s*(%|ms|s|x|k|m|hours?|mins?|days?|users?)", lower))
        has_ownership = bool(re.search(r"\b(i led|i built|i designed|i fixed|i owned|i proposed|i paired|i wrote|i analyzed|i resolved)\b", lower))
        has_team = bool(re.search(r"\b(team|qa|engineer|designer|pm|stakeholder|colleague|manager|customer)\b", lower))
        has_structure = len(words) >= 22

        clarity = min(9.4, round(6.8 + min(1.8, len(words) / 28.0), 1))
        structure = min(9.4, round(6.5 + (1.4 if has_structure else 0.4) + (0.6 if has_ownership else 0.0), 1))
        relevance = min(9.4, round(7.2 + (0.9 if has_ownership else 0.3) + (0.5 if has_team else 0.0), 1))
        impact = min(9.5, round(6.2 + (2.0 if has_metric else 0.6) + (0.5 if has_team else 0.0), 1))
        breakdown = RubricScores(
            clarity=clarity, structure=structure, relevance=relevance, impact=impact
        )
        overall = round((clarity + structure + relevance + impact) / 4.0, 1)

        working_well: list[str] = []
        if has_ownership:
            working_well.append("Clear personal ownership")
        if has_structure:
            working_well.append("Logical STAR pacing")
        if has_metric:
            working_well.append("Quantified outcome")
        if has_team:
            working_well.append("Cross-team collaboration")
        if not working_well:
            working_well = ["Direct response to the prompt", "Relevant context"]

        improve_next: list[ImprovementNote] = []
        if not has_metric:
            improve_next.append(
                ImprovementNote(
                    code="01",
                    title="Quantify the result",
                    detail="Add a concrete number, percentage, or time saved to prove impact.",
                )
            )
        if not has_ownership:
            improve_next.append(
                ImprovementNote(
                    code=f"{len(improve_next) + 1:02d}",
                    title="Highlight personal actions",
                    detail="Clarify the specific steps you personally led rather than only the group effort.",
                )
            )
        if len(improve_next) < 2 and not has_team:
            improve_next.append(
                ImprovementNote(
                    code=f"{len(improve_next) + 1:02d}",
                    title="Show collaboration",
                    detail="Mention how you aligned teammates or stakeholders around your approach.",
                )
            )
        if not improve_next:
            improve_next.append(
                ImprovementNote(
                    code="01",
                    title="Name trade-offs explicitly",
                    detail="Briefly mention one alternative you considered and why you ruled it out.",
                )
            )

        verdict = (
            "Outstanding answer"
            if overall >= 8.5
            else "Strong answer"
            if overall >= 7.5
            else "Solid foundation"
        )
        verdict_detail = (
            "Strong ownership paired with concrete evidence."
            if has_metric and has_ownership
            else "Clear direction. Pair your actions with a measurable outcome next."
        )
        snapshot = LiveScoreSnapshot(
            questionLabel=f"Q{q_idx} · {curr_q.topic}",
            overallScore=overall,
            verdict=verdict,
            verdictDetail=verdict_detail,
            breakdown=breakdown,
            workingWell=working_well[:3],
            improveNext=improve_next[:2],
        )
        evaluation = EvaluatedAnswer(
            question_index=q_idx,
            question=curr_q,
            user_answer=answer,
            overall_score=overall,
            breakdown=breakdown,
            takeaway=improve_next[0].title,
            coach_feedback=verdict_detail,
            working_well=working_well[:3],
            improve_next=improve_next[:2],
        )

        if next_q:
            reply = f"{verdict_detail}\n\n{next_q.question}"
        else:
            reply = f"{verdict_detail} That wraps up all {len(record.questions)} questions. Your full summary is ready."

        bot_turn = ChatTurn(
            id=f"turn-b-{now_ms + 1}",
            sender="sir-bot",
            timestamp=_now_clock(),
            topic=next_q.topic if next_q else curr_q.topic,
            content=reply,
        )
        new_turns = [*record.state.turns, user_turn, bot_turn]
        new_evals = [*record.evaluations, evaluation]

        if next_q:
            updated_state = record.state.model_copy(
                update={
                    "current_question_index": q_idx + 1,
                    "current_topic": next_q.topic,
                    "turns": new_turns,
                    "live_score": snapshot,
                }
            )
            return record.model_copy(update={"state": updated_state, "evaluations": new_evals}), True, None

        done_rec = record.model_copy(
            update={
                "state": record.state.model_copy(
                    update={"turns": new_turns, "live_score": snapshot}
                ),
                "evaluations": new_evals,
            }
        )
        return self.finalize_session(done_rec), True, None

    def finalize_session(self, record: SessionRecord) -> SessionRecord:
        """Delegate final aggregation to InterviewEngine.finalize_session."""
        helper = InterviewEngine(llm_client=None, rag=self.rag)
        return helper.finalize_session(record)


def build_sample_stored_session() -> StoredSession:
    """Build one realistic sample completed session when the user clicks Load sample session."""
    config = InterviewSetupConfig(
        role="Software Engineer",
        difficulty="Normal",
        questionRange="3-5",
        tone="Witty",
        questionCount=3,
    )
    questions = [
        InterviewQuestion(
            number="01",
            topic="Introduction",
            shortTitle="Tell me about yourself",
            question="Tell me about yourself and what engineering problems excite you most right now.",
            expectedSignals=["Relevant background", "Clear focus"],
        ),
        InterviewQuestion(
            number="02",
            topic="Handling pressure",
            shortTitle="Pre-launch checkout bug",
            question="Tell me about a time you handled unexpected pressure right before a release.",
            expectedSignals=["Calm triage", "Measurable outcome"],
        ),
        InterviewQuestion(
            number="03",
            topic="Reflection",
            shortTitle="Guardrails carried forward",
            question="What helped you stay calm during that release, and what guardrail did you keep?",
            expectedSignals=["Self-awareness", "Process improvement"],
        ),
    ]
    evals = [
        EvaluatedAnswer(
            question_index=1,
            question=questions[0],
            user_answer="I am a software engineer focused on reliable web architecture. Over the last three years I led checkout latency and reliability upgrades that cut p95 response time by 42%.",
            overall_score=8.3,
            breakdown=RubricScores(clarity=8.5, structure=8.2, relevance=8.6, impact=7.9),
            takeaway="Crisp opener backed by a real latency metric.",
            coach_feedback="Strong opening arc. Mention the user scale affected by that 42% cut for even stronger framing.",
            working_well=["Clear role focus", "Concrete performance metric"],
            improve_next=[
                ImprovementNote(
                    code="01",
                    title="State user scale",
                    detail="Mention how many monthly users or requests benefited from the speedup.",
                )
            ],
        ),
        EvaluatedAnswer(
            question_index=2,
            question=questions[1],
            user_answer="One day before launch we caught a payment retry bug breaking checkout. I led root-cause triage, wrote a rollback guardrail, paired with QA on a six-case smoke suite, and cut errors from 12% to 0.4% so we shipped on schedule.",
            overall_score=8.8,
            breakdown=RubricScores(clarity=8.8, structure=8.9, relevance=9.0, impact=8.5),
            takeaway="Complete STAR flow with ownership and measurable drop in errors.",
            coach_feedback="Standout answer. Stakeholders can immediately trace your actions to the 12% to 0.4% drop.",
            working_well=["Personal ownership", "Cross-team QA pairing", "Quantified impact"],
            improve_next=[
                ImprovementNote(
                    code="01",
                    title="Mention trade-offs",
                    detail="Note what scope or shortcut you deliberately rejected to keep the fix safe.",
                )
            ],
        ),
        EvaluatedAnswer(
            question_index=3,
            question=questions[2],
            user_answer="Writing down verified facts, open unknowns, and our rollback trigger kept everyone focused. Afterward I added the six-case checkout smoke check into CI so regressions fail before merge.",
            overall_score=8.4,
            breakdown=RubricScores(clarity=8.6, structure=8.3, relevance=8.5, impact=8.2),
            takeaway="Practical reflection tied to a permanent CI guardrail.",
            coach_feedback="Composed closing takeaway that demonstrates lasting engineering discipline.",
            working_well=["Structured crisis habit", "Permanent CI guardrail"],
            improve_next=[
                ImprovementNote(
                    code="01",
                    title="Share follow-on impact",
                    detail="Mention whether that CI check caught subsequent bugs before release.",
                )
            ],
        ),
    ]
    turns = [
        ChatTurn(id="sample-1", sender="sir-bot", timestamp="10:12 AM", topic="Introduction", content=questions[0].question),
        ChatTurn(id="sample-2", sender="user", timestamp="10:14 AM", content=evals[0].user_answer),
        ChatTurn(id="sample-3", sender="sir-bot", timestamp="10:14 AM", topic="Handling pressure", content=f"Clear opening trajectory.\n\n{questions[1].question}"),
        ChatTurn(id="sample-4", sender="user", timestamp="10:17 AM", content=evals[1].user_answer),
        ChatTurn(id="sample-5", sender="sir-bot", timestamp="10:17 AM", topic="Reflection", content=f"Strong ownership and crisp error metrics.\n\n{questions[2].question}"),
        ChatTurn(id="sample-6", sender="user", timestamp="10:19 AM", content=evals[2].user_answer),
        ChatTurn(id="sample-7", sender="sir-bot", timestamp="10:19 AM", topic="Reflection", content="Strong closing reflection. Your complete session summary is ready."),
    ]
    avg_b = RubricScores(clarity=8.6, structure=8.5, relevance=8.7, impact=8.2)
    summary = FinalResultsSummary(
        totalQuestions=3,
        completedQuestions=3,
        finalScore=8.5,
        ratingLabel="Outstanding performance",
        headline="Clear, high-impact storytelling.",
        summaryLines=(
            "Your answers balanced strong personal ownership with concrete evidence.",
            "Keep pairing outcomes with explicit trade-offs on senior-level probes.",
        ),
        nextFocusLine="Next focus: highlight trade-offs and user scale up front.",
        breakdown=avg_b,
        questionResults=[
            QuestionResultItem(
                number=e.question.number,
                title=e.question.short_title,
                takeaway=e.takeaway,
                score=e.overall_score,
                prompt=e.question.question,
                userAnswer=e.user_answer,
                coachFeedback=e.coach_feedback,
            )
            for e in evals
        ],
        keepDoingThis=["Personal ownership", "Quantified impact", "Cross-team QA pairing"],
        focusOnNext=[
            ImprovementNote(
                code="01",
                title="State user scale",
                detail="Name the user volume or traffic affected by your improvements.",
            ),
            ImprovementNote(
                code="02",
                title="Mention trade-offs",
                detail="Briefly contrast your chosen fix with an alternative you ruled out.",
            ),
        ],
    )
    state = PracticeSessionState(
        id=f"sample-software-engineer-{int(time.time())}",
        config=config,
        status="completed",
        totalQuestions=3,
        currentQuestionIndex=3,
        currentTopic="Reflection",
        turns=turns,
        liveScore=LiveScoreSnapshot(
            questionLabel="Q3 · Reflection",
            overallScore=8.4,
            verdict="Strong answer",
            verdictDetail="Composed reflection tied to a permanent guardrail.",
            breakdown=evals[2].breakdown,
            workingWell=evals[2].working_well,
            improveNext=evals[2].improve_next,
        ),
        finalResults=summary,
        ragSources=["Guide: star_rubric.md", "Guide: role_guides.md"],
    )
    now = _now_iso()
    return StoredSession(
        record=SessionRecord(state=state, questions=questions, evaluations=evals),
        created_at_iso=now,
        updated_at_iso=now,
        category_label="Sample preview round",
        is_sample=True,
        is_offline_demo=True,
    )


def format_session_transcript_txt(stored: StoredSession) -> str:
    """Format a completed session as a clean plain-text study sheet."""
    state = stored.record.state
    results = state.final_results
    date_label, time_label = format_session_date(stored.updated_at_iso)
    lines = [
        "INTERVIEW NI LODS — SESSION STUDY SHEET",
        f"Role: {state.config.role}",
        f"Difficulty: {state.config.difficulty} | Tone: {state.config.tone}",
        f"Date: {date_label} {time_label}".strip(),
    ]
    if state.resume_filename:
        lines.append(f"Resume context: {state.resume_filename}")
    if results:
        b = results.breakdown
        lines.extend(
            [
                f"Final score: {results.final_score:.1f} / 10 ({results.rating_label})",
                f"Completed: {results.completed_questions} of {results.total_questions} questions",
                f"Rubric averages — Clarity: {b.clarity:.1f} | Structure: {b.structure:.1f} | Relevance: {b.relevance:.1f} | Impact: {b.impact:.1f}",
                "",
                results.headline,
                results.summary_lines[0],
                results.summary_lines[1],
                results.next_focus_line,
                "",
                "Question-by-question review",
                "-" * 48,
            ]
        )
        for q in results.question_results:
            lines.extend(
                [
                    f"\nQuestion {q.number}: {q.title} ({q.score:.1f} / 10)",
                    f"Prompt: {q.prompt}",
                    f"Your answer: {q.user_answer}",
                    f"Sir Bot note: {q.coach_feedback}",
                ]
            )
    else:
        lines.append("\nConversation transcript")
        lines.append("-" * 48)
        for turn in state.turns:
            speaker = "Sir Bot" if turn.sender == "sir-bot" else "You"
            lines.append(f"\n{speaker} ({turn.timestamp}): {turn.content}")
    return "\n".join(lines) + "\n"


def format_workspace_export_json(snapshot: WorkspaceSnapshot) -> str:
    """Export all profile details, defaults, sessions, and saved answers as JSON."""
    payload = {
        "exportedAt": _now_iso(),
        **snapshot.model_dump(mode="json"),
    }
    return json.dumps(payload, indent=2, ensure_ascii=False)


# ---------------------------------------------------------------------------
# Cached Streamlit Backend Resources & Session Helpers
# ---------------------------------------------------------------------------


@st.cache_resource(show_spinner=False)
def get_cached_rag() -> InterviewRAG:
    """Initialize ChromaDB + all-MiniLM-L6-v2 ONNX embeddings once per server process."""
    return InterviewRAG()


@st.cache_resource(show_spinner=False)
def get_cached_live_engine() -> InterviewEngine | None:
    """Return a live InterviewEngine when an API key is configured, else None."""
    if not API_KEY:
        return None
    try:
        return InterviewEngine(LLMClient(), rag=get_cached_rag())
    except LLMResponseError:
        return None


def get_backend_status() -> dict[str, Any]:
    """Return honest backend availability metadata."""
    live = get_cached_live_engine()
    return {
        "live_available": live is not None,
        "model": MODEL,
        "rag_label": "ChromaDB local embeddings",
    }


def init_session_state() -> None:
    """Hydrate st.session_state from local workspace persistence on first run."""
    query_view = st.query_params.get("view")
    if isinstance(query_view, list):
        query_view = query_view[0] if query_view else None

    if "workspace_initialized" not in st.session_state:
        snapshot = load_workspace_snapshot()
        initial_view = query_view if query_view in VALID_VIEWS else "landing"
        st.session_state["workspace_initialized"] = True
        st.session_state["workspace"] = snapshot
        st.session_state["active_view"] = initial_view
        st.session_state["active_session_id"] = None
        st.session_state["live_score_open"] = snapshot.preferences.auto_open_live_score
        st.session_state["transcript_question_number"] = "01"
        st.session_state["active_guide_id"] = "measurable-impact"
        st.session_state["uploaded_resume"] = None
        st.session_state["setup_draft"] = snapshot.defaults.model_copy()
        st.session_state["live_notice"] = None
        st.session_state["live_notice_variant"] = "info"
        st.session_state["setup_error"] = None
        st.session_state["use_offline_demo"] = not bool(API_KEY)
        st.session_state["active_dialog"] = None
    elif query_view in VALID_VIEWS and query_view != st.session_state.get("last_query_view"):
        st.session_state["active_view"] = query_view

    st.session_state["last_query_view"] = query_view


def get_workspace() -> WorkspaceSnapshot:
    init_session_state()
    return st.session_state["workspace"]


def persist_workspace() -> None:
    save_workspace_snapshot(get_workspace())


def navigate(view: WorkspaceView, *, rerun: bool = True) -> None:
    st.session_state["active_dialog"] = None
    st.session_state["active_view"] = view
    st.session_state["last_query_view"] = view
    st.query_params["view"] = view
    if rerun:
        st.rerun(scope="app")


def get_session_by_id(session_id: str | None) -> StoredSession | None:
    if not session_id:
        return None
    for item in get_workspace().sessions:
        if item.record.state.id == session_id:
            return item
    return None


def get_active_session() -> StoredSession | None:
    return get_session_by_id(st.session_state.get("active_session_id"))


def upsert_stored_session(stored: StoredSession) -> None:
    ws = get_workspace()
    ws.sessions = [
        stored,
        *[s for s in ws.sessions if s.record.state.id != stored.record.state.id],
    ]
    persist_workspace()


def index_uploaded_resume(filename: str, content: bytes) -> UploadedResumeMeta:
    """Extract text from an uploaded resume file and index it in ChromaDB."""
    text = extract_resume_text(filename, content)
    resume_id = f"resume-{uuid4().hex[:10]}"
    meta = get_cached_rag().index_resume(resume_id=resume_id, filename=filename, text=text)
    return UploadedResumeMeta(
        resume_id=meta["resume_id"],
        filename=meta["filename"],
        char_count=meta["char_count"],
        chunk_count=meta["chunk_count"],
        preview=meta["preview"],
    )


def launch_interview(
    config: InterviewSetupConfig,
    *,
    resume: UploadedResumeMeta | None = None,
    force_offline: bool = False,
) -> tuple[StoredSession | None, str | None]:
    """Start a new interview session via live LLM engine or explicit offline demo mode."""
    live_engine = None if force_offline else get_cached_live_engine()
    is_offline = live_engine is None
    engine: InterviewEngine | OfflineInterviewEngine = (
        live_engine if live_engine is not None else OfflineInterviewEngine(rag=get_cached_rag())
    )

    try:
        record = engine.start_session(
            config,
            resume_id=resume.resume_id if resume else None,
            resume_filename=resume.filename if resume else None,
        )
    except Exception as exc:
        return None, f"Could not start live interview ({exc}). Check your API key or switch to Offline demo mode."

    now = _now_iso()
    category = (
        "Resume-tailored interview"
        if resume
        else "Portfolio walkthrough"
        if config.role == "Product Designer"
        else "Behavioral interview"
    )
    stored = StoredSession(
        record=record,
        created_at_iso=now,
        updated_at_iso=now,
        category_label=category,
        is_sample=False,
        is_offline_demo=is_offline,
    )
    upsert_stored_session(stored)
    st.session_state["active_session_id"] = record.state.id
    st.session_state["live_score_open"] = get_workspace().preferences.auto_open_live_score
    st.session_state["live_notice"] = (
        "Running in offline demo mode (heuristic scoring). Configure AIKI_API_KEY in .env for live AI coaching."
        if is_offline
        else None
    )
    st.session_state["live_notice_variant"] = "info"
    st.session_state["active_view"] = "live"
    st.query_params["view"] = "live"
    return stored, None


def submit_live_answer(
    stored: StoredSession, answer: str
) -> tuple[StoredSession, bool, str | None, str | None]:
    """Submit an answer for the active session and update persisted state."""
    use_offline = stored.is_offline_demo or get_cached_live_engine() is None
    engine: InterviewEngine | OfflineInterviewEngine = (
        OfflineInterviewEngine(rag=get_cached_rag())
        if use_offline
        else get_cached_live_engine()  # type: ignore[assignment]
    )
    try:
        updated_record, accepted, refusal_reason = engine.submit_answer(stored.record, answer)
    except Exception as exc:
        return (
            stored,
            False,
            None,
            f"Could not evaluate your answer right now ({exc}). Your draft was preserved — try again.",
        )

    updated_stored = stored.model_copy(
        update={
            "record": updated_record,
            "updated_at_iso": _now_iso(),
        }
    )
    upsert_stored_session(updated_stored)
    return updated_stored, accepted, refusal_reason, None


def finalize_live_session(stored: StoredSession) -> StoredSession:
    """End an in-progress session early and generate its final results summary."""
    helper = InterviewEngine(llm_client=None, rag=get_cached_rag())
    finalized_record = helper.finalize_session(stored.record)
    updated_stored = stored.model_copy(
        update={
            "record": finalized_record,
            "updated_at_iso": _now_iso(),
        }
    )
    upsert_stored_session(updated_stored)
    return updated_stored


def toggle_saved_guide(guide_id: str) -> bool:
    """Bookmark or unbookmark a coaching guide. Returns the new saved state."""
    ws = get_workspace()
    if guide_id in ws.saved_guide_ids:
        ws.saved_guide_ids = [gid for gid in ws.saved_guide_ids if gid != guide_id]
        persist_workspace()
        return False
    ws.saved_guide_ids = [guide_id, *ws.saved_guide_ids]
    persist_workspace()
    return True


def is_answer_saved(session_id: str, question_number: str) -> bool:
    return any(
        item.session_id == session_id and item.question_number == question_number
        for item in get_workspace().saved_answers
    )


def toggle_saved_answer(
    stored: StoredSession, item: QuestionResultItem, tag: str = "Ownership"
) -> bool:
    """Save or remove a question answer from the Saved Answers library."""
    ws = get_workspace()
    sid = stored.record.state.id
    existing = [
        a for a in ws.saved_answers if a.session_id == sid and a.question_number == item.number
    ]
    if existing:
        ws.saved_answers = [
            a
            for a in ws.saved_answers
            if not (a.session_id == sid and a.question_number == item.number)
        ]
        persist_workspace()
        return False

    date_label, _ = format_session_date(stored.updated_at_iso)
    new_item = SavedAnswerItem(
        id=f"saved-{uuid4().hex[:8]}",
        title=item.title,
        role=stored.record.state.config.role,
        tag=tag,
        score=item.score,
        date_label=date_label,
        answer=item.user_answer,
        coach_note=item.coach_feedback,
        session_id=sid,
        question_number=item.number,
    )
    ws.saved_answers = [new_item, *ws.saved_answers]
    persist_workspace()
    return True


def remove_saved_answer(answer_id: str) -> None:
    ws = get_workspace()
    ws.saved_answers = [a for a in ws.saved_answers if a.id != answer_id]
    persist_workspace()


def clear_all_sessions() -> None:
    ws = get_workspace()
    ws.sessions = []
    st.session_state["active_session_id"] = None
    persist_workspace()
