import Link from "next/link";
import { RadarChart } from "@/components/radar-chart";
import { TrustBadge } from "@/components/trust-badge";
import {
  MOCK_RECOMMENDATIONS,
  MOCK_PROFILE,
  AXIS_LABELS,
  type AxisScores,
} from "@/lib/mock-data";

function RecommendationCard({
  rec,
  rank,
}: {
  rec: (typeof MOCK_RECOMMENDATIONS)[0];
  rank: number;
}) {
  const tierColors = {
    "best-fit": "border-blue-200 bg-blue-50/30",
    "safe-alternative": "border-green-200 bg-green-50/30",
    "challenge-pick": "border-orange-200 bg-orange-50/30",
  };

  return (
    <div
      className={`border rounded-2xl p-5 ${tierColors[rec.tier]} transition-all`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold">
          {rec.tierEmoji} {rec.tierLabel}
        </span>
        <span className="text-sm font-bold text-blue-600">
          매칭도 {rec.matchPercent}%
        </span>
      </div>

      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
          🎾
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-400">{rec.racket.brand}</div>
          <h3 className="font-bold text-base text-gray-900">
            {rec.racket.model}
          </h3>
          <p className="text-sm text-gray-600 mt-1 leading-snug">
            &quot;{rec.fitSummary}&quot;
          </p>
        </div>
      </div>

      <div className="mt-4">
        <RadarChart scores={rec.racket.scores} size={180} />
      </div>

      <div className="mt-3 space-y-1.5">
        {rec.reasons.map((r) => (
          <div key={r} className="flex items-start gap-2 text-sm">
            <span className="text-green-500 shrink-0">✅</span>
            <span className="text-gray-700">{r}</span>
          </div>
        ))}
        {rec.tradeoffs.map((t) => (
          <div key={t} className="flex items-start gap-2 text-sm">
            <span className="text-yellow-500 shrink-0">⚠️</span>
            <span className="text-gray-500">{t}</span>
          </div>
        ))}
      </div>

      <TrustBadge variant={`confidence-${rec.confidence}`} />

      <div className="mt-4 flex gap-2">
        <Link
          href={`/racket/${rec.racket.id}`}
          className="flex-1 py-2.5 text-center text-sm font-medium text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors"
        >
          자세히 보기
        </Link>
        <Link
          href={`/compare?ids=${rec.racket.id}`}
          className="flex-1 py-2.5 text-center text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          비교하기
        </Link>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <main className="min-h-screen bg-white pb-32">
      {/* Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-100 px-6 py-3 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link href="/diagnosis" className="text-sm text-gray-600">
            ← 다시 진단
          </Link>
          <h1 className="text-sm font-semibold">추천 결과</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="px-6 pt-6">
        <div className="max-w-lg mx-auto">
          {/* Player summary */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">
              나의 진단 프로필
            </h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-500">
                현재 라켓:{" "}
                <span className="text-gray-800 font-medium">
                  {MOCK_PROFILE.currentRacket}
                </span>
              </div>
              <div className="text-gray-500">
                경력:{" "}
                <span className="text-gray-800 font-medium">
                  {MOCK_PROFILE.experience}
                </span>
              </div>
              <div className="text-gray-500">
                빈도:{" "}
                <span className="text-gray-800 font-medium">
                  {MOCK_PROFILE.frequency}
                </span>
              </div>
              <div className="text-gray-500">
                스타일:{" "}
                <span className="text-gray-800 font-medium">
                  {MOCK_PROFILE.playStyle}
                </span>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              우선순위:{" "}
              <span className="text-gray-800 font-medium">
                {MOCK_PROFILE.priorities.join(" > ")}
              </span>
            </div>
          </div>

          {/* Recommendations */}
          <div className="space-y-4">
            {MOCK_RECOMMENDATIONS.map((rec, i) => (
              <RecommendationCard key={rec.racket.id} rec={rec} rank={i + 1} />
            ))}
          </div>

          {/* Next steps */}
          <div className="mt-8 space-y-3">
            <h3 className="text-base font-bold">다음 단계</h3>
            <Link
              href="/partners"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <span className="text-lg">📍</span>
              <div>
                <div className="text-sm font-semibold text-gray-800">
                  가까운 매장에서 시타해보기
                </div>
                <div className="text-xs text-gray-500">
                  추천 라켓을 직접 쳐볼 수 있는 매장
                </div>
              </div>
              <span className="ml-auto text-gray-400">→</span>
            </Link>
            <button
              type="button"
              className="flex items-center gap-3 w-full p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-left"
            >
              <span className="text-lg">💾</span>
              <div>
                <div className="text-sm font-semibold text-gray-800">
                  내 진단 저장하기
                </div>
                <div className="text-xs text-gray-500">
                  나중에 다시 확인하고 비교할 수 있습니다
                </div>
              </div>
            </button>
          </div>

          {/* Neutrality */}
          <div className="mt-8 text-center">
            <TrustBadge variant="neutrality" />
            <p className="text-xs text-gray-400 mt-2">
              추천은 광고나 유료 배치 없이 진단 결과만으로 생성됩니다
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
