"""Interview ni Lods visual design system: faithful Next.js lavender & charcoal palette, zero emojis, zero fixed-width fonts."""

from __future__ import annotations

import base64
from functools import lru_cache
import html
from pathlib import Path
import re
from typing import Iterable, Sequence

import streamlit as st

ASSETS_DIR = Path(__file__).resolve().parent / "assets"
SIR_BOT_LOGO_PATH = ASSETS_DIR / "sir-bot-logo.png"

SVG_ICONS: dict[str, str] = {
    "check": (
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
        '<path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.1" '
        'stroke-linecap="round" stroke-linejoin="round"/></svg>'
    ),
    "clock": (
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
        '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.75"/>'
        '<path d="M12 7v5l3 2" stroke="currentColor" stroke-width="1.75" '
        'stroke-linecap="round" stroke-linejoin="round"/></svg>'
    ),
    "chart": (
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
        '<path d="M4 19h16M7 15v-4m5 4V7m5 8v-6" stroke="currentColor" stroke-width="1.8" '
        'stroke-linecap="round" stroke-linejoin="round"/></svg>'
    ),
    "shield": (
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
        '<path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z" '
        'stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>'
    ),
    "briefcase": (
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
        '<rect x="3" y="7" width="18" height="13" rx="2.5" stroke="currentColor" stroke-width="1.7"/>'
        '<path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="1.7"/></svg>'
    ),
    "chat": (
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
        '<path d="M21 14a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9z" '
        'stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>'
    ),
    "check_circle": (
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
        '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/>'
        '<path d="M8.5 12.5l2.3 2.3 4.7-5" stroke="currentColor" stroke-width="1.8" '
        'stroke-linecap="round" stroke-linejoin="round"/></svg>'
    ),
    "sparkle": (
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
        '<path d="M12 3l2.2 6.2L20.5 12l-6.3 2.2L12 20.5l-2.2-6.3L3.5 12l6.3-2.8L12 3z" '
        'stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>'
    ),
    "sliders": (
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
        '<path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'
        '<circle cx="9" cy="7" r="2.2" fill="#FFFFFF" stroke="currentColor" stroke-width="1.7"/>'
        '<circle cx="15" cy="12" r="2.2" fill="#FFFFFF" stroke="currentColor" stroke-width="1.7"/>'
        '<circle cx="11" cy="17" r="2.2" fill="#FFFFFF" stroke="currentColor" stroke-width="1.7"/></svg>'
    ),
    "grid": (
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
        '<rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.7"/>'
        '<rect x="13" y="4" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.7"/>'
        '<rect x="4" y="13" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.7"/>'
        '<rect x="13" y="13" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.7"/></svg>'
    ),
    "book": (
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
        '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5v-12z" '
        'stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>'
        '<path d="M8 7h8M8 11h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
    ),
    "arrow_right": (
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
        '<path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.9" '
        'stroke-linecap="round" stroke-linejoin="round"/></svg>'
    ),
    "star": (
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">'
        '<path d="M12 2.5l2.85 5.77 6.37.93-4.61 4.49 1.09 6.35L12 17.04l-5.7 3 1.09-6.35L2.78 9.2l6.37-.93L12 2.5z"/></svg>'
    ),
}


@lru_cache(maxsize=24)
def get_asset_data_uri(filename: str) -> str:
    """Return a local image or SVG asset from ui/assets as a base64 data URI."""
    path = ASSETS_DIR / filename
    if not path.is_file():
        return ""
    suffix = path.suffix.lower()
    mime = (
        "image/svg+xml"
        if suffix == ".svg"
        else "image/jpeg"
        if suffix in {".jpg", ".jpeg"}
        else "image/png"
    )
    encoded = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:{mime};base64,{encoded}"


@lru_cache(maxsize=64)
def get_tinted_svg_data_uri(rel_path: str, stroke_color: str | None = None) -> str:
    """Return a base64 SVG data URI from ui/assets, optionally recoloring stroke hex values."""
    path = ASSETS_DIR / rel_path
    if not path.is_file():
        return ""
    raw = path.read_text(encoding="utf-8")
    if stroke_color:
        raw = re.sub(r'stroke="#[0-9A-Fa-f]{3,8}"', f'stroke="{stroke_color}"', raw)
    encoded = base64.b64encode(raw.encode("utf-8")).decode("ascii")
    return f"data:image/svg+xml;base64,{encoded}"


def get_svg_img_tag(
    rel_path: str,
    width: int = 18,
    height: int = 18,
    stroke_color: str | None = None,
) -> str:
    """Return an inline <img> tag rendering a local SVG asset via base64 data URI."""
    uri = get_tinted_svg_data_uri(rel_path, stroke_color)
    if not uri:
        return ""
    return (
        f'<img src="{uri}" alt="" width="{width}" height="{height}" '
        f'style="width:{width}px;height:{height}px;display:block;flex-shrink:0;" />'
    )


def _inline_svg_data_uri(svg_markup: str) -> str:
    encoded = base64.b64encode(svg_markup.encode("utf-8")).decode("ascii")
    return f"data:image/svg+xml;base64,{encoded}"


def get_sir_bot_logo_data_uri() -> str:
    return get_asset_data_uri("sir-bot-logo.png")


def esc(value: object) -> str:
    """HTML-escape dynamic text before inserting into templates."""
    return html.escape(str(value), quote=True)


def render_html(markup: str) -> None:
    """Render HTML/SVG/CSS via st.markdown without DOMPurify stripping or CommonMark block-splitting."""
    compact = "\n".join(
        line.lstrip() for line in markup.strip().splitlines() if line.strip()
    )
    st.markdown(compact, unsafe_allow_html=True)


