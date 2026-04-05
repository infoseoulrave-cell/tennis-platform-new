"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { RadarChart } from "@/components/radar-chart";
import { trackEvent } from "@/lib/track-event";

// ---------- types ----------

type AxisScores = Record<string, number>;

type CompareRacket = {
  recommendationResultId: string;
  racketModelId: string;
  name: string | null;
  nameKo: string | null;
  segment: string | null;
  imageUrl: string | null;
  brand: { name: string; nameKo: string | null } | null;
  specs: {
    headSizeSqIn: number | null;
    weightG: number | null;
    balanceMm: number | null;
    swingWeightKgCm2: number | null;
    stiffnessRa: number | null;
    stringPattern: string | null;
    composition: string | null;
  } | null;
  retailPriceKrw: number | null;
  recommendation: {
    rank: number;
    tier: string;
    totalScore: number;
    axisScores: AxisScores;
    explanationFragments: unknown;
    confidence: { level: string; reasonKo: string | null };
  };
};

type Verdict = {
  axisKey: string;
  winnerRacketModelId: string;
  winnerName: string | null;
  scores: Array<{ racketModelId: string; score: number }>;
};

type KeyDifference = {
  racketModelId: string;
  name: string | null;
  totalScore: number;
  rank: number;
  strengthAxisKey: string | null;
  summaryLine: string;
};

type CompareData = {
  rackets: CompareRacket[];
  playerPriorities: { first: string | null; second: string | null };
  verdicts: Verdict[];
  keyDifferences: KeyDifference[];
};

const AXIS_LABELS: Record<string, string> = {
  power: "파워",
  control: "컨트롤",
  spin: "스핀",
  comfort: "편안함",
  stability: "안정성",
};

const AXES = ["power", "control", "spin", "comfort", "stability"];

const TIER_EMOJI: Record<string, string> = {
  best_fit: "🏆",
  safe_alternative: "💚",
  adventurous_choice: "🔥",
};

// ---------- component ----------

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
        </main>
      }
    >
      <CompareContent />
    </Suspense>
  );
}

