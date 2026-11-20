"use client";

import React, { useCallback, useRef, useState } from "react";

interface ResizeHandleProps {
  /** Label announced to assistive tech, e.g. "Resize sidebar" */
  ariaLabel: string;
  /** Current pane width in pixels */
  value: number;
  min: number;
  max: number;
  defaultValue: number;
  /** Direction of drag that increases width: "right" (left sidebar) or "left" (right drawer) */
  growDirection: "right" | "left";
  onChange: (nextWidth: number) => void;
  className?: string;
}

/**
 * Accessible pointer + keyboard drag handle that makes workspace panes smoothly resizable.
 * Double-click (or press Home) resets cleanly to the default width.
 */
export function ResizeHandle({
  ariaLabel,
  value,
  min,
  max,
  defaultValue,
  growDirection,
  onChange,
  className = "",
}: ResizeHandleProps) {
  const [dragging, setDragging] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(value);

  const clamp = useCallback(
    (next: number) => Math.round(Math.min(max, Math.max(min, next))),
    [min, max]
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    startXRef.current = event.clientX;
    startWidthRef.current = value;
    setDragging(true);

    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);

    const prevCursor = document.body.style.cursor;
    const prevSelect = document.body.style.userSelect;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const onMove = (moveEvent: PointerEvent) => {
      const delta = moveEvent.clientX - startXRef.current;
      const signedDelta = growDirection === "right" ? delta : -delta;
      onChange(clamp(startWidthRef.current + signedDelta));
    };

    const onUp = () => {
      setDragging(false);
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = prevSelect;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 32 : 16;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      onChange(clamp(value + (growDirection === "right" ? step : -step)));
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      onChange(clamp(value + (growDirection === "right" ? -step : step)));
    } else if (event.key === "Home") {
      event.preventDefault();
      onChange(defaultValue);
    }
  };

  return (
    <div
      role="separator"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-orientation="vertical"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      title="Drag to resize · Double-click to reset"
      onPointerDown={handlePointerDown}
      onDoubleClick={() => onChange(defaultValue)}
      onKeyDown={handleKeyDown}
      className={`group relative z-20 hidden w-[6px] shrink-0 cursor-col-resize select-none items-center justify-center focus-visible:outline-none lg:flex ${className}`}
    >
      <span
        aria-hidden="true"
        className={`h-full w-[2px] rounded-full transition-colors duration-150 ${
          dragging
            ? "bg-[#7453a6]"
            : "bg-transparent group-hover:bg-[#c7b8fa] group-focus-visible:bg-[#7453a6]"
        }`}
      />
    </div>
  );
}
