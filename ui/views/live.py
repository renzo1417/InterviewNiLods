"""Screens 02 & 03 — Live Interview Chat with grounded lavender Live Score Preview drawer."""

from __future__ import annotations

import streamlit as st

from backend.schemas import LiveScoreSnapshot, PracticeSessionState
from ui.dialogs import show_end_interview_dialog
from ui.state import (
    get_active_session,
    get_workspace,
    navigate,
    submit_live_answer,
)
from ui.theme import (
    esc,
    get_sir_bot_logo_data_uri,
    get_svg_img_tag,
    render_check_list_html,
    render_html,
    render_notice,
    render_numbered_notes_html,
    render_pill,
    render_progress_bar,
    render_rubric_bars_html,
)


def _render_conversation_thread(state: PracticeSessionState) -> None:
    """Render Sir Bot and candidate turns with lavender user bubbles and zero emojis."""
    logo_uri = get_sir_bot_logo_data_uri()
    logo_tag = f'<img src="{logo_uri}" alt="Sir Bot" />' if logo_uri else ""

    parts: list[str] = []
    for turn in state.turns:
        content_safe = esc(turn.content)
        time_safe = esc(turn.timestamp)
        if turn.sender == "sir-bot":
            parts.append(
                f"""
                <article class="inl-turn-bot">
                  <div class="inl-turn-head">
                    {logo_tag}
                    <span class="inl-turn-speaker">Sir Bot</span>
                    <span class="inl-turn-time">{time_safe}</span>
                  </div>
                  <div class="inl-turn-bot-body">{content_safe}</div>
                </article>
                """
            )
        else:
            parts.append(
                f"""
                <article class="inl-turn-user">
                  <div class="inl-turn-head">
                    <span class="inl-turn-speaker" style="color:#655273;">You</span>
                    <span class="inl-turn-time">{time_safe}</span>
                  </div>
                  <div class="inl-turn-user-bubble">{content_safe}</div>
                </article>
                """
            )

    render_html(f'<div class="inl-thread">{"".join(parts)}</div>')


def _render_live_score_panel(live: LiveScoreSnapshot | None) -> None:
    """Render the grounded soft-lavender Live Score Preview drawer matching LiveInterviewView.tsx."""
    with st.container(border=False, key="live_score_drawer"):
        render_html(
            """
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:3px;">
              <h2 style="font-size:18px;font-weight:600;color:#3D304D;margin:0;line-height:1.35;">Live score preview</h2>
              <span style="display:inline-flex;align-items:center;gap:7px;height:24px;border-radius:12px;background:#EEE6FA;padding:0 10px;font-size:10.5px;font-weight:500;color:#6D4E91;">
                <span style="width:6px;height:6px;border-radius:999px;background:#9772C0;display:inline-block;"></span>
                Live
              </span>
            </div>
            <p style="font-size:12px;color:#796985;margin:0 0 16px 0;">
              Feedback on your latest answer
            </p>
            """
        )

        if live is None:
            render_html(
                """
                <div style="border-radius:16px;border:1px dashed #DDD1ED;background:#FFFFFF;padding:18px 20px;">
                  <div style="font-size:14px;font-weight:600;color:#4D3C5D;">Ready when you are</div>
                  <p style="font-size:12px;line-height:1.58;color:#796985;margin:8px 0 0 0;">
                    Send your first response and Sir Bot will score clarity, structure, relevance,
                    and measurable impact in real time.
                  </p>
                </div>
                <p style="font-size:10.5px;color:#796985;margin:22px 2px 0 2px;">
                  A preview, not your final session score.
                </p>
                """
            )
        else:
            b = live.breakdown
            notes = [(n.code, n.title, n.detail) for n in live.improve_next]
            render_html(
                f"""
                <div style="font-size:11.5px;font-weight:500;color:#796985;margin-bottom:8px;">
                  {esc(live.question_label)}
                </div>
                <div class="inl-score-box" style="margin-bottom:18px;">
                  <div>
                    <span class="inl-score-big">{live.overall_score:.1f}</span>
                    <span class="inl-score-denom">/ 10</span>
                  </div>
                  <div style="font-size:14.5px;font-weight:600;color:#5D3F7F;margin-top:8px;">
                    {esc(live.verdict)}
                  </div>
                  <div style="font-size:12px;line-height:1.5;color:#766085;margin-top:3px;">
                    {esc(live.verdict_detail)}
                  </div>
                </div>
                <div style="font-size:13.5px;font-weight:600;color:#4D3C5D;margin-bottom:10px;">
                  Answer breakdown
                </div>
                {render_rubric_bars_html(b.clarity, b.structure, b.relevance, b.impact)}
                <div style="height:1px;background:#E7DFEF;margin:16px 0;"></div>
                <div style="font-size:13.5px;font-weight:600;color:#4D3C5D;">
                  What is working well
                </div>
                {render_check_list_html(live.working_well)}
                <div style="font-size:13.5px;font-weight:600;color:#4D3C5D;margin-top:16px;">
                  Improve next
                </div>
                {render_numbered_notes_html(notes)}
                <p style="font-size:10.5px;color:#796985;margin:18px 0 0 0;">
                  A preview, not your final session score.
                </p>
                """
            )


