import Link from "next/link";
import { RadarChart } from "@/components/radar-chart";
import {
  MOCK_RECOMMENDATIONS,
  MOCK_PROFILE,
  AXIS_LABELS,
  type AxisScores,
} from "@/lib/mock-data";

const AXES: (keyof AxisScores)[] = [
  "power",
  "control",
  "spin",
  "comfort",
  "stability",
];

export default function ComparePage() {
  const recs = MOCK_RECOMMENDATIONS;
  const priorityLabels: Record<string, keyof AxisScores> = {
    컨트롤: "control",
    파워: "power",
    스핀: "spin",
    "편안함 (팔 보호)": "comfort",
    편안함: "comfort",
    "안정성 (미스 허용)": "stability",
    안정성: "stability",
  };

  return (
    <main className="min-h-screen bg-white pb-32">
      {/* Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-100 px-6 py-3 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link href="/results" className="text-sm text-gray-600">
            ← 추천 결과
          </Link>
          <h1 className="text-sm font-semibold">라켓 비교</h1>
          <button type="button" className="text-sm text-blue-600">
            편집
          </button>
        </div>
      </header>

      <div className="px-6 pt-6">
        <div className="max-w-lg mx-auto">
          {/* Racket headers */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {recs.map((rec) => (
              <div key={rec.racket.id} className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-xl mx-auto flex items-center justify-center text-xl mb-2">
                  🎾
                </div>
                <div className="text-xs text-gray-400">{rec.racket.brand}</div>
                <div className="text-sm font-semibold text-gray-800 leading-tight">
                  {rec.racket.model}
                </div>
                <div className="text-xs font-bold text-blue-600 mt-1">
                  {rec.matchPercent}%
                </div>
              </div>
            ))}
          </div>

          {/* Comparison table */}
          <section className="mb-8">
            <h3 className="text-base font-bold mb-4">5축 비교</h3>

            {/* Table */}
            <div className="space-y-3">
              {AXES.map((axis) => (
                <div key={axis}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">
                      {AXIS_LABELS[axis]}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {recs.map((rec) => {
                      const val = rec.racket.scores[axis];
                      const isMax = Math.max(
                        ...recs.map((r) => r.racket.scores[axis]),
                      ) === val;
                      return (
                        <div
                          key={rec.racket.id}
                          className="text-center"
                        >
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
                            <div
                              className={`h-full rounded-full ${isMax ? "bg-blue-500" : "bg-gray-300"}`}
                              style={{ width: `${val}%` }}
                            />
                          </div>
                          <span
                            className={`text-xs font-medium ${isMax ? "text-blue-600" : "text-gray-500"}`}
                          >
                            {val}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Key differences */}
          <section className="mb-8">
            <h3 className="text-base font-bold mb-3">핵심 차이</h3>
            <div className="space-y-2">
              {recs.map((rec) => (
                <div
                  key={rec.racket.id}
                  className="flex items-start gap-2 text-sm"
                >
                  <span className="shrink-0">{rec.tierEmoji}</span>
                  <div>
                    <span className="font-medium text-gray-800">
                      {rec.racket.model}:
                    </span>{" "}
                    <span className="text-gray-600">{rec.fitSummary}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Priority verdict */}
          <section className="mb-8 bg-blue-50 rounded-2xl p-5">
            <h3 className="text-base font-bold mb-3 text-blue-900">
              나의 우선순위 기준
            </h3>
            {MOCK_PROFILE.priorities.map((priority, idx) => {
              const axisKey = priorityLabels[priority];
              if (!axisKey) return null;
              const scores = recs.map((r) => ({
                name: r.racket.model,
                score: r.racket.scores[axisKey],
              }));
              const winner = scores.reduce((a, b) =>
                a.score >= b.score ? a : b,
              );
              return (
                <div
                  key={priority}
                  className="flex items-center gap-2 text-sm mb-2"
                >
                  <span className="font-semibold text-blue-800">
                    {idx + 1}순위 {priority}
                  </span>
                  <span className="text-blue-600">→</span>
                  <span className="font-bold text-blue-900">
                    {winner.name} 승
                  </span>
                  <span className="text-blue-400 text-xs">
                    ({winner.score})
                  </span>
                </div>
              );
            })}
          </section>

          {/* Specs comparison */}
          <section className="mb-8">
            <h3 className="text-base font-bold mb-3">사양 비교</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-gray-400 font-normal">
                      항목
                    </th>
                    {recs.map((rec) => (
                      <th
                        key={rec.racket.id}
                        className="text-center py-2 text-gray-600 font-medium"
                      >
                        {rec.racket.model.split(" ")[0]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-b border-gray-50">
                    <td className="py-2 text-gray-400">헤드</td>
                    {recs.map((r) => (
                      <td key={r.racket.id} className="text-center py-2">
                        {r.racket.headSize}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-50">
                    <td className="py-2 text-gray-400">무게</td>
                    {recs.map((r) => (
                      <td key={r.racket.id} className="text-center py-2">
                        {r.racket.weight}g
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-50">
                    <td className="py-2 text-gray-400">밸런스</td>
                    {recs.map((r) => (
                      <td key={r.racket.id} className="text-center py-2">
                        {r.racket.balance}mm
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-50">
                    <td className="py-2 text-gray-400">강성</td>
                    {recs.map((r) => (
                      <td key={r.racket.id} className="text-center py-2">
                        {r.racket.stiffness}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-400">가격</td>
                    {recs.map((r) => (
                      <td key={r.racket.id} className="text-center py-2">
                        ₩{r.racket.priceKrw.toLocaleString()}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 px-6 py-4 safe-bottom">
        <div className="max-w-lg mx-auto">
          <Link
            href="/partners"
            className="flex items-center justify-center w-full py-3 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            📍 이 라켓 시타해보기
          </Link>
        </div>
      </div>
    </main>
  );
}
