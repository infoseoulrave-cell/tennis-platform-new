import Link from "next/link";
import { RadarChart } from "@/components/radar-chart";
import { AxisBar } from "@/components/axis-bar";
import { TrustBadge } from "@/components/trust-badge";
import {
  MOCK_RECOMMENDATIONS,
  MOCK_CURRENT_RACKET,
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

export default async function RacketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rec = MOCK_RECOMMENDATIONS.find((r) => r.racket.id === id);
  if (!rec) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">라켓을 찾을 수 없습니다</p>
      </main>
    );
  }

  const { racket } = rec;
  const current = MOCK_CURRENT_RACKET;

  return (
    <main className="min-h-screen bg-white pb-32">
      {/* Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-100 px-6 py-3 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link href="/results" className="text-sm text-gray-600">
            ← 추천 결과
          </Link>
          <h1 className="text-sm font-semibold">{racket.model}</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="px-6 pt-6">
        <div className="max-w-lg mx-auto">
          {/* Hero */}
          <div className="text-center mb-6">
            <div className="w-24 h-24 bg-gray-100 rounded-2xl mx-auto flex items-center justify-center text-4xl mb-4">
              🎾
            </div>
            <div className="text-sm text-gray-400">{racket.brand}</div>
            <h2 className="text-2xl font-bold text-gray-900">{racket.model}</h2>
            <div className="flex justify-center gap-2 mt-3">
              <span className="text-sm font-bold text-blue-600">
                {rec.tierEmoji} {rec.tierLabel} · 매칭도 {rec.matchPercent}%
              </span>
            </div>
            <TrustBadge variant={`confidence-${rec.confidence}`} />
          </div>

          {/* Why this racket */}
          <section className="mb-8">
            <h3 className="text-base font-bold mb-3 text-gray-900">
              왜 이 라켓인가요?
            </h3>
            <div className="space-y-2">
              {rec.reasons.map((r) => (
                <div key={r} className="flex items-start gap-2 text-sm">
                  <span className="text-green-500 shrink-0 mt-0.5">✅</span>
                  <span className="text-gray-700">{r}</span>
                </div>
              ))}
              {rec.tradeoffs.map((t) => (
                <div key={t} className="flex items-start gap-2 text-sm">
                  <span className="text-yellow-500 shrink-0 mt-0.5">⚠️</span>
                  <span className="text-gray-500">{t}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 5-axis radar */}
          <section className="mb-8">
            <h3 className="text-base font-bold mb-3 text-gray-900">
              5축 해석
            </h3>
            <div className="flex justify-center mb-4">
              <RadarChart
                scores={racket.scores}
                compareScores={current.scores}
                size={220}
              />
            </div>
            <div className="flex justify-center gap-6 text-xs text-gray-400 mb-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-blue-500 rounded inline-block" />
                {racket.model}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-gray-400 rounded inline-block border-dashed" />
                {current.model} (현재)
              </span>
            </div>
            <div className="space-y-2.5">
              {AXES.map((axis) => (
                <AxisBar
                  key={axis}
                  axis={axis}
                  value={racket.scores[axis]}
                  delta={racket.scores[axis] - current.scores[axis]}
                />
              ))}
            </div>
          </section>

          {/* Current racket comparison delta */}
          <section className="mb-8 bg-gray-50 rounded-2xl p-5">
            <h3 className="text-base font-bold mb-3 text-gray-900">
              현재 라켓과 비교
            </h3>
            <div className="text-sm text-gray-500 mb-3">
              {current.brand} {current.model} 대비 변화
            </div>
            <div className="grid grid-cols-2 gap-3">
              {AXES.map((axis) => {
                const delta = racket.scores[axis] - current.scores[axis];
                return (
                  <div key={axis} className="text-sm">
                    <span className="text-gray-600">
                      {AXIS_LABELS[axis]}
                    </span>{" "}
                    <span
                      className={`font-semibold ${delta > 0 ? "text-green-600" : delta < 0 ? "text-red-500" : "text-gray-400"}`}
                    >
                      {delta > 0 ? `+${delta} ↑` : delta < 0 ? `${delta} ↓` : "±0"}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* For whom / Not for whom */}
          <section className="mb-8">
            <h3 className="text-base font-bold mb-3 text-gray-900">
              이런 분에게 추천
            </h3>
            <div className="space-y-1.5 mb-4">
              {rec.forWhom.map((f) => (
                <div key={f} className="flex items-start gap-2 text-sm">
                  <span className="text-blue-500 shrink-0">•</span>
                  <span className="text-gray-700">{f}</span>
                </div>
              ))}
            </div>
            <h3 className="text-base font-bold mb-3 text-gray-900">
              이런 분은 다른 선택을
            </h3>
            <div className="space-y-1.5">
              {rec.notForWhom.map((n) => (
                <div key={n} className="flex items-start gap-2 text-sm">
                  <span className="text-gray-400 shrink-0">•</span>
                  <span className="text-gray-500">{n}</span>
                </div>
              ))}
            </div>
          </section>

          {/* String + grip suggestion */}
          <section className="mb-8 border border-gray-200 rounded-2xl p-5">
            <h3 className="text-base font-bold mb-3 text-gray-900">
              연계 추천
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-lg">🔧</span>
                <div>
                  <div className="text-sm font-medium text-gray-800">
                    추천 스트링: {rec.suggestedString}
                  </div>
                  <div className="text-xs text-gray-500">
                    장력 {rec.suggestedStringTension} 추천
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">🤝</span>
                <div>
                  <div className="text-sm font-medium text-gray-800">
                    추천 그립: Wilson Pro Overgrip
                  </div>
                  <div className="text-xs text-gray-500">
                    컨트롤 세팅에 맞는 얇은 그립
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Specs */}
          <section className="mb-8">
            <h3 className="text-base font-bold mb-3 text-gray-900">
              기본 사양
            </h3>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
              <div>
                <span className="text-gray-400">헤드 사이즈</span>{" "}
                <span className="font-medium">{racket.headSize} sq in</span>
              </div>
              <div>
                <span className="text-gray-400">무게</span>{" "}
                <span className="font-medium">{racket.weight}g</span>
              </div>
              <div>
                <span className="text-gray-400">밸런스</span>{" "}
                <span className="font-medium">{racket.balance}mm</span>
              </div>
              <div>
                <span className="text-gray-400">강성</span>{" "}
                <span className="font-medium">{racket.stiffness} RA</span>
              </div>
              <div>
                <span className="text-gray-400">스트링 패턴</span>{" "}
                <span className="font-medium">{racket.stringPattern}</span>
              </div>
              <div>
                <span className="text-gray-400">가격</span>{" "}
                <span className="font-medium">
                  ₩{racket.priceKrw.toLocaleString()}
                </span>
              </div>
            </div>
          </section>

          {/* Confidence */}
          <section className="mb-8 text-center">
            <h3 className="text-sm font-bold text-gray-700 mb-2">
              매칭 신뢰도
            </h3>
            <TrustBadge variant={`confidence-${rec.confidence}`} />
            <p className="text-xs text-gray-400 mt-2">
              진단 답변과 데이터 커버리지 모두 충분합니다
            </p>
          </section>

          {/* Neutrality footer */}
          <div className="text-center border-t border-gray-100 pt-6">
            <p className="text-xs text-gray-400">
              ℹ️ 추천은 광고나 유료 배치 없이 진단 결과만으로 생성됩니다
            </p>
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 px-6 py-4 safe-bottom">
        <div className="max-w-lg mx-auto flex gap-2">
          <Link
            href="/partners"
            className="flex-1 py-3 text-center text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            📍 매장에서 시타 예약
          </Link>
          <Link
            href="/compare"
            className="py-3 px-4 text-center text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            📊 비교
          </Link>
        </div>
      </div>
    </main>
  );
}
