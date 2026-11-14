import React from "react";

interface SirBotMarkProps {
  className?: string;
  alt?: string;
}

/**
 * Renders the Interview ni Lods / Sir Bot speech-bubble crown emblem using the exact
 * Figma four-layer crop so edge density and alpha match the design 1:1.
 */
export function SirBotMark({ className = "h-[60px] w-[54px]", alt = "Interview ni Lods logo" }: SirBotMarkProps) {
  return (
    <div className={`relative overflow-hidden ${className}`} role="img" aria-label={alt}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {[0, 1, 2, 3].map((layer) => (
          <div key={layer} className="absolute inset-0 overflow-hidden">
            <img
              alt=""
              src="/assets/sir-bot-logo.png"
              className="absolute left-[-15.02%] top-[-11.66%] h-[120.63%] w-[132.51%] max-w-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

