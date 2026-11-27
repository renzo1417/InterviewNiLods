"""Landing Page view — faithful Streamlit adaptation of the Next.js Interview ni Lods landing page."""

from __future__ import annotations

import streamlit as st

from ui.state import navigate
from ui.theme import (
    SVG_ICONS,
    esc,
    get_asset_data_uri,
    get_sir_bot_logo_data_uri,
    render_check_list_html,
    render_html,
    render_rubric_bars_html,
)

JOB_PLATFORMS: tuple[tuple[str, str], ...] = (
    ("Indeed", "logo-indeed.svg"),
    ("LinkedIn", "logo-linkedin.svg"),
    ("Jobstreet", "logo-jobstreet.svg"),
    ("Glassdoor", "logo-glassdoor.svg"),
    ("Kalibrr", "logo-kalibrr.svg"),
    ("Upwork", "logo-upwork.svg"),
    ("Monster", "logo-monster.svg"),
    ("ZipRecruiter", "logo-ziprecruiter.svg"),
)

LANDING_STORIES: tuple[dict[str, object], ...] = (
    {
        "quote": "The follow-up questions helped me explain my thinking. I knew what to improve before my next interview.",
        "name": "Gianne",
        "role": "Interview practice with Interview ni Lods",
        "location": "Manila, PH",
        "rating": 5,
    },
    {
        "quote": "Switching to structured STAR prompts made every answer sharper and cut out my rambling right away.",
        "name": "Mei Lin Tan",
        "role": "Product Analyst prep",
        "location": "Singapore, SG",
        "rating": 5,
    },
    {
        "quote": "Rehearsing trade-off questions with live rubric feedback gave me the confidence to clear three panel rounds.",
        "name": "Aarav Sharma",
        "role": "Backend Engineer prep",
        "location": "Bengaluru, IN",
        "rating": 5,
    },
    {
        "quote": "Generic chat prompts were too polite. The realistic tone presets pushed my answers until they held up under pressure.",
        "name": "Tom Whitfield",
        "role": "Product Manager prep",
        "location": "London, GB",
        "rating": 5,
    },
    {
        "quote": "Seeing clarity, structure, relevance, and impact scored separately made it obvious which weak spot to fix first.",
        "name": "Renata Alves",
        "role": "Customer Success prep",
        "location": "Sao Paulo, BR",
        "rating": 5,
    },
)

LANDING_FAQS: tuple[tuple[str, str], ...] = (
    (
        "What is Interview ni Lods?",
        "Interview ni Lods is your AI interview coach. Choose your role and settings, practice through a chat with Sir Bot, and get structured rubric feedback on every answer. No pressure. No perfect answers. Just progress.",
    ),
    (
        "How do I customize my interview?",
        "Before starting a session, choose any target job role, difficulty level (Easy, Normal, or Hard), number of questions, and Sir Bot's coaching tone (Friendly, Witty, or Direct). You can also upload a resume to ground questions in your own projects.",
    ),
    (
        "What does the live score preview show?",
        "During your interview, the live score preview scores each answer across Clarity, Structure, Relevance, and Impact so you can spot gaps and tighten your examples in real time.",
    ),
    (
        "Is my live score my final session score?",
        "No. The live score updates for each individual answer while the round is in progress. Once you finish all questions or end early, you receive your final session score with rubric averages and question-by-question feedback.",
    ),
    (
        "What feedback do I get after an interview?",
        "You receive a final score out of 10 across Clarity, Structure, Relevance, and Impact, a question-by-question breakdown, coaching takeaways, and a downloadable study transcript.",
    ),
    (
        "Can I review my previous sessions?",
        "Yes. Completed and in-progress sessions appear under your Sessions list so you can revisit transcripts, scores, saved answers, and coaching notes anytime.",
    ),
)

WAVEFORM_HEIGHTS: tuple[int, ...] = (
    8, 16, 10, 24, 18, 30, 14, 22, 10, 18, 12, 26, 18, 30, 14, 20, 10, 16,
)


def _star_row(rating: int) -> str:
    star_svg = SVG_ICONS["star"]
    return "".join(
        f'<span style="color:#7453A6;opacity:{"1" if i < rating else "0.25"};display:inline-flex;">{star_svg}</span>'
        for i in range(5)
    )


