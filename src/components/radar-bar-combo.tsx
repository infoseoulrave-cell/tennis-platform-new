import { type Scores } from "./radar-chart";
import { RadarChart } from "./radar-chart";
import { AxisBars } from "./axis-bars";

export function RadarBarCombo({
  scores,
  className = "",
}: {
  scores: Scores;
  className?: string;
}) {
  return (
    <div className={`flex flex-col sm:flex-row items-center sm:items-start gap-6 ${className}`}>
      <RadarChart scores={scores} size={140} className="shrink-0" />
      <AxisBars scores={scores} className="flex-1 w-full" />
    </div>
  );
}
