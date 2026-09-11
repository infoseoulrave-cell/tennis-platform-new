/**
 * 제휴 문의 알림.
 *
 * `/api/partner-inquiries` 는 지금까지 DB 에만 저장했다. 어드민 페이지를 열어
 * 보지 않으면 브랜드가 보낸 문의가 며칠씩 묻힌다. 그래서 저장 직후 한 번
 * 알린다 — 텔레그램(봇 토큰 + 채팅 ID) 또는 임의 웹훅(JSON POST).
 *
 * 둘 다 설정이 없으면 아무것도 하지 않는다. 알림이 실패해도 문의 접수는
 * 이미 성공한 뒤라 요청을 실패시키지 않는다.
 */
import { INQUIRY_TYPE_LABELS } from "@/lib/partner-inquiry";

export type InquiryNotification = {
  inquiryType: string;
  name: string;
  contact: string;
  message?: string | null;
  receivedAt?: Date;
};

export type InquiryNotifyTargets = {
  telegram?: { token: string; chatId: string };
  webhook?: string;
  adminUrl?: string;
};

type EnvLike = Record<string, string | undefined>;

export function inquiryNotifyTargets(env: EnvLike = process.env): InquiryNotifyTargets {
  const targets: InquiryNotifyTargets = {};
  const token = env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = env.TELEGRAM_CHAT_ID?.trim();
  if (token && chatId) targets.telegram = { token, chatId };

  const webhook = env.INQUIRY_NOTIFY_WEBHOOK?.trim();
  if (webhook && /^https?:\/\//.test(webhook)) targets.webhook = webhook;

  const appUrl = env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "");
  if (appUrl) targets.adminUrl = `${appUrl}/admin/partners`;
  return targets;
}

function formatKst(date: Date): string {
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")} KST`;
}

export function formatInquiryMessage(
  inquiry: InquiryNotification,
  adminUrl?: string,
): string {
  const typeLabel =
    (INQUIRY_TYPE_LABELS as Record<string, string>)[inquiry.inquiryType]
    ?? inquiry.inquiryType;
  const message = inquiry.message?.trim();
  const lines = [
    "🎾 racket lab 제휴 문의",
    `유형: ${typeLabel}`,
    `이름/상호: ${inquiry.name}`,
    `연락처: ${inquiry.contact}`,
  ];
  if (message) lines.push(`내용: ${message.length > 500 ? `${message.slice(0, 500)}…` : message}`);
  lines.push(`접수: ${formatKst(inquiry.receivedAt ?? new Date())}`);
  if (adminUrl) lines.push(`관리: ${adminUrl}`);
  return lines.join("\n");
}

type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

/** 한 대상에 보낸다. 실패는 여기서 삼킨다 — 호출자는 결과를 기다리지 않는다. */
async function post(fetchImpl: FetchLike, url: string, body: unknown, label: string) {
  try {
    const res = await fetchImpl(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) console.error(`[inquiry-notify] ${label} responded ${res.status}`);
  } catch (err) {
    console.error(`[inquiry-notify] ${label} failed:`, err);
  }
}

export async function notifyPartnerInquiry(
  inquiry: InquiryNotification,
  env: EnvLike = process.env,
  fetchImpl: FetchLike = fetch,
): Promise<void> {
  const targets = inquiryNotifyTargets(env);
  if (!targets.telegram && !targets.webhook) return;

  const text = formatInquiryMessage(inquiry, targets.adminUrl);
  const jobs: Promise<void>[] = [];

  if (targets.telegram) {
    const { token, chatId } = targets.telegram;
    jobs.push(
      post(
        fetchImpl,
        `https://api.telegram.org/bot${token}/sendMessage`,
        { chat_id: chatId, text, disable_web_page_preview: true },
        "telegram",
      ),
    );
  }
  if (targets.webhook) {
    jobs.push(
      post(
        fetchImpl,
        targets.webhook,
        { text, inquiry: { ...inquiry, receivedAt: (inquiry.receivedAt ?? new Date()).toISOString() } },
        "webhook",
      ),
    );
  }
  await Promise.all(jobs);
}
