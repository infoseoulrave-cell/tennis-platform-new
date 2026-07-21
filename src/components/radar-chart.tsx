import { clampPublicScore, formatPublicScore } from "@/lib/score-display";

export type Scores = {
  power: number;
  control: number;
  spin: number;
  comfort: number;
  stability: number;
};

export const AXIS_LABELS: Record<keyof Scores, string> = {
  power: "파워",
  control: "컨트롤",
  spin: "스핀",
  comfort: "편안함",
  stability: "안정성",
};

const AXES: (keyof Scores)[] = ["power", "control", "spin", "comfort", "stability"];

const ACTIVE_COLOR = "#C4E538";
const GRID_COLOR = "#E2E2D8";
const LABEL_COLOR = "#525252";

function scoreToFraction(score: number): number {
  return (clampPublicScore(score) + 5) / 10;
}

function getPoint(cx: number, cy: number, r: number, index: number, fraction: number) {
  const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
  const dist = fraction * r;
  return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
}

function polygon(scores: Scores, cx: number, cy: number, r: number): string {
  return AXES.map((axis, i) => {
    const p = getPoint(cx, cy, r, i, scoreToFraction(scores[axis]));
    return `${p.x},${p.y}`;
  }).join(" ");
}

export function RadarChart({
  scores,
  compareScores,
  series,
  showValues = true,
  size = 220,
  className = "",
  color = ACTIVE_COLOR,
  compareColor = "#9ca3af",
}: {
  scores: Scores;
  compareScores?: Scores;
  series?: Array<{ id: string; scores: Scores; color: string; dashed?: boolean }>;
  showValues?: boolean;
  size?: number;
  className?: string;
  color?: string;
  compareColor?: string;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;

  const gridLevels = [0, 0.5, 1];
  const chartSeries = series ?? [
    ...(compareScores
      ? [{ id: "compare", scores: compareScores, color: compareColor, dashed: true }]
      : []),
    { id: "primary", scores, color, dashed: false },
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
    >
      {/* Grid rings */}
      {gridLevels.map((level, li) => (
        <polygon
          key={level}
          data-radar-grid={level}
          points={AXES.map((_, i) => {
            const p = getPoint(cx, cy, r, i, level === 0 ? 0.001 : level);
            return `${p.x},${p.y}`;
          }).join(" ")}
          fill="none"
          stroke={GRID_COLOR}
          strokeWidth={li === gridLevels.length - 1 ? 1 : 0.5}
          strokeDasharray={li === 1 ? "3,3" : undefined}
        />
      ))}

      {/* Axis lines */}
      {AXES.map((_, i) => {
        const p = getPoint(cx, cy, r, i, 1);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={GRID_COLOR} strokeWidth={0.5} />;
      })}

      {chartSeries.map((item) => (
        <g key={item.id} data-radar-series={item.id}>
          <polygon
            points={polygon(item.scores, cx, cy, r)}
            fill={item.color}
            fillOpacity={0.14}
            stroke={item.color}
            strokeWidth={item.dashed ? 1.5 : 2}
            strokeDasharray={item.dashed ? "4 2" : undefined}
          />
          {AXES.map((axis, i) => {
            const p = getPoint(cx, cy, r, i, scoreToFraction(item.scores[axis]));
            return <circle key={axis} cx={p.x} cy={p.y} r={2.5} fill={item.color} />;
          })}
        </g>
      ))}

      {/* Axis labels + score */}
      {AXES.map((axis, i) => {
        const labelR = r + 18;
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const lx = cx + labelR * Math.cos(angle);
        const ly = cy + labelR * Math.sin(angle);
        const score = scores[axis];
        const scoreColor = score > 0 ? color : "#aaaaaa";

        return (
          <g key={i} data-radar-label={axis}>
            <text
              x={lx}
              y={ly - 6}
              textAnchor="middle"
              className="text-[10px] fill-[#5A5A4A]"
              dominantBaseline="middle"
              style={{ fill: LABEL_COLOR, fontSize: 10 }}
            >
              {AXIS_LABELS[axis]}
            </text>
            {showValues && (
              <text
                x={lx}
                y={ly + 7}
                textAnchor="middle"
                className="text-[10px] font-bold"
                dominantBaseline="middle"
                style={{ fill: scoreColor, fontSize: 10, fontWeight: "bold" }}
              >
                {formatPublicScore(score)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
