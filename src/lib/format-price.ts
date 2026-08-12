/**
 * 한국 소매가 표기.
 *
 * 예전에는 화면마다 `₩${Math.round(price / 1000)}K` 로 찍어 "₩345K" 가 나왔다.
 * 통화 기호에 영어 축약을 붙인 표기라 한국 사용자가 읽는 방식이 아니다.
 * 만원 단위로 옮기고, 소수점은 필요할 때만 한 자리 남긴다.
 *
 *   345,000 -> 34.5만원
 *   280,000 -> 28만원
 *     9,000 -> 9,000원
 */
export function formatKrwPrice(price: number | null | undefined): string {
  if (!price || !Number.isFinite(price) || price <= 0) return "";

  // 만원 미만은 만 단위로 옮기면 오히려 읽기 어렵다.
  if (price < 10000) return `${Math.round(price).toLocaleString("ko-KR")}원`;

  const man = Math.round((price / 10000) * 10) / 10;
  return Number.isInteger(man) ? `${man}만원` : `${man.toFixed(1)}만원`;
}
