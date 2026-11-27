"""Screens 02 & 03 — Live Interview Chat with autoscroll, inline scoring status, and Live Score drawer."""

from __future__ import annotations

import streamlit as st

from backend.schemas import ChatTurn, LiveScoreSnapshot, PracticeSessionState
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


def _render_single_turn(turn: ChatTurn, *, is_latest_bot: bool, logo_tag: str) -> None:
    """Render an individual chat turn so Streamlit's autoscroll container tracks each message cleanly."""
    content_safe = esc(turn.content)
    time_safe = esc(turn.timestamp)
    if turn.sender == "sir-bot":
        card_cls = "inl-turn-bot-latest" if is_latest_bot else "inl-turn-bot"
        active_badge = (
            '<span class="inl-turn-active-tag">Current prompt</span>'
            if is_latest_bot
            else ""
        )
        render_html(
            f"""
            <article class="{card_cls}">
              <div class="inl-turn-head">
                {logo_tag}
                <span class="inl-turn-speaker">Sir Bot</span>
                <span class="inl-turn-time">{time_safe}</span>
                {active_badge}
              </div>
              <div class="inl-turn-bot-body">{content_safe}</div>
            </article>
            """
        )
    else:
        render_html(
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


def _render_conversation_thread(state: PracticeSessionState) -> None:
    """Render every turn chronologically with the latest Sir Bot prompt highlighted."""
    logo_uri = get_sir_bot_logo_data_uri()
    logo_tag = f'<img src="{logo_uri}" alt="Sir Bot" />' if logo_uri else ""

    last_bot_idx = -1
    for idx, turn in enumerate(state.turns):
        if turn.sender == "sir-bot":
            last_bot_idx = idx

    for idx, turn in enumerate(state.turns):
        _render_single_turn(
            turn,
            is_latest_bot=(idx == last_bot_idx),
            logo_tag=logo_tag,
        )


def _render_optimistic_scoring_turns(user_answer: str) -> None:
    """Append the candidate's submitted bubble and Sir Bot's inline reviewing indicator inside the chat."""
    logo_uri = get_sir_bot_logo_data_uri()
    logo_tag = f'<img src="{logo_uri}" alt="Sir Bot" />' if logo_uri else ""
    render_html(
        f"""
        <article class="inl-turn-user">
          <div class="inl-turn-head">
            <span class="inl-turn-speaker" style="color:#655273;">You</span>
            <span class="inl-turn-time">Just now</span>
          </div>
          <div class="inl-turn-user-bubble">{esc(user_answer)}</div>
        </article>
        """
    )
    render_html(
        f"""
        <article class="inl-thinking-card" role="status" aria-live="polite">
          <div class="inl-turn-head">
            {logo_tag}
            <span class="inl-turn-speaker">Sir Bot</span>
            <span class="inl-turn-time">Reviewing...</span>
          </div>
          <div class="inl-thinking-row">
            <span class="inl-dots" aria-hidden="true"><span></span><span></span><span></span></span>
            <span>Scoring your response against the STAR rubric...</span>
          </div>
        </article>
        """
    )


def _render_live_score_panel(live: LiveScoreSnapshot | None) -> None:
    """Render the grounded soft-lavender Live Score Preview drawer aligned with the chat column."""
    with st.container(border=False, key="live_score_drawer"):
        render_html(
            """
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:2px;">
              <h2 class="inl-drawer-title">Live score preview</h2>
              <span style="display:inline-flex;align-items:center;gap:7px;height:23px;border-radius:12px;background:#EEE6FA;padding:0 10px;font-size:10.5px;font-weight:500;color:#6D4E91;">
                <span style="width:6px;height:6px;border-radius:999px;background:#9772C0;display:inline-block;"></span>
                Live
              </span>
            </div>
            <p style="font-size:12px;color:#796985;margin:0 0 12px 0;">
              Feedback on your latest answer
            </p>
            """
        )

        if live is None:
            render_html(
                """
                <div style="border-radius:14px;border:1px dashed #DDD1ED;background:#FFFFFF;padding:16px 18px;">
                  <div style="font-size:13.5px;font-weight:600;color:#4D3C5D;">Ready when you are</div>
                  <p style="font-size:12px;line-height:1.55;color:#796985;margin:6px 0 0 0;">
                    Send your first response and Sir Bot will score clarity, structure, relevance,
                    and measurable impact in real time.
                  </p>
                </div>
                <p style="font-size:10.5px;color:#796985;margin:18px 2px 0 2px;">
                  A preview, not your final session score.
                </p>
                """
            )
        else:
            b = live.breakdown
            notes = [(n.code, n.title, n.detail) for n in live.improve_next]
            with st.container(height=490, border=False):
                render_html(
                    f"""
                    <div style="font-size:11.5px;font-weight:500;color:#796985;margin-bottom:6px;">
                      {esc(live.question_label)}
                    </div>
                    <div class="inl-score-box" style="padding:14px 16px;margin-bottom:14px;">
                      <div>
                        <span class="inl-score-big" style="font-size:38px;">{live.overall_score:.1f}</span>
                        <span class="inl-score-denom" style="font-size:15px;">/ 10</span>
                      </div>
                      <div style="font-size:14px;font-weight:600;color:#5D3F7F;margin-top:6px;">
                        {esc(live.verdict)}
                      </div>
                      <div style="font-size:12px;line-height:1.45;color:#766085;margin-top:3px;">
                        {esc(live.verdict_detail)}
                      </div>
                    </div>
                    <div style="font-size:13px;font-weight:600;color:#4D3C5D;margin-bottom:8px;">
                      Answer breakdown
                    </div>
                    {render_rubric_bars_html(b.clarity, b.structure, b.relevance, b.impact)}
                    <div style="height:1px;background:#E7DFEF;margin:14px 0;"></div>
                    <div style="font-size:13px;font-weight:600;color:#4D3C5D;">
                      What is working well
                    </div>
                    {render_check_list_html(live.working_well)}
                    <div style="font-size:13px;font-weight:600;color:#4D3C5D;margin-top:14px;">
                      Improve next
                    </div>
                    {render_numbered_notes_html(notes)}
                    <p style="font-size:10.5px;color:#796985;margin:14px 0 2px 0;">
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
        f'<img src="{logo_uri}" alt="Sir Bot" style="width:32px;height:32px;object-fit:contain;" />'
        if logo_uri
        else ""
    )

    # Compact top workspace header bar matching PracticeWorkspace.tsx
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

    render_html('<div style="height:1px;background:#EFEBF4;margin:6px 0 12px 0;"></div>')

    def _render_chat_column() -> None:
        resume_pill = (
            render_pill(f"Resume RAG · {state.resume_filename}", "accent")
            if state.resume_filename
            else ""
        )
        demo_pill = render_pill("Offline demo", "warning") if stored.is_offline_demo else ""
        render_html(
            f"""
            <div style="margin-bottom:2px;">
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

        # Scrollable chat viewport with autoscroll=True so the newest Sir Bot turn stays pinned in view
        thread_box = st.container(
            height=410,
            border=False,
            autoscroll=True,
            key="live_chat_thread",
        )
        with thread_box:
            _render_conversation_thread(state)

        answer = st.chat_input(
            "Take your time. Type your answer...",
            key=f"live_chat_input_{state.id}",
        )
        if ws.preferences.show_star_hints:
            bulb_img = get_svg_img_tag("practice/conv-tip-bulb.svg", width=15, height=15)
            render_html(
                f"""
                <div style="display:flex;align-items:center;gap:8px;margin:4px 4px 0 4px;">
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

            # Render the user's sent bubble and Sir Bot's inline reviewing status INSIDE thread_box (above composer)
            with thread_box:
                _render_optimistic_scoring_turns(cleaned)

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
