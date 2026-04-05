/**
 * Client-side event tracking helper.
 * Fires events to /api/events — fire-and-forget, never blocks UI.
 */

let _sessionId: string | null = null;

export function getSessionId(): string {
  if (!_sessionId) {
    _sessionId = crypto.randomUUID();
  }
  return _sessionId;
}

export function trackEvent(
  eventType: string,
  payload?: Record<string, unknown>,
) {
  fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: getSessionId(),
      eventType,
      payload,
      pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
      referrer:
        typeof document !== "undefined" ? document.referrer || undefined : undefined,
    }),
  }).catch(() => {
    // fire-and-forget
  });
}
