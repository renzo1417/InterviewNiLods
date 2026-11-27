"""Help & support view: lavender quick-help cards and searchable FAQ expanders."""

from __future__ import annotations

import streamlit as st

from ui.content import HELP_FAQ_ITEMS, HELP_REFERENCE_CARDS
from ui.theme import esc, render_html, render_page_header


def render_help_view() -> None:
    """Render concise lavender reference cards and searchable FAQ expanders."""
    h_left, h_right = st.columns([2.4, 1.2], vertical_alignment="bottom")
    with h_left:
        render_page_header(
            breadcrumbs=["Help & support"],
            title="Help & support",
            subtitle="Answers on STAR rubric scoring, ChromaDB resume context, and prompt safety guardrails.",
        )
    with h_right:
        query = st.text_input(
            "Search help topics",
            placeholder="Search help topics...",
            label_visibility="collapsed",
            key="help_search_input",
        ).strip().lower()

    cols = st.columns(3, gap="medium")
    for col, (title, body) in zip(cols, HELP_REFERENCE_CARDS):
        with col:
            render_html(
                f"""
                <div class="inl-card-tinted" style="min-height:132px;">
                  <div style="font-size:14.5px;font-weight:600;color:#4D365F;margin-bottom:6px;">
                    {esc(title)}
                  </div>
                  <p style="font-size:12.5px;line-height:1.55;color:#665570;margin:0;">
                    {esc(body)}
                  </p>
                </div>
                """
            )

    render_html('<div style="height:16px;"></div>')
    render_html('<h2 class="inl-section-title" style="margin-bottom:10px;">Frequently asked questions</h2>')

    visible = [
        (q, a)
        for q, a in HELP_FAQ_ITEMS
        if not query or query in q.lower() or query in a.lower()
    ]

    if not visible:
        render_html(
            f'<div class="inl-card-tinted"><p style="font-size:13px;color:#665570;margin:0;">'
            f'No help topics matched "{esc(query)}". Try searching for resume, scoring, or export.'
            f"</p></div>"
        )
        return

    for idx, (question, answer) in enumerate(visible):
        with st.expander(question, expanded=(idx == 0 and not query)):
            render_html(
                f'<p style="font-size:13.5px;line-height:1.6;color:#665570;margin:0;">{esc(answer)}</p>'
            )