def render_live_view() -> None:
    """Render Screens 02 & 03: live interview conversation and toggleable live score drawer."""
    stored = get_active_session()
    ws = get_workspace()

    if stored is None:
        render_notice("No active interview session selected. Configure a new round to begin.", variant="info")
        if st.button("Go to Interview Setup", type="primary", key="live_back_setup"):
            navigate("setup")
        return

    state = stored.record.state
    if state.status == "completed":
        navigate("results")
        return

    score_open = bool(st.session_state.get("live_score_open", True))
    logo_uri = get_sir_bot_logo_data_uri()
    logo_tag = (
        f'<img src="{logo_uri}" alt="Sir Bot" style="width:36px;height:36px;object-fit:contain;" />'
        if logo_uri
        else ""
    )

    # Top workspace header bar matching PracticeWorkspace.tsx
    bar_left, bar_mid, bar_right = st.columns([3.0, 1.15, 0.95], vertical_alignment="center")
    with bar_left:
        render_html(
            '<div class="inl-breadcrumb" style="margin:0;">Practice '
            '<span style="margin:0 7px;color:#A59EB3;">/</span> '
            "<strong>Live interview</strong></div>"
        )
    with bar_mid:
        live_hint = (
            f"Hide score ({state.live_score.overall_score:.1f})"
            if score_open and state.live_score
            else "Hide live score"
            if score_open
            else f"{state.live_score.overall_score:.1f} / 10 · Live score"
            if state.live_score
            else "Live score"
        )
        if st.button(live_hint, type="secondary", width="stretch", key="live_toggle_score"):
            st.session_state["live_score_open"] = not score_open
            st.rerun()
    with bar_right:
        if st.button("End interview", type="secondary", width="stretch", key="live_end_btn"):
            st.session_state["active_dialog"] = "end_interview"

    if st.session_state.get("active_dialog") == "end_interview":
        show_end_interview_dialog(stored)

    render_html('<div style="height:1px;background:#EFEBF4;margin:8px 0 18px 0;"></div>')

    def _render_chat_column() -> None:
        resume_pill = (
            render_pill(f"Resume RAG · {state.resume_filename}", "accent")
            if state.resume_filename
            else ""
        )
        demo_pill = render_pill("Offline demo", "warning") if stored.is_offline_demo else ""
        render_html(
            f"""
            <div style="margin-bottom:4px;">
              <div style="display:flex;align-items:center;gap:8px;">
                {logo_tag}
                <h1 class="inl-page-title">Chat with Sir Bot</h1>
              </div>
              <div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:4px;font-size:12px;color:#796985;">
                <span>{esc(state.config.role)} <span style="margin:0 6px;color:#B9AEC5;">/</span> {esc(state.config.difficulty)} difficulty <span style="margin:0 6px;color:#B9AEC5;">/</span> {esc(state.config.tone)}</span>
                {resume_pill}
                {demo_pill}
              </div>
            </div>
            """
        )

        render_progress_bar(
            current=state.current_question_index,
            total=state.total_questions,
            topic=state.current_topic,
            status_text="Interview in progress",
        )

        if st.session_state.get("live_notice"):
            render_notice(
                st.session_state["live_notice"],
                variant=st.session_state.get("live_notice_variant", "info"),
            )

        with st.container(height=340, border=False):
            _render_conversation_thread(state)

        answer = st.chat_input(
            "Take your time. Type your answer...",
            key=f"live_chat_input_{state.id}",
        )
        if ws.preferences.show_star_hints:
            bulb_img = get_svg_img_tag("practice/conv-tip-bulb.svg", width=16, height=16)
            render_html(
                f"""
                <div style="display:flex;align-items:center;gap:9px;margin:8px 4px 0 4px;">
                  {bulb_img}
                  <span style="font-size:11.5px;color:#796985;">
                    Coach tip: Use STAR — Situation, Task, Action, Result.
                  </span>
                </div>
                """
            )

        if answer is not None:
            cleaned = answer.strip()
            if not cleaned:
                st.session_state["live_notice"] = "Please write an answer before sending."
                st.session_state["live_notice_variant"] = "warning"
                st.rerun()
                return

            with st.spinner("Scoring your response against the STAR rubric..."):
                updated, accepted, refusal_reason, err = submit_live_answer(stored, cleaned)

            if err:
                st.session_state["live_notice"] = err
                st.session_state["live_notice_variant"] = "error"
                st.rerun()
                return

            if not accepted:
                reason_text = (
                    "Prompt-injection guardrails kept Sir Bot in interviewer mode. Answer the active interview question directly."
                    if refusal_reason == "prompt_injection"
                    else "Sir Bot kept the round on track. Respond directly to the current question to earn a rubric score."
                )
                st.session_state["live_notice"] = reason_text
                st.session_state["live_notice_variant"] = "warning"
                st.rerun()
                return

            st.session_state["live_notice"] = None
            if updated.record.state.status == "completed":
                navigate("results")
            else:
                st.rerun()

    if score_open:
        chat_col, score_col = st.columns([1.95, 1.0], gap="large")
        with chat_col:
            _render_chat_column()
        with score_col:
            _render_live_score_panel(state.live_score)
    else:
        _render_chat_column()
