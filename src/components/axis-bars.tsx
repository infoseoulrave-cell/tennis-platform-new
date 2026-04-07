import { type Scores, AXIS_LABELS } from "./radar-chart";

const AXES: (keyof Scores)[] = ["power", "control", "spin", "comfort", "stability"];

function scoreToPercent(score: number): number {
  return ((score + 5) / 10) * 100;
}

function scoreColor(score: number): string {
  if (score >= 3) return "#111";
  if (score >= 0) return "#111";
  return "#9ca3af";
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
        return (
          <div key={axis}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-[var(--color-text-secondary)]">{AXIS_LABELS[axis]}</span>
              <span className="text-sm font-semibold" style={{ color: scoreColor(score) }}>
                {sign}{score}
              </span>
            </div>
            <div className="h-1.5 bg-[#f0f0f0] rounded-full">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  backgroundColor: scoreColor(score),
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
