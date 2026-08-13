import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

/**
 * 이 서비스는 2026-04-08 배포 이후 약 4개월간 트래픽이 한 번도 측정되지 않았다.
 * `@vercel/analytics` 가 아예 설치되어 있지 않았고, 루트 레이아웃에도 없었다.
 *
 * 그래서 유입 경로도, 홈을 거치는지 상세로 직행하는지도, 세그먼트 비중도
 * 전부 알 수 없었다. 브랜드 TF 네 세션이 트래픽을 근거로 논증했는데 그 근거는
 * 확인된 적이 없었다 — `visitors: 0` 은 "없다"가 아니라 "측정된 적이 없다"였다.
 *
 * 계측은 조용히 사라지기 쉽다. 레이아웃을 정리하다 한 줄 지워도 아무 화면도
 * 깨지지 않고, 다음 사람은 숫자가 0인 이유를 다시 며칠 걸려 찾는다.
 * 그래서 파일로 잠근다.
 */

const LAYOUT = fileURLToPath(new URL("../src/app/layout.tsx", import.meta.url));
const PACKAGE_JSON = fileURLToPath(new URL("../package.json", import.meta.url));

const layoutSource = readFileSync(LAYOUT, "utf8");
const pkg = JSON.parse(readFileSync(PACKAGE_JSON, "utf8")) as {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

test("계측 패키지는 dependencies 에 있다 — devDependencies 면 프로덕션에서 빠진다", () => {
  assert.ok(
    pkg.dependencies?.["@vercel/analytics"],
    "@vercel/analytics 가 dependencies 에 없다. 계측이 프로덕션 번들에 들어가지 않는다.",
  );
  assert.equal(
    pkg.devDependencies?.["@vercel/analytics"],
    undefined,
    "@vercel/analytics 는 devDependencies 가 아니라 dependencies 여야 한다.",
  );
});

test("루트 레이아웃이 Analytics 를 import 한다", () => {
  assert.match(
    layoutSource,
    /import\s*\{\s*Analytics\s*\}\s*from\s*["']@vercel\/analytics\/next["']/,
    "루트 레이아웃에 Analytics import 가 없다.",
  );
});

test("루트 레이아웃이 Analytics 를 실제로 렌더한다 — import 만으로는 아무 일도 일어나지 않는다", () => {
  assert.match(
    layoutSource,
    /<Analytics\s*\/>/,
    "Analytics 를 import 했지만 렌더하지 않는다. 계측이 붙지 않는다.",
  );
});

test("Analytics 는 body 안에 있다 — html 바깥이면 hydration 이 깨진다", () => {
  const body = layoutSource.slice(
    layoutSource.indexOf("<body"),
    layoutSource.lastIndexOf("</body>"),
  );
  assert.ok(body.length > 0, "layout.tsx 에서 body 를 찾지 못했다.");
  assert.match(body, /<Analytics\s*\/>/, "Analytics 가 body 밖에 있다.");
});
