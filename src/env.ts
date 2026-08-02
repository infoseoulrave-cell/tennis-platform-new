/**
 * 서버가 필요로 하는 환경변수를 한 곳에 적어 둔다.
 *
 * 예전 이 파일은 `@t3-oss/env-nextjs` 로 스키마를 선언해 두었지만 **아무도
 * import 하지 않아 검증이 한 번도 실행되지 않았다.** 게다가 가장 민감한 두 개
 * (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)는 선언조차 없었다.
 * 있는데 동작하지 않는 안전장치는 없는 것보다 나쁘다.
 *
 * 그래서 실제로 호출되는 형태로 바꿨다. 검증은 빌드 시점이 아니라 **처음 쓸
 * 때** 일어난다. 빌드 도구가 배포 환경변수 없이 서버 모듈을 import 하는 경우가
 * 있어서, 빌드 중에 던지면 배포가 통째로 깨진다.
 */

export const SUPABASE_ENV = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

export const DATABASE_ENV = ["DATABASE_URL"] as const;

export const ADMIN_ENV = ["ADMIN_SECRET"] as const;

/**
 * 값이 다 있으면 그대로 돌려주고, 하나라도 없으면 무엇이 없는지 적어 던진다.
 *
 * 조용히 빈 값으로 넘어가면 카탈로그가 통째로 비어 보이는데, 그 화면은 "라켓이
 * 없음"과 구분되지 않는다. 그래서 반드시 던진다.
 */
export function requireServerEnv<Name extends string>(
  names: readonly Name[],
  purpose: string,
): Record<Name, string> {
  const resolved = {} as Record<Name, string>;
  const missing: string[] = [];

  for (const name of names) {
    const value = process.env[name];
    if (!value) missing.push(name);
    else resolved[name] = value;
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing environment variable${missing.length > 1 ? "s" : ""} for ${purpose}: ${missing.join(", ")}`,
    );
  }

  return resolved;
}
