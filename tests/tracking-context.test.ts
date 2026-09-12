import assert from "node:assert/strict";
import test from "node:test";
import { getSessionId, getTrackingContext, trackEvent } from "../src/lib/track-event";

test("기존 탭 세션을 재사용하고 캠페인·내부 테스트 표시는 다음 경로에도 유지한다", (t) => {
  const saved = new Map<string, string>([["racketlab.session.v1", "b2a46c3c-1010-4111-9222-012345678901"]]);
  const original = Object.getOwnPropertyDescriptor(globalThis, "window");
  const fakeWindow = {
    location: { href: "https://racketlab.kr/?utm_source=codex_qa&utm_campaign=readiness&racketlab_test=1" },
    sessionStorage: {
      getItem: (key: string) => saved.get(key) ?? null,
      setItem: (key: string, value: string) => saved.set(key, value),
    },
  };
  Object.defineProperty(globalThis, "window", { configurable: true, value: fakeWindow });
  t.after(() => {
    if (original) Object.defineProperty(globalThis, "window", original);
    else Reflect.deleteProperty(globalThis, "window");
  });
  assert.equal(getSessionId(), "b2a46c3c-1010-4111-9222-012345678901");
  assert.equal(getSessionId(), saved.get("racketlab.session.v1"));
  const entry = getTrackingContext();
  fakeWindow.location.href = "https://racketlab.kr/start";
  assert.deepEqual(getTrackingContext(), entry);
  assert.deepEqual(entry, {
    campaign: { utm_source: "codex_qa", utm_campaign: "readiness" },
    trafficType: "internal",
  });
});

test("이벤트 URL의 임의 쿼리와 fragment를 보내지 않고 캠페인 키만 별도로 전송한다", (t) => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "window");
  const fakeWindow = {
    location: { href: "https://racketlab.kr/start?email=private%40example.com&utm_source=partner#secret" },
    sessionStorage: { getItem: () => null, setItem: () => undefined },
  };
  Object.defineProperty(globalThis, "window", { configurable: true, value: fakeWindow });
  t.after(() => {
    if (original) Object.defineProperty(globalThis, "window", original);
    else Reflect.deleteProperty(globalThis, "window");
  });
  let request: RequestInit | undefined;
  t.mock.method(globalThis, "fetch", async (_url: string, init: RequestInit) => {
    request = init;
    return new Response(null, { status: 204 });
  });
  trackEvent("diagnosis_start", { entryPoint: "quick_start" });
  const body = JSON.parse(String(request?.body));
  assert.equal(body.pageUrl, "https://racketlab.kr/start");
  assert.deepEqual(body.payload.campaign, { utm_source: "partner" });
  assert.equal(body.payload.entryPoint, "quick_start");
  assert.equal(body.payload.trafficType, "unclassified");
  assert.doesNotMatch(String(request?.body), /private|secret/);
  assert.equal(request?.keepalive, true);
});

test("저장소 접근이 막혀도 캠페인 링크의 정보는 읽는다", (t) => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      location: { href: "https://racketlab.kr/?utm_campaign=launch" },
      get sessionStorage() { throw new Error("Storage blocked"); },
    },
  });
  t.after(() => {
    if (original) Object.defineProperty(globalThis, "window", original);
    else Reflect.deleteProperty(globalThis, "window");
  });
  assert.deepEqual(getTrackingContext(), { campaign: { utm_campaign: "launch" }, trafficType: "unclassified" });
});
