"""Interview engine: plans questions, retrieves RAG context, judges answers, and builds final results."""

from __future__ import annotations

from datetime import datetime
import re
import time
from typing import Any

from .prompts import build_evaluation_messages, build_question_plan_messages, check_input_filter
from .rag import InterviewRAG
from .schemas import (
    ChatTurn,
    EvaluatedAnswer,
    FinalResultsSummary,
    ImprovementNote,
    InterviewQuestion,
    InterviewSetupConfig,
    LLMEvaluationPayload,
    LiveScoreSnapshot,
    PracticeSessionState,
    QUESTION_COUNT_BY_RANGE,
    QuestionPlanPayload,
    QuestionResultItem,
    RubricScores,
    SessionRecord,
)


def _now() -> str:
    return datetime.now().strftime("%-I:%M %p")


def _dedupe(items: list[str], limit: int) -> list[str]:
    seen, out = set(), []
    for item in items:
        clean = item.strip()
        if clean and clean.lower() not in seen:
            seen.add(clean.lower())
            out.append(clean)
            if len(out) >= limit:
                break
    return out


class InterviewEngine:
    """Runs the 3 core interview steps: start_session -> submit_answer -> finalize_session."""

    def __init__(self, llm_client: Any, rag: InterviewRAG | None = None) -> None:
        self.llm_client = llm_client
        self.rag = rag

    def start_session(
        self, config: InterviewSetupConfig, resume_id: str | None = None, resume_filename: str | None = None
    ) -> SessionRecord:
        total = config.question_count or QUESTION_COUNT_BY_RANGE[config.question_range]
        ctx = (
            self.rag.retrieve_context(f"{config.role} projects experience impact", config.role, resume_id)
            if self.rag
            else {"resume_chunks": [], "guide_chunks": [], "sources": []}
        )

        raw = self.llm_client.chat_json(
            build_question_plan_messages(config, total, ctx["resume_chunks"], ctx["guide_chunks"]),
            max_tokens=700,
        )
        plan = QuestionPlanPayload.model_validate(raw)
        questions = self._normalize_questions(plan.questions, total, config.role)
        first = questions[0]
        resume_matches = plan.resume_matches_role if resume_id else True

        greeting = plan.opening_greeting.strip()
        opening = greeting if first.question.lower() in greeting.lower() else f"{greeting}\n\n{first.question}"
        slug = re.sub(r"[^a-z0-9]+", "-", config.role.lower()).strip("-") or "role"

        state = PracticeSessionState(
            id=f"session-{slug}-{int(time.time() * 1000)}",
            config=config,
            status="in_progress",
            totalQuestions=len(questions),
            currentQuestionIndex=1,
            currentTopic=first.topic,
            turns=[ChatTurn(id="turn-q1", sender="sir-bot", timestamp=_now(), topic=first.topic, content=opening)],
            resumeFilename=resume_filename,
            ragSources=ctx["sources"],
        )
        return SessionRecord(
            state=state,
            questions=questions,
            resume_id=resume_id,
            resume_matches_role=resume_matches,
        )

    def submit_answer(self, record: SessionRecord, raw_answer: str) -> tuple[SessionRecord, bool, str | None]:
        if record.state.status == "completed":
            raise ValueError("This interview session is already completed.")
        answer = raw_answer.strip()
        if not answer:
            return record, False, "empty_input"

        q_idx = record.state.current_question_index
        curr_q = record.questions[q_idx - 1]
        next_q = record.questions[q_idx] if q_idx < len(record.questions) else None
        now_ms = int(time.time() * 1000)
        user_turn = ChatTurn(id=f"turn-u-{now_ms}", sender="user", timestamp=_now(), content=answer)

        # Defense 1: block obvious jailbreaks before calling the LLM
        if check_input_filter(answer):
            bot_turn = ChatTurn(
                id=f"turn-b-{now_ms + 1}",
                sender="sir-bot",
                timestamp=_now(),
                topic=curr_q.topic,
                content=f'Nice try, but I stay in interviewer mode! How would you answer: "{curr_q.question}"',
            )
            return record.model_copy(update={"state": record.state.model_copy(update={"turns": [*record.state.turns, user_turn, bot_turn]})}), False, "prompt_injection"

        effective_resume_id = record.resume_id if record.resume_matches_role else None
        ctx = (
            self.rag.retrieve_context(f"{curr_q.topic}: {curr_q.question} {answer[:200]}", record.state.config.role, effective_resume_id)
            if self.rag
            else {"resume_chunks": [], "guide_chunks": [], "sources": []}
        )
        sources = _dedupe([*record.state.rag_sources, *ctx["sources"]], 10)

        raw = self.llm_client.chat_json(
            build_evaluation_messages(record.state.config, curr_q, answer, record.state.turns, next_q, ctx["resume_chunks"], ctx["guide_chunks"]),
            max_tokens=650,
        )
        payload = LLMEvaluationPayload.model_validate(raw)

        if not payload.is_valid_interview_response:
            bot_turn = ChatTurn(id=f"turn-b-{now_ms + 1}", sender="sir-bot", timestamp=_now(), topic=curr_q.topic, content=payload.bot_reply.strip())
            updated = record.state.model_copy(update={"turns": [*record.state.turns, user_turn, bot_turn], "rag_sources": sources})
            return record.model_copy(update={"state": updated}), False, payload.refusal_reason or "non_interview_input"

        b = payload.breakdown or RubricScores(clarity=7.0, structure=7.0, relevance=7.0, impact=6.5)
        overall = round((b.clarity + b.structure + b.relevance + b.impact) / 4.0, 1)
        working_well = _dedupe(payload.working_well, 3) or ["Clear intent", "On-topic response"]
        improve_next = [
            ImprovementNote(code=f"{i + 1:02d}", title=n.title.strip() or "Add specifics", detail=n.detail.strip() or "Support with a concrete example.")
            for i, n in enumerate(payload.improve_next[:2])
        ] or [ImprovementNote(code="01", title="Quantify impact", detail="Add a concrete number or outcome.")]

        verdict = (payload.verdict or ("Outstanding answer" if overall >= 8.5 else "Strong answer" if overall >= 7.5 else "Solid foundation")).strip()
        verdict_detail = (payload.verdict_detail or "Solid foundation — pair actions with measurable results.").strip()
        snapshot = LiveScoreSnapshot(
            questionLabel=f"Q{q_idx} · {curr_q.topic}",
            overallScore=overall,
            verdict=verdict,
            verdictDetail=verdict_detail,
            breakdown=b,
            workingWell=working_well,
            improveNext=improve_next,
        )
        evaluation = EvaluatedAnswer(
            question_index=q_idx,
            question=curr_q,
            user_answer=answer,
            overall_score=overall,
            breakdown=b,
            takeaway=(payload.takeaway or improve_next[0].title).strip(),
            coach_feedback=(payload.coach_feedback or verdict_detail).strip(),
            working_well=working_well,
            improve_next=improve_next,
        )

        reply = payload.bot_reply.strip()
        if next_q and next_q.question.lower() not in reply.lower():
            reply = f"{reply}\n\n{next_q.question}"
        bot_turn = ChatTurn(id=f"turn-b-{now_ms + 1}", sender="sir-bot", timestamp=_now(), topic=next_q.topic if next_q else curr_q.topic, content=reply)

        new_evals = [*record.evaluations, evaluation]
        new_turns = [*record.state.turns, user_turn, bot_turn]
        if next_q:
            state = record.state.model_copy(update={"current_question_index": q_idx + 1, "current_topic": next_q.topic, "turns": new_turns, "live_score": snapshot, "rag_sources": sources})
            return record.model_copy(update={"state": state, "evaluations": new_evals}), True, None

        done_rec = record.model_copy(update={"state": record.state.model_copy(update={"turns": new_turns, "live_score": snapshot, "rag_sources": sources}), "evaluations": new_evals})
        return self.finalize_session(done_rec), True, None

    def finalize_session(self, record: SessionRecord) -> SessionRecord:
        if record.state.status == "completed" and record.state.final_results is not None:
            return record

        eval_map = {e.question_index: e for e in record.evaluations}
        n = len(record.evaluations)
        if n > 0:
            avg_b = RubricScores(
                clarity=sum(e.breakdown.clarity for e in record.evaluations) / n,
                structure=sum(e.breakdown.structure for e in record.evaluations) / n,
                relevance=sum(e.breakdown.relevance for e in record.evaluations) / n,
                impact=sum(e.breakdown.impact for e in record.evaluations) / n,
            )
            final_score = round(sum(e.overall_score for e in record.evaluations) / n, 1)
        else:
            avg_b = RubricScores(clarity=0.0, structure=0.0, relevance=0.0, impact=0.0)
            final_score = 0.0

        rating, headline, lines, next_focus = self._narrative(final_score, avg_b, n)
        q_results = [
            QuestionResultItem(
                number=q.number,
                title=q.short_title,
                takeaway=eval_map[i].takeaway if i in eval_map else "Ended before answering.",
                score=eval_map[i].overall_score if i in eval_map else 0.0,
                prompt=q.question,
                userAnswer=eval_map[i].user_answer if i in eval_map else "No answer recorded.",
                coachFeedback=eval_map[i].coach_feedback if i in eval_map else "Complete this prompt in your next round.",
            )
            for i, q in enumerate(record.questions, start=1)
        ]

        keep = _dedupe([s for e in record.evaluations for s in e.working_well], 3) or ["Willingness to practice", "On-topic focus", "Calm pacing"]
        notes, seen = [], set()
        for e in record.evaluations:
            for item in e.improve_next:
                if item.title.lower() not in seen:
                    seen.add(item.title.lower())
                    notes.append(ImprovementNote(code=f"{len(notes) + 1:02d}", title=item.title, detail=item.detail))
                if len(notes) >= 2:
                    break
            if len(notes) >= 2:
                break

        summary = FinalResultsSummary(
            totalQuestions=len(record.questions),
            completedQuestions=n,
            finalScore=final_score,
            ratingLabel=rating,
            headline=headline,
            summaryLines=lines,
            nextFocusLine=next_focus,
            breakdown=avg_b,
            questionResults=q_results,
            keepDoingThis=keep,
            focusOnNext=notes or [ImprovementNote(code="01", title="Quantify impact", detail="Add concrete metrics or outcomes.")],
        )
        return record.model_copy(update={"state": record.state.model_copy(update={"status": "completed", "current_question_index": len(record.questions), "final_results": summary})})

    @staticmethod
    def _normalize_questions(questions: list[InterviewQuestion], target: int, role: str) -> list[InterviewQuestion]:
        items = list(questions[:target])
        while len(items) < target:
            items.append(InterviewQuestion(topic="Role reflection", shortTitle="Key takeaway", question=f"What hard-earned lesson would you bring into a {role} role?", expectedSignals=["Example", "Outcome"]))
        return [q.model_copy(update={"number": f"{i + 1:02d}", "expected_signals": q.expected_signals[:2]}) for i, q in enumerate(items)]

    @staticmethod
    def _narrative(score: float, b: RubricScores, count: int) -> tuple[str, str, tuple[str, str], str]:
        if count == 0:
            return ("No answers scored", "Ready whenever you are.", ("No interview responses were submitted yet.", "Answer at least one question to unlock rubric feedback."), "Next focus: complete your first STAR response.")
        lowest = min(
            [("clarity", b.clarity, "tightening phrasing"), ("structure", b.structure, "using STAR structure"), ("relevance", b.relevance, "staying anchored to the prompt"), ("impact", b.impact, "adding measurable impact")],
            key=lambda x: x[1],
        )[2]
        if score >= 8.5:
            return ("Outstanding performance", "Clear, high-impact storytelling.", ("Your answers balanced strong ownership with concrete evidence.", "Keep refining concise outcomes."), f"Next focus: keep {lowest}.")
        if score >= 7.5:
            return ("Strong performance", "A strong foundation.", ("You told clear stories and took ownership.", "Make outcomes just as specific as your approach."), f"Next focus: focus on {lowest}.")
        if score >= 6.0:
            return ("Solid foundation", "Steady progress in motion.", ("You stayed focused and shared relevant context.", "Adding sharper structure and metrics will lift your score."), f"Next focus: prioritize {lowest}.")
        return ("Needs more structure", "A good starting baseline.", ("Responses stayed high-level.", "Walk step-by-step through what you did and what changed."), f"Next focus: practice {lowest}.")