function CompareContent() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("ids");

  const [data, setData] = useState<CompareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!idsParam) {
      setError("비교할 추천 결과가 없습니다");
      setLoading(false);
      return;
    }

    async function fetchCompare() {
      try {
        const res = await fetch(
          `/api/recommendations/compare?ids=${encodeURIComponent(idsParam!)}`,
        );
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? `서버 오류 (${res.status})`);
        }
        const result = await res.json();
        setData(result);

        trackEvent("compare_view", {
          racketModelIds: result.rackets.map(
            (r: CompareRacket) => r.racketModelId,
          ),
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "비교 데이터를 불러오지 못했습니다",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchCompare();
  }, [idsParam]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-3 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">비교 데이터 로딩 중...</p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="text-sm text-gray-600 mb-4">
            {error ?? "데이터를 불러올 수 없습니다"}
          </p>
          <Link
            href="/diagnosis"
            className="text-sm text-blue-600 font-medium hover:underline"
          >
            진단 다시 하기 →
          </Link>
        </div>
      </main>
    );
  }

  const rackets = data.rackets;

  return (
    <main className="min-h-screen bg-white pb-32">
      {/* Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-100 px-6 py-3 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className="text-sm text-gray-600"
          >
            ← 추천 결과
          </button>
          <h1 className="text-sm font-semibold">라켓 비교</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="px-6 pt-6">
        <div className="max-w-lg mx-auto">
          {/* Racket headers */}
          <div
            className="grid gap-2 mb-6"
            style={{
              gridTemplateColumns: `repeat(${rackets.length}, minmax(0, 1fr))`,
            }}
          >
            {rackets.map((r) => (
              <div key={r.recommendationResultId} className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-xl mx-auto flex items-center justify-center text-xl mb-2">
                  {TIER_EMOJI[r.recommendation.tier] ?? "🎾"}
                </div>
                <div className="text-xs text-gray-400">
                  {r.brand?.nameKo ?? r.brand?.name}
                </div>
                <div className="text-sm font-semibold text-gray-800 leading-tight">
                  {r.nameKo ?? r.name}
                </div>
                <div className="text-xs font-bold text-blue-600 mt-1">
                  {Math.round(r.recommendation.totalScore)}점
                </div>
              </div>
            ))}
          </div>

          {/* 5-axis comparison */}
          <section className="mb-8">
            <h3 className="text-base font-bold mb-4">5축 비교</h3>
            <div className="space-y-3">
              {AXES.map((axis) => (
                <div key={axis}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">
                      {AXIS_LABELS[axis] ?? axis}
                    </span>
                  </div>
                  <div
                    className="grid gap-2"
                    style={{
                      gridTemplateColumns: `repeat(${rackets.length}, minmax(0, 1fr))`,
                    }}
                  >
                    {rackets.map((r) => {
                      const val = r.recommendation.axisScores[axis] ?? 0;
                      const maxVal = Math.max(
                        ...rackets.map(
                          (x) => x.recommendation.axisScores[axis] ?? 0,
                        ),
                      );
                      const isMax = val === maxVal;
                      return (
                        <div
                          key={r.recommendationResultId}
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
                            {Math.round(val)}
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
              {data.keyDifferences.map((kd) => (
                <div
                  key={kd.racketModelId}
                  className="flex items-start gap-2 text-sm"
                >
                  <span className="shrink-0">
                    {TIER_EMOJI[
                      rackets.find((r) => r.racketModelId === kd.racketModelId)
                        ?.recommendation.tier ?? ""
                    ] ?? "•"}
                  </span>
                  <div>
                    <span className="font-medium text-gray-800">
                      {kd.name}:
                    </span>{" "}
                    <span className="text-gray-600">{kd.summaryLine}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Priority verdicts */}
          {data.verdicts.length > 0 && (
            <section className="mb-8 bg-blue-50 rounded-2xl p-5">
              <h3 className="text-base font-bold mb-3 text-blue-900">
                나의 우선순위 기준
              </h3>
              {data.verdicts.map((v, idx) => (
                <div
                  key={v.axisKey}
                  className="flex items-center gap-2 text-sm mb-2"
                >
                  <span className="font-semibold text-blue-800">
                    {idx + 1}순위 {AXIS_LABELS[v.axisKey] ?? v.axisKey}
                  </span>
                  <span className="text-blue-600">→</span>
                  <span className="font-bold text-blue-900">
                    {v.winnerName} 승
                  </span>
                  <span className="text-blue-400 text-xs">
                    (
                    {Math.round(
                      v.scores.find(
                        (s) => s.racketModelId === v.winnerRacketModelId,
                      )?.score ?? 0,
                    )}
                    )
                  </span>
                </div>
              ))}
            </section>
          )}

          {/* Specs table */}
          <section className="mb-8">
            <h3 className="text-base font-bold mb-3">사양 비교</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-gray-400 font-normal">
                      항목
                    </th>
                    {rackets.map((r) => (
                      <th
                        key={r.recommendationResultId}
                        className="text-center py-2 text-gray-600 font-medium"
                      >
                        {(r.nameKo ?? r.name ?? "").split(" ")[0]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-b border-gray-50">
                    <td className="py-2 text-gray-400">헤드</td>
                    {rackets.map((r) => (
                      <td
                        key={r.recommendationResultId}
                        className="text-center py-2"
                      >
                        {r.specs?.headSizeSqIn ?? "—"}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-50">
                    <td className="py-2 text-gray-400">무게</td>
                    {rackets.map((r) => (
                      <td
                        key={r.recommendationResultId}
                        className="text-center py-2"
                      >
                        {r.specs?.weightG ? `${r.specs.weightG}g` : "—"}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-50">
                    <td className="py-2 text-gray-400">밸런스</td>
                    {rackets.map((r) => (
                      <td
                        key={r.recommendationResultId}
                        className="text-center py-2"
                      >
                        {r.specs?.balanceMm ? `${r.specs.balanceMm}mm` : "—"}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-50">
                    <td className="py-2 text-gray-400">강성</td>
                    {rackets.map((r) => (
                      <td
                        key={r.recommendationResultId}
                        className="text-center py-2"
                      >
                        {r.specs?.stiffnessRa ?? "—"}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-50">
                    <td className="py-2 text-gray-400">스트링 패턴</td>
                    {rackets.map((r) => (
                      <td
                        key={r.recommendationResultId}
                        className="text-center py-2"
                      >
                        {r.specs?.stringPattern ?? "—"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-400">가격</td>
                    {rackets.map((r) => (
                      <td
                        key={r.recommendationResultId}
                        className="text-center py-2"
                      >
                        {r.retailPriceKrw
                          ? `₩${r.retailPriceKrw.toLocaleString()}`
                          : "—"}
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
