"""Interview ni Lods (Sir Bot) — Streamlit Landing & Practice Workspace Entrypoint."""

from __future__ import annotations

import streamlit as st

from ui.sidebar import render_sidebar
from ui.state import init_session_state
from ui.theme import SIR_BOT_LOGO_PATH, inject_theme
from ui.views.help import render_help_view
from ui.views.landing import render_landing_view
from ui.views.live import render_live_view
from ui.views.profile import render_profile_view
from ui.views.results import render_results_view
from ui.views.sessions import render_sessions_view
from ui.views.setup import render_setup_view
from ui.views.tips import render_tips_view
from ui.views.transcript import render_transcript_view

st.set_page_config(
    page_title="Interview ni Lods — Practice now, panic less later.",
    page_icon=str(SIR_BOT_LOGO_PATH) if SIR_BOT_LOGO_PATH.is_file() else None,
    layout="wide",
    initial_sidebar_state="expanded",
)


def main() -> None:
    init_session_state()
    view = st.session_state.get("active_view", "landing")

    inject_theme(is_landing=(view == "landing"), is_setup=(view == "setup"))

    if view == "landing":
        render_landing_view()
        return

    render_sidebar()

    if view == "live":
        render_live_view()
    elif view == "results":
        render_results_view()
    elif view == "transcript":
        render_transcript_view()
    elif view == "sessions":
        render_sessions_view()
    elif view in {"tips", "tips_detail"}:
        render_tips_view()
    elif view == "profile":
        render_profile_view()
    elif view == "help":
        render_help_view()
    else:
        render_setup_view()


if __name__ == "__main__":
    main()
