"""Profile, Saved Answers, and Preferences view (honest computed metrics + plum Altair chart)."""

from __future__ import annotations

import altair as alt
import pandas as pd
import streamlit as st

from backend.schemas import InterviewSetupConfig
from ui.content import (
    DIFFICULTY_OPTIONS,
    JOB_ROLE_OPTIONS,
    QUESTION_RANGE_OPTIONS,
    SAVED_ANSWER_TAGS,
    TONE_OPTIONS,
)
from ui.dialogs import show_clear_history_dialog
from ui.state import (
    CoachingPreferences,
    UserProfile,
    format_session_date,
    format_workspace_export_json,
    get_workspace,
    launch_interview,
    navigate,
    persist_workspace,
    remove_saved_answer,
)
from ui.theme import esc, render_html, render_kpi_strip, render_notice, render_pill


def _render_score_trend_chart(completed_sessions: list) -> None:
    """Render a clean single-hue plum Altair line chart when >= 2 completed sessions exist."""
    ordered = sorted(completed_sessions, key=lambda s: s.updated_at_iso)
    rows = []
    for idx, item in enumerate(ordered, start=1):
        res = item.record.state.final_results
        if res is None:
            continue
        date_label, _ = format_session_date(item.updated_at_iso)
        rows.append(
            {
                "Round": f"Round {idx}",
                "Order": idx,
                "Role": item.record.state.config.role,
                "Date": date_label,
                "Score": round(res.final_score, 1),
            }
        )

    if len(rows) < 2:
        with st.container(border=True):
            render_html(
                """
                <div style="font-size:14.5px;font-weight:600;color:#30263C;">Score progression</div>
                <p style="font-size:13px;color:#665570;line-height:1.5;margin:6px 0 0 0;">
                  Complete at least two practice interviews to see your rubric score trend across rounds.
                </p>
                """
            )
        return

    df = pd.DataFrame(rows)
    chart = (
        alt.Chart(df)
        .mark_line(color="#7453A6", strokeWidth=2.4, point=alt.OverlayMarkDef(color="#7453A6", size=54))
        .encode(
            x=alt.X(
                "Round:N",
                sort=list(df["Round"]),
                title=None,
                axis=alt.Axis(labelAngle=0, labelColor="#665570", labelFont="Inter", domainColor="#E5DFEC", tickColor="#E5DFEC"),
            ),
            y=alt.Y(
                "Score:Q",
                scale=alt.Scale(domain=[0, 10]),
                title=None,
                axis=alt.Axis(
                    values=[0, 2.5, 5, 7.5, 10],
                    gridColor="#EFEBF4",
                    domain=False,
                    ticks=False,
                    labelColor="#6D5E79",
                    labelFont="Inter",
                ),
            ),
            tooltip=["Round", "Role", "Date", alt.Tooltip("Score:Q", format=".1f")],
        )
        .properties(height=210)
        .configure_view(strokeWidth=0)
    )

    with st.container(border=True):
        render_html(
            '<div style="font-size:14.5px;font-weight:600;color:#30263C;margin-bottom:8px;">'
            "Score progression"
            "</div>"
        )
        st.altair_chart(chart, width="stretch")