def _build_stylesheet(is_landing: bool, is_setup: bool) -> str:
    # Base64 SVG data URIs from the original Next.js practice icon set
    ico_new = get_tinted_svg_data_uri("practice/nav-new.svg", "#292331")
    ico_practice_idle = get_tinted_svg_data_uri("practice/nav-practice.svg", "#AAAAB3")
    ico_practice_active = get_tinted_svg_data_uri("practice/nav-practice.svg", "#D6C9FC")
    ico_sessions_idle = get_tinted_svg_data_uri("practice/nav-sessions.svg", "#AAAAB3")
    ico_sessions_active = get_tinted_svg_data_uri("practice/nav-sessions.svg", "#D6C9FC")
    ico_tips_idle = get_tinted_svg_data_uri("practice/nav-tips.svg", "#AAAAB3")
    ico_tips_active = get_tinted_svg_data_uri("practice/nav-tips.svg", "#D6C9FC")
    ico_profile_idle = get_tinted_svg_data_uri("practice/nav-profile.svg", "#AAAAB3")
    ico_profile_active = get_tinted_svg_data_uri("practice/nav-profile.svg", "#D6C9FC")
    ico_recent_idle = get_tinted_svg_data_uri("practice/nav-session-item.svg", "#8B8A96")
    ico_recent_active = get_tinted_svg_data_uri("practice/nav-session-active.svg", "#C7B8FA")
    ico_help_idle = get_tinted_svg_data_uri("practice/nav-help.svg", "#B3B1BE")
    ico_help_active = get_tinted_svg_data_uri("practice/nav-help.svg", "#D6C9FC")
    ico_landing_idle = _inline_svg_data_uri(
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">'
        '<path d="M19 12H5m6-6-6 6 6 6" stroke="#B3B1BE" stroke-width="1.8" '
        'stroke-linecap="round" stroke-linejoin="round"/></svg>'
    )
    ico_briefcase = get_tinted_svg_data_uri("practice/setup-briefcase.svg", "#9C89B2")
    ico_arrow_right = get_tinted_svg_data_uri("practice/setup-arrow-right.svg", "#423052")
    ico_score_bars = get_tinted_svg_data_uri("practice/conv-score-bars.svg", "#756092")

    landing_rules = (
        """
        [data-testid="stSidebar"],
        [data-testid="stSidebarCollapsedControl"] {
          display: none !important;
        }
        [data-testid="stHeader"] {
          display: none !important;
        }
        [data-testid="stMainBlockContainer"] {
          max-width: 1220px !important;
          padding: 0 1.5rem 2.5rem 1.5rem !important;
          margin: 0 auto !important;
          background: transparent !important;
          border: none !important;
        }
        [data-testid="stAppViewContainer"] {
          background: #FFFFFF !important;
        }
        """
        if is_landing
        else (
            """
            [data-testid="stAppViewContainer"] {
              background:
                radial-gradient(ellipse 56% 52% at 4% 12%, rgba(214, 194, 248, 0.34) 0%, rgba(214, 194, 248, 0) 68%),
                radial-gradient(ellipse 58% 54% at 6% 96%, rgba(208, 187, 247, 0.30) 0%, rgba(208, 187, 247, 0) 68%),
                radial-gradient(ellipse 50% 46% at 96% 14%, rgba(226, 211, 252, 0.28) 0%, rgba(226, 211, 252, 0) 66%),
                linear-gradient(180deg, #FFFFFF 0%, #F5F1FC 100%) !important;
            }
            [data-testid="stMainBlockContainer"] {
              max-width: 920px !important;
              padding: 0.75rem 2.25rem 2.75rem 2.25rem !important;
              background: transparent !important;
            }
            """
            if is_setup
            else """
            [data-testid="stAppViewContainer"] {
              background: #FFFFFF !important;
            }
            [data-testid="stMainBlockContainer"] {
              max-width: 1180px !important;
              padding: 0.9rem 2.5rem 2.5rem 2.5rem !important;
              background: #FFFFFF !important;
            }
            """
        )
    )

    return f"""
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

      :root {{
        --font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        --bg: #FFFFFF;
        --ink: #30263C;
        --ink-deep: #242126;
        --ink-plum: #4D365F;
        --plum-strong: #60427D;
        --plum-cta: #57367D;
        --plum-cta-hover: #492C6B;
        --accent: #7453A6;
        --lavender-btn: #C7B8FA;
        --lavender-btn-hover: #B9A6F5;
        --lavender-btn-ink: #292331;
        --lavender-surface: #F2ECFB;
        --lavender-soft: #F7F4FA;
        --lavender-tint: #FAF8FD;
        --lavender-pill: #EEE6FA;
        --lavender-border: #E5DFEC;
        --lavender-border-strong: #DDD1ED;
        --lavender-rule: #EFEBF4;
        --bar-fill: #A782C9;
        --bar-track: #E2D7EE;
        --muted: #665570;
        --faint: #6D5E79;
        --sidebar-bg: #202124;
        --sidebar-card: #2B2B30;
        --sidebar-active: #343438;
        --sidebar-rule: #3B3B41;
        --sidebar-text: #F5F4F8;
        --sidebar-muted: #C3C2CA;
        --sidebar-sub: #A9A8B3;
        --positive-bg: #EDF3E9;
        --positive-ink: #4C6940;
        --warning-bg: #FFF7E6;
        --warning-border: #F2D49B;
        --warning-ink: #8A5300;
        --danger-bg: #FDF2F4;
        --danger-border: #E6B4BD;
        --danger-ink: #9E3A4A;
        --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
      }}

      /* Enforce single Inter sans-serif typography everywhere (zero fixed-width fonts),
         while preserving Streamlit's Material Symbols icon ligatures. */
      html, body, .stApp, [data-testid="stAppViewContainer"],
      [data-testid="stSidebar"], [data-testid="stDialog"],
      button, input, textarea, select, label, p, div, li, td, th, a,
      h1, h2, h3, h4, h5, h6,
      code, pre, kbd, samp, tt,
      [data-testid="stCode"], [data-testid="stCodeBlock"],
      [data-testid="stMarkdownContainer"] code,
      [data-testid="stMarkdownContainer"] pre {{
        font-family: var(--font-sans) !important;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }}

      [data-testid="stIconMaterial"],
      [data-testid="stIconMaterial"] * {{
        font-family: "Material Symbols Rounded", "Material Symbols Outlined" !important;
        font-style: normal !important;
        font-weight: 400 !important;
      }}

      [data-testid="stMarkdownContainer"] code,
      [data-testid="stMarkdownContainer"] pre {{
        background: transparent !important;
        color: inherit !important;
        border: none !important;
        padding: 0 !important;
        font-size: inherit !important;
      }}

      [data-testid="stAppViewContainer"] {{
        color: var(--ink) !important;
        scroll-padding-bottom: 96px;
      }}

      [data-testid="stHeader"] {{
        background: transparent !important;
      }}

      #MainMenu, footer, [data-testid="stStatusWidget"],
      [data-testid="stAppDeployButton"] {{
        visibility: hidden !important;
      }}

      {landing_rules}

      @media (max-width: 768px) {{
        [data-testid="stMainBlockContainer"] {{
          padding: 1rem 1rem 2rem 1rem !important;
        }}
      }}

      /* =====================================================================
         DARK CHARCOAL WORKSPACE SIDEBAR (#202124) — EXACT NEXT.JS MATCH
         ===================================================================== */
      [data-testid="stSidebar"] {{
        background-color: var(--sidebar-bg) !important;
        border-right: 1px solid #2E2F34 !important;
        min-width: 248px !important;
        max-width: 264px !important;
      }}

      [data-testid="stSidebar"] > div:first-child {{
        background-color: var(--sidebar-bg) !important;
        padding-top: 0.9rem !important;
        padding-left: 0.95rem !important;
        padding-right: 0.95rem !important;
      }}

      [data-testid="stSidebar"] [data-testid="stVerticalBlock"] {{
        gap: 0.35rem !important;
      }}

      [data-testid="stSidebar"] p,
      [data-testid="stSidebar"] span:not([data-testid="stIconMaterial"]),
      [data-testid="stSidebar"] label {{
        color: var(--sidebar-muted);
      }}

      /* Force TRUE left-alignment + icon gap on ALL sidebar navigation buttons */
      [data-testid="stSidebar"] [data-testid="stButton"] button {{
        display: flex !important;
        flex-direction: row !important;
        align-items: center !important;
        justify-content: flex-start !important;
        text-align: left !important;
        gap: 11px !important;
        width: 100% !important;
        padding-left: 14px !important;
        padding-right: 12px !important;
      }}

      [data-testid="stSidebar"] [data-testid="stButton"] button > div,
      [data-testid="stSidebar"] [data-testid="stButton"] button [data-testid="stMarkdownContainer"],
      [data-testid="stSidebar"] [data-testid="stButton"] button p {{
        width: auto !important;
        flex: 0 1 auto !important;
        display: flex !important;
        align-items: center !important;
        justify-content: flex-start !important;
        text-align: left !important;
        margin: 0 !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }}

      /* Sidebar primary button: signature soft lavender #c7b8fa */
      [data-testid="stSidebar"] button[data-testid="stBaseButton-primary"],
      [data-testid="stSidebar"] button[kind="primary"] {{
        background-color: var(--lavender-btn) !important;
        color: var(--lavender-btn-ink) !important;
        border: 1px solid var(--lavender-btn) !important;
        border-radius: 10px !important;
        min-height: 44px !important;
        font-size: 13.5px !important;
        font-weight: 600 !important;
      }}

      [data-testid="stSidebar"] button[data-testid="stBaseButton-primary"] p,
      [data-testid="stSidebar"] button[kind="primary"] p {{
        color: var(--lavender-btn-ink) !important;
        font-weight: 600 !important;
      }}

      /* Sidebar inactive nav rows */
      [data-testid="stSidebar"] button[data-testid="stBaseButton-tertiary"] {{
        background-color: transparent !important;
        border: 1px solid transparent !important;
        border-radius: 9px !important;
        min-height: 39px !important;
        padding-top: 0.42rem !important;
        padding-bottom: 0.42rem !important;
        color: var(--sidebar-muted) !important;
        font-weight: 400 !important;
      }}

      [data-testid="stSidebar"] button[data-testid="stBaseButton-tertiary"] p {{
        color: var(--sidebar-muted) !important;
        font-size: 13px !important;
        font-weight: 400 !important;
      }}

      /* Sidebar active nav row (#343438 pill, #f2eefc text) */
      [data-testid="stSidebar"] button[data-testid="stBaseButton-secondary"] {{
        background-color: var(--sidebar-active) !important;
        border: 1px solid transparent !important;
        border-radius: 9px !important;
        min-height: 39px !important;
        padding-top: 0.42rem !important;
        padding-bottom: 0.42rem !important;
        color: #F2EEFC !important;
        font-weight: 500 !important;
      }}

      [data-testid="stSidebar"] button[data-testid="stBaseButton-secondary"] p {{
        color: #F2EEFC !important;
        font-size: 13px !important;
        font-weight: 500 !important;
      }}

      /* Exact Next.js sidebar SVG icons injected cleanly on the left of every nav button */
      [data-testid="stSidebar"] .st-key-sidebar_new_interview button::before,
      [data-testid="stSidebar"] .st-key-nav_setup button::before,
      [data-testid="stSidebar"] .st-key-nav_sessions button::before,
      [data-testid="stSidebar"] .st-key-nav_tips button::before,
      [data-testid="stSidebar"] .st-key-nav_profile button::before,
      [data-testid="stSidebar"] .st-key-nav_help button::before,
      [data-testid="stSidebar"] .st-key-nav_landing button::before,
      [data-testid="stSidebar"] [class*="st-key-recent_"] button::before {{
        content: "" !important;
        display: inline-block !important;
        width: 18px !important;
        height: 18px !important;
        min-width: 18px !important;
        flex-shrink: 0 !important;
        background-position: center !important;
        background-repeat: no-repeat !important;
        background-size: contain !important;
      }}

      [data-testid="stSidebar"] .st-key-sidebar_new_interview button::before {{
        background-image: url("{ico_new}") !important;
      }}
      [data-testid="stSidebar"] .st-key-nav_setup button::before {{
        background-image: url("{ico_practice_idle}") !important;
      }}
      [data-testid="stSidebar"] .st-key-nav_setup button[data-testid="stBaseButton-secondary"]::before {{
        background-image: url("{ico_practice_active}") !important;
      }}
      [data-testid="stSidebar"] .st-key-nav_sessions button::before {{
        background-image: url("{ico_sessions_idle}") !important;
      }}
      [data-testid="stSidebar"] .st-key-nav_sessions button[data-testid="stBaseButton-secondary"]::before {{
        background-image: url("{ico_sessions_active}") !important;
      }}
      [data-testid="stSidebar"] .st-key-nav_tips button::before {{
        background-image: url("{ico_tips_idle}") !important;
      }}
      [data-testid="stSidebar"] .st-key-nav_tips button[data-testid="stBaseButton-secondary"]::before {{
        background-image: url("{ico_tips_active}") !important;
      }}
      [data-testid="stSidebar"] .st-key-nav_profile button::before {{
        background-image: url("{ico_profile_idle}") !important;
      }}
      [data-testid="stSidebar"] .st-key-nav_profile button[data-testid="stBaseButton-secondary"]::before {{
        background-image: url("{ico_profile_active}") !important;
      }}
      [data-testid="stSidebar"] [class*="st-key-recent_"] button::before {{
        width: 16px !important;
        height: 16px !important;
        min-width: 16px !important;
        background-image: url("{ico_recent_idle}") !important;
      }}
      [data-testid="stSidebar"] [class*="st-key-recent_"] button[data-testid="stBaseButton-secondary"]::before {{
        background-image: url("{ico_recent_active}") !important;
      }}
      [data-testid="stSidebar"] .st-key-nav_help button::before {{
        background-image: url("{ico_help_idle}") !important;
      }}
      [data-testid="stSidebar"] .st-key-nav_help button[data-testid="stBaseButton-secondary"]::before {{
        background-image: url("{ico_help_active}") !important;
      }}
      [data-testid="stSidebar"] .st-key-nav_landing button::before {{
        background-image: url("{ico_landing_idle}") !important;
      }}

      /* =====================================================================
         MAIN CANVAS BUTTONS — TACTILE APPLE + EMIL MOTION
         ===================================================================== */
      .stButton > button,
      .stDownloadButton > button,
      .stFormSubmitButton > button {{
        border-radius: 10px !important;
        font-size: 13px !important;
        font-weight: 600 !important;
        line-height: 1.4 !important;
        min-height: 40px !important;
        padding: 0.48rem 1.05rem !important;
        box-shadow: none !important;
        transition:
          transform 140ms var(--ease-out),
          background-color 160ms ease,
          border-color 160ms ease,
          color 160ms ease !important;
      }}

      .stButton > button:active,
      .stDownloadButton > button:active,
      .stFormSubmitButton > button:active {{
        transform: scale(0.97) !important;
      }}

      .stButton > button:focus-visible,
      .stDownloadButton > button:focus-visible,
      .stFormSubmitButton > button:focus-visible,
      [data-baseweb="select"] > div:focus-within,
      input:focus-visible,
      textarea:focus-visible {{
        outline: 2px solid var(--accent) !important;
        outline-offset: 2px !important;
      }}

      /* Workspace Primary Button: signature lavender #c7b6f0 with #423052 plum ink */
      [data-testid="stMain"] button[data-testid="stBaseButton-primary"],
      [data-testid="stMain"] button[kind="primary"],
      [data-testid="stMain"] button[data-testid="stBaseButton-primaryFormSubmit"],
      [data-testid="stDialog"] button[data-testid="stBaseButton-primary"] {{
        background-color: #C7B6F0 !important;
        color: #423052 !important;
        border: 1px solid #C7B6F0 !important;
      }}

      [data-testid="stMain"] button[data-testid="stBaseButton-primary"] p,
      [data-testid="stMain"] button[data-testid="stBaseButton-primaryFormSubmit"] p,
      [data-testid="stDialog"] button[data-testid="stBaseButton-primary"] p {{
        color: #423052 !important;
        font-weight: 600 !important;
      }}

      /* Setup "Start interview ->" button matching hero-app-preview.png */
      .st-key-setup_start_btn button {{
        border-radius: 11px !important;
        min-height: 42px !important;
        padding: 0.5rem 1.25rem !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 12px !important;
      }}
      .st-key-setup_start_btn button::after {{
        content: "" !important;
        display: inline-block !important;
        width: 17px !important;
        height: 17px !important;
        flex-shrink: 0 !important;
        background: url("{ico_arrow_right}") center/contain no-repeat !important;
      }}

      /* Live score toggle button with score-bars SVG */
      .st-key-live_toggle_score button {{
        background-color: #F4F1FB !important;
        border: 1px solid #E5DDF5 !important;
        color: #4D365F !important;
        border-radius: 11px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 8px !important;
      }}
      .st-key-live_toggle_score button::before {{
        content: "" !important;
        display: inline-block !important;
        width: 16px !important;
        height: 16px !important;
        flex-shrink: 0 !important;
        background: url("{ico_score_bars}") center/contain no-repeat !important;
      }}

      /* Landing Page Primary Button override: deep royal plum #57367d with white text */
      {"[data-testid='stMain'] button[data-testid='stBaseButton-primary'] { background-color: #57367D !important; border-color: #57367D !important; color: #FFFFFF !important; min-height: 46px !important; border-radius: 11px !important; } [data-testid='stMain'] button[data-testid='stBaseButton-primary'] p { color: #FFFFFF !important; }" if is_landing else ""}

      /* Secondary Button: crisp white with lavender border */
      [data-testid="stMain"] button[data-testid="stBaseButton-secondary"],
      [data-testid="stMain"] button[kind="secondary"],
      [data-testid="stMain"] button[data-testid="stBaseButton-secondaryFormSubmit"],
      [data-testid="stDialog"] button[data-testid="stBaseButton-secondary"] {{
        background-color: #FFFFFF !important;
        color: var(--ink-plum) !important;
        border: 1px solid var(--lavender-border-strong) !important;
        font-weight: 500 !important;
      }}

      [data-testid="stMain"] button[data-testid="stBaseButton-secondary"] p,
      [data-testid="stDialog"] button[data-testid="stBaseButton-secondary"] p {{
        color: var(--ink-plum) !important;
        font-weight: 500 !important;
      }}

      @media (hover: hover) and (pointer: fine) {{
        [data-testid="stSidebar"] button[data-testid="stBaseButton-primary"]:hover {{
          background-color: #D3C7FC !important;
          border-color: #D3C7FC !important;
        }}
        [data-testid="stSidebar"] button[data-testid="stBaseButton-tertiary"]:hover {{
          background-color: var(--sidebar-card) !important;
          color: #FFFFFF !important;
        }}
        [data-testid="stSidebar"] button[data-testid="stBaseButton-tertiary"]:hover p {{
          color: #FFFFFF !important;
        }}
        [data-testid="stMain"] button[data-testid="stBaseButton-primary"]:hover,
        [data-testid="stMain"] button[data-testid="stBaseButton-primaryFormSubmit"]:hover,
        [data-testid="stDialog"] button[data-testid="stBaseButton-primary"]:hover {{
          background-color: {"#492C6B" if is_landing else "#BCA9EB"} !important;
          border-color: {"#492C6B" if is_landing else "#BCA9EB"} !important;
        }}
        [data-testid="stMain"] button[data-testid="stBaseButton-secondary"]:hover,
        [data-testid="stDialog"] button[data-testid="stBaseButton-secondary"]:hover {{
          background-color: var(--lavender-tint) !important;
          border-color: #C4B2E1 !important;
        }}
        .st-key-live_toggle_score button:hover {{
          background-color: #EBE5F9 !important;
          border-color: #D4C5EE !important;
        }}
      }}

      /* =====================================================================
         INPUTS, SELECTS, SEGMENTED CONTROLS, TABS, CONTAINERS
         ===================================================================== */
      [data-baseweb="input"] > div,
      [data-baseweb="textarea"] > div,
      [data-baseweb="select"] > div {{
        background-color: #FFFFFF !important;
        border: 1px solid #DDD1ED !important;
        border-radius: 9px !important;
        min-height: 42px !important;
        box-shadow: none !important;
        transition: border-color 150ms ease, background-color 150ms ease !important;
      }}

      /* Job role combobox with leading briefcase SVG matching hero-app-preview.png */
      .st-key-setup_role_select [data-baseweb="select"] > div {{
        background-color: #FCFAFE !important;
        border: 1px solid #E7E0EF !important;
        border-radius: 10px !important;
        min-height: 48px !important;
        padding-left: 10px !important;
      }}
      .st-key-setup_role_select [data-baseweb="select"] > div::before {{
        content: "" !important;
        display: inline-block !important;
        width: 20px !important;
        height: 20px !important;
        margin-right: 4px !important;
        flex-shrink: 0 !important;
        align-self: center !important;
        background: url("{ico_briefcase}") center/contain no-repeat !important;
      }}

      [data-baseweb="input"] > div:focus-within,
      [data-baseweb="textarea"] > div:focus-within,
      [data-baseweb="select"] > div:focus-within {{
        background-color: #FFFFFF !important;
        border-color: var(--accent) !important;
      }}

      [data-baseweb="input"] input,
      [data-baseweb="textarea"] textarea {{
        color: var(--ink) !important;
        font-size: 14px !important;
      }}

      [data-baseweb="input"] input::placeholder,
      [data-baseweb="textarea"] textarea::placeholder {{
        color: var(--faint) !important;
        opacity: 1 !important;
      }}

      [data-testid="stWidgetLabel"] label,
      [data-testid="stWidgetLabel"] p {{
        font-size: 12.5px !important;
        font-weight: 500 !important;
        color: #776A81 !important;
      }}

      /* Segmented control pill tray (Streamlit 1.67 React Aria uses [data-selected]) */
      [data-testid="stButtonGroup"] [role="listbox"],
      [data-testid="stButtonGroup"] > div:last-child {{
        background-color: #F7F4FA !important;
        border: 1px solid #EFEBF4 !important;
        border-radius: 10px !important;
        padding: 4px !important;
        gap: 4px !important;
        width: 100% !important;
      }}

      [data-testid="stButtonGroup"] button[data-variant="segmented_control"],
      [data-testid="stButtonGroup"] button {{
        border-radius: 7px !important;
        font-size: 12.5px !important;
        font-weight: 400 !important;
        min-height: 36px !important;
        border: 1px solid transparent !important;
        background-color: transparent !important;
        color: #796985 !important;
        margin-right: 0 !important;
        box-shadow: none !important;
        transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease !important;
      }}

      [data-testid="stButtonGroup"] button[data-selected],
      [data-testid="stButtonGroup"] button[aria-selected="true"],
      [data-testid="stButtonGroup"] button[aria-pressed="true"],
      [data-testid="stButtonGroup"] button[data-testid="stBaseButton-segmented_controlActive"] {{
        background-color: #FFFFFF !important;
        color: #745396 !important;
        border: 1px solid #DDD1ED !important;
        font-weight: 600 !important;
        box-shadow: 0 1px 3px rgba(72, 48, 94, 0.08) !important;
      }}

      [data-testid="stButtonGroup"] button[data-selected] p,
      [data-testid="stButtonGroup"] button[aria-selected="true"] p,
      [data-testid="stButtonGroup"] button[aria-pressed="true"] p {{
        color: #745396 !important;
        font-weight: 600 !important;
      }}

      /* Tabs: royal plum underline */
      [data-testid="stTabs"] [role="tablist"] {{
        border-bottom: 1px solid var(--lavender-rule);
        gap: 1.5rem;
      }}

      [data-testid="stTabs"] button[role="tab"] {{
        font-size: 13.5px !important;
        font-weight: 500 !important;
        color: var(--muted) !important;
        padding: 0.6rem 0.15rem !important;
      }}

      [data-testid="stTabs"] button[role="tab"][aria-selected="true"] {{
        color: var(--plum-strong) !important;
        font-weight: 600 !important;
      }}

      [data-testid="stTabs"] [data-baseweb="tab-highlight"] {{
        background-color: var(--accent) !important;
        height: 2px !important;
      }}

      /* Elevated Setup Card ("Make it your interview") matching hero-app-preview.png */
      .st-key-setup_card {{
        background-color: #FFFFFF !important;
        border: 1px solid #E7E0F0 !important;
        border-radius: 20px !important;
        padding: 24px 28px 22px 28px !important;
        box-shadow: 0 10px 34px rgba(72, 48, 94, 0.05) !important;
      }}

      .st-key-setup_resume_callout {{
        background-color: #F4EFFA !important;
        border: 1px solid #DDD1ED !important;
        border-radius: 16px !important;
        padding: 14px 18px !important;
        margin-bottom: 14px !important;
      }}

      /* Grounded Live Score Preview Drawer matching LiveInterviewView.tsx */
      .st-key-live_score_drawer {{
        background-color: #FCFAFE !important;
        border: 1px solid #E8E1F0 !important;
        border-radius: 18px !important;
        padding: 20px 22px !important;
        min-height: 495px !important;
      }}

      /* Native bordered cards across workspace views */
      [data-testid="stVerticalBlockBorderWrapper"] {{
        background-color: #FFFFFF !important;
        border: 1px solid var(--lavender-border) !important;
        border-radius: 16px !important;
        padding: 4px !important;
      }}

      /* Expanders (FAQ & Help) */
      [data-testid="stExpander"] {{
        border: 1px solid var(--lavender-border) !important;
        border-radius: 12px !important;
        background-color: #FFFFFF !important;
        overflow: hidden;
      }}

      [data-testid="stExpander"] details[open] {{
        background-color: #F5F1FA !important;
      }}

      [data-testid="stExpander"] summary {{
        font-size: 14.5px !important;
        font-weight: 600 !important;
        color: var(--ink) !important;
        padding: 0.35rem 0.25rem !important;
      }}

      /* File uploader: clean compact lavender dropzone */
      [data-testid="stFileUploaderDropzone"] {{
        background-color: #FCFAFE !important;
        border: 1px dashed #DDD1ED !important;
        border-radius: 10px !important;
        padding: 10px 14px !important;
      }}

      [data-testid="stFileUploaderDropzone"] button {{
        background-color: #FFFFFF !important;
        border: 1px solid #DDD1ED !important;
        border-radius: 8px !important;
        color: #5B3D82 !important;
        font-size: 12.5px !important;
        font-weight: 500 !important;
        min-height: 34px !important;
        padding: 0.25rem 0.85rem !important;
      }}

      [data-testid="stFileUploaderDropzone"] button:hover {{
        background-color: #F4EFFA !important;
        border-color: #C4B2E1 !important;
      }}

      [data-testid="stFileUploaderDropzoneInstructions"] {{
        color: #796985 !important;
        font-size: 12px !important;
      }}

      /* Chat input composer matching LiveInterviewView.tsx */
      [data-testid="stChatInput"] > div {{
        border: 1px solid #E6E1ED !important;
        border-radius: 16px !important;
        background-color: #F8F7FA !important;
        box-shadow: none !important;
        padding: 4px 6px !important;
      }}

      [data-testid="stChatInput"] > div:focus-within {{
        border-color: #BDA5DB !important;
        background-color: #FBFAFD !important;
      }}

      [data-testid="stChatInputSubmitButton"] {{
        background-color: #CCBDF4 !important;
        color: #3A2A50 !important;
        border-radius: 10px !important;
      }}

      [data-testid="stChatInputSubmitButton"]:hover {{
        background-color: #BEA9EE !important;
      }}

      /* Dialog modal */
      [data-testid="stDialog"] [role="dialog"] {{
        border-radius: 20px !important;
        border: 1px solid var(--lavender-border) !important;
        box-shadow: 0 18px 42px rgba(36, 28, 56, 0.16) !important;
      }}

      /* =====================================================================
         CUSTOM SEMANTIC CLASSES — WORKSPACE & LANDING PAGE
         ===================================================================== */
      .inl-num {{ font-variant-numeric: tabular-nums; }}

      .inl-sb-brand {{
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 2px 4px 2px 4px;
      }}
      .inl-sb-brand img {{ width: 37px; height: 37px; object-fit: contain; flex-shrink: 0; }}
      .inl-sb-title {{ font-size: 15px; font-weight: 600; color: #F5F4F8; line-height: 1.3; }}
      .inl-sb-sub {{ font-size: 11px; color: #B3B2BA; margin: 6px 4px 16px 4px; line-height: 1.45; }}
      .inl-sb-divider {{ height: 1px; background: #3B3B41; margin: 16px 4px; }}
      .inl-sb-heading {{
        font-size: 10px;
        font-weight: 500;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: #A0A0AC;
        margin: 0 8px 8px 8px;
      }}
      .inl-sb-card {{
        margin-top: 14px;
        border-radius: 12px;
        background: #2B2B30;
        padding: 15px 16px;
      }}
      .inl-sb-card-title {{ font-size: 12px; font-weight: 600; color: #E4E1EC; margin-top: 10px; }}
      .inl-sb-card-sub {{ font-size: 11px; color: #ABA8B7; margin-top: 4px; line-height: 1.45; }}

      .inl-breadcrumb {{
        font-size: 13px;
        color: var(--faint);
        margin-bottom: 2px;
      }}
      .inl-breadcrumb strong {{ color: var(--ink); font-weight: 500; }}

      .inl-page-title {{
        font-size: 24px;
        font-weight: 600;
        line-height: 1.28;
        letter-spacing: -0.02em;
        color: #2C2834;
        margin: 0;
      }}
      .inl-page-subtitle {{
        font-size: 13.5px;
        line-height: 1.5;
        color: var(--muted);
        margin: 4px 0 0 0;
        max-width: 66ch;
      }}
      .inl-section-title {{
        font-size: 17px;
        font-weight: 600;
        line-height: 1.35;
        letter-spacing: -0.01em;
        color: var(--ink);
        margin: 0 0 4px 0;
      }}
      .inl-section-sub {{
        font-size: 13px;
        line-height: 1.5;
        color: var(--muted);
        margin: 0;
      }}

      .inl-pill {{
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 11px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 500;
        line-height: 1.35;
        white-space: nowrap;
      }}
      .inl-pill-neutral {{ background: var(--lavender-soft); color: var(--ink-plum); }}
      .inl-pill-accent {{ background: var(--lavender-pill); color: var(--plum-strong); }}
      .inl-pill-positive {{ background: var(--positive-bg); color: var(--positive-ink); }}
      .inl-pill-warning {{
        background: var(--warning-bg);
        color: var(--warning-ink);
        border: 1px solid var(--warning-border);
      }}
      .inl-pill-negative {{ background: var(--danger-bg); color: var(--danger-ink); }}

      /* Lavender highlight cards (Results banner, Live score card, Resume card) */
      .inl-lavender-banner {{
        background: var(--lavender-surface);
        border: 1px solid #E5DBF3;
        border-radius: 18px;
        padding: 22px 26px;
      }}

      .inl-card-tinted {{
        background: var(--lavender-tint);
        border: 1px solid var(--lavender-border);
        border-radius: 14px;
        padding: 16px 18px;
      }}

      .inl-score-box {{
        background: var(--lavender-pill);
        border-radius: 16px;
        padding: 18px 20px;
      }}
      .inl-score-big {{
        font-size: 46px;
        font-weight: 600;
        line-height: 1.08;
        letter-spacing: -0.025em;
        color: var(--plum-strong);
        font-variant-numeric: tabular-nums;
      }}
      .inl-score-denom {{
        font-size: 17px;
        font-weight: 500;
        color: #79628C;
        margin-left: 5px;
      }}

      /* Progress bar */
      .inl-progress-row {{
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 0 14px 0;
        border-bottom: 1px solid var(--lavender-rule);
        margin-bottom: 16px;
      }}
      .inl-progress-segments {{ display: flex; align-items: center; gap: 7px; }}
      .inl-progress-seg {{
        width: 28px;
        height: 4px;
        border-radius: 999px;
        background: #EEEBF3;
      }}
      .inl-progress-seg.is-done {{ background: #AC91DD; }}
      .inl-progress-meta {{ font-size: 13px; font-weight: 500; color: var(--ink-plum); }}
      .inl-progress-topic {{ color: var(--muted); font-weight: 400; }}

      /* Conversation turns */
      .inl-thread {{ display: flex; flex-direction: column; gap: 20px; padding: 6px 4px 12px 2px; }}
      .inl-turn-bot {{ display: flex; flex-direction: column; gap: 8px; max-width: 68ch; }}
      .inl-turn-head {{ display: flex; align-items: center; gap: 8px; }}
      .inl-turn-head img {{ width: 22px; height: 22px; object-fit: contain; flex-shrink: 0; }}
      .inl-turn-speaker {{ font-size: 12.5px; font-weight: 600; color: #51425E; }}
      .inl-turn-time {{ font-size: 11.5px; color: var(--faint); font-variant-numeric: tabular-nums; }}
      .inl-turn-bot-body {{
        padding-left: 30px;
        font-size: 14.5px;
        line-height: 1.6;
        color: #3A3344;
        white-space: pre-wrap;
      }}
      .inl-turn-user {{ display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }}
      .inl-turn-user-bubble {{
        max-width: 64ch;
        background: #F2EDF9;
        border: 1px solid #E6DCF4;
        border-radius: 14px;
        padding: 13px 17px;
        font-size: 14px;
        line-height: 1.58;
        color: #463952;
        white-space: pre-wrap;
      }}

      /* STAR Rubric Bars */
      .inl-rubric-list {{ display: flex; flex-direction: column; gap: 12px; }}
      .inl-rubric-head {{
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        font-size: 12.5px;
        margin-bottom: 5px;
      }}
      .inl-rubric-label {{ color: #6B587A; font-weight: 500; }}
      .inl-rubric-val {{ color: var(--plum-strong); font-weight: 600; font-variant-numeric: tabular-nums; }}
      .inl-rubric-track {{
        height: 6px;
        width: 100%;
        border-radius: 999px;
        background: var(--bar-track);
        overflow: hidden;
      }}
      .inl-rubric-fill {{
        height: 100%;
        border-radius: 999px;
        background: var(--bar-fill);
      }}

      /* KPI Strip */
      .inl-kpi-strip {{
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        border: 1px solid var(--lavender-border);
        border-radius: 14px;
        background: var(--lavender-tint);
        overflow: hidden;
      }}
      @media (max-width: 768px) {{
        .inl-kpi-strip {{ grid-template-columns: repeat(2, minmax(0, 1fr)); }}
      }}
      .inl-kpi-cell {{ padding: 18px 20px; border-right: 1px solid var(--lavender-rule); }}
      .inl-kpi-cell:last-child {{ border-right: none; }}
      .inl-kpi-label {{ font-size: 12.5px; font-weight: 500; color: var(--ink-plum); margin-top: 6px; }}
      .inl-kpi-value {{
        font-size: 28px;
        font-weight: 600;
        line-height: 1.15;
        letter-spacing: -0.02em;
        color: var(--ink);
        font-variant-numeric: tabular-nums;
      }}
      .inl-kpi-sub {{ font-size: 12px; color: var(--faint); margin-top: 2px; }}

      /* Checklists & Improvement notes */
      .inl-check-list {{
        list-style: none;
        padding: 0;
        margin: 8px 0 0 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }}
      .inl-check-list li {{
        display: flex;
        align-items: flex-start;
        gap: 9px;
        font-size: 13px;
        line-height: 1.45;
        color: #564564;
      }}
      .inl-check-icon {{ color: #5C7C4F; flex-shrink: 0; margin-top: 2px; display: inline-flex; }}

      .inl-note-list {{
        list-style: none;
        padding: 0;
        margin: 10px 0 0 0;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }}
      .inl-note-item {{ display: flex; align-items: flex-start; gap: 11px; }}
      .inl-note-badge {{
        width: 24px;
        height: 24px;
        border-radius: 8px;
        background: #ECE5F5;
        color: #73518F;
        font-size: 11px;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        font-variant-numeric: tabular-nums;
        margin-top: 1px;
      }}
      .inl-note-title {{ font-size: 13px; font-weight: 600; color: var(--ink-plum); line-height: 1.4; }}
      .inl-note-detail {{ font-size: 12.5px; color: var(--muted); line-height: 1.45; margin-top: 2px; }}

      .inl-notice {{
        border-radius: 12px;
        padding: 11px 15px;
        font-size: 13px;
        line-height: 1.5;
        margin-bottom: 12px;
      }}
      .inl-notice-warning {{
        background: var(--warning-bg);
        border: 1px solid var(--warning-border);
        color: var(--warning-ink);
      }}
      .inl-notice-info {{
        background: var(--lavender-soft);
        border: 1px solid #E3DAF1;
        color: var(--plum-strong);
      }}
      .inl-notice-error {{
        background: var(--danger-bg);
        border: 1px solid var(--danger-border);
        color: var(--danger-ink);
      }}

      .inl-monogram {{
        width: 64px;
        height: 64px;
        border-radius: 16px;
        background: #ECE5F5;
        color: var(--plum-strong);
        font-size: 26px;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }}

      /* =====================================================================
         LANDING PAGE COMPONENTS — FAITHFUL NEXT.JS SECTIONS
         ===================================================================== */
      .lp-nav-notch {{
        background: #202124;
        border-radius: 0 0 28px 28px;
        padding: 18px 28px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        box-shadow: 0 14px 32px -10px rgba(32, 33, 36, 0.22);
      }}
      .lp-nav-brand {{
        display: inline-flex;
        align-items: center;
        gap: 10px;
        text-decoration: none !important;
      }}
      .lp-nav-brand img {{ width: 42px; height: 42px; object-fit: contain; }}
      .lp-nav-brand span {{ font-size: 18px; font-weight: 700; color: #F5F4F8; letter-spacing: -0.02em; }}
      .lp-nav-links {{ display: flex; flex-wrap: wrap; align-items: center; gap: 26px; }}
      .lp-nav-links a {{
        font-size: 14.5px;
        font-weight: 600;
        color: #E8E6F0 !important;
        text-decoration: none !important;
        transition: color 160ms ease;
      }}
      .lp-nav-links a:hover {{ color: #CAB4F0 !important; }}
      .lp-nav-cta {{
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: #FFFFFF;
        color: #423052 !important;
        text-decoration: none !important;
        font-size: 13px;
        font-weight: 600;
        padding: 10px 18px;
        border-radius: 10px;
        transition: transform 140ms var(--ease-out), background-color 160ms ease;
      }}
      .lp-nav-cta:hover {{ background: #F4EFFA; }}
      .lp-nav-cta:active {{ transform: scale(0.97); }}

      .lp-hero-stage {{
        text-align: center;
        padding: 52px 16px 34px 16px;
        background: radial-gradient(ellipse 74% 52% at 50% 88%, rgba(212, 196, 244, 0.34) 0%, rgba(246, 242, 253, 0.16) 55%, rgba(255, 255, 255, 0) 85%);
        border-radius: 24px;
      }}
      .lp-hero-h1 {{
        font-size: clamp(34px, 5vw, 68px);
        font-weight: 700;
        line-height: 1.07;
        letter-spacing: -0.036em;
        color: #17151A;
        margin: 0 auto;
        max-width: 980px;
      }}
      .lp-hero-pill {{
        display: inline-flex;
        align-items: center;
        gap: 10px;
        background: #EFE6FC;
        color: #4C2B78;
        border-radius: 999px;
        padding: 2px 22px 5px 18px;
        margin: 0 4px;
      }}
      .lp-hero-pill-dot {{
        width: 11px;
        height: 11px;
        border-radius: 999px;
        background: #6D42A6;
        display: inline-block;
      }}
      .lp-hero-sub {{
        margin: 20px auto 0 auto;
        max-width: 640px;
        font-size: 18px;
        line-height: 1.55;
        color: #5B4D68;
      }}
      .lp-preview-frame {{
        margin: 28px auto 0 auto;
        max-width: 1060px;
        border: 1px solid #DCD3EB;
        background: #FFFFFF;
        box-shadow: 0 24px 60px -16px rgba(32, 33, 36, 0.16);
        overflow: hidden;
      }}
      .lp-preview-frame img {{ width: 100%; height: auto; display: block; }}

      .lp-platforms {{
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
        margin-top: 22px;
      }}
      .lp-platform-tile {{
        display: inline-flex;
        align-items: center;
        gap: 9px;
        padding: 10px 16px;
        border-radius: 12px;
        border: 1px solid #E3DAF1;
        background: #FFFFFF;
        font-size: 13.5px;
        font-weight: 500;
        color: #3B294D;
      }}
      .lp-platform-tile img {{ width: 20px; height: 20px; object-fit: contain; }}

      .lp-dark-section {{
        background: #202124;
        color: #FFFFFF;
        border-radius: 28px;
        padding: 56px 40px;
        margin: 42px 0;
      }}
      .lp-dark-grid {{
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 20px;
        margin-top: 34px;
      }}
      @media (max-width: 900px) {{
        .lp-dark-section {{ padding: 36px 20px; }}
        .lp-dark-grid {{ grid-template-columns: 1fr; }}
      }}
      .lp-dark-card {{
        background: #2B2C30;
        border: 1px solid #424147;
        border-radius: 20px;
        padding: 20px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }}
      .lp-dark-inner {{
        background: #35363B;
        border-radius: 12px;
        padding: 16px;
        min-height: 152px;
      }}

      .lp-feature-grid {{
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 20px;
        margin-top: 28px;
      }}
      @media (max-width: 820px) {{
        .lp-feature-grid {{ grid-template-columns: 1fr; }}
      }}
      .lp-feature-card {{
        background: #FFFFFF;
        border: 1px solid #E7E1ED;
        border-radius: 20px;
        padding: 24px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 20px;
      }}
      .lp-feature-strip {{
        background: #F3EFF8;
        border-radius: 10px;
        padding: 14px 16px;
      }}

      .lp-cta-banner {{
        background: #EAE3F7;
        border-radius: 24px;
        padding: 46px 40px;
        margin: 42px 0 28px 0;
        display: grid;
        grid-template-columns: 1.35fr 1fr;
        gap: 28px;
        align-items: center;
      }}
      @media (max-width: 820px) {{
        .lp-cta-banner {{ grid-template-columns: 1fr; padding: 32px 22px; }}
      }}
      .lp-dark-btn {{
        display: inline-flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        background: #242126;
        color: #FFFFFF !important;
        text-decoration: none !important;
        padding: 13px 22px;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 600;
        min-width: 210px;
        transition: transform 140ms var(--ease-out), background-color 160ms ease;
      }}
      .lp-dark-btn:hover {{ background: #36323B; }}
      .lp-dark-btn:active {{ transform: scale(0.97); }}

      .lp-footer {{
        background: #F5F4F7;
        border-top: 1px solid #E8E5EF;
        border-radius: 22px 22px 0 0;
        padding: 34px 32px 0 32px;
        overflow: hidden;
      }}
      .lp-watermark {{
        font-size: clamp(44px, 11.5vw, 152px);
        font-weight: 900;
        line-height: 0.8;
        letter-spacing: -0.045em;
        color: #E2E0E7;
        text-align: center;
        margin: 28px 0 -4px 0;
        user-select: none;
      }}

      @media (prefers-reduced-motion: reduce) {{
        *, *::before, *::after {{
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 120ms !important;
        }}
        .stButton > button:active,
        .lp-nav-cta:active,
        .lp-dark-btn:active {{
          transform: none !important;
        }}
      }}
    </style>
    """


