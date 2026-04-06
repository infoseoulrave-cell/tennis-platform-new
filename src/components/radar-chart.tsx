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

function scoreToFraction(score: number): number {
  // score: -5 to +5 → 0 to 1
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
  size = 160,
  className = "",
  color = "#111",
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

  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={className} style={{ width: size, height: size }}>
      {/* Grid rings */}
      {gridLevels.map((level) => (
        <polygon
          key={level}
          points={AXES.map((_, i) => {
            const p = getPoint(cx, cy, r, i, level);
            return `${p.x},${p.y}`;
          }).join(" ")}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={level === 1 ? 1 : 0.5}
        />
      ))}

      {/* Axis lines */}
      {AXES.map((_, i) => {
        const p = getPoint(cx, cy, r, i, 1);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#f0f0f0" strokeWidth={0.5} />;
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
        fillOpacity={0.06}
        stroke={color}
        strokeWidth={1.5}
      />

      {/* Data dots */}
      {AXES.map((axis, i) => {
        const p = getPoint(cx, cy, r, i, scoreToFraction(scores[axis]));
        return <circle key={i} cx={p.x} cy={p.y} r={2.5} fill={color} />;
      })}

      {/* Labels */}
      {AXES.map((axis, i) => {
        const labelR = r + 16;
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const lx = cx + labelR * Math.cos(angle);
        const ly = cy + labelR * Math.sin(angle);
        return (
          <text
            key={i}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={10}
            fill="#666"
          >
            {AXIS_LABELS[axis]}
          </text>
        );
      })}
    </svg>
  );
}
