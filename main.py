"""Interactive CLI entrypoint for Interview ni Lods using the structured backend + ChromaDB RAG."""

from __future__ import annotations

from pathlib import Path
from uuid import uuid4

from backend.interview_engine import InterviewEngine
from backend.llm_client import LLMClient
from backend.rag import InterviewRAG, extract_resume_text
from backend.schemas import InterviewSetupConfig, LiveScoreSnapshot


def _prompt_choice(label: str, options: tuple[str, ...], default: str) -> str:
    options_str = "/".join(options)
    raw = input(f"{label} ({options_str}) [default: {default}]: ").strip()
    if not raw:
        return default
    for opt in options:
        if raw.lower() == opt.lower():
            return opt
    print(f"Unrecognized choice '{raw}', using '{default}'.")
    return default


def _print_live_score(snapshot: LiveScoreSnapshot) -> None:
    b = snapshot.breakdown
    print("\n--- Live Score Preview ---")
    print(f"{snapshot.question_label}: {snapshot.overall_score:.1f} / 10 — {snapshot.verdict}")
    print(f"Summary: {snapshot.verdict_detail}")
    print(
        f"Rubric: Clarity {b.clarity:.1f} | Structure {b.structure:.1f} | "
        f"Relevance {b.relevance:.1f} | Impact {b.impact:.1f}"
    )
    print("Working well:", ", ".join(snapshot.working_well))
    for note in snapshot.improve_next:
        print(f"  [{note.code}] {note.title}: {note.detail}")
    print("--------------------------\n")


def run_cli() -> None:
    """Run an interactive structured mock interview session in the terminal."""
    rag = InterviewRAG()
    engine = InterviewEngine(LLMClient(), rag=rag)

    print("=== Interview ni Lods (Sir Bot CLI) ===")
    role = input("Enter job role / field [default: Software Engineer]: ").strip() or "Software Engineer"
    difficulty = _prompt_choice("Difficulty", ("Easy", "Normal", "Hard"), "Normal")
    question_range = _prompt_choice("Questions", ("3-5", "5-8", "8-10"), "3-5")
    tone = _prompt_choice("Coach tone", ("Friendly", "Witty", "Direct"), "Witty")

    resume_id: str | None = None
    resume_filename: str | None = None
    raw_path = input("Optional resume path (.pdf/.docx/.txt) [press Enter to skip]: ").strip()
    if raw_path:
        path = Path(raw_path).expanduser()
        if path.is_file():
            try:
                text = extract_resume_text(path.name, path.read_bytes())
                resume_id = f"resume-{uuid4().hex[:10]}"
                resume_filename = path.name
                meta = rag.index_resume(resume_id=resume_id, filename=path.name, text=text)
                print(
                    f"Indexed resume '{path.name}' ({meta['chunk_count']} chunks into ChromaDB)."
                )
            except ValueError as exc:
                print(f"Could not read resume ({exc}). Continuing without resume.")
        else:
            print(f"File not found at '{path}'. Continuing without resume.")

    config = InterviewSetupConfig(
        role=role,
        difficulty=difficulty,  # type: ignore[arg-type]
        questionRange=question_range,  # type: ignore[arg-type]
        tone=tone,  # type: ignore[arg-type]
    )

    print("\nPreparing your structured interview plan...\n")
    record = engine.start_session(
        config, resume_id=resume_id, resume_filename=resume_filename
    )
    if record.state.rag_sources:
        print(f"[RAG Sources: {', '.join(record.state.rag_sources)}]\n")
    print(f"Sir Bot: {record.state.turns[-1].content}\n")

    while record.state.status != "completed":
        print(
            f"[Question {record.state.current_question_index} of {record.state.total_questions} · "
            f"{record.state.current_topic}] (type 'X' to end early)"
        )
        answer = input("You: ").strip()
        if answer.upper() == "X":
            print("\nEnding interview early...")
            break

        record, accepted, refusal_reason = engine.submit_answer(record, answer)
        if not accepted:
            if refusal_reason == "empty_input":
                print("\nSir Bot: Please type an answer or enter 'X' to finish.\n")
            else:
                print(f"\nSir Bot ({refusal_reason}): {record.state.turns[-1].content}\n")
            continue

        if record.state.live_score is not None:
            _print_live_score(record.state.live_score)

        print(f"Sir Bot: {record.state.turns[-1].content}\n")

    record = engine.finalize_session(record)
    summary = record.state.final_results
    if summary is None:
        return

    b = summary.breakdown
    print("=== Final Interview Results ===")
    print(f"Score: {summary.final_score:.1f} / 10 ({summary.rating_label})")
    print(f"Completed: {summary.completed_questions} of {summary.total_questions} questions")
    print(f"Headline: {summary.headline}")
    print(summary.summary_lines[0])
    print(summary.summary_lines[1])
    print(summary.next_focus_line)
    print(
        f"Averages — Clarity: {b.clarity:.1f} | Structure: {b.structure:.1f} | "
        f"Relevance: {b.relevance:.1f} | Impact: {b.impact:.1f}"
    )
    print("\nQuestion-by-question:")
    for item in summary.question_results:
        print(f"  {item.number}. {item.title} ({item.score:.1f}/10) — {item.takeaway}")
    print("\nKeep doing this:", ", ".join(summary.keep_doing_this))
    print("Focus on next:")
    for note in summary.focus_on_next:
        print(f"  [{note.code}] {note.title}: {note.detail}")


if __name__ == "__main__":
    run_cli()