def inject_theme(*, is_landing: bool = False, is_setup: bool = False) -> None:
    """Inject full Interview ni Lods stylesheet cleanly without DOMPurify stripping."""
    render_html(_build_stylesheet(is_landing=is_landing, is_setup=is_setup))


def render_page_header(
    breadcrumbs: Sequence[str],
    title: str,
    subtitle: str | None = None,
) -> None:
    """Render a workspace breadcrumb trail and deep-plum page title."""
    crumb_parts = []
    for idx, seg in enumerate(breadcrumbs):
        safe = esc(seg)
        if idx == len(breadcrumbs) - 1:
            crumb_parts.append(f"<strong>{safe}</strong>")
        else:
            crumb_parts.append(safe)
    crumb_html = ' <span style="margin:0 6px;color:#A59EB3;">/</span> '.join(crumb_parts)
    sub_html = f'<p class="inl-page-subtitle">{esc(subtitle)}</p>' if subtitle else ""
    render_html(
        f"""
        <div style="margin-bottom: 14px;">
          <div class="inl-breadcrumb">{crumb_html}</div>
          <h1 class="inl-page-title">{esc(title)}</h1>
          {sub_html}
        </div>
        """
    )


def render_pill(label: str, variant: str = "neutral") -> str:
    """Return an inline HTML pill badge."""
    allowed = {"neutral", "accent", "positive", "warning", "negative"}
    cls = variant if variant in allowed else "neutral"
    return f'<span class="inl-pill inl-pill-{cls}">{esc(label)}</span>'


