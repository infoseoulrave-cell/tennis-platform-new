/**
 * Client-side event tracking helper.
 * Fires events to /api/events — fire-and-forget, never blocks UI.
 */

let _sessionId: string | null = null;
const SESSION_KEY = "racketlab.session.v1";
const CAMPAIGN_KEY = "racketlab.campaign.v1";
const TEST_KEY = "racketlab.internal.v1";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const;

export function getSessionId(): string {
  if (!_sessionId) {
    try {
      const saved = window.sessionStorage.getItem(SESSION_KEY);
      _sessionId = saved && /^[\da-f-]{36}$/i.test(saved) ? saved : crypto.randomUUID();
      window.sessionStorage.setItem(SESSION_KEY, _sessionId);
    } catch {
      // Storage can be unavailable; keep a stable ID for this document.
      _sessionId = crypto.randomUUID();
    }
  }
  return _sessionId;
}

export function getTrackingContext(): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  const params = new URL(window.location.href).searchParams;
  let campaign: Record<string, string> = Object.fromEntries(
    UTM_KEYS.flatMap((key) => {
      const value = params.get(key)?.slice(0, 100);
      return value ? [[key, value]] : [];
    }),
  );
  let internal = params.get("racketlab_test") === "1" || campaign.utm_source === "codex_qa";
  try {
    if (Object.keys(campaign).length) {
      window.sessionStorage.setItem(CAMPAIGN_KEY, JSON.stringify(campaign));
    } else {
      const saved: unknown = JSON.parse(window.sessionStorage.getItem(CAMPAIGN_KEY) || "{}");
      if (saved && typeof saved === "object") {
        campaign = Object.fromEntries(UTM_KEYS.flatMap((key) => {
          const value = (saved as Record<string, unknown>)[key];
          return typeof value === "string" ? [[key, value.slice(0, 100)]] : [];
        }));
      }
    }
    if (internal) window.sessionStorage.setItem(TEST_KEY, "1");
    internal ||= window.sessionStorage.getItem(TEST_KEY) === "1";
  } catch {
    // Tracking still works when browser storage is blocked or malformed.
  }
  return { campaign, trafficType: internal ? "internal" : "unclassified" };
}

function withoutQuery(value: string): string | undefined {
  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname}`;
  } catch {
    return undefined;
  }
}

export function trackEvent(
  eventType: string,
  payload?: Record<string, unknown>,
) {
  if (typeof window === "undefined") return;
  fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: getSessionId(),
      eventType,
      payload: { ...payload, ...getTrackingContext() },
      pageUrl: withoutQuery(window.location.href),
      referrer:
        typeof document !== "undefined" ? withoutQuery(document.referrer) : undefined,
    }),
    keepalive: true,
  }).catch(() => {
    // fire-and-forget
  });
}
