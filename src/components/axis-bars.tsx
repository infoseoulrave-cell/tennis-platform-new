import { AXIS_LABELS } from "./radar-chart";
import {
  formatPublicAxisScore,
  PUBLIC_AXIS_KEYS,
  publicAxisScoreToPercent,
  type PublicAxisScores5,
} from "@/lib/score-display";

const ACTIVE_COLOR = "#C4E538";
const TRACK_COLOR = "#E8E8E0";

const DARK_TRACK_COLOR = "rgba(255,255,255,0.1)";

export function AxisBars({
  scores,
  className = "",
  dark = false,
}: {
  scores: PublicAxisScores5;
  className?: string;
  dark?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {PUBLIC_AXIS_KEYS.map((axis) => {
        const score = scores[axis];
        const pct = publicAxisScoreToPercent(score);
        const scoreColor = dark ? ACTIVE_COLOR : "#9BBB30";
        const labelColor = dark ? "rgba(255,255,255,0.6)" : "#5A5A4A";
        const trackColor = dark ? DARK_TRACK_COLOR : TRACK_COLOR;

        return (
          <div key={axis}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs" style={{ color: labelColor }}>
                {AXIS_LABELS[axis]}
              </span>
              <span
                className={`${dark ? "text-sm" : "w-14 text-xs text-right"} font-bold tabular-nums`}
                style={{ color: scoreColor }}
              >
                {formatPublicAxisScore(score)}
              </span>
            </div>
            <div
              className={`flex-1 ${dark ? "h-2" : "h-1.5"} rounded-full overflow-hidden`}
              style={{ backgroundColor: trackColor }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  backgroundColor: ACTIVE_COLOR,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
