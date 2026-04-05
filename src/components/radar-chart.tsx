"use client";

import { type AxisScores, AXIS_LABELS } from "@/lib/mock-data";

type RadarChartProps = {
  scores: AxisScores;
  compareScores?: AxisScores;
  size?: number;
};

const AXES: (keyof AxisScores)[] = [
  "power",
  "control",
  "spin",
  "comfort",
  "stability",
];

export function RadarChart({
  scores,
  compareScores,
  size = 200,
}: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;

  function getPoint(index: number, value: number) {
    const angle = (Math.PI * 2 * index) / AXES.length - Math.PI / 2;
    const dist = (value / 100) * r;
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
  }

  function polygon(axisScores: AxisScores) {
    return AXES.map((a, i) => {
      const p = getPoint(i, axisScores[a]);
      return `${p.x},${p.y}`;
    }).join(" ");
  }

  const gridLevels = [25, 50, 75, 100];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[200px]">
      {gridLevels.map((level) => (
        <polygon
          key={level}
          points={AXES.map((_, i) => {
            const p = getPoint(i, level);
            return `${p.x},${p.y}`;
          }).join(" ")}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
      ))}
      {AXES.map((_, i) => {
        const p = getPoint(i, 100);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        );
      })}
      {compareScores && (
        <polygon
          points={polygon(compareScores)}
          fill="rgba(156,163,175,0.15)"
          stroke="#9ca3af"
          strokeWidth="1.5"
          strokeDasharray="4 2"
        />
      )}
      <polygon
        points={polygon(scores)}
        fill="rgba(59,130,246,0.2)"
        stroke="#3b82f6"
        strokeWidth="2"
      />
      {AXES.map((axis, i) => {
        const p = getPoint(i, 100);
        const labelOffset = 14;
        const angle = (Math.PI * 2 * i) / AXES.length - Math.PI / 2;
        const lx = cx + (r + labelOffset) * Math.cos(angle);
        const ly = cy + (r + labelOffset) * Math.sin(angle);
        return (
          <text
            key={axis}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-gray-600 text-[10px] font-medium"
          >
            {AXIS_LABELS[axis]}
          </text>
        );
      })}
    </svg>
  );
}
