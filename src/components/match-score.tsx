type MatchScoreProps = {
  score: number;
  size?: "sm" | "md";
};

export function MatchScore({ score, size = "sm" }: MatchScoreProps) {
  const boundedScore = Math.max(0, Math.min(100, score));
  const dims = size === "sm" ? 64 : 96;
  const strokeWidth = size === "sm" ? 5 : 6;
  const r = (dims - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (boundedScore / 100) * circumference;

  const fontSize = size === "sm" ? "text-sm" : "text-xl";
  const labelSize = size === "sm" ? "text-[9px]" : "text-xs";

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="relative" style={{ width: dims, height: dims }}>
        <svg
          width={dims}
          height={dims}
          viewBox={`0 0 ${dims} ${dims}`}
          className="transform -rotate-90"
        >
          <circle
            cx={dims / 2}
            cy={dims / 2}
            r={r}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={dims / 2}
            cy={dims / 2}
            r={r}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${fontSize} font-bold text-gray-900`}>
            {Math.round(boundedScore)}
          </span>
        </div>
      </div>
      <span className={`${labelSize} font-medium text-gray-500`}>
        상대 적합 점수
      </span>
    </div>
  );
}
