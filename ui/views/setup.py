"""Screen 01 — Interview Setup faithful to the Next.js InterviewSetupView."""

from __future__ import annotations

import streamlit as st

from backend.schemas import InterviewSetupConfig
from ui.content import (
    DIFFICULTY_OPTIONS,
    ESTIMATED_DURATION_BY_RANGE,
    JOB_ROLE_OPTIONS,
    QUESTION_RANGE_OPTIONS,
    TONE_OPTIONS,
)
from ui.dialogs import show_how_it_works_dialog
from ui.state import (
    UploadedResumeMeta,
    get_backend_status,
    get_workspace,
    index_uploaded_resume,
    launch_interview,
    navigate,
)
from ui.theme import (
    SVG_ICONS,
    esc,
    get_sir_bot_logo_data_uri,
    get_svg_img_tag,
    render_html,
    render_notice,
)


def render_setup_view() -> None:
    """Render Screen 01 matching InterviewSetupView: ambient lavender canvas, crisp white card, trust cues."""
    ws = get_workspace()
    draft: InterviewSetupConfig = st.session_state.get("setup_draft") or ws.defaults.model_copy()
    backend = get_backend_status()
    logo_uri = get_sir_bot_logo_data_uri()

    # Top workspace breadcrumb bar + compact How it works button
    top_left, top_right = st.columns([4.2, 1.0], vertical_alignment="center")
    with top_left:
        render_html(
            '<div class="inl-breadcrumb" style="margin:0;">Practice '
            '<span style="margin:0 7px;color:#A59EB3;">/</span> '
            "<strong>New interview</strong></div>"
        )
    with top_right:
        if st.button("How it works", type="secondary", width="stretch", key="setup_how_it_works"):
            st.session_state["active_dialog"] = "how_it_works"

    if st.session_state.get("active_dialog") == "how_it_works":
        show_how_it_works_dialog()

    render_html('<div style="height:1px;background:#ECE6F4;margin:8px 0 22px 0;"></div>')

    # Centered Sir Bot mark & hero headline (matching hero-app-preview.png)
    logo_tag = (
        f'<img src="{logo_uri}" alt="Sir Bot" '
        f'style="width:112px;height:112px;object-fit:contain;margin:0 auto;display:block;" />'
        if logo_uri
        else ""
    )
    render_html(
        f"""
        <div style="text-align:center;margin-bottom:24px;">
          {logo_tag}
          <h1 style="font-size:clamp(25px,2.9vw,34px);font-weight:600;line-height:1.18;letter-spacing:-0.032em;color:#30263C;margin:14px auto 0 auto;max-width:740px;">
            A little practice helps build a lot more confidence.
          </h1>
          <p style="font-size:15px;line-height:1.5;color:#796985;margin:10px auto 0 auto;max-width:580px;">
            Meet Sir Bot, your AI interview coach. Set the scene, find your words,
            and walk into your next interview feeling ready.
          </p>
        </div>
        """
    )

    # Unfinished round callout when an active session exists
    active_in_progress = next(
        (s for s in ws.sessions if s.record.state.status == "in_progress"), None
    )
    if active_in_progress is not None:
        s_state = active_in_progress.record.state
        with st.container(border=False, key="setup_resume_callout"):
            r_col, b_col = st.columns([3.4, 1.0], vertical_alignment="center")
            with r_col:
                render_html(
                    f"""
                    <div style="font-size:13.5px;font-weight:600;color:#4D365F;">
                      Unfinished round: {esc(s_state.config.role)}
                    </div>
                    <div class="inl-num" style="font-size:12.5px;color:#665570;margin-top:2px;">
                      Question {s_state.current_question_index} of {s_state.total_questions} · {esc(s_state.current_topic)}
                    </div>
                    """
                )
            with b_col:
                if st.button("Resume round", type="secondary", width="stretch", key="setup_resume_btn"):
                    st.session_state["active_session_id"] = s_state.id
                    navigate("live")

    if st.session_state.get("setup_error"):
        render_notice(st.session_state["setup_error"], variant="error")

    # Resolve current offline preference before card submit button
    if not backend["live_available"]:
        use_offline = True
    else:
        use_offline = bool(
            st.session_state.get(
                "setup_offline_toggle", st.session_state.get("use_offline_demo", False)
            )
        )
        st.session_state["use_offline_demo"] = use_offline

    # Elevated white rounded setup card ("Make it your interview")
    with st.container(border=False, key="setup_card"):
        render_html(
            """
            <div style="margin-bottom:14px;">
              <h2 style="font-size:16px;font-weight:600;color:#46384F;margin:0;">Make it your interview</h2>
              <p style="font-size:12.5px;color:#796985;margin:4px 0 0 0;">
                Choose what feels right. You can try something different next time.
              </p>
            </div>
            """
        )

        role_options = list(JOB_ROLE_OPTIONS)
        current_role = draft.role.strip() or "Software Engineer"
        if current_role not in role_options:
            role_options.insert(0, current_role)
        role_idx = role_options.index(current_role)

        try:
            selected_role = st.selectbox(
                "Job role",
                options=role_options,
                index=role_idx,
                accept_new_options=True,
                placeholder="Type any job role (e.g. Nurse, AI Engineer, Accountant)...",
                key="setup_role_select",
            )
        except TypeError:
            selected_role = st.selectbox(
                "Job role",
                options=role_options,
                index=role_idx,
                key="setup_role_select_fallback",
            )
            custom_role = st.text_input(
                "Or enter a custom job role",
                value="" if current_role in JOB_ROLE_OPTIONS else current_role,
                placeholder="Type any custom role",
                key="setup_role_custom_fallback",
            )
            if custom_role.strip():
                selected_role = custom_role.strip()

        resolved_role = (selected_role or "").strip()

        render_html('<div style="height:6px;"></div>')

        # Difficulty & Questions compact dropdowns + Coach's tone segmented pill tray (matching hero-app-preview.png)
        c_diff, c_qty, c_tone = st.columns([1.0, 1.0, 1.85], gap="medium")

        with c_diff:
            diff_opts = list(DIFFICULTY_OPTIONS)
            diff_idx = diff_opts.index(draft.difficulty) if draft.difficulty in diff_opts else 0
            difficulty = st.selectbox(
                "Difficulty",
                options=diff_opts,
                index=diff_idx,
                key="setup_diff_select",
            )

        with c_qty:
            range_opts = list(QUESTION_RANGE_OPTIONS)
            range_idx = range_opts.index(draft.question_range) if draft.question_range in range_opts else 1
            question_range = st.selectbox(
                "Questions",
                options=range_opts,
                index=range_idx,
                key="setup_range_select",
            )

        with c_tone:
            picked_tone = st.segmented_control(
                "Coach's tone",
                options=list(TONE_OPTIONS),
                default=draft.tone,
                selection_mode="single",
                required=True,
                width="stretch",
                key="setup_tone_seg",
            )
            tone = picked_tone or draft.tone

        if resolved_role:
            st.session_state["setup_draft"] = InterviewSetupConfig(
                role=resolved_role,
                difficulty=difficulty,  # type: ignore[arg-type]
                questionRange=question_range,  # type: ignore[arg-type]
                tone=tone,  # type: ignore[arg-type]
            )

        render_html('<div style="height:8px;"></div>')

        # Optional Resume RAG upload
        render_html(
            """
            <div style="margin-bottom:6px;">
              <div style="font-size:12.5px;font-weight:500;color:#4C3E59;">
                Resume context <span style="font-weight:400;color:#796985;">(optional · PDF, DOCX, TXT, or MD)</span>
              </div>
              <div style="font-size:11.5px;color:#796985;margin-top:2px;">
                Tailors questions and STAR scoring to your actual projects via ChromaDB RAG.
              </div>
            </div>
            """
        )

        uploaded_meta: UploadedResumeMeta | None = st.session_state.get("uploaded_resume")
        uploader_ver = st.session_state.get("resume_uploader_ver", 0)
        resume_error: str | None = None

        if uploaded_meta is not None:
            r_info, r_rm = st.columns([3.6, 1.0], vertical_alignment="center")
            with r_info:
                render_html(
                    f"""
                    <div class="inl-card-tinted" style="background:#F7F4FA;padding:11px 14px;">
                      <div style="display:flex;align-items:center;gap:8px;">
                        <span style="color:#5D3F7F;display:inline-flex;">{SVG_ICONS["check"]}</span>
                        <span style="font-size:13px;font-weight:600;color:#4C3E59;">{esc(uploaded_meta.filename)}</span>
                      </div>
                      <div class="inl-num" style="font-size:11.5px;color:#796985;margin-top:3px;">
                        {uploaded_meta.chunk_count} chunks indexed in ChromaDB · {uploaded_meta.char_count:,} characters
                      </div>
                    </div>
                    """
                )
            with r_rm:
                if st.button("Remove", type="secondary", width="stretch", key="setup_remove_resume"):
                    st.session_state["uploaded_resume"] = None
                    st.session_state["uploaded_resume_sig"] = None
                    st.session_state["resume_uploader_ver"] = uploader_ver + 1
                    st.rerun()
        else:
            uploaded_file = st.file_uploader(
                "Upload resume",
                type=["pdf", "docx", "txt", "md"],
                label_visibility="collapsed",
                key=f"setup_resume_uploader_{uploader_ver}",
            )
            if uploaded_file is not None:
                sig = (uploaded_file.name, uploaded_file.size)
                if st.session_state.get("uploaded_resume_sig") != sig:
                    with st.spinner("Extracting and indexing resume into ChromaDB..."):
                        try:
                            meta = index_uploaded_resume(
                                uploaded_file.name, uploaded_file.getvalue()
                            )
                            st.session_state["uploaded_resume"] = meta
                            st.session_state["uploaded_resume_sig"] = sig
                            st.rerun()
                        except ValueError as exc:
                            resume_error = str(exc)

        if resume_error:
            render_notice(resume_error, variant="error")

        render_html('<div style="height:1px;background:#EEE8F3;margin:14px 0 12px 0;"></div>')

        # Bottom bar: clock + duration on left, lavender "Start interview ->" CTA on right
        foot_left, foot_right = st.columns([2.4, 1.05], vertical_alignment="center")
        with foot_left:
            duration_text = ESTIMATED_DURATION_BY_RANGE[question_range]
            clock_img = get_svg_img_tag("practice/setup-clock.svg", width=17, height=17)
            render_html(
                f"""
                <div style="display:flex;align-items:center;gap:9px;font-size:12px;color:#796985;">
                  {clock_img}
                  <span>{esc(duration_text)} interview</span>
                </div>
                """
            )
        with foot_right:
            start_disabled = not bool(resolved_role)
            if st.button(
                "Start interview",
                type="primary",
                disabled=start_disabled,
                width="stretch",
                key="setup_start_btn",
            ):
                cfg = InterviewSetupConfig(
                    role=resolved_role,
                    difficulty=difficulty,  # type: ignore[arg-type]
                    questionRange=question_range,  # type: ignore[arg-type]
                    tone=tone,  # type: ignore[arg-type]
                )
                st.session_state["setup_error"] = None
                with st.spinner("Preparing your structured interview plan..."):
                    stored, err = launch_interview(
                        cfg,
                        resume=st.session_state.get("uploaded_resume"),
                        force_offline=use_offline,
                    )
                if err:
                    st.session_state["setup_error"] = err
                    st.rerun()
                elif stored is not None:
                    st.rerun()

    # Three trust cues & closing reassurance matching hero-app-preview.png
    check_img = get_svg_img_tag("practice/setup-check.svg", width=17, height=17)
    chart_img = get_svg_img_tag("practice/setup-chart.svg", width=17, height=17)
    shield_img = get_svg_img_tag("practice/setup-shield.svg", width=17, height=17)
    render_html(
        f"""
        <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:34px;margin-top:22px;font-size:12px;color:#796985;">
          <span style="display:inline-flex;align-items:center;gap:9px;">
            {check_img}
            Personalized questions
          </span>
          <span style="display:inline-flex;align-items:center;gap:9px;">
            {chart_img}
            Actionable feedback
          </span>
          <span style="display:inline-flex;align-items:center;gap:9px;">
            {shield_img}
            A judgment-free space
          </span>
        </div>
        <p style="text-align:center;font-size:12px;color:#796985;margin-top:16px;">
          No pressure. No perfect answers. Just progress.
        </p>
        """
    )

    # Subtle offline mode control tucked quietly below the setup flow
    if not backend["live_available"]:
        render_notice(
            "AIKI_API_KEY is not set in .env. Running in Offline demo mode using local STAR heuristics and ChromaDB guides.",
            variant="info",
        )
    else:
        _, opt_mid, _ = st.columns([0.9, 2.2, 0.9])
        with opt_mid:
            toggled = st.checkbox(
                "Run in offline demo mode (local STAR heuristic, no LLM API calls)",
                value=bool(st.session_state.get("use_offline_demo", False)),
                key="setup_offline_toggle",
            )
            st.session_state["use_offline_demo"] = toggled
