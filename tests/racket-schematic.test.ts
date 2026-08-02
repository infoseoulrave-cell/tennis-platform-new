import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { resolveHeadShape, DEFAULT_HEAD_SHAPE } from "../src/data/racket-head-shapes";
import {
  buildSchematicGeometry,
  parseBeamProfileMm,
  parseHeadSizeSqIn,
  parseStringPattern,
  schematicFromSpec,
  SCHEMATIC_VIEWBOX,
} from "../src/lib/racket-schematic";

function read(relativePath: string): string {
  return readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

const PATTERN = { mains: 16, crosses: 19 } as const;

test("head size parses the shapes the catalog actually stores", () => {
  assert.equal(parseHeadSizeSqIn('100"'), 100);
  assert.equal(parseHeadSizeSqIn('98"'), 98);
  assert.equal(parseHeadSizeSqIn("104"), 104);
  assert.equal(parseHeadSizeSqIn('97.5"'), 97.5);
});

test("head size rejects missing or impossible values", () => {
  assert.equal(parseHeadSizeSqIn(null), null);
  assert.equal(parseHeadSizeSqIn("데이터 없음"), null);
  assert.equal(parseHeadSizeSqIn('12"'), null);
  assert.equal(parseHeadSizeSqIn('900"'), null);
});

test("string pattern parses every separator the catalog uses", () => {
  assert.deepEqual(parseStringPattern("16x19"), { mains: 16, crosses: 19 });
  assert.deepEqual(parseStringPattern("18x20"), { mains: 18, crosses: 20 });
  assert.deepEqual(parseStringPattern("16 x 19"), { mains: 16, crosses: 19 });
  assert.deepEqual(parseStringPattern("16×19"), { mains: 16, crosses: 19 });
});

test("string pattern rejects missing or impossible values", () => {
  assert.equal(parseStringPattern(null), null);
  assert.equal(parseStringPattern("정보 없음"), null);
  assert.equal(parseStringPattern("2x3"), null);
  assert.equal(parseStringPattern("40x50"), null);
});

test("beam width parses the catalog format and its variations", () => {
  assert.deepEqual(parseBeamProfileMm("23/26/23mm"), [23, 26, 23]);
  assert.deepEqual(parseBeamProfileMm("23-26-23"), [23, 26, 23]);
  // 값이 하나뿐이면 테이퍼 없는 일정 빔이다.
  assert.deepEqual(parseBeamProfileMm("26mm"), [26, 26, 26]);
  assert.equal(parseBeamProfileMm(null), null);
  assert.equal(parseBeamProfileMm("정보 없음"), null);
  // 라켓 빔이 될 수 없는 값은 버린다.
  assert.equal(parseBeamProfileMm("2mm"), null);
});

test("the drawing has exactly as many strings as the spec says", () => {
  for (const [mains, crosses] of [[16, 19], [18, 20], [16, 20]] as const) {
    const geometry = buildSchematicGeometry(100, { mains, crosses });
    assert.equal(geometry.mains.length, mains);
    assert.equal(geometry.crosses.length, crosses);
  }
});

test("strings are woven, not merely crossed", () => {
  // 격자처럼 보이지 않으려면 엇갈린 교차점에서 메인이 크로스 위로 다시 올라와야 한다.
  const geometry = buildSchematicGeometry(100, PATTERN);
  assert.ok(
    geometry.weaveOverlays.length > 50,
    `위빙 조각이 너무 적습니다: ${geometry.weaveOverlays.length}`,
  );

  // 덧그리는 조각은 항상 세로(메인 방향)이고 짧아야 한다.
  for (const overlay of geometry.weaveOverlays) {
    assert.equal(overlay.x1, overlay.x2);
    const span = Math.abs(overlay.y2 - overlay.y1);
    assert.ok(span > 0 && span < 20, `위빙 조각 길이가 이상합니다: ${span}`);
  }
});

test("every weave overlay sits on a real main and cross intersection", () => {
  const geometry = buildSchematicGeometry(100, PATTERN);
  const mainXs = new Set(geometry.mains.map((line) => line.x1));

  for (const overlay of geometry.weaveOverlays) {
    assert.ok(
      mainXs.has(overlay.x1),
      `위빙 조각이 메인 위에 있지 않습니다: x=${overlay.x1}`,
    );
  }
});

test("denser patterns produce more weave points", () => {
  const open = buildSchematicGeometry(100, { mains: 16, crosses: 19 });
  const dense = buildSchematicGeometry(100, { mains: 18, crosses: 20 });
  assert.ok(dense.weaveOverlays.length > open.weaveOverlays.length);
});

test("bigger head size draws a bigger head", () => {
  const small = buildSchematicGeometry(95, PATTERN);
  const large = buildSchematicGeometry(115, PATTERN);

  assert.ok(large.head.rx > small.head.rx);
  assert.ok(large.head.ryUp > small.head.ryUp);
});

test("head shape comes from the brand family, not per model", () => {
  const yonex = resolveHeadShape("Yonex", "EZONE 100");
  const head = resolveHeadShape("Head", "Gravity MP");
  const unknown = resolveHeadShape("NoSuchBrand", "Whatever");

  // Yonex 아이소메트릭은 모서리가 각져 지수가 더 크다.
  assert.ok(yonex.exponent > head.exponent);
  assert.deepEqual(unknown, DEFAULT_HEAD_SHAPE);

  // 브랜드를 모르면 기본형으로 떨어지되 렌더는 계속된다.
  assert.deepEqual(resolveHeadShape(null, null), DEFAULT_HEAD_SHAPE);
});

test("a squarer head shape actually changes the outline", () => {
  const round = buildSchematicGeometry(100, PATTERN, {
    exponent: 2,
    aspect: 1.2,
    topBias: 1,
  });
  const isometric = buildSchematicGeometry(100, PATTERN, {
    exponent: 2.55,
    aspect: 1.2,
    topBias: 1,
  });

  assert.notEqual(round.hoopPath, isometric.hoopPath);
  // 각진 형은 같은 반경에서 모서리가 더 바깥으로 나가므로 스트링이 더 길어진다.
  const roundSpan = round.crosses[0].x2 - round.crosses[0].x1;
  const isometricSpan = isometric.crosses[0].x2 - isometric.crosses[0].x1;
  assert.ok(isometricSpan > roundSpan);
});

test("every string stays inside the string bed", () => {
  const geometry = buildSchematicGeometry(100, PATTERN);
  const { cx, cy, exponent } = geometry.head;
  const { rx, ryUp, ryDown } = geometry.stringBed;
  const tolerance = 0.02;

  for (const line of [...geometry.mains, ...geometry.crosses]) {
    for (const [x, y] of [[line.x1, line.y1], [line.x2, line.y2]] as const) {
      const dy = y - cy;
      const ry = dy < 0 ? ryUp : ryDown;
      const normalized =
        (Math.abs(x - cx) / rx) ** exponent + (Math.abs(dy) / ry) ** exponent;
      assert.ok(
        normalized <= 1 + tolerance,
        `스트링 끝점 (${x}, ${y}) 이 스트링 베드를 벗어났습니다`,
      );
    }
  }
});

test("strings never reach outside the frame", () => {
  const geometry = buildSchematicGeometry(105, { mains: 18, crosses: 20 });
  assert.ok(geometry.stringBed.rx < geometry.head.rx);
  assert.ok(geometry.stringBed.ryUp < geometry.head.ryUp);
});

test("a wider beam eats further into the string bed", () => {
  const thin = buildSchematicGeometry(100, PATTERN, DEFAULT_HEAD_SHAPE, [
    20, 20, 20,
  ]);
  const thick = buildSchematicGeometry(100, PATTERN, DEFAULT_HEAD_SHAPE, [
    32, 32, 32,
  ]);
  // 후프 안쪽 경계가 달라져야 빔 두께가 실제로 반영된 것이다.
  assert.notEqual(thin.innerPath, thick.innerPath);
});

test("the drawing fits the canvas", () => {
  const geometry = buildSchematicGeometry(115, PATTERN);
  const { cx, cy, rx, ryUp } = geometry.head;

  assert.ok(cx - rx >= 0);
  assert.ok(cx + rx <= SCHEMATIC_VIEWBOX.width);
  assert.ok(cy - ryUp >= 0);
  assert.ok(
    geometry.handle.y + geometry.handle.height <= SCHEMATIC_VIEWBOX.height,
  );
});

test("geometry is deterministic", () => {
  assert.deepEqual(
    buildSchematicGeometry(100, PATTERN),
    buildSchematicGeometry(100, PATTERN),
  );
});

test("incomplete specs draw nothing rather than guessing", () => {
  assert.equal(schematicFromSpec({ headSize: null, pattern: "16x19" }), null);
  assert.equal(schematicFromSpec({ headSize: '100"', pattern: null }), null);
  assert.ok(schematicFromSpec({ headSize: '100"', pattern: "16x19" }));
});

test("missing beam width or brand still renders", () => {
  // 빔과 브랜드는 있으면 좋은 값이지 필수가 아니다.
  const geometry = schematicFromSpec({
    headSize: '100"',
    pattern: "16x19",
    beamWidth: null,
    brand: null,
    model: null,
  });
  assert.ok(geometry);
});

test("the customizer no longer paints over product photography", () => {
  const component = read("src/components/racket-visual-customizer.tsx");
  assert.doesNotMatch(component, /maskImage|WebkitMaskImage|mixBlendMode/);
  assert.doesNotMatch(component, /next\/image/);
  assert.match(component, /RacketSchematic/);

  const route = read("src/lib/racket-customizer-route.ts");
  assert.match(route, /schematicFromSpec/);
  assert.doesNotMatch(route, /matchesCustomizerDimensions/);
});

test("the render tells the viewer it is not a photo", () => {
  const component = read("src/components/racket-visual-customizer.tsx");
  assert.match(component, /사진이 아니라/);
  // 로고·문양을 재현하지 않는다는 사실을 숨기지 않는다.
  assert.match(component, /로고와 문양은 재현하지 않습니다/);

  const page = read("src/app/customizer/[slug]/page.tsx");
  assert.match(page, /제품 사진이 아니라/);
});
