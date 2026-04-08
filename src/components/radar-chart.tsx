export type Scores = {
  power: number;
  control: number;
  spin: number;
  comfort: number;
  stability: number;
};

export const AXIS_LABELS: Record<keyof Scores, string> = {
  power: "직구력",
  control: "컨트롤",
  spin: "스핀",
  comfort: "충격흡수",
  stability: "안정감",
};

const AXES: (keyof Scores)[] = ["power", "control", "spin", "comfort", "stability"];

const ACTIVE_COLOR = "#A8D400";
const GRID_COLOR = "#E8E8D8";
const LABEL_COLOR = "#5A5A4A";

function scoreToFraction(score: number): number {
  return (score + 5) / 10;
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
  size = 220,
  className = "",
  color = ACTIVE_COLOR,
  compareColor = "#9ca3af",
}: {
  scores: Scores;
  compareScores?: Scores;
  size?: number;
  className?: string;
  color?: string;
  compareColor?: string;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;

  const gridLevels = [0, 0.5, 1];

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

      {/* Compare polygon */}
      {compareScores && (
        <polygon
          points={polygon(compareScores, cx, cy, r)}
          fill={compareColor}
          fillOpacity={0.1}
          stroke={compareColor}
          strokeWidth={1.5}
          strokeDasharray="4 2"
        />
      )}

      {/* Data polygon */}
      <polygon
        points={polygon(scores, cx, cy, r)}
        fill={color}
        fillOpacity={0.2}
        stroke={color}
        strokeWidth={2}
      />

      {/* Data dots */}
      {AXES.map((axis, i) => {
        const p = getPoint(cx, cy, r, i, scoreToFraction(scores[axis]));
        return <circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />;
      })}

      {/* Axis labels + score */}
      {AXES.map((axis, i) => {
        const labelR = r + 18;
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const lx = cx + labelR * Math.cos(angle);
        const ly = cy + labelR * Math.sin(angle);
        const score = scores[axis];
        const sign = score > 0 ? "+" : "";
        const scoreColor = score > 0 ? color : "#aaaaaa";

        return (
          <g key={i}>
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
            <text
              x={lx}
              y={ly + 7}
              textAnchor="middle"
              className="text-[10px] font-bold"
              dominantBaseline="middle"
              style={{ fill: scoreColor, fontSize: 10, fontWeight: "bold" }}
            >
              {sign}{score.toFixed ? score.toFixed(0) : score}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
