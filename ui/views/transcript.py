"""Screen 05 — Session Transcript & Answer Review matching the Next.js plum & lavender aesthetic."""

from __future__ import annotations

import streamlit as st

from ui.state import (
    format_session_date,
    format_session_transcript_txt,
    get_active_session,
    is_answer_saved,
    navigate,
    toggle_saved_answer,
)
from ui.theme import (
    esc,
    render_html,
    render_notice,
    render_numbered_notes_html,
    render_pill,
    render_rubric_bars_html,
)


def render_transcript_view() -> None:
    """Render Screen 05: per-question transcript inspection, rubric breakdown, and study-sheet download."""
    stored = get_active_session()
    if stored is None or stored.record.state.final_results is None:
        render_notice(
            "No completed transcript selected yet. Open a finished session from Sessions.",
            variant="info",
        )
        if st.button("View sessions", type="primary", key="tx_go_sessions"):
            navigate("sessions")
        return

    state = stored.record.state
    results = state.final_results
    q_items = results.question_results
    if not q_items:
        render_notice("This session does not contain recorded question items.", variant="info")
        return

    selected_num = st.session_state.get("transcript_question_number") or q_items[0].number
    selected_idx = next(
        (i for i, item in enumerate(q_items) if item.number == selected_num), 0
    )
    active_item = q_items[selected_idx]

    eval_by_number = {e.question.number: e for e in stored.record.evaluations}
    matched_eval = eval_by_number.get(active_item.number)

    date_label, _ = format_session_date(stored.updated_at_iso)
    saved = is_answer_saved(state.id, active_item.number)

    h_left, h_save, h_again = st.columns([2.5, 0.9, 1.0], vertical_alignment="bottom")
    with h_left:
        render_html(
            f"""
            <div style="margin-bottom:14px;">
              <div class="inl-breadcrumb">
                Sessions <span style="margin:0 6px;color:#A59EB3;">/</span>
                Interview results <span style="margin:0 6px;color:#A59EB3;">/</span>
                <strong>Transcript</strong>
              </div>
              <div style="display:flex;flex-wrap:wrap;align-items:center;gap:10px;">
                <h1 class="inl-page-title">Session transcript</h1>
                {render_pill(f"Final score {results.final_score:.1f} / 10", "accent")}
              </div>
              <p class="inl-page-subtitle">
                {esc(state.config.role)} · {esc(state.config.difficulty)} difficulty · {esc(state.config.tone)} · {esc(date_label)}
              </p>
            </div>
            """
        )
    with h_save:
        save_label = "Answer saved" if saved else "Save answer"
        if st.button(
            save_label,
            type="secondary",
            width="stretch",
            key=f"tx_save_{state.id}_{active_item.number}",
        ):
            toggle_saved_answer(stored, active_item)
            st.rerun()
    with h_again:
        if st.button("Practice similar", type="primary", width="stretch", key="tx_practice_similar"):
            st.session_state["setup_draft"] = state.config.model_copy()
            navigate("setup")

    rail_col, detail_col = st.columns([1.0, 2.05], gap="large")

    with rail_col:
        with st.container(border=True):
            render_html(
                f"""
                <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:500;
                            color:#6D5E79;padding-bottom:8px;border-bottom:1px solid #EFEBF4;margin-bottom:8px;">
                  <span class="inl-num">Questions ({len(q_items)})</span>
                  <span>Score</span>
                </div>
                """
            )
            for item in q_items:
                is_curr = item.number == active_item.number
                short_title = (
                    item.title if len(item.title) <= 22 else f"{item.title[:20]}..."
                )
                score_txt = f"{item.score:.1f}" if item.score > 0 else "—"
                btn_label = f"{item.number} · {short_title} ({score_txt})"
                if st.button(
                    btn_label,
                    key=f"tx_pick_{item.number}",
                    type="primary" if is_curr else "secondary",
                    width="stretch",
                ):
                    st.session_state["transcript_question_number"] = item.number
                    st.rerun()

            render_html('<div style="height:1px;background:#EFEBF4;margin:14px 0;"></div>')
            render_html(
                f"""
                <div style="font-size:12.5px;font-weight:600;color:#73518F;">Export transcript</div>
                <p style="font-size:12px;color:#665570;line-height:1.45;margin:4px 0 10px 0;">
                  Save all {len(q_items)} answers and Sir Bot coaching notes as a clean study sheet.
                </p>
                """
            )
            txt_bytes = format_session_transcript_txt(stored)
            safe_slug = state.config.role.lower().replace(" ", "-")
            st.download_button(
                "Download study summary",
                data=txt_bytes,
                file_name=f"interview-ni-lods-{safe_slug}-transcript.txt",
                mime="text/plain",
                type="secondary",
                width="stretch",
                key="tx_download_summary",
            )

        if st.button("Back to results", type="secondary", width="stretch", key="tx_back_results"):
            navigate("results")

    with detail_col:
        word_count = len(active_item.user_answer.split())
        spoken_secs = max(10, round((word_count / 2.2) * 1.4)) if word_count > 3 else 0
        duration_meta = (
            f"{word_count} words · about {spoken_secs}s spoken"
            if spoken_secs > 0
            else "No spoken estimate"
        )
        score_badge = (
            render_pill(
                f"{active_item.score:.1f} / 10 · {'Strong answer' if active_item.score >= 8.0 else 'Solid answer'}",
                "accent" if active_item.score >= 7.5 else "neutral",
            )
            if active_item.score > 0
            else render_pill("Unanswered", "neutral")
        )

        with st.container(border=True):
            render_html(
                f"""
                <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;">
                  <div class="inl-num" style="font-size:12px;font-weight:600;color:#73518F;">
                    Question {esc(active_item.number)} · {esc(active_item.title)}
                  </div>
                  {score_badge}
                </div>

                <div style="margin-top:14px;">
                  <div style="font-size:12px;font-weight:500;color:#6D5E79;">Sir Bot asked</div>
                  <div style="font-size:16px;font-weight:600;line-height:1.45;color:#30263C;margin-top:4px;">
                    "{esc(active_item.prompt)}"
                  </div>
                </div>

                <div class="inl-card-tinted" style="margin-top:16px;padding:15px 17px;">
                  <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;margin-bottom:8px;">
                    <span style="font-size:12px;font-weight:600;color:#60427D;">Your answer</span>
                    <span class="inl-num" style="font-size:12px;color:#6D5E79;">{esc(duration_meta)}</span>
                  </div>
                  <div style="font-size:13.5px;line-height:1.6;color:#51465B;white-space:pre-wrap;">
                    {esc(active_item.user_answer)}
                  </div>
                </div>
                """
            )

        rubric_html = ""
        if matched_eval is not None:
            eb = matched_eval.breakdown
            rubric_html = (
                '<div style="background:#FFFFFF;border-radius:12px;padding:16px 18px;margin-bottom:14px;">'
                + render_rubric_bars_html(eb.clarity, eb.structure, eb.relevance, eb.impact)
                + "</div>"
            )

        upgrades_html = ""
        if matched_eval is not None and matched_eval.improve_next:
            notes = [(n.code, n.title, n.detail) for n in matched_eval.improve_next]
            upgrades_html = (
                '<div style="margin-top:14px;padding-top:12px;border-top:1px solid #EFEBF4;">'
                '<div style="font-size:12px;font-weight:600;color:#60427D;">Try next time</div>'
                + render_numbered_notes_html(notes)
                + "</div>"
            )

        render_html(
            f"""
            <section class="inl-lavender-banner" style="padding:20px 22px;margin-top:4px;">
              <div style="font-size:12px;font-weight:600;color:#73518F;margin-bottom:12px;">
                Sir Bot answer breakdown
              </div>
              {rubric_html}
              <div style="background:#FFFFFF;border:1px solid #E3DAF1;border-radius:12px;padding:16px 18px;">
                <div style="font-size:12px;font-weight:600;color:#73518F;">Coaching note</div>
                <p style="font-size:13.5px;line-height:1.55;color:#564564;margin:6px 0 0 0;">
                  {esc(active_item.coach_feedback)}
                </p>
                {upgrades_html}
              </div>
            </section>
            """
        )

        render_html('<div style="height:12px;"></div>')
        nav_prev, _, nav_next = st.columns([1.0, 1.4, 1.0])
        with nav_prev:
            if st.button(
                "Previous question",
                type="secondary",
                disabled=selected_idx <= 0,
                width="stretch",
                key="tx_prev_q",
            ):
                st.session_state["transcript_question_number"] = q_items[selected_idx - 1].number
                st.rerun()
        with nav_next:
            if st.button(
                "Next question",
                type="secondary",
                disabled=selected_idx >= len(q_items) - 1,
                width="stretch",
                key="tx_next_q",
            ):
                st.session_state["transcript_question_number"] = q_items[selected_idx + 1].number
                st.rerun()
