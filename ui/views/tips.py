"""Interview Tips library, editorial guide reader, bookmarks, and STAR quick reference."""

from __future__ import annotations

import streamlit as st

from backend.schemas import InterviewSetupConfig
from ui.content import (
    INTERVIEW_GUIDES,
    InterviewGuide,
    STAR_ITEMS,
    TIP_CATEGORIES,
)
from ui.state import (
    get_workspace,
    launch_interview,
    navigate,
    toggle_saved_guide,
)
from ui.theme import esc, render_html, render_notice, render_numbered_notes_html, render_page_header, render_pill


def _render_star_card() -> None:
    rows_html = "".join(
        f"""
        <div style="display:flex;align-items:flex-start;gap:12px;">
          <span style="width:30px;height:30px;border-radius:8px;background:#ECE5F5;color:#73518F;
                       font-size:13px;font-weight:600;display:inline-flex;align-items:center;
                       justify-content:center;flex-shrink:0;margin-top:1px;">
            {esc(letter)}
          </span>
          <div>
            <div style="font-size:13.5px;font-weight:600;color:#30263C;">{esc(title)}</div>
            <div style="font-size:12px;color:#665570;line-height:1.45;margin-top:2px;">
              {esc(detail)}
            </div>
          </div>
        </div>
        """
        for letter, title, detail in STAR_ITEMS
    )
    with st.container(border=True):
        render_html(
            f"""
            <div style="font-size:12.5px;font-weight:600;color:#73518F;margin-bottom:14px;">
              The STAR method
            </div>
            <div style="display:flex;flex-direction:column;gap:14px;">
              {rows_html}
            </div>
            <div style="height:1px;background:#EFEBF4;margin:16px 0 10px 0;"></div>
            <div style="font-size:12px;color:#6D5E79;">A guide for your thoughts, not a script.</div>
            """
        )


def _start_drill_from_guide(guide: InterviewGuide) -> None:
    cfg = InterviewSetupConfig(
        role=guide.drill_role,
        difficulty=guide.drill_difficulty,
        questionRange=guide.drill_range,
        tone=guide.drill_tone,
    )
    use_offline = bool(st.session_state.get("use_offline_demo", False))
    with st.spinner("Starting focused practice drill..."):
        stored, err = launch_interview(cfg, force_offline=use_offline)
    if err:
        st.session_state["tips_error"] = err
    elif stored is not None:
        st.session_state["tips_error"] = None
    st.rerun()


