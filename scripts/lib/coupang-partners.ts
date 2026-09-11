/**
 * 쿠팡 파트너스 Open API 딥링크 + 판매처 검색 URL 빌더.
 *
 * 딥링크 API (공식 문서 "쿠팡 파트너스 API — 딥링크 생성"):
 *   POST https://api-gateway.coupang.com/v2/providers/affiliate_open_api/apis/openapi/v1/deeplink
 *   Authorization: CEA algorithm=HmacSHA256, access-key=<ACCESS>, signed-date=<yyMMdd'T'HHmmss'Z'>, signature=<hex>
 *   signature = HMAC-SHA256(secret, signed-date + METHOD + path)   ※ path 는 도메인 제외, 쿼리 포함
 *   body: { "coupangUrls": ["https://www.coupang.com/..."] }
 *   응답: { rCode, rMessage, data: [{ originalUrl, shortenUrl, landingUrl }] }
 *
 * 키가 없으면 호출하지 않는다. 런타임 번들에는 들어가지 않는 스크립트 전용 모듈이다.
 */
import { createHmac } from "node:crypto";

export const COUPANG_API_HOST = "https://api-gateway.coupang.com";
export const COUPANG_DEEPLINK_PATH =
  "/v2/providers/affiliate_open_api/apis/openapi/v1/deeplink";

export type CoupangCredentials = { accessKey: string; secretKey: string };

export type CoupangDeeplink = {
  originalUrl: string;
  shortenUrl: string;
  landingUrl: string;
};

/** 쿠팡이 요구하는 서명 시각 포맷: yyMMdd'T'HHmmss'Z' (UTC). */
export function coupangSignedDate(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${String(date.getUTCFullYear()).slice(-2)}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`
    + `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

export function coupangSignature(
  secretKey: string,
  signedDate: string,
  method: string,
  path: string,
): string {
  return createHmac("sha256", secretKey)
    .update(`${signedDate}${method.toUpperCase()}${path}`)
    .digest("hex");
}

export function buildCoupangAuthorization({
  method,
  path,
  accessKey,
  secretKey,
  signedDate = coupangSignedDate(),
}: CoupangCredentials & { method: string; path: string; signedDate?: string }): string {
  const signature = coupangSignature(secretKey, signedDate, method, path);
  return `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${signedDate}, signature=${signature}`;
}

type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

export async function createCoupangDeeplinks(
  urls: readonly string[],
  credentials: CoupangCredentials,
  fetchImpl: FetchLike = fetch,
  now: Date = new Date(),
): Promise<CoupangDeeplink[]> {
  if (urls.length === 0) return [];
  const res = await fetchImpl(`${COUPANG_API_HOST}${COUPANG_DEEPLINK_PATH}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      Authorization: buildCoupangAuthorization({
        method: "POST",
        path: COUPANG_DEEPLINK_PATH,
        signedDate: coupangSignedDate(now),
        ...credentials,
      }),
    },
    body: JSON.stringify({ coupangUrls: urls }),
  });
  if (!res.ok) {
    throw new Error(`Coupang deeplink API responded ${res.status}`);
  }
  const json = (await res.json()) as { rCode?: string; rMessage?: string; data?: CoupangDeeplink[] };
  if (json.rCode && json.rCode !== "0") {
    throw new Error(`Coupang deeplink API error ${json.rCode}: ${json.rMessage ?? ""}`);
  }
  return json.data ?? [];
}

/** 쿠팡 검색 결과 페이지. 딥링크 API 는 검색 URL 도 받는다. */
export function coupangSearchUrl(query: string): string {
  return `https://www.coupang.com/np/search?q=${encodeURIComponent(query)}`;
}

/** 네이버쇼핑 통합 검색. 제휴(쇼핑 커넥트) 전환 전의 임시 판매처 링크다. */
export function naverShoppingSearchUrl(query: string): string {
  return `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(query)}`;
}

/** 검색어: 브랜드 + 모델명, 모델명에 연도가 없으면 연도를 붙인다. */
export function offerSearchQuery(brand: string, model: string, year: number | null): string {
  const base = `${brand} ${model}`.replace(/\s+/g, " ").trim();
  if (year && !/\b(19|20)\d{2}\b/.test(model)) return `${base} ${year}`;
  return base;
}
