import { type Scores, AXIS_LABELS } from "./radar-chart";
import { formatPublicScore, publicScoreToPercent } from "@/lib/score-display";

const AXES: (keyof Scores)[] = ["power", "control", "spin", "comfort", "stability"];

const ACTIVE_COLOR = "#C4E538";
const NEGATIVE_COLOR = "#E2E2E2";
const TRACK_COLOR = "#E8E8E0";

export function AxisBars({
  scores,
  className = "",
}: {
  scores: Scores;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {AXES.map((axis) => {
        const score = scores[axis];
        const pct = publicScoreToPercent(score);
        const barColor = score >= 0 ? ACTIVE_COLOR : NEGATIVE_COLOR;
        const scoreColor = score > 0 ? "#9BBB30" : "#171717";

        return (
          <div key={axis}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs" style={{ color: "#5A5A4A" }}>
                {AXIS_LABELS[axis]}
              </span>
              <span
                className="w-7 text-xs text-right font-bold tabular-nums"
                style={{ color: scoreColor }}
              >
                {formatPublicScore(score)}
              </span>
            </div>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: TRACK_COLOR }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  backgroundColor: barColor,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
