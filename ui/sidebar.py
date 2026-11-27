"""Dark charcoal (#202124) workspace sidebar matching the Next.js PracticeSidebar 1:1."""

from __future__ import annotations

import streamlit as st

from ui.state import (
    get_backend_status,
    get_workspace,
    navigate,
)
from ui.theme import esc, get_sir_bot_logo_data_uri, get_svg_img_tag, render_html


def render_sidebar() -> None:
    """Render the dark charcoal sidebar with soft lavender CTA, nav, recent sessions, and encouragement card."""
    ws = get_workspace()
    active_view = st.session_state.get("active_view", "setup")
    active_sid = st.session_state.get("active_session_id")
    backend = get_backend_status()
    offline_selected = bool(st.session_state.get("use_offline_demo", False))

    with st.sidebar:
        logo_uri = get_sir_bot_logo_data_uri()
        logo_img = (
            f'<img src="{logo_uri}" alt="Sir Bot mark" />' if logo_uri else ""
        )
        render_html(
            f"""
            <a href="?view=landing" target="_self" style="text-decoration:none;display:block;">
              <div class="inl-sb-brand">
                {logo_img}
                <div class="inl-sb-title">Sir Bot</div>
              </div>
            </a>
            <div class="inl-sb-sub">Practice now, panic less later.</div>
            """
        )

        if st.button(
            "New interview",
            key="sidebar_new_interview",
            type="primary",
            width="stretch",
        ):
            st.session_state["setup_error"] = None
            st.session_state["setup_draft"] = ws.defaults.model_copy()
            navigate("setup")

        render_html('<div style="height:12px;"></div>')

        in_progress_count = sum(
            1 for s in ws.sessions if s.record.state.status == "in_progress"
        )
        sessions_label = (
            f"Sessions ({in_progress_count} active)"
            if in_progress_count > 0
            else "Sessions"
        )

        nav_items = [
            ("setup", "Practice", active_view in {"setup", "live"}),
            (
                "sessions",
                sessions_label,
                active_view in {"sessions", "results", "transcript"},
            ),
            ("tips", "Tips", active_view in {"tips", "tips_detail"}),
            ("profile", "Profile", active_view == "profile"),
        ]

        for target_view, label, is_active in nav_items:
            if st.button(
                label,
                key=f"nav_{target_view}",
                type="secondary" if is_active else "tertiary",
                width="stretch",
            ):
                if target_view == "setup" and active_view == "live":
                    navigate("live")
                else:
                    navigate(target_view)

        render_html('<div class="inl-sb-divider"></div>')
        render_html('<div class="inl-sb-heading">RECENT SESSIONS</div>')

        recent = ws.sessions[:4]
        if not recent:
            render_html(
                '<p style="font-size:11.5px;color:#8E8D99;margin:2px 8px 8px 8px;line-height:1.45;">'
                "No sessions yet. Start an interview to see it here."
                "</p>"
            )
        else:
            for stored in recent:
                state = stored.record.state
                sid = state.id
                is_selected = sid == active_sid and active_view in {
                    "live",
                    "results",
                    "transcript",
                }
                if state.status == "completed" and state.final_results is not None:
                    meta = f"{state.final_results.final_score:.1f} / 10"
                else:
                    meta = f"Q{state.current_question_index}/{state.total_questions}"

                role_short = (
                    state.config.role
                    if len(state.config.role) <= 15
                    else f"{state.config.role[:13]}..."
                )
                row_label = f"{role_short} · {meta}"
                if st.button(
                    row_label,
                    key=f"recent_{sid}",
                    type="secondary" if is_selected else "tertiary",
                    width="stretch",
                ):
                    st.session_state["active_session_id"] = sid
                    navigate("results" if state.status == "completed" else "live")

        # Bottom encouragement card matching Next.js PracticeSidebar
        if backend["live_available"] and not offline_selected:
            dot_color = "#86D3A5"
            mode_line = f"Live AI · {backend['model']}"
        elif backend["live_available"] and offline_selected:
            dot_color = "#E6BA78"
            mode_line = "Offline demo mode"
        else:
            dot_color = "#E6BA78"
            mode_line = "Offline demo (no key)"

        sparkle_img = get_svg_img_tag("practice/nav-sparkle.svg", width=19, height=19)
        render_html(
            f"""
            <div class="inl-sb-card">
              <div style="display:inline-flex;">{sparkle_img}</div>
              <div class="inl-sb-card-title">Progress, not perfection.</div>
              <div class="inl-sb-card-sub">One answer at a time.</div>
              <div style="margin-top:10px;padding-top:8px;border-top:1px solid #3B3B41;font-size:11px;color:#A9A8B3;">
                <span style="display:inline-block;width:6px;height:6px;border-radius:999px;background:{dot_color};margin-right:6px;vertical-align:middle;"></span>
                {esc(mode_line)}
              </div>
            </div>
            <div class="inl-sb-divider"></div>
            """
        )

        if st.button(
            "Help & support",
            key="nav_help",
            type="secondary" if active_view == "help" else "tertiary",
            width="stretch",
        ):
            navigate("help")

        if st.button(
            "Back to landing page",
            key="nav_landing",
            type="tertiary",
            width="stretch",
        ):
            navigate("landing")
