import Link from "next/link";
import { MatchScore } from "./match-score";
import { ExplanationList } from "./explanation-list";
import { TrustBadge } from "./trust-badge";

type ExplanationFragment = {
  type: "positive" | "tradeoff";
  textKo: string;
};

type RecommendationCardProps = {
  tier: "best_fit" | "safe_alternative" | "adventurous_choice";
  racketName: string;
  racketNameKo: string | null;
  imageUrl?: string | null;
  brandName?: string | null;
  summaryKo?: string | null;
  matchScore: number;
  explanationFragments: ExplanationFragment[];
  confidenceLevel: "high" | "medium" | "low";
  recommendationResultId: string;
  compareIds?: string;
};

const TIER_CONFIG = {
  best_fit: {
    emoji: "\uD83C\uDFC6",
    label: "Best Fit",
    border: "border-blue-200",
    bg: "bg-blue-50/30",
    shadow: "shadow-md",
  },
  safe_alternative: {
    emoji: "\uD83D\uDC9A",
    label: "\uC548\uC804\uD55C \uB300\uC548",
    border: "border-green-200",
    bg: "bg-green-50/30",
    shadow: "",
  },
  adventurous_choice: {
    emoji: "\uD83D\uDD25",
    label: "\uB3C4\uC804\uC801 \uC120\uD0DD",
    border: "border-orange-200",
    bg: "bg-orange-50/30",
    shadow: "",
  },
};

const CONFIDENCE_BADGE: Record<string, "confidence-high" | "confidence-medium" | "confidence-exploratory"> = {
  high: "confidence-high",
  medium: "confidence-medium",
  low: "confidence-exploratory",
};

export function RecommendationCard({
  tier,
  racketName,
  racketNameKo,
  imageUrl,
  brandName,
  summaryKo,
  matchScore,
  explanationFragments,
  confidenceLevel,
  recommendationResultId,
  compareIds,
}: RecommendationCardProps) {
  const config = TIER_CONFIG[tier];

  return (
    <div
      className={`border rounded-xl p-5 ${config.border} ${config.bg} ${config.shadow} transition-all`}
    >
      {/* Tier badge + match score */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
            {config.emoji} {config.label}
          </span>
          {brandName && (
            <div className="text-xs text-gray-400 mt-0.5">{brandName}</div>
          )}
          <h3 className="font-bold text-lg text-gray-900 mt-0.5">
            {racketNameKo ?? racketName}
          </h3>
          {racketNameKo && racketNameKo !== racketName && (
            <div className="text-xs text-gray-400">{racketName}</div>
          )}
        </div>
        <MatchScore score={matchScore} size="sm" />
      </div>

      {/* Summary */}
      {summaryKo && (
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          {summaryKo}
        </p>
      )}

      {/* Explanation fragments */}
      <ExplanationList fragments={explanationFragments} />

      {/* Confidence badge */}
      <div className="mt-3">
        <TrustBadge variant={CONFIDENCE_BADGE[confidenceLevel] ?? "confidence-medium"} />
      </div>

      {/* CTA buttons */}
      <div className="mt-4 flex gap-2">
        <Link
          href={`/racket/${recommendationResultId}`}
          className="flex-1 py-3 text-center text-sm font-medium text-white bg-blue-500 rounded-2xl hover:bg-blue-600 active:bg-blue-700 transition-colors min-h-[44px] flex items-center justify-center"
        >
          자세히 보기
        </Link>
        <Link
          href={`/compare?ids=${compareIds ?? recommendationResultId}`}
          className="flex-1 py-3 text-center text-sm font-medium text-gray-600 border border-gray-200 rounded-2xl hover:bg-gray-50 active:bg-gray-100 transition-colors min-h-[44px] flex items-center justify-center"
        >
          비교하기
        </Link>
      </div>
    </div>
  );
}