def _render_guide_detail(guide: InterviewGuide) -> None:
    ws = get_workspace()
    is_saved = guide.id in ws.saved_guide_ids

    h_left, h_save, h_back = st.columns([2.5, 0.9, 0.9], vertical_alignment="bottom")
    with h_left:
        render_page_header(
            breadcrumbs=["Tips", guide.category],
            title=guide.title,
            subtitle=guide.lead,
        )
    with h_save:
        if st.button(
            "Saved guide" if is_saved else "Save guide",
            type="secondary",
            width="stretch",
            key=f"tip_detail_save_{guide.id}",
        ):
            toggle_saved_guide(guide.id)
            st.rerun()
    with h_back:
        if st.button("All guides", type="secondary", width="stretch", key="tip_detail_back"):
            navigate("tips")

    if st.session_state.get("tips_error"):
        render_notice(st.session_state["tips_error"], variant="error")

    main_col, rail_col = st.columns([1.8, 1.0], gap="large")

    with main_col:
        render_html(
            f"""
            <div class="inl-card-tinted" style="margin-bottom:14px;">
              <div style="font-size:12px;font-weight:600;color:#73518F;margin-bottom:12px;">
                Side-by-side example
              </div>
              <div style="margin-bottom:12px;">
                <div style="font-size:12px;font-weight:500;color:#6D5E79;">Instead of</div>
                <p style="font-size:14px;line-height:1.55;color:#5D4E6B;margin:4px 0 0 0;">
                  "{esc(guide.before_example)}"
                </p>
              </div>
              <div style="background:#EEE6F8;border-radius:12px;padding:14px 16px;">
                <div style="font-size:12px;font-weight:600;color:#60427D;">Show the outcome</div>
                <p style="font-size:14px;font-weight:500;line-height:1.55;color:#4D365F;margin:4px 0 0 0;">
                  "{esc(guide.after_example)}"
                </p>
              </div>
              <div style="font-size:12px;color:#6D5E79;margin-top:10px;">{esc(guide.example_caption)}</div>
            </div>
            """
        )

        with st.container(border=True):
            steps_tuples = [(s.code, s.heading, s.detail) for s in guide.steps]
            render_html(
                f'<h2 class="inl-section-title" style="margin-bottom:8px;">{esc(guide.framework_title)}</h2>'
                + render_numbered_notes_html(steps_tuples)
            )

    with rail_col:
        render_html(
            f"""
            <div class="inl-lavender-banner" style="padding:20px 22px;margin-bottom:12px;">
              <div style="font-size:12px;font-weight:600;color:#73518F;">Try it with Sir Bot</div>
              <div style="font-size:17px;font-weight:600;color:#4D365F;margin-top:4px;line-height:1.35;">
                Put this into practice right now.
              </div>
              <p style="font-size:12.5px;line-height:1.5;color:#665570;margin:6px 0 0 0;">
                Start a focused {esc(guide.drill_range)} question {esc(guide.drill_role)} round in {esc(guide.drill_tone)} tone with live rubric scoring.
              </p>
            </div>
            """
        )
        if st.button(
            "Start practice drill",
            type="primary",
            width="stretch",
            key=f"tip_drill_{guide.id}",
        ):
            _start_drill_from_guide(guide)

        render_html('<div style="height:10px;"></div>')
        related = [g for g in INTERVIEW_GUIDES if g.id != guide.id][:3]
        with st.container(border=True):
            render_html('<div style="font-size:12.5px;font-weight:600;color:#6D5E79;margin-bottom:8px;">Up next in toolkit</div>')
            for rel in related:
                if st.button(
                    f"{rel.title} ({rel.read_time})",
                    type="secondary",
                    width="stretch",
                    key=f"tip_rel_{rel.id}",
                ):
                    st.session_state["active_guide_id"] = rel.id
                    st.rerun()


