import { RadarChart } from "./radar-chart";
import { AxisBars } from "./axis-bars";
import type { PublicAxisScores5 } from "@/lib/score-display";

export function RadarBarCombo({
  scores,
  className = "",
  dark = false,
}: {
  scores: PublicAxisScores5;
  className?: string;
  dark?: boolean;
}) {
  if (dark) {
    return (
      <div className={`grid md:grid-cols-[280px_1fr] gap-10 items-center ${className}`}>
        <div className="flex justify-center">
          <RadarChart scores={scores} size={240} fillOpacity={0.2} pointRadius={3} />
        </div>
        <AxisBars scores={scores} dark className="w-full" />
      </div>
    );
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center sm:items-start gap-6 ${className}`}>
      <RadarChart scores={scores} size={140} className="shrink-0" />
      <AxisBars scores={scores} className="flex-1 w-full" />
    </div>
  );
}
