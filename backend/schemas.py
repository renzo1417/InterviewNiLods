"""Pydantic v2 data models for Interview ni Lods sessions, rubric scoring, and transcripts."""

from __future__ import annotations

from typing import Any, Literal
from pydantic import BaseModel, ConfigDict, Field, field_validator

InterviewDifficulty = Literal["Easy", "Normal", "Hard"]
QuestionRange = Literal["3-5", "5-8", "8-10"]
CoachTone = Literal["Friendly", "Witty", "Direct"]
QUESTION_COUNT_BY_RANGE: dict[QuestionRange, int] = {"3-5": 4, "5-8": 5, "8-10": 8}


def _clamp(value: Any) -> float:
    if value is None:
        return 0.0
    try:
        return round(min(10.0, max(0.0, float(value))), 1)
    except (TypeError, ValueError):
        return 0.0


class CamelModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)


class InterviewSetupConfig(CamelModel):
    role: str = Field(default="Software Engineer", min_length=1, max_length=120)
    difficulty: InterviewDifficulty = "Normal"
    question_range: QuestionRange = Field(default="5-8", alias="questionRange")
    tone: CoachTone = "Witty"
    question_count: int | None = Field(default=None, alias="questionCount", ge=1, le=10)

    @field_validator("role")
    @classmethod
    def _clean_role(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Role cannot be empty.")
        return v.strip()


class InterviewQuestion(CamelModel):
    number: str = "01"
    topic: str = Field(min_length=1)
    short_title: str = Field(alias="shortTitle", min_length=1)
    question: str = Field(min_length=1)
    expected_signals: list[str] = Field(default_factory=list, alias="expectedSignals")


class QuestionPlanPayload(CamelModel):
    opening_greeting: str = Field(alias="openingGreeting", min_length=1)
    resume_matches_role: bool = Field(default=True, alias="resumeMatchesRole")
    questions: list[InterviewQuestion] = Field(min_length=1)


class RubricScores(CamelModel):
    clarity: float
    structure: float
    relevance: float
    impact: float

    @field_validator("clarity", "structure", "relevance", "impact", mode="before")
    @classmethod
    def _clamp_dim(cls, v: float) -> float:
        return _clamp(v)


class ImprovementNote(CamelModel):
    code: str
    title: str
    detail: str


class LLMEvaluationPayload(CamelModel):
    is_valid_interview_response: bool = Field(alias="isValidInterviewResponse")
    refusal_reason: str | None = Field(default=None, alias="refusalReason")
    reasoning: str | None = None
    bot_reply: str = Field(alias="botReply", min_length=1)
    breakdown: RubricScores | None = None
    verdict: str | None = None
    verdict_detail: str | None = Field(default=None, alias="verdictDetail")
    working_well: list[str] = Field(default_factory=list, alias="workingWell")
    improve_next: list[ImprovementNote] = Field(default_factory=list, alias="improveNext")
    takeaway: str | None = None
    coach_feedback: str | None = Field(default=None, alias="coachFeedback")

    @field_validator("breakdown", mode="before")
    @classmethod
    def _null_if_all_none(cls, v: Any) -> Any:
        if isinstance(v, dict) and all(val is None for val in v.values()):
            return None
        return v

    @field_validator("working_well", "improve_next", mode="before")
    @classmethod
    def _none_to_list(cls, v: Any) -> Any:
        return [] if v is None else v


class LiveScoreSnapshot(CamelModel):
    question_label: str = Field(alias="questionLabel")
    overall_score: float = Field(alias="overallScore")
    verdict: str
    verdict_detail: str = Field(alias="verdictDetail")
    breakdown: RubricScores
    working_well: list[str] = Field(alias="workingWell")
    improve_next: list[ImprovementNote] = Field(alias="improveNext")

    @field_validator("overall_score", mode="before")
    @classmethod
    def _clamp_overall(cls, v: float) -> float:
        return _clamp(v)


class QuestionResultItem(CamelModel):
    number: str
    title: str
    takeaway: str
    score: float
    prompt: str
    user_answer: str = Field(alias="userAnswer")
    coach_feedback: str = Field(alias="coachFeedback")


class FinalResultsSummary(CamelModel):
    total_questions: int = Field(alias="totalQuestions")
    completed_questions: int = Field(alias="completedQuestions")
    final_score: float = Field(alias="finalScore")
    rating_label: str = Field(alias="ratingLabel")
    headline: str
    summary_lines: tuple[str, str] = Field(alias="summaryLines")
    next_focus_line: str = Field(alias="nextFocusLine")
    breakdown: RubricScores
    question_results: list[QuestionResultItem] = Field(alias="questionResults")
    keep_doing_this: list[str] = Field(alias="keepDoingThis")
    focus_on_next: list[ImprovementNote] = Field(alias="focusOnNext")


class ChatTurn(CamelModel):
    id: str
    sender: Literal["sir-bot", "user"]
    timestamp: str
    content: str
    topic: str | None = None


class EvaluatedAnswer(CamelModel):
    question_index: int
    question: InterviewQuestion
    user_answer: str
    overall_score: float
    breakdown: RubricScores
    takeaway: str
    coach_feedback: str
    working_well: list[str]
    improve_next: list[ImprovementNote]


class PracticeSessionState(CamelModel):
    id: str
    config: InterviewSetupConfig
    status: Literal["in_progress", "completed"]
    total_questions: int = Field(alias="totalQuestions")
    current_question_index: int = Field(alias="currentQuestionIndex")
    current_topic: str = Field(alias="currentTopic")
    turns: list[ChatTurn]
    live_score: LiveScoreSnapshot | None = Field(default=None, alias="liveScore")
    final_results: FinalResultsSummary | None = Field(default=None, alias="finalResults")
    resume_filename: str | None = Field(default=None, alias="resumeFilename")
    rag_sources: list[str] = Field(default_factory=list, alias="ragSources")


class SessionRecord(CamelModel):
    state: PracticeSessionState
    questions: list[InterviewQuestion]
    evaluations: list[EvaluatedAnswer] = Field(default_factory=list)
    resume_id: str | None = None
    resume_matches_role: bool = True
