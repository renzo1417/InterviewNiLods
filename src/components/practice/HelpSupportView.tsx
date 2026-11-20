"use client";

import React, { useMemo, useState } from "react";
import { HELP_FAQ_ITEMS } from "./workspace-data";

const QUICK_TOPICS = [
  {
    eyebrow: "SCORING RUBRIC",
    title: "How live scoring works",
    description:
      "Every answer is scored across Clarity, Structure, Relevance, and Impact on a 10-point scale.",
  },
  {
    eyebrow: "WORKFLOW",
    title: "Keyboard shortcuts",
    description:
      "Press Enter to send, Shift + Enter for a new line, and toggle Live score anytime mid-round.",
  },
  {
    eyebrow: "PRIVACY",
    title: "Your answers stay private",
    description:
      "Practice transcripts are stored only for your review and never used to train external models.",
  },
] as const;

const SUPPORT_TOPICS = [
  "Coaching feedback & scoring",
  "Account & sign-in help",
  "Feature suggestion",
  "Bug report",
] as const;

/**
 * Help & support workspace screen (Figma node 242:8481).
 * Includes instant FAQ search, quick-help cards, CSS-grid accordion, and a live support form.
 */
export function HelpSupportView() {
  const [search, setSearch] = useState("");
  const [openFaqId, setOpenFaqId] = useState<string>(HELP_FAQ_ITEMS[0].id);
  const [topic, setTopic] = useState<string>(SUPPORT_TOPICS[0]);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const visibleFaqs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return HELP_FAQ_ITEMS;
    return HELP_FAQ_ITEMS.filter(
      (item) =>
        item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q)
    );
  }, [search]);

  const handleSubmitSupport = (event: React.FormEvent) => {
    event.preventDefault();
    if (!message.trim()) return;
    setSubmitted(true);
    setMessage("");
  };

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-white px-4 py-6 pb-24 sm:px-8 lg:px-[48px] lg:py-[32px] lg:pb-10">
      <div className="mx-auto max-w-[1104px] space-y-6">
        {/* Heading + Search */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-[26px] font-semibold leading-[1.25] tracking-[-0.02em] text-[#30263c] sm:text-[28px]">
              Help &amp; support
            </h1>
            <p className="mt-1 text-[13px] text-[#796985]">
              Answers, keyboard shortcuts, and direct support whenever you need a hand.
            </p>
          </div>

          <div className="relative w-full md:w-[300px]">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#796985]"
            >
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
              <path
                d="m20 20-3.5-3.5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search help topics…"
              aria-label="Search help topics"
              className="h-[40px] w-full rounded-[12px] border border-[#e3daf1] bg-[#f9f7fc] pl-10 pr-3.5 text-[12px] text-[#30263c] placeholder:text-[#796985] focus:border-[#7453a6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7453a6]/15"
            />
          </div>
        </div>

        {/* 3 Quick-help cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {QUICK_TOPICS.map((card) => (
            <section
              key={card.title}
              className="rounded-[16px] border border-[#e5dfec] bg-[#faf8fd] p-5 sm:p-6"
            >
              <p className="text-[10px] font-semibold tracking-[0.04em] text-[#73518f]">
                {card.eyebrow}
              </p>
              <h2 className="mt-2 text-[15px] font-semibold text-[#4d365f]">{card.title}</h2>
              <p className="mt-1.5 text-[12px] leading-[1.55] text-[#796985]">
                {card.description}
              </p>
            </section>
          ))}
        </div>

        {/* Bottom 704 / 368 split: FAQ Accordion + Contact form */}
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,704fr)_minmax(0,368fr)]">
          {/* FAQ Accordion */}
          <section className="min-w-0 rounded-[16px] border border-[#e5dfec] bg-white p-5 sm:p-6">
            <h2 className="text-[16px] font-semibold text-[#30263c]">
              Frequently asked questions
            </h2>

            {visibleFaqs.length === 0 ? (
              <p className="mt-4 text-[13px] text-[#796985]">
                No FAQ entries matched “{search}”. Send us a message on the right and we’ll help!
              </p>
            ) : (
              <div className="mt-4 divide-y divide-[#efebf4]">
                {visibleFaqs.map((faq) => {
                  const isOpen = openFaqId === faq.id;
                  return (
                    <div key={faq.id} className="py-3.5 first:pt-1 last:pb-0">
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setOpenFaqId(isOpen ? "" : faq.id)}
                        className="flex w-full cursor-pointer items-center justify-between gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7453a6]"
                      >
                        <span
                          className={`text-[13px] font-medium transition-colors ${
                            isOpen ? "text-[#60427d]" : "text-[#30263c]"
                          }`}
                        >
                          {faq.question}
                        </span>
                        <span
                          aria-hidden="true"
                          className="shrink-0 text-[16px] font-medium text-[#796985]"
                        >
                          {isOpen ? "−" : "+"}
                        </span>
                      </button>
                      <div className="faq-grid-panel" data-open={isOpen}>
                        <div className="faq-grid-inner">
                          <p className="pt-2 text-[12px] leading-[1.6] text-[#796985]">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Send a message card */}
          <section className="min-w-0 rounded-[16px] border border-[#e5dfec] bg-[#faf8fd] p-5 sm:p-6">
            <p className="text-[10px] font-semibold tracking-[0.04em] text-[#73518f]">
              NEED A HAND?
            </p>
            <h2 className="mt-1.5 text-[17px] font-semibold text-[#4d365f]">
              Send us a message
            </h2>

            {submitted ? (
              <div className="mt-4 rounded-[12px] border border-[#d6e4cd] bg-[#edf3e9] p-4">
                <p className="text-[13px] font-semibold text-[#4c6940]">✓ Message received</p>
                <p className="mt-1 text-[12px] leading-[1.5] text-[#5d7850]">
                  Thanks for reaching out. We usually reply within one business day.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-3 cursor-pointer text-[12px] font-semibold text-[#4c6940] hover:underline"
                >
                  Send another note
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitSupport} className="mt-4 space-y-4">
                <label className="block space-y-1.5">
                  <span className="block text-[12px] font-medium text-[#4d365f]">Topic</span>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="h-[40px] w-full cursor-pointer rounded-[8px] border border-[#e3daf1] bg-white px-3 text-[13px] text-[#30263c] focus:border-[#7453a6] focus:outline-none focus:ring-2 focus:ring-[#7453a6]/15"
                  >
                    {SUPPORT_TOPICS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-1.5">
                  <span className="block text-[12px] font-medium text-[#4d365f]">Message</span>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what happened or what feature would help your prep…"
                    className="w-full resize-y rounded-[8px] border border-[#e3daf1] bg-white p-3 text-[12px] leading-[1.5] text-[#30263c] placeholder:text-[#796985] focus:border-[#7453a6] focus:outline-none focus:ring-2 focus:ring-[#7453a6]/15"
                  />
                </label>

                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="btn-tactile inline-flex h-[40px] w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] bg-[#c7b8fa] px-4 text-[13px] font-semibold text-[#292331] hover:bg-[#baa9f7] disabled:cursor-not-allowed disabled:opacity-55"
                >
                  <span>Send message</span>
                  <span aria-hidden="true">→</span>
                </button>

                <p className="text-[11px] text-[#796985]">
                  We usually reply within one business day.
                </p>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
