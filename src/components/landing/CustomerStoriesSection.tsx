"use client";

import { useEffect, useRef, useState } from "react";
import {
  FULL_MOTION_QUERY,
  MOTION,
  REDUCED_MOTION_QUERY,
  SplitText,
  gsap,
  useGSAP,
} from "@/lib/gsap";
import { TestimonialGlobe, type GlobeTestimonial } from "@/components/ui/testimonial-globe";
import { ArrowRightStrokeIcon } from "./MotionVectors";

// Ordered east-to-west starting at Manila so autoplay turns continuously westward.
// 7 five-star reviews + 3 four-star reviews = 4.7 average across 10 global learners.
export const LEARNER_STORIES: GlobeTestimonial[] = [
  {
    id: "manila",
    quote:
      "The follow-up questions helped me explain my thinking. I knew what to improve before my next interview.",
    name: "Example learner",
    role: "Interview practice with Interview ni Lods",
    city: "Manila",
    country: "PH",
    locationLabel: "Gianne, PH",
    lat: 14.6,
    lng: 120.98,
    image: "/assets/reviewer-avatar.png",
    rating: 5,
    tone: 1,
  },
  {
    id: "singapore",
    quote:
      "The voice drill caught my filler words right away. Switching to structured STAR prompts made every answer sharper.",
    name: "Mei Lin Tan",
    role: "Product Analyst prep",
    city: "Singapore",
    country: "SG",
    locationLabel: "Mei Lin, SG",
    lat: 1.35,
    lng: 103.82,
    image: "/assets/avatars/sg-meilin.svg",
    rating: 5,
    tone: 2,
  },
  {
    id: "bengaluru",
    quote:
      "Rehearsing trade-off questions with live rubric feedback gave me the confidence to clear three panel rounds.",
    name: "Aarav Sharma",
    role: "Backend Engineer prep",
    city: "Bengaluru",
    country: "IN",
    locationLabel: "Aarav, IN",
    lat: 12.97,
    lng: 77.59,
    image: "/assets/avatars/in-aarav.svg",
    rating: 5,
    tone: 3,
  },
  {
    id: "nairobi",
    quote:
      "I practiced before each hiring loop during my commute. Hearing back specific action items saved hours of guessing.",
    name: "Wanjiru Kamau",
    role: "Operations Lead prep",
    city: "Nairobi",
    country: "KE",
    locationLabel: "Wanjiru, KE",
    lat: -1.29,
    lng: 36.82,
    image: "/assets/avatars/ke-wanjiru.svg",
    rating: 4,
    tone: 4,
  },
  {
    id: "london",
    quote:
      "Generic chat prompts were too polite. The realistic tone presets pushed my answers until they held up under pressure.",
    name: "Tom Whitfield",
    role: "Product Manager prep",
    city: "London",
    country: "GB",
    locationLabel: "Tom, GB",
    lat: 51.51,
    lng: -0.13,
    image: "/assets/avatars/gb-tom.svg",
    rating: 5,
    tone: 5,
  },
  {
    id: "sao-paulo",
    quote:
      "Seeing communication, clarity, and structure scored separately made it obvious which weak spot to fix first.",
    name: "Renata Alves",
    role: "Customer Success prep",
    city: "São Paulo",
    country: "BR",
    locationLabel: "Renata, BR",
    lat: -23.55,
    lng: -46.63,
    image: "/assets/avatars/br-renata.svg",
    rating: 5,
    tone: 1,
  },
  {
    id: "toronto",
    quote:
      "Ten minutes a night built real muscle memory. When the real behavioral round started, the stories came naturally.",
    name: "Claire Donovan",
    role: "Engineering Manager prep",
    city: "Toronto",
    country: "CA",
    locationLabel: "Claire, CA",
    lat: 43.65,
    lng: -79.38,
    image: "/assets/avatars/ca-claire.svg",
    rating: 4,
    tone: 2,
  },
  {
    id: "san-francisco",
    quote:
      "Role-aware hints nudged me back to measurable outcomes whenever I rambled too long on background context.",
    name: "Daniel Ferreira",
    role: "Solutions Architect prep",
    city: "San Francisco",
    country: "US",
    locationLabel: "Daniel, US",
    lat: 37.78,
    lng: -122.42,
    image: "/assets/avatars/us-daniel.svg",
    rating: 5,
    tone: 3,
  },
  {
    id: "sydney",
    quote:
      "The Taglish-to-English warmth presets kept coaching practical without sounding stiff or robotic.",
    name: "Ethan Cruz",
    role: "UX Designer prep",
    city: "Sydney",
    country: "AU",
    locationLabel: "Ethan, AU",
    lat: -33.87,
    lng: 151.21,
    image: "/assets/avatars/au-ethan.svg",
    rating: 5,
    tone: 4,
  },
  {
    id: "seoul",
    quote:
      "Reviewing session history side by side showed how much more concise my STAR results became in one week.",
    name: "Jiho Shin",
    role: "Data Analyst prep",
    city: "Seoul",
    country: "KR",
    locationLabel: "Jiho, KR",
    lat: 37.57,
    lng: 126.98,
    image: "/assets/avatars/kr-jiho.svg",
    rating: 4,
    tone: 5,
  },
];

