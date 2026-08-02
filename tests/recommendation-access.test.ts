import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import {
  appendOwnedRunId,
  canViewPersonalNarrative,
  isUuid,
  MAX_OWNED_RUNS,
  parseOwnedRunIds,
  RUN_OWNER_COOKIE,
} from "../src/lib/recommendation-access";
import { parseSearchLimit } from "../src/app/api/diagnosis/racket-search/route";

const root = join(import.meta.dirname, "..");
const read = (relative: string) => readFileSync(join(root, relative), "utf8");

const RUN_A = "11111111-2222-4333-8444-555555555555";
const RUN_B = "66666666-7777-4888-8999-aaaaaaaaaaaa";

test("uuid guard accepts real uuids and rejects everything else", () => {
  assert.ok(isUuid(RUN_A));
  assert.ok(isUuid(RUN_A.toUpperCase()));
  for (const bad of ["", "1", "not-a-uuid", "../../etc/passwd", null, 7, {}]) {
    assert.equal(isUuid(bad), false, `should reject ${JSON.stringify(bad)}`);
  }
});

test("owned-run cookie round-trips and drops junk entries", () => {
  const cookie = appendOwnedRunId(appendOwnedRunId("", RUN_A), RUN_B);
  assert.deepEqual(parseOwnedRunIds(cookie), [RUN_B, RUN_A]);

  assert.deepEqual(parseOwnedRunIds("garbage.also-garbage"), []);
  assert.deepEqual(parseOwnedRunIds(undefined), []);
  assert.deepEqual(parseOwnedRunIds(`${RUN_A}.oops`), [RUN_A]);
});

test("re-running a diagnosis does not duplicate the run id", () => {
  const cookie = appendOwnedRunId(appendOwnedRunId("", RUN_A), RUN_A);
  assert.deepEqual(parseOwnedRunIds(cookie), [RUN_A]);
});

test("the cookie is bounded so it cannot grow without limit", () => {
  let cookie = "";
  for (let i = 0; i < MAX_OWNED_RUNS + 10; i += 1) {
    const hex = i.toString(16).padStart(12, "0");
    cookie = appendOwnedRunId(cookie, `11111111-2222-4333-8444-${hex}`);
  }
  assert.equal(parseOwnedRunIds(cookie).length, MAX_OWNED_RUNS);
});

test("a stranger holding only the UUID cannot read the personal narrative", () => {
  assert.equal(
    canViewPersonalNarrative({
      runId: RUN_A,
      shareToken: "abcd1234",
      providedToken: null,
      ownedRunIds: [],
    }),
    false,
  );
});

test("the browser that ran the diagnosis can read its own narrative", () => {
  assert.equal(
    canViewPersonalNarrative({
      runId: RUN_A,
      shareToken: "abcd1234",
      providedToken: null,
      ownedRunIds: [RUN_B, RUN_A],
    }),
    true,
  );
});

test("a correct share token opens the narrative, a wrong one does not", () => {
  const base = {
    runId: RUN_A,
    shareToken: "abcd1234",
    ownedRunIds: [] as string[],
  };
  assert.equal(
    canViewPersonalNarrative({ ...base, providedToken: "abcd1234" }),
    true,
  );
  assert.equal(
    canViewPersonalNarrative({ ...base, providedToken: "abcd1235" }),
    false,
  );
  // 길이가 다른 토큰도 예외 없이 false 여야 한다.
  assert.equal(canViewPersonalNarrative({ ...base, providedToken: "x" }), false);
});

test("a run with no share token cannot be opened by any token", () => {
  assert.equal(
    canViewPersonalNarrative({
      runId: RUN_A,
      shareToken: null,
      providedToken: "anything",
      ownedRunIds: [],
    }),
    false,
  );
  // 빈 문자열 토큰끼리 우연히 일치해서 열리면 안 된다.
  assert.equal(
    canViewPersonalNarrative({
      runId: RUN_A,
      shareToken: "",
      providedToken: "",
      ownedRunIds: [],
    }),
    false,
  );
});

test("the personal narrative is gated on every surface that renders it", () => {
  const detail = read("src/app/api/recommendations/[id]/route.ts");
  const compare = read("src/app/api/recommendations/compare/route.ts");
  const page = read("src/app/results/[id]/page.tsx");

  for (const [label, source] of [
    ["api/recommendations/[id]", detail],
    ["api/recommendations/compare", compare],
    ["results/[id]", page],
  ] as const) {
    assert.match(source, /canViewPersonalNarrative/, `${label} lost its gate`);
    assert.match(source, /RUN_OWNER_COOKIE/, `${label} stopped reading the cookie`);
  }

  assert.match(detail, /profile && mayViewNarrative/);
  assert.match(page, /profile && mayViewNarrative &&/);
  assert.match(compare, /mayViewNarrative\s*\?/);
});

test("diagnosis submit hands the browser proof of its own run", () => {
  const submit = read("src/app/api/diagnosis/submit/route.ts");
  assert.match(submit, /response\.cookies\.set\(/);
  // 쿠키 이름은 리터럴이 아니라 공유 상수로 쓴다 — 이름이 한 곳에서만 바뀌도록.
  assert.match(submit, /RUN_OWNER_COOKIE/);
  assert.match(submit, /appendOwnedRunId\(/);
  // 엔진 내부 오류 메시지를 클라이언트로 넘기지 않는다.
  assert.doesNotMatch(submit, /message: err\.message|message,/);
});

test("the cookie name is defined once and is httpOnly", () => {
  assert.equal(RUN_OWNER_COOKIE, "rl_owned_runs");
  const access = read("src/lib/recommendation-access.ts");
  assert.match(access, /httpOnly: true/);
  assert.match(access, /sameSite: "lax"/);
  // 운영에서는 https 로만 실려야 한다.
  assert.match(access, /secure: process\.env\.NODE_ENV === "production"/);
});

test("uuid-shaped params are validated before reaching a uuid column", () => {
  for (const relative of [
    "src/app/api/recommendations/[id]/route.ts",
    "src/app/api/recommendations/compare/route.ts",
    "src/app/api/partners/nearby/route.ts",
    "src/app/results/[id]/page.tsx",
  ]) {
    assert.match(read(relative), /isUuid/, `${relative} skips uuid validation`);
  }
});

test("search limit is clamped at both ends", () => {
  // 상한만 두면 `?limit=-5` 가 `LIMIT -5` 로 내려가 Postgres가 거절한다.
  assert.equal(parseSearchLimit("-5"), 10);
  assert.equal(parseSearchLimit("0"), 10);
  assert.equal(parseSearchLimit("abc"), 10);
  assert.equal(parseSearchLimit(null), 10);
  assert.equal(parseSearchLimit("3"), 3);
  assert.equal(parseSearchLimit("9999"), 20);
});

test("public catalog reads only published specs", () => {
  const queries = read("src/lib/queries.ts");
  const filters = queries.match(
    /\.eq\("racket_specs\.ingestion_state", PUBLISHED_SPEC_STATE\)/g,
  );
  // 목록·상세·비교·홈·유사 라켓 다섯 경로 전부.
  assert.equal(filters?.length, 5);
  // 필터가 실제로 걸리려면 embedded 조인이 inner 여야 한다.
  assert.equal(queries.match(/racket_specs!inner\(/g)?.length, 5);
  assert.match(queries, /const PUBLISHED_SPEC_STATE = "published"/);
});
