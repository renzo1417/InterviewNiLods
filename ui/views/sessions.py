"""Sessions view: lavender resume banner, history table, and honest 0-session empty state."""

from __future__ import annotations

import streamlit as st

from backend.schemas import InterviewSetupConfig
from ui.content import STARTER_PRESETS
from ui.state import (
    StoredSession,
    build_sample_stored_session,
    format_session_date,
    get_workspace,
    launch_interview,
    navigate,
    upsert_stored_session,
)
from ui.theme import esc, render_html, render_notice, render_page_header, render_pill


def _launch_preset(role: str, difficulty: str, question_range: str, tone: str) -> None:
    cfg = InterviewSetupConfig(
        role=role,
        difficulty=difficulty,  # type: ignore[arg-type]
        questionRange=question_range,  # type: ignore[arg-type]
        tone=tone,  # type: ignore[arg-type]
    )
    use_offline = bool(st.session_state.get("use_offline_demo", False))
    with st.spinner(f"Preparing {role} warm-up..."):
        stored, err = launch_interview(cfg, force_offline=use_offline)
    if err:
        st.session_state["sessions_error"] = err
    elif stored is not None:
        st.session_state["sessions_error"] = None
    st.rerun()


def render_sessions_view() -> None:
    """Render the Sessions history workspace with honest real counts and quick presets."""
    ws = get_workspace()
    sessions = ws.sessions
    completed = [s for s in sessions if s.record.state.status == "completed"]
    in_progress = [s for s in sessions if s.record.state.status == "in_progress"]

    h_left, h_right = st.columns([2.8, 1.2], vertical_alignment="bottom")
    with h_left:
        render_page_header(
            breadcrumbs=["Sessions"],
            title="Your sessions",
            subtitle="Review past interviews and put your feedback to work.",
        )
    with h_right:
        render_html(
            f"""
            <div class="inl-num" style="text-align:right;font-size:12.5px;color:#665570;padding-bottom:14px;">
              {len(completed)} completed · {len(in_progress)} in progress
            </div>
            """
        )

    if st.session_state.get("sessions_error"):
        render_notice(st.session_state["sessions_error"], variant="error")

    # Honest empty state when 0 sessions exist
    if not sessions:
        render_html(
            """
            <div class="inl-card-tinted" style="padding:26px 28px;margin-bottom:14px;">
              <h2 style="font-size:20px;font-weight:600;color:#30263C;margin:0;">No practice sessions yet</h2>
              <p style="font-size:13.5px;line-height:1.55;color:#665570;margin:8px 0 0 0;max-width:60ch;">
                Start a calm 5-minute mock interview with Sir Bot. Your rubric scores, full
                transcripts, and personalized next-focus notes will automatically appear here.
              </p>
            </div>
            """
        )
        a_col1, a_col2, _ = st.columns([1.25, 1.15, 1.6], gap="small")
        with a_col1:
            if st.button(
                "Start your first interview",
                type="primary",
                width="stretch",
                key="sessions_empty_start",
            ):
                navigate("setup")
        with a_col2:
            if st.button(
                "Load sample session",
                type="secondary",
                width="stretch",
                key="sessions_load_sample",
            ):
                sample = build_sample_stored_session()
                upsert_stored_session(sample)
                st.session_state["active_session_id"] = sample.record.state.id
                st.rerun()

        render_html('<div style="height:16px;"></div>')
        render_html(
            '<h2 class="inl-section-title" style="margin-bottom:10px;">Or jump into a popular warm-up</h2>'
        )
        preset_cols = st.columns(3, gap="medium")
        for col, preset in zip(preset_cols, STARTER_PRESETS):
            with col:
                with st.container(border=True):
                    render_html(
                        f"""
                        <div style="font-size:14.5px;font-weight:600;color:#4D365F;">{esc(preset.role)}</div>
                        <div style="font-size:12px;color:#665570;margin:4px 0 12px 0;line-height:1.45;">
                          {esc(preset.meta)}
                        </div>
                        """
                    )
                    if st.button(
                        "Start warm-up",
                        type="secondary",
                        width="stretch",
                        key=f"starter_{preset.role}",
                    ):
                        _launch_preset(
                            preset.role,
                            preset.difficulty,
                            preset.question_range,
                            preset.tone,
                        )
        return

    # Lavender resume banner for unfinished round
    if in_progress:
        latest = in_progress[0]
        ls = latest.record.state
        answered = len(latest.record.evaluations)
        segs = "".join(
            f'<span class="inl-progress-seg{" is-done" if i < max(answered, 1) else ""}"></span>'
            for i in range(max(1, ls.total_questions))
        )
        render_html(
            f"""
            <div class="inl-lavender-banner" style="padding:20px 24px;margin-bottom:12px;">
              <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px;align-items:center;">
                <div>
                  <div style="font-size:12px;font-weight:600;color:#7C6693;">Pick up where you left off</div>
                  <div style="font-size:19px;font-weight:600;color:#4D365F;margin-top:3px;">{esc(ls.config.role)}</div>
                  <div style="font-size:12.5px;color:#665570;margin-top:2px;">
                    {esc(latest.category_label)} · {esc(ls.config.difficulty)} · {esc(ls.config.tone)}
                  </div>
                </div>
                <div style="border-left:1px solid #DFD4EC;padding-left:18px;">
                  <div class="inl-num" style="font-size:13px;font-weight:500;color:#6B4E80;">
                    Question {ls.current_question_index} of {ls.total_questions}
                  </div>
                  <div class="inl-progress-segments" style="margin:8px 0 6px 0;">{segs}</div>
                  <div style="font-size:12px;color:#665570;">Continue with: {esc(ls.current_topic)}</div>
                </div>
              </div>
            </div>
            """
        )
        _, r_btn_col = st.columns([3.0, 1.0])
        with r_btn_col:
            if st.button("Resume interview", type="primary", width="stretch", key="sessions_resume_top"):
                st.session_state["active_session_id"] = ls.id
                navigate("live")

    render_html('<div style="height:8px;"></div>')

    f_status, f_role, f_search, f_sort = st.columns([1.5, 1.0, 1.2, 0.9], gap="small")
    with f_status:
        status_choice = (
            st.segmented_control(
                "Status",
                options=["All", "Completed", "In progress"],
                default="All",
                selection_mode="single",
                label_visibility="collapsed",
                key="sessions_status_filter",
            )
            or "All"
        )
    with f_role:
        unique_roles = sorted({s.record.state.config.role for s in sessions})
        role_filter = st.selectbox(
            "Role filter",
            options=["All roles", *unique_roles],
            label_visibility="collapsed",
            key="sessions_role_filter",
        )
    with f_search:
        search_q = st.text_input(
            "Search sessions",
            placeholder="Search role or keyword...",
            label_visibility="collapsed",
            key="sessions_search",
        ).strip().lower()
    with f_sort:
        sort_by = st.selectbox(
            "Sort sessions",
            options=["Newest first", "Highest score"],
            label_visibility="collapsed",
            key="sessions_sort",
        )

    def _matches(item: StoredSession) -> bool:
        st_obj = item.record.state
        if status_choice == "Completed" and st_obj.status != "completed":
            return False
        if status_choice == "In progress" and st_obj.status != "in_progress":
            return False
        if role_filter != "All roles" and st_obj.config.role != role_filter:
            return False
        if search_q:
            hay = " ".join(
                [
                    st_obj.config.role,
                    item.category_label,
                    st_obj.config.difficulty,
                    st_obj.config.tone,
                ]
            ).lower()
            if search_q not in hay:
                return False
        return True

    filtered = [s for s in sessions if _matches(s)]
    if sort_by == "Highest score":
        filtered.sort(
            key=lambda s: (
                s.record.state.final_results.final_score
                if s.record.state.final_results
                else -1.0
            ),
            reverse=True,
        )
    else:
        filtered.sort(key=lambda s: s.updated_at_iso, reverse=True)

    if not filtered:
        render_html(
            '<div class="inl-card-tinted" style="text-align:center;padding:24px;">'
            '<p style="font-size:13.5px;color:#4D365F;margin:0;">No sessions match that filter.</p>'
            "</div>"
        )
        return

    with st.container(border=True):
        render_html(
            """
            <div style="display:grid;grid-template-columns:2fr 1.1fr 0.9fr 0.9fr 115px;gap:10px;
                        padding-bottom:8px;border-bottom:1px solid #EFEBF4;
                        font-size:12px;font-weight:500;color:#6D5E79;">
              <span>Interview</span>
              <span>Date</span>
              <span>Setup</span>
              <span style="text-align:right;">Score</span>
              <span></span>
            </div>
            """
        )

        for idx, item in enumerate(filtered):
            st_obj = item.record.state
            date_label, time_label = format_session_date(item.updated_at_iso)
            c_name, c_date, c_setup, c_score, c_act = st.columns(
                [2.0, 1.1, 0.9, 0.9, 1.0], vertical_alignment="center"
            )
            with c_name:
                extra_tag = (
                    f' {render_pill("Sample", "neutral")}'
                    if item.is_sample
                    else f' {render_pill("Offline", "neutral")}'
                    if item.is_offline_demo
                    else ""
                )
                render_html(
                    f"""
                    <div style="padding:4px 0;">
                      <div style="font-size:13.5px;font-weight:500;color:#30263C;">
                        {esc(st_obj.config.role)}{extra_tag}
                      </div>
                      <div style="font-size:12px;color:#665570;margin-top:2px;">
                        {esc(item.category_label)} · <span class="inl-num">{st_obj.total_questions}</span> questions
                      </div>
                    </div>
                    """
                )
            with c_date:
                render_html(
                    f"""
                    <div class="inl-num" style="font-size:12.5px;color:#4D365F;">{esc(date_label)}</div>
                    <div class="inl-num" style="font-size:11.5px;color:#6D5E79;margin-top:1px;">{esc(time_label)}</div>
                    """
                )
            with c_setup:
                render_html(
                    f"""
                    <div style="font-size:12.5px;color:#4D365F;">{esc(st_obj.config.difficulty)}</div>
                    <div style="font-size:11.5px;color:#6D5E79;margin-top:1px;">{esc(st_obj.config.tone)}</div>
                    """
                )
            with c_score:
                if st_obj.status == "in_progress":
                    render_html(
                        f'<div style="text-align:right;">'
                        f'{render_pill(f"Q{st_obj.current_question_index}/{st_obj.total_questions} live", "accent")}'
                        f"</div>"
                    )
                elif st_obj.final_results is not None:
                    render_html(
                        f'<div class="inl-num" style="text-align:right;font-size:15px;font-weight:600;color:#60427D;">'
                        f'{st_obj.final_results.final_score:.1f}'
                        f'<span style="font-size:12px;font-weight:400;color:#6D5E79;"> / 10</span></div>'
                    )
                else:
                    render_html('<div style="text-align:right;color:#6D5E79;">—</div>')
            with c_act:
                action_label = "Resume" if st_obj.status == "in_progress" else "View results"
                if st.button(
                    action_label,
                    type="secondary",
                    width="stretch",
                    key=f"sess_open_{st_obj.id}",
                ):
                    st.session_state["active_session_id"] = st_obj.id
                    navigate("live" if st_obj.status == "in_progress" else "results")

            if idx < len(filtered) - 1:
                render_html('<div style="height:1px;background:#EFEBF4;margin:2px 0;"></div>')