export function CustomerStoriesSection() {
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const sectionRef = useRef<HTMLDivElement>(null);
  const modalBackdropRef = useRef<HTMLDivElement>(null);
  const modalPanelRef = useRef<HTMLDivElement>(null);
  const globeJumpRef = useRef<((index: number) => void) | null>(null);

  // Scroll-driven entrance choreography synced with TestimonialGlobe elements
  useGSAP(
    () => {
      const root = sectionRef.current;
      if (!root) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          fullMotion: FULL_MOTION_QUERY,
          reduceMotion: REDUCED_MOTION_QUERY,
          isDesktop: `(min-width: 1024px) and ${FULL_MOTION_QUERY}`,
        },
        (context) => {
          const { reduceMotion, isDesktop } = context.conditions ?? {};

          const globeBox = root.querySelector("[data-globe-box]");
          const rightHeader = root.querySelector("[data-stories-header]");
          const eyebrowEl = root.querySelector("[data-stories-eyebrow]");
          const headingEl = root.querySelector("[data-stories-heading]");
          const metricsBar = root.querySelector("[data-stories-metrics]");
          const reviewsCount = root.querySelector<HTMLElement>("[data-metric-reviews]");
          const avgCount = root.querySelector<HTMLElement>("[data-metric-average]");
          const learnersCount = root.querySelector<HTMLElement>("[data-metric-learners]");
          const cardEl = root.querySelector("[data-stories-card]");
          const cardStars = gsap.utils.toArray<HTMLElement>("[data-stories-star]", root);

          if (reduceMotion) {
            gsap.from([globeBox, rightHeader, metricsBar, cardEl].filter(Boolean), {
              autoAlpha: 0,
              duration: 0.2,
              stagger: 0.04,
              ease: MOTION.ease.out,
              clearProps: "opacity,visibility",
              scrollTrigger: {
                trigger: root,
                start: "top 80%",
                once: true,
                refreshPriority: MOTION.refreshPriority.stories,
              },
            });
            return;
          }

          if (headingEl) {
            SplitText.create(headingEl, {
              type: "lines",
              mask: "lines",
              autoSplit: true,
              aria: "auto",
              onSplit(self) {
                return gsap.from(self.lines, {
                  yPercent: 108,
                  duration: MOTION.duration.textLine,
                  stagger: 0.08,
                  ease: MOTION.ease.out,
                  clearProps: "transform",
                  scrollTrigger: {
                    trigger: rightHeader ?? root,
                    start: "top 76%",
                    once: true,
                    refreshPriority: MOTION.refreshPriority.stories,
                  },
                });
              },
            });
          }

          const storyTl = gsap.timeline({
            defaults: { ease: MOTION.ease.out },
            scrollTrigger: {
              trigger: root,
              start: "top 74%",
              once: true,
              refreshPriority: MOTION.refreshPriority.stories,
            },
          });

          if (globeBox) {
            storyTl.from(
              globeBox,
              {
                autoAlpha: 0,
                scale: 0.96,
                duration: 0.56,
                clearProps: "transform,opacity,visibility",
              },
              0
            );
          }

          if (eyebrowEl) {
            storyTl.from(
              eyebrowEl,
              { autoAlpha: 0, y: 8, duration: 0.34, clearProps: "transform,opacity,visibility" },
              0.04
            );
          }

          if (metricsBar) {
            storyTl.from(
              metricsBar,
              { autoAlpha: 0, y: 10, duration: 0.42, clearProps: "transform,opacity,visibility" },
              0.16
            );
          }

          if (reviewsCount) {
            const obj = { val: 0 };
            storyTl.to(
              obj,
              {
                val: LEARNER_STORIES.length,
                duration: 0.55,
                ease: MOTION.ease.out,
                onUpdate: () => {
                  reviewsCount.textContent = String(Math.round(obj.val));
                },
              },
              0.2
            );
          }

          if (avgCount) {
            const obj = { val: 0 };
            storyTl.to(
              obj,
              {
                val: 4.7,
                duration: 0.6,
                ease: MOTION.ease.out,
                onUpdate: () => {
                  avgCount.textContent = obj.val.toFixed(1);
                },
              },
              0.22
            );
          }

          if (learnersCount) {
            const obj = { val: 0 };
            storyTl.to(
              obj,
              {
                val: LEARNER_STORIES.length,
                duration: 0.55,
                ease: MOTION.ease.out,
                onUpdate: () => {
                  learnersCount.textContent = String(Math.round(obj.val));
                },
              },
              0.24
            );
          }

          if (cardEl) {
            storyTl.from(
              cardEl,
              {
                autoAlpha: 0,
                x: isDesktop ? -10 : 0,
                y: isDesktop ? 0 : 14,
                scale: 0.985,
                duration: 0.45,
                ease: MOTION.ease.drawer,
                clearProps: "transform,opacity,visibility",
              },
              isDesktop ? 0.28 : 0.24
            );
          }

          if (cardStars.length) {
            storyTl.from(
              cardStars,
              {
                autoAlpha: 0,
                scale: 0.9,
                duration: 0.24,
                stagger: 0.045,
                clearProps: "transform,opacity,visibility",
              },
              isDesktop ? 0.44 : 0.36
            );
          }
        }
      );
    },
    { scope: sectionRef }
  );

  // Modal enter animation
  useGSAP(
    () => {
      if (!showReviewsModal) return;
      const backdrop = modalBackdropRef.current;
      const panel = modalPanelRef.current;
      if (!backdrop || !panel) return;

      const reduceMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
      gsap.fromTo(
        backdrop,
        { opacity: 0 },
        { opacity: 1, duration: reduceMotion ? 0.12 : 0.2, ease: MOTION.ease.out }
      );
      gsap.fromTo(
        panel,
        {
          autoAlpha: 0,
          scale: reduceMotion ? 1 : 0.95,
          y: reduceMotion ? 0 : 8,
        },
        {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          duration: reduceMotion ? 0.14 : 0.24,
          ease: MOTION.ease.out,
          clearProps: "transform",
        }
      );
    },
    { scope: sectionRef, dependencies: [showReviewsModal] }
  );

  // Modal asymmetric fast exit animation
  useGSAP(
    () => {
      if (!showReviewsModal || !isClosingModal) return;
      const backdrop = modalBackdropRef.current;
      const panel = modalPanelRef.current;

      if (!backdrop || !panel || window.matchMedia(REDUCED_MOTION_QUERY).matches) {
        setIsClosingModal(false);
        setShowReviewsModal(false);
        return;
      }

      gsap.to(backdrop, { opacity: 0, duration: 0.16, ease: MOTION.ease.out });
      gsap.to(panel, {
        autoAlpha: 0,
        scale: 0.96,
        y: 6,
        duration: 0.16,
        ease: MOTION.ease.inOut,
        onComplete: () => {
          setIsClosingModal(false);
          setShowReviewsModal(false);
        },
      });
    },
    { scope: sectionRef, dependencies: [isClosingModal] }
  );

  const handleCloseModal = (immediate = false) => {
    if (!showReviewsModal || isClosingModal) return;
    if (immediate || window.matchMedia(REDUCED_MOTION_QUERY).matches) {
      setIsClosingModal(false);
      setShowReviewsModal(false);
      return;
    }
    setIsClosingModal(true);
  };

  useEffect(() => {
    if (!showReviewsModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsClosingModal(false);
        setShowReviewsModal(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showReviewsModal]);

  return (
    <div ref={sectionRef} className="relative w-full">
      <TestimonialGlobe
        id="stories"
        variant="stories"
        items={LEARNER_STORIES}
        eyebrow="Trusted on every continent"
        headingLines={["What customers say,", "from where they say it"]}
        unitLabel={{ singular: "learner", plural: "learners" }}
        size={680}
        autoRotate
        rotationSpeed={0.08}
        autoplay
        interval={4500}
        globeControlRef={globeJumpRef}
        onActiveChange={(idx) => {
          if (idx !== null) setActiveIndex(idx);
        }}
        ambient={
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
            style={{
              backgroundImage: [
                "radial-gradient(ellipse 52% 48% at 6% 88%, rgba(121, 61, 175, 0.22) 0%, rgba(121, 61, 175, 0.08) 50%, transparent 80%)",
                "radial-gradient(ellipse 54% 48% at 94% 86%, rgba(121, 61, 175, 0.24) 0%, rgba(121, 61, 175, 0.09) 50%, transparent 80%)",
                "radial-gradient(ellipse 46% 52% at 28% 52%, rgba(121, 61, 175, 0.14) 0%, transparent 76%)",
              ].join(", "),
            }}
          >
            <div className="absolute bottom-[-18%] left-[-9.375%] h-[24%] min-h-[204px] w-[37.7%]">
              <div className="absolute inset-[-196.08%_-73.66%]">
                <img
                  alt=""
                  src="/assets/stories-ellipse-13.svg"
                  width={1343}
                  height={1004}
                  className="block size-full max-w-none"
                />
              </div>
            </div>
            <div className="absolute bottom-[-12%] right-[-13.82%] h-[24%] min-h-[204px] w-[37.7%]">
              <div className="absolute inset-[-196.08%_-73.66%]">
                <img
                  alt=""
                  src="/assets/stories-ellipse-13.svg"
                  width={1343}
                  height={1004}
                  className="block size-full max-w-none"
                />
              </div>
            </div>
          </div>
        }
        action={
          <button
            type="button"
            onClick={() => setShowReviewsModal(true)}
            className="btn-tactile inline-flex h-[46px] min-w-[186px] cursor-pointer items-center justify-between gap-3 rounded-[23px] bg-[#e5daf4] px-[18px] text-[14px] font-semibold leading-[20px] text-[#3b294d]"
          >
            <span className="whitespace-nowrap">Read all reviews</span>
            <span className="size-[18px] shrink-0">
              <ArrowRightStrokeIcon
                variant="standard"
                size={18}
                color="#51366F"
                className="hover-arrow-shift block size-full max-w-none"
              />
            </span>
          </button>
        }
      />

      {/* All Reviews Modal with Emil asymmetric enter/exit timing & globe jump */}
      {showReviewsModal && (
        <div
          ref={modalBackdropRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reviews-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={() => handleCloseModal(false)}
        >
          <div
            ref={modalPanelRef}
            className="flex max-h-[85vh] w-full max-w-[600px] flex-col rounded-[20px] border border-[#bda5db] bg-[#e5daf4] p-6 text-[#3b294d] shadow-2xl sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between gap-4">
              <div>
                <p className="text-[12px] font-semibold text-[#7453a6]">LEARNER STORIES · 4.7 AVERAGE</p>
                <h3 id="reviews-modal-title" className="mt-1 text-[22px] font-semibold">
                  All learner reviews ({LEARNER_STORIES.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => handleCloseModal(false)}
                className="btn-tactile cursor-pointer rounded-lg bg-[#3b294d] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#242126]"
              >
                Close
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-3 overflow-y-auto pr-1">
              {LEARNER_STORIES.map((story, idx) => {
                const isSelected = idx === activeIndex;
                const stars = story.rating ?? 5;
                return (
                  <button
                    key={story.id}
                    type="button"
                    onClick={() => {
                      globeJumpRef.current?.(idx);
                      handleCloseModal(false);
                    }}
                    className={`w-full cursor-pointer rounded-[14px] border p-4 text-left transition-colors duration-150 ${
                      isSelected
                        ? "border-[#7453a6] bg-white shadow-xs"
                        : "border-transparent bg-white/75 hover:border-[#bda5db] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <img
                            key={i}
                            alt=""
                            src="/assets/icon-star.svg"
                            width={15}
                            height={15}
                            className={i < stars ? "opacity-100" : "opacity-25"}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] font-semibold text-[#7453a6]">
                        {String(idx + 1).padStart(2, "0")} / {String(LEARNER_STORIES.length).padStart(2, "0")}
                      </span>
                    </div>
                    <p className="mt-2.5 text-[15px] font-medium leading-[23px] text-[#3b294d]">
                      “{story.quote}”
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#cdbce3] pt-2.5 text-[12px]">
                      <div className="flex items-center gap-2.5">
                        <img
                          alt={story.name}
                          src={story.image}
                          width={28}
                          height={28}
                          className="size-7 rounded-full object-cover"
                        />
                        <span className="font-semibold text-[#3b294d]">{story.name}</span>
                      </div>
                      <span className="font-medium text-[#665174]">
                        {story.locationLabel ?? `${story.city}, ${story.country}`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
