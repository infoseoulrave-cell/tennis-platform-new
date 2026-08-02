import { timingSafeEqual } from "node:crypto";

/**
 * 진단 결과의 개인 서술을 누가 볼 수 있는지 결정한다.
 *
 * 추천된 라켓 자체는 공유 가치가 있어 공개로 둔다. 반면 "나의 진단 프로필"
 * 서술과 플레이스타일, 우선순위 답변은 그 사람에 대한 정보라서 UUID를 아는
 * 것만으로 읽히면 안 된다.
 *
 * 본인임을 증명하는 방법은 둘이다.
 * 1. 진단을 마친 그 브라우저 — 제출 시 심어 둔 httpOnly 쿠키에 run id가 있다.
 * 2. 공유 링크를 받은 사람 — 실행에 저장된 share token을 함께 제시한다.
 *
 * 계정이 없는 서비스라(로그아웃 우선) 세션 기반 소유권을 쓸 수 없어서 이 두
 * 경로만 인정한다.
 */

export const RUN_OWNER_COOKIE = "rl_owned_runs";

/** 쿠키 하나에 담아 둘 최근 실행 수. 넘치면 오래된 것부터 버린다. */
export const MAX_OWNED_RUNS = 20;

/** 쿠키 값 구분자. UUID에 이미 하이픈이 있어 마침표를 쓴다. */
const OWNED_RUNS_SEPARATOR = ".";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * uuid 컬럼에 들어가기 전에 형식을 본다.
 *
 * 형식을 안 보고 넘기면 Postgres가 `22P02 invalid input syntax` 를 던지고,
 * 그게 잡히지 않아 스택 트레이스가 붙은 500이 나간다.
 */
export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

export function parseOwnedRunIds(
  cookieValue: string | undefined | null,
): string[] {
  if (!cookieValue) return [];
  return cookieValue
    .split(OWNED_RUNS_SEPARATOR)
    .filter(isUuid)
    .slice(0, MAX_OWNED_RUNS);
}

export function appendOwnedRunId(
  cookieValue: string | undefined | null,
  runId: string,
): string {
  if (!isUuid(runId)) return cookieValue ?? "";
  const rest = parseOwnedRunIds(cookieValue).filter(
    (id) => id.toLowerCase() !== runId.toLowerCase(),
  );
  return [runId, ...rest]
    .slice(0, MAX_OWNED_RUNS)
    .join(OWNED_RUNS_SEPARATOR);
}

function constantTimeEquals(left: string, right: string): boolean {
  const leftBytes = Buffer.from(left, "utf8");
  const rightBytes = Buffer.from(right, "utf8");
  if (leftBytes.length !== rightBytes.length) return false;
  return timingSafeEqual(leftBytes, rightBytes);
}

export function canViewPersonalNarrative({
  runId,
  shareToken,
  providedToken,
  ownedRunIds,
}: {
  runId: string | null | undefined;
  /** 실행에 저장된 토큰. 없으면 공유 링크로는 열 수 없다. */
  shareToken: string | null | undefined;
  /** 요청이 들고 온 토큰 */
  providedToken: string | null | undefined;
  ownedRunIds: readonly string[];
}): boolean {
  if (!runId) return false;

  const owns = ownedRunIds.some(
    (id) => id.toLowerCase() === runId.toLowerCase(),
  );
  if (owns) return true;

  if (!shareToken || !providedToken) return false;
  return constantTimeEquals(shareToken, providedToken);
}

/** 진단 제출 응답에 소유권 쿠키를 실을 때 쓰는 옵션. */
export function ownedRunsCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  };
}