def render_profile_view() -> None:
    """Render Profile Overview, Saved Answers library, and Preferences & Data management."""
    ws = get_workspace()
    profile = ws.profile
    defaults = ws.defaults
    prefs = ws.preferences

    initial = (profile.display_name.strip()[:1] or "C").upper()

    id_left, id_right = st.columns([3.0, 1.1], vertical_alignment="center")
    with id_left:
        render_html(
            f"""
            <div style="display:flex;align-items:center;gap:16px;margin-bottom:14px;">
              <div class="inl-monogram">{esc(initial)}</div>
              <div>
                <div class="inl-breadcrumb">Profile</div>
                <h1 class="inl-page-title">{esc(profile.display_name)}</h1>
                <p class="inl-page-subtitle" style="margin-top:2px;">{esc(profile.headline)}</p>
              </div>
            </div>
            """
        )
    with id_right:
        if st.button("Start with defaults", type="primary", width="stretch", key="prof_start_defaults"):
            use_offline = bool(st.session_state.get("use_offline_demo", False))
            with st.spinner("Starting interview with your defaults..."):
                stored, err = launch_interview(defaults, force_offline=use_offline)
            if err:
                st.session_state["profile_notice"] = err
            elif stored is not None:
                st.session_state["profile_notice"] = None
            st.rerun()

    if st.session_state.get("profile_notice"):
        render_notice(st.session_state["profile_notice"], variant="error")

    tab_overview, tab_saved, tab_prefs = st.tabs(
        ["Overview", f"Saved answers ({len(ws.saved_answers)})", "Account & preferences"]
    )

    with tab_overview:
        completed = [s for s in ws.sessions if s.record.state.status == "completed"]
        scored = [
            s.record.state.final_results.final_score
            for s in completed
            if s.record.state.final_results is not None
            and s.record.state.final_results.completed_questions > 0
        ]
        total_answers = sum(len(s.record.evaluations) for s in ws.sessions)
        avg_display = f"{(sum(scored) / len(scored)):.1f} / 10" if scored else "—"

        render_kpi_strip(
            [
                ("Completed interviews", str(len(completed)), "Your practice so far"),
                ("Answers evaluated", str(total_answers), "STAR-scored responses"),
                ("Average score", avg_display, "Across completed sessions" if scored else "No scored rounds yet"),
                ("Saved answers", str(len(ws.saved_answers)), "Bookmarked STAR stories"),
            ]
        )

        render_html('<div style="height:16px;"></div>')

        left_col, right_col = st.columns([1.75, 1.0], gap="large")
        with left_col:
            _render_score_trend_chart(completed)

            render_html('<div style="height:10px;"></div>')
            with st.container(border=True):
                render_html(
                    '<div style="font-size:15px;font-weight:600;color:#30263C;margin-bottom:8px;">'
                    "Recent saved answers"
                    "</div>"
                )
                if not ws.saved_answers:
                    render_html(
                        '<p style="font-size:13px;color:#665570;margin:0;">'
                        "No saved answers yet. Bookmark standout answers from any session transcript to build your personal STAR library."
                        "</p>"
                    )
                else:
                    for idx, ans in enumerate(ws.saved_answers[:3]):
                        render_html(
                            f"""
                            <div style="padding:8px 0;">
                              <div style="display:flex;justify-content:space-between;gap:10px;align-items:baseline;">
                                <span style="font-size:13.5px;font-weight:600;color:#30263C;">{esc(ans.title)}</span>
                                <span class="inl-num" style="font-size:12.5px;font-weight:600;color:#73518F;">{ans.score:.1f} / 10</span>
                              </div>
                              <p style="font-size:12.5px;color:#665570;line-height:1.45;margin:4px 0 0 0;">
                                {esc(ans.answer[:170])}{"..." if len(ans.answer) > 170 else ""}
                              </p>
                              <div style="font-size:11.5px;color:#6D5E79;margin-top:4px;">
                                {esc(ans.tag)} · {esc(ans.role)}
                              </div>
                            </div>
                            """
                        )
                        if idx < min(len(ws.saved_answers), 3) - 1:
                            render_html('<div style="height:1px;background:#EFEBF4;"></div>')

        with right_col:
            with st.container(border=True):
                render_html(
                    f"""
                    <div style="font-size:15px;font-weight:600;color:#30263C;margin-bottom:10px;">
                      Practice defaults
                    </div>
                    <div style="display:flex;flex-direction:column;gap:6px;font-size:13px;">
                      <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #EFEBF4;">
                        <span style="color:#665570;">Target role</span>
                        <span style="font-weight:500;color:#30263C;">{esc(defaults.role)}</span>
                      </div>
                      <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #EFEBF4;">
                        <span style="color:#665570;">Difficulty</span>
                        <span style="font-weight:500;color:#30263C;">{esc(defaults.difficulty)}</span>
                      </div>
                      <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #EFEBF4;">
                        <span style="color:#665570;">Questions</span>
                        <span class="inl-num" style="font-weight:500;color:#30263C;">{esc(defaults.question_range)}</span>
                      </div>
                      <div style="display:flex;justify-content:space-between;padding:6px 0;">
                        <span style="color:#665570;">Coach's tone</span>
                        <span style="font-weight:500;color:#30263C;">{esc(defaults.tone)}</span>
                      </div>
                    </div>
                    <p style="font-size:12px;color:#6D5E79;margin:12px 0 0 0;">
                      Update these anytime under Account &amp; preferences.
                    </p>
                    """
                )

    with tab_saved:
        sf_tag, sf_search = st.columns([2.2, 1.2], gap="small")
        with sf_tag:
            tag_choice = (
                st.segmented_control(
                    "Tag filter",
                    options=["All", *SAVED_ANSWER_TAGS],
                    default="All",
                    selection_mode="single",
                    label_visibility="collapsed",
                    key="saved_tag_seg",
                )
                or "All"
            )
        with sf_search:
            saved_q = st.text_input(
                "Search saved answers",
                placeholder="Search saved stories...",
                label_visibility="collapsed",
                key="saved_search_input",
            ).strip().lower()

        filtered_saved = [
            a
            for a in ws.saved_answers
            if (tag_choice == "All" or a.tag == tag_choice)
            and (
                not saved_q
                or saved_q in a.title.lower()
                or saved_q in a.answer.lower()
                or saved_q in a.role.lower()
            )
        ]

        if not filtered_saved:
            render_html(
                """
                <div class="inl-card-tinted" style="text-align:center;padding:24px;">
                  <div style="font-size:15px;font-weight:600;color:#30263C;">No saved answers yet</div>
                  <p style="font-size:13px;color:#665570;margin:6px 0 0 0;">
                    Open any completed Session transcript and select Save answer to collect your strongest STAR stories here.
                  </p>
                </div>
                """
            )
        else:
            cols = st.columns(2, gap="medium")
            for idx, item in enumerate(filtered_saved):
                with cols[idx % 2]:
                    with st.container(border=True):
                        render_html(
                            f"""
                            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
                              <div>
                                <div style="font-size:15px;font-weight:600;color:#30263C;">{esc(item.title)}</div>
                                <div style="font-size:11.5px;color:#6D5E79;margin-top:2px;">
                                  {esc(item.tag)} · {esc(item.role)} · {esc(item.date_label)}
                                </div>
                              </div>
                              {render_pill(f"{item.score:.1f} / 10", "accent")}
                            </div>
                            <div class="inl-card-tinted" style="margin:12px 0;padding:12px 14px;font-size:13px;line-height:1.55;color:#564564;">
                              "{esc(item.answer)}"
                            </div>
                            <div style="font-size:12px;font-weight:500;color:#73518F;margin-bottom:12px;">
                              Sir Bot note: {esc(item.coach_note)}
                            </div>
                            """
                        )
                        b_prac, b_rm = st.columns([1.3, 0.8], gap="small")
                        with b_prac:
                            if st.button(
                                "Practice follow-up",
                                type="secondary",
                                width="stretch",
                                key=f"saved_prac_{item.id}",
                            ):
                                st.session_state["setup_draft"] = InterviewSetupConfig(
                                    role=item.role,
                                    difficulty=defaults.difficulty,
                                    questionRange="3-5",
                                    tone=defaults.tone,
                                )
                                navigate("setup")
                        with b_rm:
                            if st.button(
                                "Remove",
                                type="secondary",
                                width="stretch",
                                key=f"saved_rm_{item.id}",
                            ):
                                remove_saved_answer(item.id)
                                st.rerun()

    with tab_prefs:
        p_main, p_side = st.columns([1.75, 1.0], gap="large")

        with p_main:
            with st.container(border=True):
                render_html('<h2 class="inl-section-title" style="margin-bottom:10px;">Profile details</h2>')
                with st.form("profile_details_form", border=False):
                    pc1, pc2 = st.columns(2, gap="medium")
                    with pc1:
                        new_name = st.text_input("Display name", value=profile.display_name)
                    with pc2:
                        new_headline = st.text_input("Current interview focus", value=profile.headline)
                    if st.form_submit_button("Save profile", type="primary"):
                        ws.profile = UserProfile(
                            display_name=new_name.strip() or "Candidate",
                            headline=new_headline.strip() or profile.headline,
                        )
                        persist_workspace()
                        st.toast("Profile updated.")
                        st.rerun()

            with st.container(border=True):
                render_html('<h2 class="inl-section-title" style="margin-bottom:10px;">Default interview setup</h2>')
                with st.form("practice_defaults_form", border=False):
                    role_opts = list(JOB_ROLE_OPTIONS)
                    if defaults.role not in role_opts:
                        role_opts.insert(0, defaults.role)
                    try:
                        def_role = st.selectbox(
                            "Target role",
                            options=role_opts,
                            index=role_opts.index(defaults.role),
                            accept_new_options=True,
                        )
                    except TypeError:
                        def_role = st.selectbox(
                            "Target role",
                            options=role_opts,
                            index=role_opts.index(defaults.role),
                        )

                    dc1, dc2, dc3 = st.columns(3, gap="small")
                    with dc1:
                        def_diff = st.selectbox(
                            "Difficulty",
                            options=list(DIFFICULTY_OPTIONS),
                            index=list(DIFFICULTY_OPTIONS).index(defaults.difficulty),
                        )
                    with dc2:
                        def_range = st.selectbox(
                            "Questions",
                            options=list(QUESTION_RANGE_OPTIONS),
                            index=list(QUESTION_RANGE_OPTIONS).index(defaults.question_range),
                        )
                    with dc3:
                        def_tone = st.selectbox(
                            "Coach's tone",
                            options=list(TONE_OPTIONS),
                            index=list(TONE_OPTIONS).index(defaults.tone),
                        )
                    if st.form_submit_button("Save defaults", type="primary"):
                        clean_role = (def_role or defaults.role).strip() or "Software Engineer"
                        ws.defaults = InterviewSetupConfig(
                            role=clean_role,
                            difficulty=def_diff,  # type: ignore[arg-type]
                            questionRange=def_range,  # type: ignore[arg-type]
                            tone=def_tone,  # type: ignore[arg-type]
                        )
                        st.session_state["setup_draft"] = ws.defaults.model_copy()
                        persist_workspace()
                        st.toast("Practice defaults saved.")
                        st.rerun()

            with st.container(border=True):
                render_html('<h2 class="inl-section-title" style="margin-bottom:10px;">Coaching behavior</h2>')
                auto_score = st.toggle(
                    "Auto-open Live score preview when starting an interview",
                    value=prefs.auto_open_live_score,
                    key="pref_auto_live_score",
                )
                star_hints = st.toggle(
                    "Show STAR coach tip under the answer composer",
                    value=prefs.show_star_hints,
                    key="pref_show_star_hints",
                )
                if auto_score != prefs.auto_open_live_score or star_hints != prefs.show_star_hints:
                    ws.preferences = CoachingPreferences(
                        auto_open_live_score=auto_score,
                        show_star_hints=star_hints,
                    )
                    persist_workspace()
                    st.rerun()

        with p_side:
            with st.container(border=True):
                render_html(
                    """
                    <div style="font-size:12px;font-weight:600;color:#73518F;">Data and privacy</div>
                    <div style="font-size:15.5px;font-weight:600;color:#4D365F;margin-top:4px;">
                      Your interview history belongs to you.
                    </div>
                    <p style="font-size:12.5px;line-height:1.5;color:#665570;margin:6px 0 14px 0;">
                      Download your completed sessions, scores, and saved answers anytime.
                    </p>
                    """
                )
                st.download_button(
                    "Export all transcripts (JSON)",
                    data=format_workspace_export_json(ws),
                    file_name="interview-ni-lods-workspace.json",
                    mime="application/json",
                    type="secondary",
                    width="stretch",
                    key="prof_export_json",
                )

                render_html('<div style="height:1px;background:#EFEBF4;margin:16px 0;"></div>')
                render_html(
                    """
                    <div style="font-size:13.5px;font-weight:600;color:#9E3A4A;">Reset history</div>
                    <p style="font-size:12px;line-height:1.45;color:#665570;margin:4px 0 12px 0;">
                      Remove all stored practice sessions from local workspace storage.
                    </p>
                    """
                )
                if st.button(
                    "Clear practice history",
                    type="secondary",
                    disabled=len(ws.sessions) == 0,
                    width="stretch",
                    key="prof_clear_history_btn",
                ):
                    st.session_state["active_dialog"] = "clear_history"

                if st.session_state.get("active_dialog") == "clear_history":
                    show_clear_history_dialog(len(ws.sessions))
