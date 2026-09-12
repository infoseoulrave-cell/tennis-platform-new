import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  formatInquiryMessage,
  inquiryNotifyTargets,
  notifyPartnerInquiry,
} from "../src/lib/inquiry-notify";

const inquiry = {
  inquiryType: "brand",
  name: "바볼랏코리아",
  contact: "brand@example.com",
  message: "히어로 슬롯 문의",
  receivedAt: new Date("2026-09-11T05:00:00Z"),
};

test("문의 알림 문구는 유형 라벨·연락처·KST 접수 시각·관리 링크를 담는다", () => {
  const text = formatInquiryMessage(inquiry, "https://racketlab.kr/admin/partners");
  assert.match(text, /^🎾 racket lab 제휴 문의/);
  assert.match(text, /유형: 브랜드 \/ 유통사/);
  assert.match(text, /이름\/상호: 바볼랏코리아/);
  assert.match(text, /연락처: brand@example\.com/);
  assert.match(text, /내용: 히어로 슬롯 문의/);
  assert.match(text, /접수: 2026-09-11 14:00 KST/);
  assert.match(text, /관리: https:\/\/racketlab\.kr\/admin\/partners/);
});

test("알림 대상은 env 가 채워진 것만 고르고, 비어 있으면 아무것도 보내지 않는다", async () => {
  assert.deepEqual(inquiryNotifyTargets({}), {});
  assert.deepEqual(inquiryNotifyTargets({ TELEGRAM_BOT_TOKEN: "t" }), {}); // chat id 없음
  assert.deepEqual(inquiryNotifyTargets({ INQUIRY_NOTIFY_WEBHOOK: "not-a-url" }), {});
  assert.deepEqual(
    inquiryNotifyTargets({
      TELEGRAM_BOT_TOKEN: "t",
      TELEGRAM_CHAT_ID: "c",
      INQUIRY_NOTIFY_WEBHOOK: "https://hooks.example/x",
      NEXT_PUBLIC_APP_URL: "https://racketlab.kr/",
    }),
    {
      telegram: { token: "t", chatId: "c" },
      webhook: "https://hooks.example/x",
      adminUrl: "https://racketlab.kr/admin/partners",
    },
  );

  let calls = 0;
  await notifyPartnerInquiry(inquiry, {}, async () => {
    calls += 1;
    return new Response(null, { status: 200 });
  });
  assert.equal(calls, 0);
});

test("텔레그램과 웹훅에 각각 보내고, 실패해도 던지지 않는다", async () => {
  const sent: { url: string; body: unknown }[] = [];
  await notifyPartnerInquiry(
    inquiry,
    {
      TELEGRAM_BOT_TOKEN: "123:abc",
      TELEGRAM_CHAT_ID: "42",
      INQUIRY_NOTIFY_WEBHOOK: "https://hooks.example/x",
    },
    async (url, init) => {
      sent.push({ url, body: JSON.parse(String(init.body)) });
      return new Response(null, { status: url.includes("telegram") ? 200 : 500 });
    },
  );
  assert.equal(sent.length, 2);
  const telegram = sent.find((s) => s.url.startsWith("https://api.telegram.org/bot123:abc/sendMessage"));
  assert.ok(telegram);
  assert.equal((telegram.body as { chat_id: string }).chat_id, "42");
  assert.match((telegram.body as { text: string }).text, /바볼랏코리아/);
  const webhook = sent.find((s) => s.url === "https://hooks.example/x");
  assert.ok(webhook);
  assert.equal((webhook.body as { inquiry: { name: string } }).inquiry.name, "바볼랏코리아");

  const originalError = console.error;
  console.error = () => undefined;
  try {
    await assert.doesNotReject(
      notifyPartnerInquiry(
        inquiry,
        { TELEGRAM_BOT_TOKEN: "t", TELEGRAM_CHAT_ID: "c" },
        async () => {
          throw new Error("network down");
        },
      ),
    );
  } finally {
    console.error = originalError;
  }
});

test("문의 API 는 저장 뒤 응답 후에 알린다", () => {
  const route = readFileSync(
    new URL("../src/app/api/partner-inquiries/route.ts", import.meta.url),
    "utf8",
  );
  assert.match(route, /after\(\(\) => notifyPartnerInquiry\(notification\)\)/);
  const insertAt = route.indexOf("db.insert(partnerInquiries)");
  const notifyAt = route.indexOf("notifyPartnerInquiry(notification)");
  assert.ok(insertAt > 0 && notifyAt > insertAt, "알림은 insert 뒤에 온다");
});
