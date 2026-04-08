import { type Scores, AXIS_LABELS } from "./radar-chart";

const AXES: (keyof Scores)[] = ["power", "control", "spin", "comfort", "stability"];

const ACTIVE_COLOR = "#A8D400";
const NEGATIVE_COLOR = "#dddddd";
const TRACK_COLOR = "#E8E8D8";

function scoreToPercent(score: number): number {
  return ((score + 5) / 10) * 100;
}

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
        const pct = scoreToPercent(score);
        const sign = score > 0 ? "+" : "";
        const barColor = score >= 0 ? ACTIVE_COLOR : NEGATIVE_COLOR;
        const scoreColor = score > 0 ? ACTIVE_COLOR : "#1a1a1a";

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
                {sign}{typeof score === "number" ? Math.round(score) : score}
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
