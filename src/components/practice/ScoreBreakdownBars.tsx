import React from "react";
import type { RubricScores } from "./practice-config";

interface ScoreBreakdownBarsProps {
  breakdown: RubricScores;
  trackColorClass?: string;
  fillColorClass?: string;
  impactFillColorClass?: string;
  labelColorClass?: string;
  valueColorClass?: string;
  rowSpacingClass?: string;
}

const RUBRIC_ROWS: ReadonlyArray<{ key: keyof RubricScores; label: string }> = [
  { key: "clarity", label: "Clarity" },
  { key: "structure", label: "Structure" },
  { key: "relevance", label: "Relevance" },
  { key: "impact", label: "Impact" },
];

/**
 * Shared rubric breakdown bars used across the Live score preview drawer (03)
 * and the Final interview results card (04).
 */
export function ScoreBreakdownBars({
  breakdown,
  trackColorClass = "bg-[#ede6f3]",
  fillColorClass = "bg-[#ac8dcf]",
  impactFillColorClass = "bg-[#bba2d1]",
  labelColorClass = "text-[#72617f]",
  valueColorClass = "text-[#685075]",
  rowSpacingClass = "space-y-[14px]",
}: ScoreBreakdownBarsProps) {
  return (
    <div className={rowSpacingClass}>
      {RUBRIC_ROWS.map((item) => {
        const score = breakdown[item.key];
        const percentage = Math.min(100, Math.max(0, (score / 10) * 100));
        const fillClass = item.key === "impact" ? impactFillColorClass : fillColorClass;

        return (
          <div key={item.key} className="space-y-[6px]">
            <div className="flex items-center justify-between text-[12px] leading-[1.5]">
              <span className={labelColorClass}>{item.label}</span>
              <span className={`font-medium tabular-nums ${valueColorClass}`}>
                {score.toFixed(1)}
              </span>
            </div>
            <div
              className={`h-[4px] w-full overflow-hidden rounded-[2px] ${trackColorClass}`}
              role="progressbar"
              aria-label={item.label}
              aria-valuenow={score}
              aria-valuemin={0}
              aria-valuemax={10}
            >
              <div
                className={`h-full rounded-[2px] transition-[width] duration-500 ease-out motion-reduce:transition-none ${fillClass}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