def render_tips_view() -> None:
    """Render the Tips library or the active guide detail reader."""
    if st.session_state.get("active_view") == "tips_detail":
        active_id = st.session_state.get("active_guide_id", INTERVIEW_GUIDES[0].id)
        guide = next((g for g in INTERVIEW_GUIDES if g.id == active_id), INTERVIEW_GUIDES[0])
        _render_guide_detail(guide)
        return

    ws = get_workspace()
    saved_ids = set(ws.saved_guide_ids)

    render_page_header(
        breadcrumbs=["Tips"],
        title="Interview tips",
        subtitle="Practical ways to turn your experience into a stronger answer.",
    )

    if st.session_state.get("tips_error"):
        render_notice(st.session_state["tips_error"], variant="error")

    f_cat, f_saved = st.columns([3.2, 1.0], vertical_alignment="center")
    with f_cat:
        category = (
            st.segmented_control(
                "Topic filter",
                options=list(TIP_CATEGORIES),
                default="All guides",
                selection_mode="single",
                label_visibility="collapsed",
                key="tips_category_seg",
            )
            or "All guides"
        )
    with f_saved:
        saved_only = st.toggle(
            f"Saved only ({len(saved_ids)})",
            value=False,
            key="tips_saved_only",
        )

    featured = INTERVIEW_GUIDES[0]
    if category == "All guides" and not saved_only:
        is_feat_saved = featured.id in saved_ids
        with st.container(border=True):
            fc_left, fc_right = st.columns([1.05, 1.1], gap="large")
            with fc_left:
                render_html(
                    f"""
                    <div style="margin-bottom:8px;">
                      {render_pill(f"{featured.category} · {featured.read_time} read", "accent")}
                    </div>
                    <h2 style="font-size:21px;font-weight:600;line-height:1.28;color:#493256;margin:0 0 8px 0;">
                      {esc(featured.title)}
                    </h2>
                    <p style="font-size:13.5px;line-height:1.55;color:#665570;margin:0 0 16px 0;">
                      {esc(featured.summary)}
                    </p>
                    """
                )
                fb1, fb2, fb3 = st.columns([1.25, 0.9, 0.9], gap="small")
                with fb1:
                    if st.button("Practice this skill", type="primary", width="stretch", key="feat_drill"):
                        _start_drill_from_guide(featured)
                with fb2:
                    if st.button("Read guide", type="secondary", width="stretch", key="feat_read"):
                        st.session_state["active_guide_id"] = featured.id
                        navigate("tips_detail")
                with fb3:
                    if st.button(
                        "Saved" if is_feat_saved else "Save",
                        type="secondary",
                        width="stretch",
                        key="feat_save",
                    ):
                        toggle_saved_guide(featured.id)
                        st.rerun()

            with fc_right:
                render_html(
                    f"""
                    <div style="font-size:12px;font-weight:500;color:#6D5E79;margin-bottom:4px;">Instead of</div>
                    <p style="font-size:13.5px;color:#665570;margin:0 0 12px 0;">"{esc(featured.before_example)}"</p>
                    <div style="background:#EEE6F8;border-radius:12px;padding:13px 15px;">
                      <div style="font-size:12px;font-weight:600;color:#60427D;">Show the outcome</div>
                      <p style="font-size:13.5px;font-weight:500;line-height:1.5;color:#4D365F;margin:4px 0 0 0;">
                        "{esc(featured.after_example)}"
                      </p>
                    </div>
                    <div style="font-size:11.5px;color:#6D5E79;margin-top:8px;">{esc(featured.example_caption)}</div>
                    """
                )

    guides = list(INTERVIEW_GUIDES)
    if category == "All guides" and not saved_only:
        guides = guides[1:]
    if category != "All guides":
        guides = [g for g in guides if g.category == category]
    if saved_only:
        guides = [g for g in guides if g.id in saved_ids]

    render_html('<div style="height:10px;"></div>')
    list_col, star_col = st.columns([1.75, 1.0], gap="large")

    with list_col:
        render_html(
            f"""
            <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:10px;">
              <h2 class="inl-section-title" style="margin:0;">Build your interview toolkit</h2>
              <span class="inl-num" style="font-size:12px;color:#6D5E79;">
                {len(guides)} {"guide" if len(guides) == 1 else "guides"}
              </span>
            </div>
            """
        )

        if not guides:
            render_html(
                '<div class="inl-card-tinted" style="text-align:center;padding:20px;">'
                '<p style="font-size:13px;color:#665570;margin:0;">No guides match this filter yet. Bookmark guides as you read to keep them here.</p>'
                "</div>"
            )
        else:
            with st.container(border=True):
                for idx, guide in enumerate(guides):
                    g_info, g_act = st.columns([2.7, 0.9], vertical_alignment="center")
                    with g_info:
                        saved_tag = (
                            f' {render_pill("Saved", "positive")}' if guide.id in saved_ids else ""
                        )
                        render_html(
                            f"""
                            <div style="padding:4px 0;">
                              <div style="font-size:14px;font-weight:600;color:#30263C;">
                                {esc(guide.title)}{saved_tag}
                              </div>
                              <div style="font-size:12.5px;color:#665570;line-height:1.45;margin-top:3px;">
                                {esc(guide.summary)}
                              </div>
                              <div style="font-size:11.5px;color:#73518F;margin-top:4px;">
                                {esc(guide.category)} · {esc(guide.read_time)} read
                              </div>
                            </div>
                            """
                        )
                    with g_act:
                        if st.button(
                            "Read guide",
                            type="secondary",
                            width="stretch",
                            key=f"tip_open_{guide.id}",
                        ):
                            st.session_state["active_guide_id"] = guide.id
                            navigate("tips_detail")
                    if idx < len(guides) - 1:
                        render_html('<div style="height:1px;background:#EFEBF4;margin:4px 0;"></div>')

    with star_col:
        render_html('<h2 class="inl-section-title" style="margin:0 0 10px 0;">Keep this handy</h2>')
        _render_star_card()