def render_progress_bar(current: int, total: int, topic: str, status_text: str = "Interview in progress") -> None:
    """Render the lavender segmented interview progress row."""
    safe_total = max(1, total)
    segments = "".join(
        f'<span class="inl-progress-seg{" is-done" if idx < current else ""}"></span>'
        for idx in range(safe_total)
    )
    render_html(
        f"""
        <div class="inl-progress-row">
          <div style="display:flex;flex-wrap:wrap;align-items:center;gap:14px;">
            <div class="inl-progress-segments" aria-hidden="true">{segments}</div>
            <div class="inl-progress-meta inl-num">
              Question {current} of {safe_total}
              <span class="inl-progress-topic"> · {esc(topic)}</span>
            </div>
          </div>
          <div style="font-size:12px;color:#665570;">{esc(status_text)}</div>
        </div>
        """
    )


def render_rubric_bars_html(
    clarity: float,
    structure: float,
    relevance: float,
    impact: float,
) -> str:
    """Build pure HTML/CSS 4-dimension STAR rubric bars in lavender-plum."""
    rows = [
        ("Clarity", clarity),
        ("Structure", structure),
        ("Relevance", relevance),
        ("Impact", impact),
    ]
    items_html = []
    for label, score in rows:
        clamped = min(10.0, max(0.0, float(score)))
        pct = clamped * 10.0
        items_html.append(
            f"""
            <div>
              <div class="inl-rubric-head">
                <span class="inl-rubric-label">{esc(label)}</span>
                <span class="inl-rubric-val">{clamped:.1f}</span>
              </div>
              <div class="inl-rubric-track" role="progressbar"
                   aria-label="{esc(label)}" aria-valuenow="{clamped:.1f}"
                   aria-valuemin="0" aria-valuemax="10">
                <div class="inl-rubric-fill" style="width:{pct:.1f}%;"></div>
              </div>
            </div>
            """
        )
    return f'<div class="inl-rubric-list">{"".join(items_html)}</div>'


