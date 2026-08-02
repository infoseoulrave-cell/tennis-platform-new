import { featuredRackets } from "./featured-rackets";
import { players } from "./players";
import { stringProducts } from "./strings";

/**
 * 사이트 전체에 표시하는 "데이터 확인 기준일".
 *
 * 푸터에 날짜를 손으로 적어 두면 데이터를 갱신해도 그대로 남아 실제보다 최신인
 * 것처럼 보인다. 그래서 데이터에서 직접 계산한다.
 *
 * **가장 이른 날짜**를 쓴다. 일부만 최근에 확인했는데 그 날짜를 내걸면 나머지
 * 항목의 신선도를 과장하게 된다. "적어도 이 날짜까지는 전부 확인했다"가
 * 방어할 수 있는 주장이다.
 */
function verifiedDates(): string[] {
  return [
    ...featuredRackets.map((racket) => racket.verifiedAt),
    ...players.map((player) => player.verifiedAt),
    ...stringProducts.map((product) => product.verifiedAt),
  ].filter((value): value is string => /^\d{4}-\d{2}-\d{2}$/.test(value));
}

export function earliestVerifiedDate(dates: readonly string[]): string | null {
  if (dates.length === 0) return null;
  // ISO 날짜는 사전순 정렬이 곧 시간순이다.
  return [...dates].sort()[0];
}

export const DATA_VERIFIED_AT = earliestVerifiedDate(verifiedDates());
