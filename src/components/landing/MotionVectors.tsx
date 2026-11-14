import React from "react";

interface VectorProps {
  className?: string;
}

/** Vertical hairline divider inside the dark landing navbar (nav-divider.svg). */
export function NavDividerLine({ className = "block max-w-none" }: VectorProps) {
  return (
    <svg
      aria-hidden="true"
      preserveAspectRatio="none"
      overflow="visible"
      width="51"
      height="0.5"
      viewBox="0 0 51 0.5"
      fill="none"
      className={className}
    >
      <line data-draw-stroke="" y1="0.25" x2="51" y2="0.25" strokeWidth="0.5" stroke="white" />
    </svg>
  );
}

/** Arrow right icon matching icon-arrow-dark / icon-arrow-white / icon-start-arrow / icon-read-reviews-arrow. */
export function ArrowRightStrokeIcon({
  size = 18,
  color = "currentColor",
  className = "",
  variant = "standard",
}: VectorProps & {
  size?: number;
  color?: string;
  variant?: "standard" | "hero" | "cta";
}) {
  if (variant === "hero") {
    return (
      <svg
        aria-hidden="true"
        preserveAspectRatio="none"
        overflow="visible"
        width={size}
        height={size}
        viewBox="0 0 17 17"
        fill="none"
        className={className}
      >
        <path
          d="M3.54167 8.5H13.4583M9.20833 12.75L13.4583 8.5L9.20833 4.25"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          stroke={color}
        />
      </svg>
    );
  }

  if (variant === "cta") {
    return (
      <svg
        aria-hidden="true"
        preserveAspectRatio="none"
        overflow="visible"
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        className={className}
      >
        <path
          d="M3.33333 10H16.6667M11.6667 15L16.6667 10L11.6667 5"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          stroke={color}
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      preserveAspectRatio="none"
      overflow="visible"
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      className={className}
    >
      <path
        d="M3 9H15M10.5 13.5L15 9L10.5 4.5"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke={color}
      />
    </svg>
  );
}

/** Briefcase stroke icon used in HowItWorks Card 01 (#D2BFFF) and Features Card 1 (#7453A6). */
export function BriefcaseStrokeIcon({
  color = "#D2BFFF",
  className = "size-[24px] shrink-0",
}: VectorProps & { color?: string }) {
  return (
    <svg
      aria-hidden="true"
      preserveAspectRatio="none"
      overflow="visible"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        data-draw-stroke=""
        d="M5 7H19C20.1046 7 21 7.89543 21 9V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V9C3 7.89543 3.89543 7 5 7Z"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke={color}
      />
      <path
        data-draw-stroke=""
        d="M8 7V4H16V7M3 12C8.79188 14.2349 15.2081 14.2349 21 12M10 13H14"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke={color}
      />
    </svg>
  );
}

/** 32x32 Workshop briefcase stroke icon matching icon-workshop-briefcase.svg. */
export function WorkshopBriefcaseIcon({ className = "size-[32px]" }: VectorProps) {
  return (
    <svg
      aria-hidden="true"
      preserveAspectRatio="none"
      overflow="visible"
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      className={className}
    >
      <path
        data-draw-stroke=""
        d="M6.66667 9.33333H25.3333C26.8061 9.33333 28 10.5272 28 12V25.3333C28 26.8061 26.8061 28 25.3333 28H6.66667C5.19391 28 4 26.8061 4 25.3333V12C4 10.5272 5.19391 9.33333 6.66667 9.33333Z"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="#7453A6"
      />
      <path
        data-draw-stroke=""
        d="M10.6667 9.33333V5.33333H21.3333V9.33333M4 16C11.7225 18.9799 20.2775 18.9799 28 16M13.3333 17.3333H18.6667"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="#7453A6"
      />
    </svg>
  );
}

/** Speech bubble + typing lines used in HowItWorks Card 02 (#D2BFFF) and Workshop Follow-Up (#7453A6). */
export function ConversationStrokeIcon({
  color = "#D2BFFF",
  strokeWidth = 1.6,
  className = "size-[24px] shrink-0",
}: VectorProps & { color?: string; strokeWidth?: number }) {
  return (
    <svg
      aria-hidden="true"
      preserveAspectRatio="none"
      overflow="visible"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        data-draw-stroke=""
        d="M21 11.5C21 12.6162 20.7801 13.7215 20.353 14.7528C19.9258 15.7841 19.2997 16.7211 18.5104 17.5104C17.7211 18.2997 16.7841 18.9258 15.7528 19.353C14.7215 19.7801 13.6162 20 12.5 20H5L2 22V11.5C2 9.24566 2.89553 7.08365 4.48959 5.48959C6.08365 3.89553 8.24566 3 10.5 3H12.5C13.6162 3 14.7215 3.21986 15.7528 3.64702C16.7841 4.07419 17.7211 4.70029 18.5104 5.48959C19.2997 6.27889 19.9258 7.21592 20.353 8.24719C20.7801 9.27846 21 10.3838 21 11.5Z"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke={color}
      />
      <path
        data-draw-stroke=""
        d="M7 10H17M7 14H13"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke={color}
      />
    </svg>
  );
}

/** Checkmark circle stroke icon matching icon-check-circle.svg. */
export function CheckCircleStrokeIcon({ className = "size-[24px] shrink-0" }: VectorProps) {
  return (
    <svg
      aria-hidden="true"
      preserveAspectRatio="none"
      overflow="visible"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        data-draw-stroke=""
        d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="#D2BFFF"
      />
      <path
        data-draw-stroke=""
        d="M8 12L11 15L16 9"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="#D2BFFF"
      />
    </svg>
  );
}

/** Small checkmark stroke icon matching icon-check.svg (18x18 #7453A6). */
export function CheckStrokeIcon({ className = "size-[18px] shrink-0" }: VectorProps) {
  return (
    <svg
      aria-hidden="true"
      preserveAspectRatio="none"
      overflow="visible"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className={className}
    >
      <path
        data-draw-stroke=""
        d="M3.75 9L6.75 12L14.25 4.5"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="#7453A6"
      />
    </svg>
  );
}

/** Role document stroke icon matching icon-role-document.svg. */
export function RoleDocumentStrokeIcon({ className = "size-[24px] shrink-0" }: VectorProps) {
  return (
    <svg
      aria-hidden="true"
      preserveAspectRatio="none"
      overflow="visible"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        data-draw-stroke=""
        d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="#7453A6"
      />
      <path
        data-draw-stroke=""
        d="M14 2V8H20M8 13H16M8 17H13"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="#7453A6"
      />
    </svg>
  );
}

/** Sliders stroke icon matching icon-feature-tone.svg with individually animated knobs. */
export function FeatureToneSlidersIcon({ className = "size-[24px]" }: VectorProps) {
  return (
    <svg
      aria-hidden="true"
      preserveAspectRatio="none"
      overflow="visible"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        data-draw-stroke=""
        d="M4 6H20M4 12H20M4 18H20"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="#7453A6"
      />
      <path
        data-tone-knob="0"
        data-draw-stroke=""
        d="M9 8C10.1046 8 11 7.10457 11 6C11 4.89543 10.1046 4 9 4C7.89543 4 7 4.89543 7 6C7 7.10457 7.89543 8 9 8Z"
        fill="white"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="#7453A6"
      />
      <path
        data-tone-knob="1"
        data-draw-stroke=""
        d="M15 14C16.1046 14 17 13.1046 17 12C17 10.8954 16.1046 10 15 10C13.8954 10 13 10.8954 13 12C13 13.1046 13.8954 14 15 14Z"
        fill="white"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="#7453A6"
      />
      <path
        data-tone-knob="2"
        data-draw-stroke=""
        d="M8 20C9.10457 20 10 19.1046 10 18C10 16.8954 9.10457 16 8 16C6.89543 16 6 16.8954 6 18C6 19.1046 6.89543 20 8 20Z"
        fill="white"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="#7453A6"
      />
    </svg>
  );
}

/** 2x2 STAR grid stroke icon matching icon-feature-star.svg with quadrant hooks for S/T/A/R sync. */
export function FeatureStarGridIcon({ className = "size-[24px]" }: VectorProps) {
  return (
    <svg
      aria-hidden="true"
      preserveAspectRatio="none"
      overflow="visible"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        data-star-quadrant="S"
        data-draw-stroke=""
        d="M4 3H9C9.55228 3 10 3.44772 10 4V9C10 9.55228 9.55228 10 9 10H4C3.44772 10 3 9.55228 3 9V4C3 3.44772 3.44772 3 4 3Z"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="#7453A6"
      />
      <path
        data-star-quadrant="T"
        data-draw-stroke=""
        d="M15 3H20C20.5523 3 21 3.44772 21 4V9C21 9.55228 20.5523 10 20 10H15C14.4477 10 14 9.55228 14 9V4C14 3.44772 14.4477 3 15 3Z"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="#7453A6"
      />
      <path
        data-star-quadrant="A"
        data-draw-stroke=""
        d="M4 14H9C9.55228 14 10 14.4477 10 15V20C10 20.5523 9.55228 21 9 21H4C3.44772 21 3 20.5523 3 20V15C3 14.4477 3.44772 14 4 14Z"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="#7453A6"
      />
      <path
        data-star-quadrant="R"
        data-draw-stroke=""
        d="M15 14H20C20.5523 14 21 14.4477 21 15V20C21 20.5523 20.5523 21 20 21H15C14.4477 21 14 20.5523 14 20V15C14 14.4477 14.4477 14 15 14Z"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="#7453A6"
      />
    </svg>
  );
}

/** Feedback notebook stroke icon matching icon-feature-feedback.svg. */
export function FeatureFeedbackBookIcon({ className = "size-[24px]" }: VectorProps) {
  return (
    <svg
      aria-hidden="true"
      preserveAspectRatio="none"
      overflow="visible"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        data-draw-stroke=""
        d="M6 3H18C18.5304 3 19.0391 3.21071 19.4142 3.58579C19.7893 3.96086 20 4.46957 20 5V21H6C5.20435 21 4.44129 20.6839 3.87868 20.1213C3.31607 19.5587 3 18.7956 3 18V6C3 5.20435 3.31607 4.44129 3.87868 3.87868C4.44129 3.31607 5.20435 3 6 3Z"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="#7453A6"
      />
      <path
        data-draw-stroke=""
        d="M6 3V21M10 8H16M10 12H16M7 17H20"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="#7453A6"
      />
    </svg>
  );
}

/** Session history clock icon matching icon-session-history.svg. */
export function SessionHistoryClockIcon({ className = "size-[24px] shrink-0" }: VectorProps) {
  return (
    <svg
      aria-hidden="true"
      preserveAspectRatio="none"
      overflow="visible"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        data-draw-stroke=""
        d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="#7453A6"
      />
      <path
        data-draw-stroke=""
        d="M12 7V12L15 14"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="#7453A6"
      />
    </svg>
  );
}

/** Chevron right icon matching icon-chevron-right.svg. */
export function ChevronStrokeIcon({ className = "size-[20px] shrink-0" }: VectorProps) {
  return (
    <svg
      aria-hidden="true"
      preserveAspectRatio="none"
      overflow="visible"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
    >
      <path
        d="M7.5 4.16667L13.3333 10L7.5 15.8333"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="#7453A6"
      />
    </svg>
  );
}

/** Angled connector bridge line matching stories-connector-line.svg (209.268x2). */
export function StoriesConnectorLineSvg({ className = "block size-full max-w-none" }: VectorProps) {
  return (
    <svg
      aria-hidden="true"
      preserveAspectRatio="none"
      overflow="visible"
      width="209.268"
      height="2"
      viewBox="0 0 209.268 2"
      fill="none"
      className={className}
    >
      <line
        data-stories-line=""
        y1="1"
        x2="209.268"
        y2="1"
        strokeWidth="2"
        stroke="#E5DAF4"
      />
    </svg>
  );
}

/** Connector dot matching stories-connector-dot.svg (3x3). */
export function StoriesConnectorDotSvg({ className = "block size-full max-w-none" }: VectorProps) {
  return (
    <svg
      aria-hidden="true"
      preserveAspectRatio="none"
      overflow="visible"
      width="3"
      height="3"
      viewBox="0 0 3 3"
      fill="none"
      className={className}
    >
      <circle cx="1.5" cy="1.5" r="1.5" fill="#D9D9D9" />
    </svg>
  );
}

/**
 * Plus/Minus FAQ icon with separate horizontal base stroke and morphable vertical stroke
 * so GSAP MorphSVG smoothly morphs the vertical bar between '+' and '−'.
 */
export function FaqToggleMorphIcon({
  initialOpen = false,
  className = "size-[20px] shrink-0",
}: VectorProps & { initialOpen?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      preserveAspectRatio="none"
      overflow="visible"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
    >
      <path
        d="M4.16667 10H15.8333"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="#7453A6"
      />
      <path
        data-faq-vertical=""
        d={initialOpen ? "M4.16667 10H15.8333" : "M10 4.16667V15.8333"}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="#7453A6"
      />
    </svg>
  );
}

/** Smooth concave outer corner fillet for the top navigation notch (`#202124`). */
export function NavNotchFilletSvg({
  side,
  className = "block size-[24px]",
}: VectorProps & { side: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d={
          side === "left"
            ? "M0 0H24V24C24 10.7452 13.2548 0 0 0Z"
            : "M24 0H0V24C0 10.7452 10.7452 0 24 0Z"
        }
        fill="#202124"
      />
    </svg>
  );
}

/**
 * Editorial Notion-inspired HR Interviewer peeking over the top-right edge of the Hero screenshot.
 * Bottom neck seam stops flush along y=58 while gripping fingers overlap downward onto the border.
 */
export function HeroHrPeekTopSvg({ className = "block h-auto w-full" }: VectorProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 112 68"
      fill="none"
      className={className}
    >
      {/* Head + ears silhouette */}
      <circle cx="29" cy="40" r="4.3" fill="#FFFFFF" stroke="#202124" strokeWidth="1.95" />
      <circle cx="83" cy="40" r="4.3" fill="#FFFFFF" stroke="#202124" strokeWidth="1.95" />
      <path
        d="M32 58C29 48 29 31 33 20C39 10 47 7 56 7C65 7 73 10 79 20C83 31 83 48 80 58H32Z"
        fill="#FFFFFF"
      />
      <path
        d="M32 58C29 48 29 31 33 20C39 10 47 7 56 7C65 7 73 10 79 20C83 31 83 48 80 58"
        stroke="#202124"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Sleek hair silhouette */}
      <path
        d="M31 34C29 18 39 5 56 5C73 5 83 18 81 34C76 24 68 19 58 20C51 21 46 18 42 15C38 22 34 28 31 34Z"
        fill="#202124"
      />

      {/* Subtle shirt collar peek */}
      <path
        d="M45 58L49 54.5L56 58L63 54.5L67 58"
        fill="#F4EFFA"
        stroke="#202124"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Eyebrows & observant glasses */}
      <path d="M39 28.5Q45 25.5 50 28" stroke="#202124" strokeWidth="1.85" strokeLinecap="round" />
      <path d="M62 28Q67.5 25 73 28.5" stroke="#202124" strokeWidth="1.85" strokeLinecap="round" />
      <rect x="37" y="32" width="16" height="12" rx="4.5" fill="#FFFFFF" stroke="#202124" strokeWidth="1.85" />
      <rect x="59" y="32" width="16" height="12" rx="4.5" fill="#FFFFFF" stroke="#202124" strokeWidth="1.85" />
      <path d="M53 38H59" stroke="#202124" strokeWidth="1.85" strokeLinecap="round" />

      {/* Animated eye pupils inside lenses */}
      <g data-hr-top-eyes="">
        <circle cx="46" cy="38.5" r="2.1" fill="#202124" />
        <circle cx="67.5" cy="38.5" r="2.1" fill="#202124" />
      </g>

      {/* Nose & warm grin */}
      <path d="M55 46C55.8 47.6 57.5 47.6 58.2 46" stroke="#202124" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M51.5 51.8Q56 54 60.5 51.6" stroke="#202124" strokeWidth="1.7" strokeLinecap="round" />

      {/* Left & right gripping hands wrapping cleanly onto the top screenshot border */}
      <path
        d="M14 58C14 53.4 18.8 52 22.8 53.5C25.6 52 30.5 53.4 30.5 58C30.5 61.6 27.6 63.2 22.2 63.2C17 63.2 14 61.6 14 58Z"
        fill="#FFFFFF"
        stroke="#202124"
        strokeWidth="1.95"
        strokeLinejoin="round"
      />
      <path d="M19.5 58V62M25 58V62" stroke="#202124" strokeWidth="1.5" strokeLinecap="round" />

      <path
        d="M81.5 58C81.5 53.4 86.4 52 89.2 53.5C93.2 52 98 53.4 98 58C98 61.6 95 63.2 89.8 63.2C84.4 63.2 81.5 61.6 81.5 58Z"
        fill="#FFFFFF"
        stroke="#202124"
        strokeWidth="1.95"
        strokeLinejoin="round"
      />
      <path d="M87 58V62M92.5 58V62" stroke="#202124" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Refined Notion-inspired editorial ink HR woman peeking from behind the left edge
 * of the Hero showcase (x=85 flush seam), wearing a crisp shirt + tailored vest and holding a slim portfolio.
 */