def render_check_list_html(items: Iterable[str]) -> str:
    """Build a strength checklist using crisp outline SVG checkmarks."""
    check_svg = SVG_ICONS["check"]
    li_html = "".join(
        f'<li><span class="inl-check-icon">{check_svg}</span><span>{esc(item)}</span></li>'
        for item in items
    )
    return f'<ul class="inl-check-list">{li_html}</ul>'


def render_numbered_notes_html(notes: Sequence[tuple[str, str, str]]) -> str:
    """Build numbered coaching notes [(code, title, detail), ...]."""
    li_html = "".join(
        f"""
        <li class="inl-note-item">
          <span class="inl-note-badge">{esc(code)}</span>
          <div>
            <div class="inl-note-title">{esc(title)}</div>
            <div class="inl-note-detail">{esc(detail)}</div>
          </div>
        </li>
        """
        for code, title, detail in notes
    )
    return f'<ul class="inl-note-list">{li_html}</ul>'


def render_kpi_strip(cells: Sequence[tuple[str, str, str]]) -> None:
    """Render a lavender-tinted 4-column KPI strip."""
    cell_html = "".join(
        f"""
        <div class="inl-kpi-cell">
          <div class="inl-kpi-value">{esc(value)}</div>
          <div class="inl-kpi-label">{esc(label)}</div>
          <div class="inl-kpi-sub">{esc(sub)}</div>
        </div>
        """
        for label, value, sub in cells
    )
    render_html(f'<div class="inl-kpi-strip">{cell_html}</div>')


def render_notice(message: str, variant: str = "info") -> None:
    """Render an inline non-blocking notice (info, warning, or error)."""
    cls = variant if variant in {"info", "warning", "error"} else "info"
    render_html(f'<div class="inl-notice inl-notice-{cls}" role="status">{esc(message)}</div>')
