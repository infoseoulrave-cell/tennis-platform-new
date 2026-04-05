import { AXIS_LABELS, type AxisScores } from "@/lib/mock-data";

type AxisBarProps = {
  axis: keyof AxisScores;
  value: number;
  delta?: number;
};

export function AxisBar({ axis, value, delta }: AxisBarProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-14 text-sm text-gray-600 shrink-0">
        {AXIS_LABELS[axis]}
      </span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-8 text-sm font-medium text-gray-800 text-right">
        {value}
      </span>
      {delta !== undefined && delta !== 0 && (
        <span
          className={`text-xs font-medium w-10 text-right ${delta > 0 ? "text-green-600" : "text-red-500"}`}
        >
          {delta > 0 ? "+" : ""}
          {delta}
        </span>
      )}
    </div>
  );
}
