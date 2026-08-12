import { AXIS_LABELS } from "./radar-chart";
import {
  PUBLIC_AXIS_KEYS,
  formatPublicAxisScore,
  publicAxisScoreToPercent,
  type PublicAxisScores5,
} from "@/lib/score-display";

/**
 * 목록 한 줄에 들어가는 5축 요약.
 *
 * 이 사이트를 쇼핑몰과 구분 짓는 건 5축 점수인데, 홈에서는 히어로 구석의
 * 작은 칩 몇 개가 전부였다. 인기 목록에 붙여서 스크롤하는 동안 "여기는
 * 숫자로 설명하는 곳" 이 읽히게 한다.
 *
 * 축 색은 레이더 차트와 같은 라임이다 — 같은 것을 두 가지 색으로 그리면
 * 같은 것으로 안 읽힌다.
 *
 * 점수가 없으면 아무것도 그리지 않는다. 근거 없는 숫자를 만들어 내지
 * 않는 것이 카탈로그 전체의 규칙이다(.impeccable.md 원칙 1·4).
 */
export function MiniAxisBars({
  scores,
  className = "",
}: {
  scores: PublicAxisScores5 | null | undefined;
  className?: string;
}) {
  if (!scores) return null;

  return (
    <div className={`flex items-end gap-1 ${className}`} data-mini-axis-bars="">
      <span className="sr-only">
        {PUBLIC_AXIS_KEYS.map(
          (axis) => `${AXIS_LABELS[axis]} ${formatPublicAxisScore(scores[axis])}`,
        ).join(", ")}
      </span>
      {PUBLIC_AXIS_KEYS.map((axis) => (
        <span
          key={axis}
          aria-hidden="true"
          title={`${AXIS_LABELS[axis]} ${formatPublicAxisScore(scores[axis])}`}
          /* 트랙은 border 색을 쓴다. bg-subtle 은 흰 행 위에서 거의 안 보여
             빈 구간이 "최대치" 가 아니라 여백으로 읽혔고, 1/5 짜리 축은
             막대가 아니라 점처럼 보였다. */
          className="flex h-6 w-1.5 items-end overflow-hidden rounded-full bg-[var(--color-border)]"
        >
          <span
            className="w-full rounded-full bg-[var(--color-accent)]"
            style={{ height: `${publicAxisScoreToPercent(scores[axis])}%` }}
          />
        </span>
      ))}
    </div>
  );
}
