"""Screen 04 — Final Interview Results matching the Next.js lavender summary banner."""

from __future__ import annotations

import streamlit as st

from ui.state import (
    format_session_transcript_txt,
    get_active_session,
    navigate,
)
from ui.theme import (
    esc,
    render_check_list_html,
    render_html,
    render_notice,
    render_numbered_notes_html,
    render_pill,
    render_rubric_bars_html,
)


def render_results_view() -> None:
    """Render Screen 04 with the signature #f2ecfb overall performance banner and question list."""
    stored = get_active_session()
    if stored is None or stored.record.state.final_results is None:
        render_notice(
            "No completed session selected yet. Finish an interview or choose one from Sessions.",
            variant="info",
        )
        if st.button("View sessions", type="primary", key="results_go_sessions"):
            navigate("sessions")
        return

    state = stored.record.state
    results = state.final_results
    b = results.breakdown

    h_left, h_right = st.columns([3.0, 1.0], vertical_alignment="bottom")
    with h_left:
        sample_badge = render_pill("Sample preview", "neutral") if stored.is_sample else ""
        render_html(
            f"""
            <div style="margin-bottom:14px;">
              <div class="inl-breadcrumb">Sessions <span style="margin:0 6px;color:#A59EB3;">/</span> <strong>Interview results</strong></div>
              <div style="display:flex;flex-wrap:wrap;align-items:center;gap:10px;">
                <h1 class="inl-page-title">Your interview results</h1>
                {render_pill("Completed", "positive")}
                {sample_badge}
              </div>
              <p class="inl-page-subtitle">
                {esc(state.config.role)} · {esc(state.config.difficulty)} difficulty · {esc(state.config.tone)}
                <span class="inl-num" style="margin-left:10px;color:#6D5E79;">
                  {results.completed_questions} of {results.total_questions} questions completed
                </span>
              </p>
            </div>
            """
        )
    with h_right:
        txt_bytes = format_session_transcript_txt(stored)
        safe_slug = state.config.role.lower().replace(" ", "-")
        st.download_button(
            "Download study sheet",
            data=txt_bytes,
            file_name=f"interview-ni-lods-{safe_slug}-summary.txt",
            mime="text/plain",
            type="secondary",
            width="stretch",
            key="results_download_txt",
        )

    # Signature #f2ecfb lavender performance banner card (matches InterviewResultsView.tsx)
    rating_variant = (
        "accent"
        if results.final_score >= 7.0
        else "warning"
    )
    render_html(
        f"""
        <section class="inl-lavender-banner" aria-label="Overall performance summary">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:24px;align-items:center;">
            <div>
              <div style="font-size:12px;font-weight:600;color:#7C6693;">Final session score</div>
              <div style="margin-top:6px;">
                <span class="inl-score-big" style="font-size:52px;">{results.final_score:.1f}</span>
                <span class="inl-score-denom">/ 10</span>
              </div>
              <div style="margin-top:12px;">
                {render_pill(results.rating_label, rating_variant)}
              </div>
            </div>

            <div style="border-left:1px solid #E0D4EF;padding-left:22px;">
              <div style="font-size:20px;font-weight:600;line-height:1.35;color:#4D365F;">
                {esc(results.headline)}
              </div>
              <p style="font-size:13.5px;line-height:1.55;color:#6C577D;margin:8px 0 0 0;">
                {esc(results.summary_lines[0])} {esc(results.summary_lines[1])}
              </p>
              <div style="font-size:12.5px;font-weight:600;color:#6D4C86;margin-top:12px;">
                {esc(results.next_focus_line)}
              </div>
            </div>

            <div style="border-left:1px solid #E0D4EF;padding-left:22px;">
              {render_rubric_bars_html(b.clarity, b.structure, b.relevance, b.impact)}
            </div>
          </div>
        </section>
        """
    )

    render_html('<div style="height:18px;"></div>')

    # Question by question (left) + From Sir Bot (right)
    q_col, coach_col = st.columns([1.75, 1.0], gap="large")

    with q_col:
        qh_left, qh_right = st.columns([2.1, 1.0], vertical_alignment="center")
        with qh_left:
            render_html('<h2 class="inl-section-title" style="margin:0;">Question by question</h2>')
        with qh_right:
            if st.button("View transcript", type="secondary", width="stretch", key="results_open_tx"):
                st.session_state["transcript_question_number"] = (
                    results.question_results[0].number if results.question_results else "01"
                )
                navigate("transcript")

        with st.container(border=True):
            render_html(
                """
                <div style="display:grid;grid-template-columns:42px 1fr 78px;gap:10px;padding:0 0 8px 0;
                            border-bottom:1px solid #EFEBF4;font-size:12px;font-weight:500;color:#6D5E79;">
                  <span>No.</span>
                  <span>Question</span>
                  <span style="text-align:right;">Score / 10</span>
                </div>
                """
            )
            for idx, item in enumerate(results.question_results):
                r_info, r_score, r_btn = st.columns([2.6, 0.7, 0.75], vertical_alignment="center")
                with r_info:
                    render_html(
                        f"""
                        <div style="display:flex;align-items:flex-start;gap:12px;padding:6px 0;">
                          <span class="inl-num" style="font-size:12px;font-weight:500;color:#8B739D;width:24px;flex-shrink:0;margin-top:2px;">
                            {esc(item.number)}
                          </span>
                          <div style="min-width:0;">
                            <div style="font-size:13.5px;font-weight:500;color:#4D365F;line-height:1.35;">
                              {esc(item.title)}
                            </div>
                            <div style="font-size:12px;color:#665570;line-height:1.4;margin-top:2px;">
                              {esc(item.takeaway)}
                            </div>
                          </div>
                        </div>
                        """
                    )
                with r_score:
                    score_display = f"{item.score:.1f}" if item.score > 0 else "—"
                    render_html(
                        f'<div class="inl-num" style="text-align:right;font-size:14.5px;font-weight:600;color:#79569A;">'
                        f"{score_display}</div>"
                    )
                with r_btn:
                    if st.button("Review", type="secondary", width="stretch", key=f"res_q_{item.number}"):
                        st.session_state["transcript_question_number"] = item.number
                        navigate("transcript")
                if idx < len(results.question_results) - 1:
                    render_html('<div style="height:1px;background:#EFEBF4;margin:2px 0;"></div>')

    with coach_col:
        render_html('<h2 class="inl-section-title" style="margin:0 0 10px 0;">From Sir Bot</h2>')
        notes = [(n.code, n.title, n.detail) for n in results.focus_on_next]
        sources_html = ""
        if state.rag_sources:
            pills = " ".join(render_pill(src, "neutral") for src in state.rag_sources[:4])
            sources_html = (
                '<div style="height:1px;background:#E7DFEF;margin:16px 0;"></div>'
                '<div style="font-size:12.5px;font-weight:600;color:#665570;margin-bottom:8px;">Grounding sources</div>'
                f'<div style="display:flex;flex-wrap:wrap;gap:6px;">{pills}</div>'
            )

        render_html(
            f"""
            <div class="inl-card-tinted" style="background:#FBF9FD;">
              <div style="font-size:12.5px;font-weight:600;color:#665570;">Keep doing this</div>
              {render_check_list_html(results.keep_doing_this)}

              <div style="height:1px;background:#E7DFEF;margin:18px 0;"></div>

              <div style="font-size:12.5px;font-weight:600;color:#665570;">Focus on next</div>
              {render_numbered_notes_html(notes)}
              {sources_html}
            </div>
            """
        )

    render_html('<div style="height:16px;"></div>')

    # Bottom lavender CTA strip
    with st.container(border=True):
        f_copy, f_back, f_again = st.columns([2.3, 0.9, 1.0], vertical_alignment="center")
        with f_copy:
            render_html(
                """
                <div style="font-size:16px;font-weight:600;color:#4D365F;">Turn feedback into your next win.</div>
                <div style="font-size:12.5px;color:#665570;margin-top:2px;">
                  Try another session with measurable outcomes in mind.
                </div>
                """
            )
        with f_back:
            if st.button("Back to sessions", type="secondary", width="stretch", key="res_back_sessions"):
                navigate("sessions")
        with f_again:
            if st.button("Practice again", type="primary", width="stretch", key="res_practice_again"):
                st.session_state["setup_draft"] = state.config.model_copy()
                navigate("setup")
