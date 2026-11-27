"""Focused modal dialogs using Streamlit @st.dialog with clean dismiss handling."""

from __future__ import annotations

import streamlit as st

from ui.state import (
    StoredSession,
    clear_all_sessions,
    finalize_live_session,
    navigate,
)
from ui.theme import esc, render_html, render_numbered_notes_html


def _dismiss_dialog() -> None:
    st.session_state["active_dialog"] = None


@st.dialog("How Interview ni Lods works", on_dismiss=_dismiss_dialog)
def show_how_it_works_dialog() -> None:
    render_html(
        """
        <p style="font-size:14px;line-height:1.55;color:#665570;margin:0 0 14px 0;">
          Three calm steps to sharper behavioral and role-specific answers with Sir Bot.
        </p>
        """
        + render_numbered_notes_html(
            [
                (
                    "01",
                    "Choose your setup",
                    "Pick any target job role, difficulty, question count, and coaching tone. Optionally upload a resume so questions ground in your real projects.",
                ),
                (
                    "02",
                    "Practice with live feedback",
                    "Respond naturally in chat and toggle Live score preview anytime to see STAR scoring across Clarity, Structure, Relevance, and Impact.",
                ),
                (
                    "03",
                    "Review your session summary",
                    "Finish all questions or end early to inspect question-by-question takeaways, save standout answers, and download a study sheet.",
                ),
            ]
        )
    )
    render_html('<div style="height:14px;"></div>')
    col_note, col_btn = st.columns([1.6, 1.0])
    with col_note:
        render_html(
            '<p style="font-size:12.5px;color:#6D5E79;margin:10px 0 0 0;">'
            "No pressure. No perfect answers."
            "</p>"
        )
    with col_btn:
        if st.button("Got it, let us practice", type="primary", width="stretch", key="how_it_works_close"):
            st.session_state["active_dialog"] = None
            st.rerun(scope="app")


@st.dialog("End this session early?", on_dismiss=_dismiss_dialog)
def show_end_interview_dialog(stored: StoredSession) -> None:
    state = stored.record.state
    answered = len(stored.record.evaluations)
    live = state.live_score

    live_badge = (
        f'<span class="inl-pill inl-pill-accent inl-num">{live.overall_score:.1f} / 10 live</span>'
        if live is not None
        else '<span class="inl-pill inl-pill-neutral">No answers scored yet</span>'
    )
    render_html(
        f"""
        <div class="inl-card-tinted" style="background:#F3EEF9;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px;">
          <div>
            <div style="font-size:13.5px;font-weight:600;color:#4D365F;">
              {esc(state.config.role)} · {esc(state.config.difficulty)} · {esc(state.config.tone)}
            </div>
            <div class="inl-num" style="font-size:12px;color:#665570;margin-top:2px;">
              {answered} of {state.total_questions} questions answered so far
            </div>
          </div>
          {live_badge}
        </div>
        <p style="font-size:13.5px;line-height:1.55;color:#665570;margin:0 0 16px 0;">
          Ending now scores every question you have already answered and generates your final rubric breakdown and transcript.
        </p>
        """
    )

    c1, c2 = st.columns(2, gap="small")
    with c1:
        if st.button("Keep practicing", type="secondary", width="stretch", key="end_dlg_cancel"):
            st.session_state["active_dialog"] = None
            st.rerun(scope="app")
    with c2:
        if st.button("End and view results", type="primary", width="stretch", key="end_dlg_confirm"):
            st.session_state["active_dialog"] = None
            finalize_live_session(stored)
            navigate("results")


@st.dialog("Clear practice history?", on_dismiss=_dismiss_dialog)
def show_clear_history_dialog(session_count: int) -> None:
    render_html(
        f"""
        <p style="font-size:14px;line-height:1.55;color:#30263C;margin:0 0 8px 0;">
          This permanently removes all <strong class="inl-num">{session_count}</strong> stored practice
          {"session" if session_count == 1 else "sessions"} from this workspace.
        </p>
        <p style="font-size:13px;line-height:1.5;color:#665570;margin:0 0 16px 0;">
          Your bookmarked guides and saved answers will remain intact. Consider exporting JSON first if you want a backup.
        </p>
        """
    )
    c1, c2 = st.columns(2, gap="small")
    with c1:
        if st.button("Cancel", type="secondary", width="stretch", key="clear_dlg_cancel"):
            st.session_state["active_dialog"] = None
            st.rerun(scope="app")
    with c2:
        if st.button("Clear all sessions", type="primary", width="stretch", key="clear_dlg_confirm"):
            st.session_state["active_dialog"] = None
            clear_all_sessions()
            navigate("sessions")
