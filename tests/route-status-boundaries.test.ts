import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, relative, dirname, sep } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

/**
 * 라우트 세그먼트에 `loading.tsx` 가 있으면 Next 는 그 세그먼트와 **하위 라우트
 * 전체**를 Suspense 로 감싸고, page 가 실행되기 전에 HTTP 200 을 커밋한다.
 * 그래서 page 가 `notFound()` 를 불러도 본문만 404 이고 상태 코드는 200 으로
 * 나간다 — 크롤러에는 없는 페이지가 정상 페이지로 보인다.
 *
 * 목록 페이지처럼 404 를 낼 일이 없는 세그먼트는 route group `(list)` 안에
 * 두어 경계를 자기 자신으로 좁힌다.
 */

const APP_DIR = fileURLToPath(new URL("../src/app", import.meta.url));

/** 응답 상태를 바꾸는 호출들. 스트리밍이 시작된 뒤에는 전부 무력해진다. */
const STATUS_CHANGING = /\b(notFound|permanentRedirect|redirect)\s*\(/;

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return walk(full);
    return full;
  });
}

/** 세그먼트 자신과 app 루트까지의 모든 조상. */
function segmentChain(pageFile: string): string[] {
  const chain: string[] = [];
  let dir = dirname(pageFile);
  while (dir.startsWith(APP_DIR)) {
    chain.push(dir);
    if (dir === APP_DIR) break;
    dir = dirname(dir);
  }
  return chain;
}

test("상태 코드를 바꾸는 page 위에는 loading.tsx 경계가 없다", () => {
  const pages = walk(APP_DIR).filter((f) => f.endsWith(`${sep}page.tsx`));
  assert.ok(pages.length > 0, "page.tsx 를 하나도 찾지 못했다");

  const violations: string[] = [];

  for (const page of pages) {
    const source = readFileSync(page, "utf8");
    if (!STATUS_CHANGING.test(source)) continue;

    for (const segment of segmentChain(page)) {
      const loading = join(segment, "loading.tsx");
      if (existsSync(loading)) {
        violations.push(
          `${relative(APP_DIR, page)} 가 상태를 바꾸는데 `
            + `${relative(APP_DIR, loading)} 가 이를 감싼다`,
        );
      }
    }
  }

  assert.deepEqual(violations, []);
});

test("404 를 내는 라우트는 스트리밍 전에 존재를 확인한다", () => {
  // 회귀했던 두 라우트를 이름으로 못박는다.
  for (const route of ["rackets/[slug]", "results/[id]", "customizer/[slug]"]) {
    const page = join(APP_DIR, route, "page.tsx");
    assert.ok(existsSync(page), `${route}/page.tsx 가 없다`);
    assert.match(readFileSync(page, "utf8"), /notFound\s*\(/, route);
    assert.equal(
      existsSync(join(APP_DIR, route, "loading.tsx")),
      false,
      `${route}/loading.tsx 가 있으면 notFound 가 200 으로 나간다`,
    );
  }
});

test("라켓 목록의 loading 경계는 route group 안에 갇혀 있다", () => {
  // 목록의 스켈레톤은 유지하되 [slug] 까지 감싸면 안 된다.
  assert.ok(existsSync(join(APP_DIR, "rackets", "(list)", "loading.tsx")));
  assert.ok(existsSync(join(APP_DIR, "rackets", "(list)", "page.tsx")));
  assert.equal(existsSync(join(APP_DIR, "rackets", "loading.tsx")), false);
});