def render_landing_view() -> None:
    """Render the full Interview ni Lods landing page matching the Next.js visual design."""
    logo_uri = get_sir_bot_logo_data_uri()
    preview_uri = get_asset_data_uri("hero-app-preview.png")
    globe_uri = get_asset_data_uri("customer-globe.png")
    avatar_uri = get_asset_data_uri("reviewer-avatar.png")

    logo_img = f'<img src="{logo_uri}" alt="Interview ni Lods" />' if logo_uri else ""

    # ------------------------------------------------------------------
    # 1. TOP DARK CHARCOAL NAVIGATION NOTCH
    # ------------------------------------------------------------------
    render_html(
        f"""
        <header id="top" class="lp-nav-notch">
          <a href="#top" class="lp-nav-brand">
            {logo_img}
            <span>Interview ni Lods</span>
          </a>
          <nav class="lp-nav-links" aria-label="Primary navigation">
            <a href="#how-it-works">How it works</a>
            <a href="#workshop">Workshop</a>
            <a href="#features">Features</a>
            <a href="#stories">Stories</a>
            <a href="#faq">FAQ</a>
          </nav>
          <a href="?view=setup" target="_self" class="lp-nav-cta">
            <span>Start practice</span>
            {SVG_ICONS["arrow_right"]}
          </a>
        </header>
        """
    )

    # ------------------------------------------------------------------
    # 2. HERO STAGE + PRODUCT PREVIEW + JOB PLATFORM LOGOS
    # ------------------------------------------------------------------
    render_html(
        """
        <section class="lp-hero-stage">
          <h1 class="lp-hero-h1">
            Practice with AI,<br/>
            then <span class="lp-hero-pill"><span class="lp-hero-pill-dot"></span>own</span> the interview.
          </h1>
          <p class="lp-hero-sub">
            Practice now, panic less later. Run realistic mock interviews with Sir Bot and get
            instant, structured feedback before your next call.
          </p>
        </section>
        """
    )

    # Native Streamlit CTA buttons centered cleanly below the hero copy
    _, cta_left, cta_right, _ = st.columns([1.45, 0.95, 0.95, 1.45], gap="small")
    with cta_left:
        if st.button("Start now", type="primary", width="stretch", key="lp_hero_start"):
            navigate("setup")
    with cta_right:
        if st.button("Explore workspace", type="secondary", width="stretch", key="lp_hero_sessions"):
            navigate("sessions")

    if preview_uri:
        render_html(
            f"""
            <div class="lp-preview-frame">
              <img src="{preview_uri}" alt="Interview ni Lods practice setup screen preview" />
            </div>
            """
        )

    platform_tiles = []
    for name, filename in JOB_PLATFORMS:
        uri = get_asset_data_uri(filename)
        icon_tag = f'<img src="{uri}" alt="" />' if uri else ""
        platform_tiles.append(
            f'<div class="lp-platform-tile">{icon_tag}<span>{esc(name)}</span></div>'
        )
    render_html(
        f"""
        <div style="text-align:center;margin-top:26px;margin-bottom:14px;">
          <span class="inl-pill inl-pill-accent" style="font-size:11.5px;font-weight:600;">
            Practice for roles across leading job platforms
          </span>
          <div class="lp-platforms">{"".join(platform_tiles)}</div>
        </div>
        """
    )

    # ------------------------------------------------------------------
    # 3. HOW IT WORKS — ICONIC DARK CHARCOAL (#202124) SECTION
    # ------------------------------------------------------------------
    wave_bars = "".join(
        f'<span style="width:4px;height:{h}px;border-radius:2px;background:#BDA2ED;display:inline-block;"></span>'
        for h in WAVEFORM_HEIGHTS
    )
    render_html(
        f"""
        <section id="how-it-works" class="lp-dark-section">
          <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:20px;">
            <div>
              <div style="font-size:12.5px;font-weight:600;color:#CAB4F0;">How it works</div>
              <h2 style="font-size:clamp(28px,3.4vw,42px);font-weight:600;line-height:1.15;color:#FFFFFF;margin:10px 0 0 0;letter-spacing:-0.025em;">
                A little practice.<br/>A lot more confidence.
              </h2>
            </div>
            <p style="max-width:420px;font-size:15.5px;line-height:1.55;color:#C5C3CA;margin:0;">
              Set the scene, take your time, and learn as you go. No perfect answers needed. Just a place to begin.
            </p>
          </div>

          <div class="lp-dark-grid">
            <article class="lp-dark-card">
              <div class="lp-dark-inner">
                <div style="display:flex;align-items:center;gap:9px;color:#D2BFFF;font-size:11.5px;font-weight:600;">
                  {SVG_ICONS["briefcase"]}
                  <span style="color:#D6D3DD;">Your next role</span>
                </div>
                <div style="font-size:18px;font-weight:500;color:#FFFFFF;margin-top:14px;">Software Engineer</div>
                <div style="height:1px;background:#55545B;margin:12px 0;"></div>
                <div style="display:flex;flex-wrap:wrap;gap:14px;font-size:12px;color:#D6D3DD;">
                  <span>Normal difficulty</span>
                  <span>5 questions · Witty</span>
                </div>
              </div>
              <div style="margin-top:22px;">
                <div class="inl-num" style="font-size:12px;font-weight:600;color:#CAB4F0;">01</div>
                <h3 style="font-size:20px;font-weight:600;color:#FFFFFF;margin:8px 0 10px 0;">Make it your interview</h3>
                <p style="font-size:14.5px;line-height:1.55;color:#C5C3CA;margin:0;">
                  Choose your job role, difficulty, question count, and coach tone. Make this round work for you.
                </p>
              </div>
            </article>

            <article class="lp-dark-card">
              <div class="lp-dark-inner">
                <div style="display:flex;align-items:center;gap:9px;color:#D2BFFF;font-size:11.5px;font-weight:600;">
                  {SVG_ICONS["chat"]}
                  <span style="color:#D6D3DD;">Sir Bot</span>
                </div>
                <div style="font-size:16px;font-weight:500;line-height:1.45;color:#FFFFFF;margin-top:12px;">
                  "Tell me about a time you handled pressure at work."
                </div>
                <div style="display:flex;align-items:center;gap:6px;margin-top:16px;height:30px;">
                  {wave_bars}
                </div>
              </div>
              <div style="margin-top:22px;">
                <div class="inl-num" style="font-size:12px;font-weight:600;color:#CAB4F0;">02</div>
                <h3 style="font-size:20px;font-weight:600;color:#FFFFFF;margin:8px 0 10px 0;">Chat with Lods</h3>
                <p style="font-size:14.5px;line-height:1.55;color:#C5C3CA;margin:0;">
                  Answer one question at a time. Lods follows up to help you explain your thinking and your impact.
                </p>
              </div>
            </article>

            <article class="lp-dark-card">
              <div class="lp-dark-inner">
                <div style="display:flex;align-items:center;gap:9px;color:#D2BFFF;font-size:11.5px;font-weight:600;">
                  {SVG_ICONS["check_circle"]}
                  <span style="color:#D6D3DD;">Your next focus</span>
                </div>
                <div style="font-size:16px;font-weight:500;line-height:1.45;color:#FFFFFF;margin-top:12px;">
                  You showed clear ownership. Now make the outcome specific.
                </div>
                <div style="font-size:12.5px;font-weight:500;color:#CAB4F0;margin-top:16px;">
                  Review · Refine · Try again
                </div>
              </div>
              <div style="margin-top:22px;">
                <div class="inl-num" style="font-size:12px;font-weight:600;color:#CAB4F0;">03</div>
                <h3 style="font-size:20px;font-weight:600;color:#FFFFFF;margin:8px 0 10px 0;">Review. Refine. Repeat.</h3>
                <p style="font-size:14.5px;line-height:1.55;color:#C5C3CA;margin:0;">
                  See your final score, review each answer, and find what to focus on in your next session.
                </p>
              </div>
            </article>
          </div>
        </section>
        """
    )

    # ------------------------------------------------------------------
    # 4. THE WORKSHOP — INTERACTIVE LAVENDER SHOWCASE
    # ------------------------------------------------------------------
    render_html(
        """
        <section id="workshop" style="padding:18px 0 10px 0;">
          <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:18px;margin-bottom:18px;">
            <div>
              <div style="font-size:12.5px;font-weight:600;color:#7453A6;">The workshop</div>
              <h2 style="font-size:clamp(28px,3.4vw,42px);font-weight:600;line-height:1.15;color:#242126;margin:8px 0 0 0;letter-spacing:-0.025em;">
                Your interview.<br/>Your way to practice.
              </h2>
            </div>
            <p style="max-width:400px;font-size:15.5px;line-height:1.55;color:#665570;margin:0;">
              Choose what feels right for this session. You can try something different next time.
            </p>
          </div>
        </section>
        """
    )

    workshop_tab = (
        st.segmented_control(
            "Workshop preview mode",
            options=["Personalized questions", "Live score preview", "Interview results"],
            default="Personalized questions",
            selection_mode="single",
            label_visibility="collapsed",
            key="lp_workshop_tab",
        )
        or "Personalized questions"
    )

    ws_left, ws_right = st.columns([1.0, 1.55], gap="medium")
    with ws_left:
        render_html(
            f"""
            <div style="background:#EDE5F6;border:1px solid #E3D9EE;border-radius:22px;padding:28px;min-height:430px;display:flex;flex-direction:column;justify-content:space-between;">
              <div>
                <div style="color:#7453A6;display:inline-flex;">{SVG_ICONS["briefcase"]}</div>
                <div style="font-size:12px;font-weight:600;color:#7453A6;margin-top:16px;">Progress, not perfection</div>
                <h3 style="font-size:28px;font-weight:600;line-height:1.18;color:#242126;margin:10px 0 0 0;letter-spacing:-0.02em;">
                  Clear answers.<br/>Real progress.
                </h3>
                <p style="font-size:14.5px;line-height:1.55;color:#5D4F69;margin:14px 0 18px 0;">
                  Bring your own experience. Lods helps you shape it into clear answers, one follow-up at a time.
                </p>
                {render_check_list_html([
                    "Choose your role, difficulty, and tone",
                    "Practice with questions and follow-ups",
                    "Leave with feedback you can act on",
                ])}
              </div>
              <div style="margin-top:24px;">
                <a href="?view=setup" target="_self" class="lp-dark-btn">
                  <span>Start an interview</span>
                  {SVG_ICONS["arrow_right"]}
                </a>
              </div>
            </div>
            """
        )

    with ws_right:
        if workshop_tab == "Personalized questions":
            right_body = f"""
            <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px;padding:18px 22px;border-bottom:1px solid #EEEAF2;">
              <div>
                <div style="font-size:15.5px;font-weight:600;color:#32283C;">Sir Bot</div>
                <div style="font-size:12px;color:#665570;">Software Engineer · Normal difficulty · Witty</div>
              </div>
              <span class="inl-pill inl-pill-accent inl-num">Question 03 of 05</span>
            </div>
            <div style="padding:22px;">
              <div style="font-size:20px;font-weight:600;line-height:1.35;color:#242126;">
                Tell me about a time you handled pressure at work or in a project.
              </div>
              <p style="font-size:13px;color:#665570;margin:8px 0 16px 0;">
                Take your time. Think about the situation, your actions, and the result.
              </p>
              <div style="background:#F7F5FA;border-radius:12px;padding:14px 16px;margin-bottom:14px;">
                <div style="font-size:11.5px;font-weight:600;color:#7453A6;">Your answer</div>
                <p style="font-size:13.5px;line-height:1.55;color:#4C4157;margin:6px 0 0 0;">
                  "A day before launch, we found a critical bug. I proposed a fix, worked with QA to test it, and kept the team aligned on progress."
                </p>
              </div>
              <div style="background:#EEE7F8;border-radius:12px;padding:14px 16px;">
                <div style="display:flex;align-items:center;gap:8px;color:#7453A6;font-size:11.5px;font-weight:600;">
                  {SVG_ICONS["chat"]}
                  <span>Lods follow-up</span>
                </div>
                <p style="font-size:13.5px;line-height:1.55;color:#4D3B5E;margin:6px 0 0 0;">
                  What specific actions did you take, and how did you coordinate with the team?
                </p>
              </div>
            </div>
            """
        elif workshop_tab == "Live score preview":
            right_body = f"""
            <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px;padding:18px 22px;border-bottom:1px solid #EEEAF2;">
              <div>
                <div style="font-size:15.5px;font-weight:600;color:#32283C;">Live score preview</div>
                <div style="font-size:12px;color:#665570;">Updated after every answer · Software Engineer</div>
              </div>
              <span class="inl-pill inl-pill-accent inl-num">8.2 / 10 · Live score</span>
            </div>
            <div style="padding:22px;">
              {render_rubric_bars_html(8.5, 8.5, 8.0, 7.8)}
              <div style="background:#EEE7F8;border-radius:12px;padding:15px 17px;margin-top:20px;">
                <div style="font-size:11.5px;font-weight:600;color:#7453A6;">Real-time guidance</div>
                <p style="font-size:13.5px;line-height:1.55;color:#4D3B5E;margin:6px 0 0 0;">
                  You explained the triage clearly. Add a measurable result, like launch uptime or error reduction, to strengthen your impact score.
                </p>
              </div>
            </div>
            """
        else:
            right_body = """
            <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px;padding:18px 22px;border-bottom:1px solid #EEEAF2;">
              <div>
                <div style="font-size:15.5px;font-weight:600;color:#32283C;">Your interview results</div>
                <div style="font-size:12px;color:#665570;">5 of 5 questions completed · Strong performance</div>
              </div>
              <span class="inl-pill inl-pill-positive">Completed</span>
            </div>
            <div style="padding:22px;">
              <div style="display:flex;flex-wrap:wrap;gap:18px;align-items:center;">
                <div style="background:#F7F5FA;border-radius:14px;padding:18px 22px;text-align:center;min-width:170px;">
                  <div style="font-size:11.5px;font-weight:600;color:#7453A6;">Final session score</div>
                  <div class="inl-num" style="font-size:38px;font-weight:600;color:#30263C;margin-top:6px;">
                    8.2 <span style="font-size:15px;font-weight:400;color:#665570;">/ 10</span>
                  </div>
                  <div style="font-size:12px;font-weight:500;color:#513F61;margin-top:4px;">Strong performance</div>
                </div>
                <div style="flex:1;min-width:220px;">
                  <div style="font-size:18px;font-weight:600;color:#242126;">A strong foundation.</div>
                  <p style="font-size:13.5px;line-height:1.55;color:#51475D;margin:6px 0 0 0;">
                    You told a clear story and took ownership of your actions. Make the outcome just as specific as your approach.
                  </p>
                  <div style="font-size:12.5px;font-weight:600;color:#7453A6;margin-top:10px;">
                    Next focus: show measurable impact.
                  </div>
                </div>
              </div>
              <div style="background:#EEE7F8;border-radius:12px;padding:15px 17px;margin-top:18px;">
                <div style="font-size:11.5px;font-weight:600;color:#7453A6;">Question-by-question breakdown</div>
                <p style="font-size:13.5px;line-height:1.55;color:#4D3B5E;margin:6px 0 0 0;">
                  Review every prompt, revisit your answers, and focus your next rehearsal on your lowest-scoring rubric dimension.
                </p>
              </div>
            </div>
            """

        render_html(
            f"""
            <div style="background:#F4F0FA;border:1px solid #E3D9EE;border-radius:22px;padding:18px;min-height:430px;">
              <div style="background:#FFFFFF;border:1px solid #E3DBEB;border-radius:16px;overflow:hidden;min-height:392px;">
                {right_body}
              </div>
            </div>
            """
        )

    # ------------------------------------------------------------------
    # 5. FEATURES 2x2 GRID
    # ------------------------------------------------------------------
    render_html(
        f"""
        <section id="features" style="padding:46px 0 12px 0;">
          <div style="text-align:center;max-width:740px;margin:0 auto;">
            <div style="font-size:12.5px;font-weight:600;color:#7453A6;">Personalized practice · Actionable feedback</div>
            <h2 style="font-size:clamp(28px,3.2vw,40px);font-weight:600;line-height:1.18;color:#242126;margin:10px 0 0 0;letter-spacing:-0.025em;">
              Support for every part of your practice.
            </h2>
            <p style="font-size:15.5px;line-height:1.55;color:#665570;margin:10px 0 0 0;">
              From your first question to your next focus, Interview ni Lods helps you see what to work on.
            </p>
          </div>

          <div class="lp-feature-grid">
            <article class="lp-feature-card">
              <div>
                <div style="color:#7453A6;">{SVG_ICONS["briefcase"]}</div>
                <h3 style="font-size:21px;font-weight:600;color:#242126;margin:14px 0 8px 0;">An interview that fits you</h3>
                <p style="font-size:14.5px;line-height:1.55;color:#665570;margin:0;">
                  Set your job role, difficulty, question count, and optional resume context. Practice at a pace that feels right for you.
                </p>
              </div>
              <div class="lp-feature-strip">
                <div style="font-size:14.5px;font-weight:600;color:#513F61;">Software Engineer</div>
                <div style="font-size:12.5px;color:#665570;margin-top:2px;">Normal difficulty · 5 questions · Witty</div>
              </div>
            </article>

            <article class="lp-feature-card">
              <div>
                <div style="color:#7453A6;">{SVG_ICONS["sliders"]}</div>
                <h3 style="font-size:21px;font-weight:600;color:#242126;margin:14px 0 8px 0;">Choose your coach's tone</h3>
                <p style="font-size:14.5px;line-height:1.55;color:#665570;margin:0;">
                  Friendly, Witty, or Direct — choose how Sir Bot responds without changing what makes your stories yours.
                </p>
              </div>
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;background:#F3EFF8;border-radius:10px;padding:6px;">
                <div style="text-align:center;padding:10px 6px;border-radius:8px;font-size:13px;font-weight:500;color:#665570;">Friendly</div>
                <div style="text-align:center;padding:10px 6px;border-radius:8px;font-size:13px;font-weight:600;background:#7453A6;color:#FFFFFF;">Witty</div>
                <div style="text-align:center;padding:10px 6px;border-radius:8px;font-size:13px;font-weight:500;color:#665570;">Direct</div>
              </div>
            </article>

            <article class="lp-feature-card">
              <div>
                <div style="color:#7453A6;">{SVG_ICONS["grid"]}</div>
                <h3 style="font-size:21px;font-weight:600;color:#242126;margin:14px 0 8px 0;">Find the shape of your answer</h3>
                <p style="font-size:14.5px;line-height:1.55;color:#665570;margin:0;">
                  Use STAR: Situation, Task, Action, Result. Give your story clear structure while keeping it in your own words.
                </p>
              </div>
              <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
                <div style="background:#F4F1F8;border-radius:9px;padding:10px 11px;">
                  <div style="font-size:17px;font-weight:600;color:#7453A6;">S</div>
                  <div style="font-size:11.5px;color:#5D4F69;margin-top:4px;">Situation</div>
                </div>
                <div style="background:#F4F1F8;border-radius:9px;padding:10px 11px;">
                  <div style="font-size:17px;font-weight:600;color:#7453A6;">T</div>
                  <div style="font-size:11.5px;color:#5D4F69;margin-top:4px;">Task</div>
                </div>
                <div style="background:#E5DAF4;border-radius:9px;padding:10px 11px;">
                  <div style="font-size:17px;font-weight:600;color:#7453A6;">A</div>
                  <div style="font-size:11.5px;color:#3B294D;font-weight:500;margin-top:4px;">Action</div>
                </div>
                <div style="background:#F4F1F8;border-radius:9px;padding:10px 11px;">
                  <div style="font-size:17px;font-weight:600;color:#7453A6;">R</div>
                  <div style="font-size:11.5px;color:#5D4F69;margin-top:4px;">Result</div>
                </div>
              </div>
            </article>

            <article class="lp-feature-card">
              <div>
                <div style="color:#7453A6;">{SVG_ICONS["book"]}</div>
                <h3 style="font-size:21px;font-weight:600;color:#242126;margin:14px 0 8px 0;">Feedback, during and after</h3>
                <p style="font-size:14.5px;line-height:1.55;color:#665570;margin:0;">
                  See a live score preview while practicing, then review your final score, question-by-question transcript, and next steps.
                </p>
              </div>
              <div class="lp-feature-strip" style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <div class="inl-num" style="font-size:14.5px;font-weight:600;color:#513F61;">Final session score · 8.2 / 10</div>
                  <div style="font-size:12.5px;color:#665570;margin-top:2px;">5 of 5 questions completed</div>
                </div>
                <span style="color:#7453A6;display:inline-flex;">{SVG_ICONS["arrow_right"]}</span>
              </div>
            </article>
          </div>
        </section>
        """
    )

    # ------------------------------------------------------------------
    # 6. LEARNER STORIES — DARK CHARCOAL (#202124) SECTION + LAVENDER CARD
    # ------------------------------------------------------------------
    story_idx = int(st.session_state.get("lp_story_idx", 0)) % len(LANDING_STORIES)
    active_story = LANDING_STORIES[story_idx]
    globe_img = (
        f'<img src="{globe_uri}" alt="Global learner locations" style="width:100%;max-width:340px;height:auto;border-radius:18px;display:block;margin:0 auto;" />'
        if globe_uri
        else ""
    )
    avatar_img = (
        f'<img src="{avatar_uri}" alt="{esc(active_story["name"])}" style="width:36px;height:36px;border-radius:999px;object-fit:cover;" />'
        if avatar_uri
        else ""
    )

    render_html(
        f"""
        <section id="stories" class="lp-dark-section" style="padding:46px 36px;">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:32px;align-items:center;">
            <div style="text-align:center;">
              {globe_img}
            </div>
            <div>
              <div style="font-size:12.5px;font-weight:600;color:#CAB4F0;">Trusted by learners everywhere</div>
              <h2 style="font-size:clamp(26px,3.2vw,38px);font-weight:600;line-height:1.15;color:#FFFFFF;margin:10px 0 0 0;letter-spacing:-0.025em;">
                What learners say,<br/>from where they say it.
              </h2>

              <div style="display:flex;flex-wrap:wrap;gap:24px;margin:20px 0 22px 0;padding:12px 0;border-top:1px solid #383940;border-bottom:1px solid #383940;">
                <div>
                  <div class="inl-num" style="font-size:22px;font-weight:600;color:#FFFFFF;">4.7 / 5</div>
                  <div style="font-size:12px;color:#B3B2BA;">Average rating</div>
                </div>
                <div>
                  <div class="inl-num" style="font-size:22px;font-weight:600;color:#FFFFFF;">{len(LANDING_STORIES)}</div>
                  <div style="font-size:12px;color:#B3B2BA;">Featured stories</div>
                </div>
              </div>

              <div style="background:#E5DAF4;color:#3B294D;border-radius:18px;padding:22px 24px;">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
                  <div style="display:flex;gap:3px;">{_star_row(int(active_story["rating"]))}</div>
                  <span class="inl-num" style="font-size:11.5px;font-weight:600;color:#60427D;">
                    {story_idx + 1:02d} / {len(LANDING_STORIES):02d}
                  </span>
                </div>
                <p style="font-size:16px;font-weight:500;line-height:1.55;color:#3B294D;margin:14px 0 16px 0;">
                  "{esc(active_story["quote"])}"
                </p>
                <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;border-top:1px solid #CBBCE2;padding-top:12px;">
                  <div style="display:flex;align-items:center;gap:10px;">
                    {avatar_img}
                    <div>
                      <div style="font-size:13.5px;font-weight:600;color:#3B294D;">{esc(active_story["name"])}</div>
                      <div style="font-size:12px;color:#604C72;">{esc(active_story["role"])}</div>
                    </div>
                  </div>
                  <span style="font-size:12px;font-weight:600;color:#60427D;">{esc(active_story["location"])}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        """
    )

    _, prev_s, next_s, _ = st.columns([2.2, 0.75, 0.75, 0.3], gap="small")
    with prev_s:
        if st.button("Previous story", type="secondary", width="stretch", key="lp_story_prev"):
            st.session_state["lp_story_idx"] = (story_idx - 1) % len(LANDING_STORIES)
            st.rerun()
    with next_s:
        if st.button("Next story", type="secondary", width="stretch", key="lp_story_next"):
            st.session_state["lp_story_idx"] = (story_idx + 1) % len(LANDING_STORIES)
            st.rerun()

    # ------------------------------------------------------------------
    # 7. FAQ SECTION
    # ------------------------------------------------------------------
    render_html('<div id="faq" style="height:28px;"></div>')
    faq_left, faq_right = st.columns([1.0, 1.55], gap="large")
    with faq_left:
        render_html(
            """
            <div style="font-size:12.5px;font-weight:600;color:#7453A6;">A few things to know</div>
            <h2 style="font-size:clamp(28px,3.2vw,38px);font-weight:600;line-height:1.18;color:#242126;margin:10px 0 0 0;letter-spacing:-0.025em;">
              Good questions.<br/>Straight answers.
            </h2>
            <p style="font-size:15px;line-height:1.55;color:#665570;margin:14px 0 24px 0;">
              A few helpful things to know about setting up your interview and learning from your feedback.
            </p>
            <div style="background:#F4F1F8;border-radius:14px;padding:18px 20px;">
              <div style="font-size:14.5px;font-weight:600;color:#513F61;">Guidance, not a guarantee.</div>
              <p style="font-size:13px;line-height:1.5;color:#665570;margin:6px 0 0 0;">
                Use AI feedback to guide your practice and sharpen your stories, not to predict a hiring decision.
              </p>
            </div>
            """
        )

    with faq_right:
        for idx, (question, answer) in enumerate(LANDING_FAQS):
            with st.expander(question, expanded=(idx == 0)):
                render_html(
                    f'<p style="font-size:14px;line-height:1.6;color:#5E506B;margin:0;">{esc(answer)}</p>'
                )

    # ------------------------------------------------------------------
    # 8. START PRACTICING LAVENDER CTA BANNER (#EAE3F7)
    # ------------------------------------------------------------------
    cta_logo = (
        f'<img src="{logo_uri}" alt="Sir Bot" style="width:62px;height:62px;object-fit:contain;" />'
        if logo_uri
        else ""
    )
    render_html(
        f"""
        <section class="lp-cta-banner">
          <div>
            {cta_logo}
            <div style="font-size:12.5px;font-weight:600;color:#7453A6;margin-top:16px;">One answer at a time</div>
            <h2 style="font-size:clamp(28px,3.3vw,42px);font-weight:600;line-height:1.15;color:#32283C;margin:8px 0 0 0;letter-spacing:-0.025em;">
              Turn feedback into<br/>your next win.
            </h2>
          </div>
          <div>
            <p style="font-size:16px;line-height:1.55;color:#5A4D68;margin:0 0 22px 0;">
              Set the scene. Find your words. Start your next practice round with Sir Bot.
            </p>
            <a href="?view=setup" target="_self" class="lp-dark-btn">
              <span>Start interview</span>
              {SVG_ICONS["arrow_right"]}
            </a>
            <div style="font-size:13px;color:#665570;margin-top:14px;">No pressure. Just progress.</div>
          </div>
        </section>
        """
    )

    # ------------------------------------------------------------------
    # 9. EDITORIAL FOOTER + MASSIVE WATERMARK WORDMARK
    # ------------------------------------------------------------------
    render_html(
        """
        <footer class="lp-footer">
          <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:14px;">
            <div style="font-size:14px;color:#242126;">
              <strong>Interview ni Lods</strong>
              <span style="color:#6D6976;margin-left:6px;">— Practice now, panic less later</span>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:20px;font-size:13px;">
              <a href="#how-it-works" style="color:#5E566A;text-decoration:none;font-weight:500;">How it works</a>
              <a href="#workshop" style="color:#5E566A;text-decoration:none;font-weight:500;">Workshop</a>
              <a href="#features" style="color:#5E566A;text-decoration:none;font-weight:500;">Features</a>
              <a href="#stories" style="color:#5E566A;text-decoration:none;font-weight:500;">Stories</a>
              <a href="#faq" style="color:#5E566A;text-decoration:none;font-weight:500;">FAQ</a>
              <a href="?view=setup" target="_self" style="color:#57367D;text-decoration:none;font-weight:600;">Open workspace</a>
            </div>
          </div>
          <div class="lp-watermark" aria-hidden="true">INTERVIEW</div>
        </footer>
        """
    )