export function HeroHrPeekLeftSvg({ className = "block h-auto w-full" }: VectorProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 94 162"
      fill="none"
      className={className}
    >
      {/* Slim dark interview portfolio tucked smoothly behind her bent forearm */}
      <g transform="rotate(-11 40 103)">
        <rect x="27" y="84" width="24" height="36" rx="2.5" fill="#202124" />
        <path d="M31 87.5H47" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.85" />
        <path d="M31 92H43" stroke="#CAB4F0" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.85" />
      </g>

      {/* Tailored HR torso & soft lavender-tinted sleeveless vest flush against x=85 */}
      <path
        d="M85 60C71 58 55 60 47 68L41 96C39 114 41 134 45 151H85V60Z"
        fill="#F2EEF8"
      />
      <path
        d="M85 60C71 58 55 60 47 68C44 74 42 84 41 96C39 114 41 134 45 151H85"
        stroke="#202124"
        strokeWidth="1.95"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Crisp white shirt V-collar + vest tailoring seam & two minimalist buttons */}
      <path
        d="M52 61L64 81L74 60"
        fill="#FFFFFF"
        stroke="#202124"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M64 81V124" stroke="#202124" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="67.5" cy="91" r="1.5" fill="#202124" />
      <circle cx="67.5" cy="103" r="1.5" fill="#202124" />

      {/* Natural white shirt sleeve wrapping seamlessly shoulder -> elbow -> hand clasping portfolio */}
      <path
        d="M47 68C40 74 31 88 28 100C26 106 30 112 37 112L54 110C57 109.5 59 107 58.5 104C58 101.5 55.5 100.5 52 101L39 102.5L46 84"
        fill="#FFFFFF"
        stroke="#202124"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M51 101L53 110" stroke="#202124" strokeWidth="1.4" strokeLinecap="round" />

      {/* Back high bun + loose ink hair curl */}
      <circle cx="43" cy="20" r="9.5" fill="#202124" />
      <path d="M39 27C35 30 35.5 34.5 38.5 37" stroke="#202124" strokeWidth="1.6" strokeLinecap="round" />

      {/* Neck & serene 3/4 oval face turned gently toward the preview screen */}
      <path
        d="M53 50V61L64 62V51"
        fill="#FFFFFF"
      />
      <path
        d="M53 50V61M64 52V60"
        stroke="#202124"
        strokeWidth="1.85"
        strokeLinecap="round"
      />

      <path
        d="M49 52C44 47 43 38 44 29C46 19 54 13 65 14C73 15 77 22 77 31C77 41 72 49 64 52.5C59 54 53 54 49 52Z"
        fill="#FFFFFF"
        stroke="#202124"
        strokeWidth="1.95"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Swept editorial crown hair & clean side part */}
      <path
        d="M43 32C42 18 52 10 65 11C74 12 78 19 77 27C71 21 61 19 52 24C48 26 45 29 43 32Z"
        fill="#202124"
      />

      {/* Ear + delicate muted-violet pearl stud */}
      <path
        d="M45 33C42.5 33 41.5 35.5 42 38C42.5 40 44 41 46 40.5"
        fill="#FFFFFF"
        stroke="#202124"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="44.5" cy="40.5" r="1.4" fill="#7453A6" />

      {/* Calm observant brows & glancing eyes */}
      <path d="M56 27Q60 25 63.5 27" stroke="#202124" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M68.5 26.5Q71.5 25 74.5 26.8" stroke="#202124" strokeWidth="1.6" strokeLinecap="round" />
      <g data-hr-left-eyes="">
        <circle cx="60.5" cy="32.5" r="1.85" fill="#202124" />
        <circle cx="71" cy="32" r="1.85" fill="#202124" />
      </g>

      {/* Minimalist nose arc & subtle calm smile */}
      <path d="M68 35C69.5 38 69 40.2 67 40.8" stroke="#202124" strokeWidth="1.55" strokeLinecap="round" />
      <path d="M59.5 44.8Q64 47.2 68.5 44.2" stroke="#202124" strokeWidth="1.6" strokeLinecap="round" />

      {/* Delicate right hand gripping lightly onto the left screenshot border at x=85..92 */}
      <path
        d="M82 77C87 76 92.5 77.5 92.5 82C92.5 86.5 87 88 82 87Z"
        fill="#FFFFFF"
        stroke="#202124"
        strokeWidth="1.85"
        strokeLinejoin="round"
      />
      <path d="M85.5 80.5H90.5M85.5 83.8H90.5" stroke="#202124" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}


