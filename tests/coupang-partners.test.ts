import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";

import {
  COUPANG_API_HOST,
  COUPANG_DEEPLINK_PATH,
  buildCoupangAuthorization,
  coupangSearchUrl,
  coupangSignedDate,
  createCoupangDeeplinks,
  naverShoppingSearchUrl,
  offerSearchQuery,
} from "../scripts/lib/coupang-partners";

test("서명 시각은 yyMMdd'T'HHmmss'Z' (UTC) 다", () => {
  assert.equal(coupangSignedDate(new Date("2026-09-11T05:07:09Z")), "260911T050709Z");
  assert.equal(coupangSignedDate(new Date("2030-01-02T23:59:59.999Z")), "300102T235959Z");
});

test("Authorization 헤더는 CEA 포맷이고 서명은 signed-date+METHOD+path 의 HMAC-SHA256 이다", () => {
  const header = buildCoupangAuthorization({
    method: "post",
    path: COUPANG_DEEPLINK_PATH,
    accessKey: "AK",
    secretKey: "SK",
    signedDate: "260911T050709Z",
  });
  const expected = createHmac("sha256", "SK")
    .update(`260911T050709ZPOST${COUPANG_DEEPLINK_PATH}`)
    .digest("hex");
  assert.equal(
    header,
    `CEA algorithm=HmacSHA256, access-key=AK, signed-date=260911T050709Z, signature=${expected}`,
  );
  assert.match(expected, /^[0-9a-f]{64}$/);
});

test("딥링크 요청은 서명 헤더와 coupangUrls 본문을 보내고 data 를 돌려준다", async () => {
  const seen: { url: string; init: RequestInit }[] = [];
  const links = await createCoupangDeeplinks(
    ["https://www.coupang.com/np/search?q=a"],
    { accessKey: "AK", secretKey: "SK" },
    async (url, init) => {
      seen.push({ url, init });
      return new Response(
        JSON.stringify({
          rCode: "0",
          data: [{ originalUrl: "https://www.coupang.com/np/search?q=a", shortenUrl: "https://link.coupang.com/a/x", landingUrl: "https://www.coupang.com/np/search?q=a" }],
        }),
        { status: 200 },
      );
    },
    new Date("2026-09-11T05:07:09Z"),
  );
  assert.equal(seen.length, 1);
  assert.equal(seen[0].url, `${COUPANG_API_HOST}${COUPANG_DEEPLINK_PATH}`);
  const headers = seen[0].init.headers as Record<string, string>;
  assert.match(headers.Authorization, /^CEA algorithm=HmacSHA256, access-key=AK, signed-date=260911T050709Z, signature=[0-9a-f]{64}$/);
  assert.deepEqual(JSON.parse(String(seen[0].init.body)), { coupangUrls: ["https://www.coupang.com/np/search?q=a"] });
  assert.equal(links[0].shortenUrl, "https://link.coupang.com/a/x");

  await assert.rejects(
    createCoupangDeeplinks(["https://www.coupang.com/x"], { accessKey: "AK", secretKey: "SK" }, async () =>
      new Response(JSON.stringify({ rCode: "401", rMessage: "bad key" }), { status: 200 }),
    ),
    /401/,
  );
  assert.deepEqual(await createCoupangDeeplinks([], { accessKey: "AK", secretKey: "SK" }, async () => {
    throw new Error("must not be called");
  }), []);
});

test("판매처 검색 URL 은 인코딩된 브랜드+모델(+연도) 쿼리를 쓴다", () => {
  assert.equal(offerSearchQuery("Babolat", "Pure Drive 2025", 2025), "Babolat Pure Drive 2025");
  assert.equal(offerSearchQuery("Prince", "Phantom 100P 310g", 2024), "Prince Phantom 100P 310g 2024");
  assert.equal(offerSearchQuery("Yonex", "EZONE 100", null), "Yonex EZONE 100");
  assert.equal(
    naverShoppingSearchUrl("Babolat Pure Drive 2025"),
    "https://search.shopping.naver.com/search/all?query=Babolat%20Pure%20Drive%202025",
  );
  assert.equal(coupangSearchUrl("Yonex EZONE 100"), "https://www.coupang.com/np/search?q=Yonex%20EZONE%20100");
});
