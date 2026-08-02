/**
 * 라켓 파라메트릭 렌더 기하.
 *
 * 이전 색상 시뮬레이션은 제품 사진 위에 손으로 찍은 좌표를 CSS mask로 덮는 방식이라
 * 라켓마다 사람이 좌표를 찍어야 했고(327KB), 사진의 원근·가림과 늘 어긋났다.
 *
 * 여기서는 사진을 건드리지 않는다. 값은 셋 중 하나에서만 온다.
 *  1) 이미 DB에 있는 스펙 — 헤드 면적, 스트링 패턴, 빔 두께
 *  2) 사진에서 자동 추출한 컬러웨이
 *  3) 브랜드 패밀리 단위 형상 테이블 (모델 수와 무관하게 개수가 고정)
 */

import {
  DEFAULT_HEAD_SHAPE,
  resolveHeadShape,
  type HeadShape,
} from "@/data/racket-head-shapes";

export const SCHEMATIC_VIEWBOX = { width: 200, height: 500 } as const;

const HEAD_CENTER_X = 100;
const HEAD_CENTER_Y = 148;
/** 100 sq.in 라켓의 기준 가로 반경. 다른 면적은 제곱근 비례로 키우고 줄인다. */
const BASE_HEAD_RX = 60;
/** 스트링 베드가 프레임 안쪽으로 들어가는 비율. */
const STRING_INSET = 0.9;
/** 빔 1mm 를 캔버스 몇 단위로 그릴지. 26mm 표준 빔이 약 7 단위가 된다. */
const MM_TO_UNIT = 7 / 26;
const DEFAULT_BEAM_MM: BeamProfile = [23, 26, 23];

const HANDLE_TOP_Y = 318;
const HANDLE_BOTTOM_Y = 476;
const HANDLE_HALF_WIDTH = 11;
/** 후프 외곽선을 몇 개의 점으로 근사할지. */
const HOOP_SAMPLES = 168;

export type StringPattern = {
  readonly mains: number;
  readonly crosses: number;
};

/** [팁, 중간, 스로트] 순서의 빔 두께(mm). */
export type BeamProfile = readonly [number, number, number];

export type SchematicLine = {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
};

export type SchematicGeometry = {
  readonly head: {
    readonly cx: number;
    readonly cy: number;
    readonly rx: number;
    readonly ryUp: number;
    readonly ryDown: number;
    readonly exponent: number;
  };
  readonly stringBed: {
    readonly rx: number;
    readonly ryUp: number;
    readonly ryDown: number;
  };
  readonly mains: readonly SchematicLine[];
  readonly crosses: readonly SchematicLine[];
  /**
   * 교차점에서 메인을 크로스 위로 다시 덧그리는 짧은 조각.
   * 이게 있어야 격자가 아니라 실제로 엮인 스트링처럼 보인다.
   */
  readonly weaveOverlays: readonly SchematicLine[];
  /** 빔 두께가 반영된 후프. 외곽선과 내곽선 사이가 채워진다. */
  readonly hoopPath: string;
  /** 스트링 베드 경계 — 그로밋 띠를 그리는 데 쓴다. */
  readonly innerPath: string;
  readonly bumperPath: string;
  readonly throatPath: string;
  readonly handle: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
  };
};

export function parseHeadSizeSqIn(headSize: string | null): number | null {
  if (!headSize) return null;
  const match = headSize.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) && value >= 80 && value <= 140 ? value : null;
}

export function parseStringPattern(
  pattern: string | null,
): StringPattern | null {
  if (!pattern) return null;
  const match = pattern.match(/(\d{1,2})\s*[x×X]\s*(\d{1,2})/);
  if (!match) return null;

  const mains = Number(match[1]);
  const crosses = Number(match[2]);
  if (mains < 12 || mains > 20 || crosses < 12 || crosses > 26) return null;

  return { mains, crosses };
}

/**
 * `23/26/23mm`, `23-26-23`, `26mm` 을 모두 받는다.
 *
 * 값이 하나뿐이면 테이퍼 없는 일정 빔으로 본다.
 * 실측이 없으면 null 을 돌려주고, 호출부가 표준값으로 떨어진다.
 */
export function parseBeamProfileMm(beamWidth: string | null): BeamProfile | null {
  if (!beamWidth) return null;

  const values = [...beamWidth.matchAll(/(\d+(?:\.\d+)?)/g)]
    .map((match) => Number(match[1]))
    .filter((value) => Number.isFinite(value) && value >= 15 && value <= 35);

  if (values.length === 0) return null;
  if (values.length === 1) return [values[0], values[0], values[0]];
  if (values.length === 2) return [values[0], values[1], values[0]];
  return [values[0], values[1], values[2]];
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function headRadiusForArea(headSizeSqIn: number): number {
  return BASE_HEAD_RX * Math.sqrt(headSizeSqIn / 100);
}

/** 초타원 반경 배율. n=2 면 원/타원, 커질수록 모서리가 각진다. */
function superellipseFactor(angle: number, exponent: number): {
  fx: number;
  fy: number;
} {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const power = 2 / exponent;
  return {
    fx: Math.sign(cos) * Math.abs(cos) ** power,
    fy: Math.sign(sin) * Math.abs(sin) ** power,
  };
}

/** 주어진 x 에서 초타원의 세로 반쪽 길이. */
function verticalExtent(
  dx: number,
  rx: number,
  ry: number,
  exponent: number,
): number {
  const ratio = Math.min(1, Math.abs(dx) / rx);
  return ry * (1 - ratio ** exponent) ** (1 / exponent);
}

/** 주어진 y 에서 초타원의 가로 반쪽 길이. */
function horizontalExtent(
  dy: number,
  ry: number,
  rx: number,
  exponent: number,
): number {
  const ratio = Math.min(1, Math.abs(dy) / ry);
  return rx * (1 - ratio ** exponent) ** (1 / exponent);
}

/** 후프를 한 바퀴 도는 각도별 빔 두께(캔버스 단위). 팁이 위, 스로트가 아래다. */
function beamWidthAtAngle(angle: number, beam: BeamProfile): number {
  const [tip, middle, throat] = beam;
  // sin(angle) 이 -1 이면 12시(팁), +1 이면 6시(스로트), 0 이면 좌우 중간이다.
  const vertical = Math.sin(angle);
  const mm = vertical < 0
    ? middle + (tip - middle) * -vertical
    : middle + (throat - middle) * vertical;
  return mm * MM_TO_UNIT;
}

function pointsToPath(points: readonly { x: number; y: number }[]): string {
  return points
    .map((point, index) =>
      `${index === 0 ? "M" : "L"} ${round(point.x)} ${round(point.y)}`,
    )
    .join(" ") + " Z";
}

function sampleShape(
  rx: number,
  ryUp: number,
  ryDown: number,
  exponent: number,
  inset: (angle: number) => number,
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  for (let index = 0; index < HOOP_SAMPLES; index += 1) {
    const angle = (index / HOOP_SAMPLES) * Math.PI * 2;
    const { fx, fy } = superellipseFactor(angle, exponent);
    const shrink = inset(angle);
    const ry = fy < 0 ? ryUp : ryDown;
    points.push({
      x: HEAD_CENTER_X + fx * Math.max(1, rx - shrink),
      y: HEAD_CENTER_Y + fy * Math.max(1, ry - shrink),
    });
  }
  return points;
}

export function buildSchematicGeometry(
  headSizeSqIn: number,
  pattern: StringPattern,
  shape: HeadShape = DEFAULT_HEAD_SHAPE,
  beam: BeamProfile = DEFAULT_BEAM_MM,
): SchematicGeometry {
  const rx = headRadiusForArea(headSizeSqIn);
  const baseRy = rx * shape.aspect;
  // topBias 로 위쪽을 키우되 전체 높이는 유지해 헤드가 위아래로 치우치지 않게 한다.
  const ryUp = baseRy * shape.topBias;
  const ryDown = baseRy * (2 - shape.topBias);
  const exponent = shape.exponent;

  const bedRx = rx * STRING_INSET;
  const bedRyUp = ryUp * STRING_INSET;
  const bedRyDown = ryDown * STRING_INSET;

  // ---- 스트링 ----
  const mainXs: number[] = [];
  const mains: SchematicLine[] = [];
  for (let i = 0; i < pattern.mains; i += 1) {
    const t = (i + 0.5) / pattern.mains;
    const x = HEAD_CENTER_X - bedRx + 2 * bedRx * t;
    const dx = x - HEAD_CENTER_X;
    mainXs.push(x);
    mains.push({
      x1: round(x),
      y1: round(HEAD_CENTER_Y - verticalExtent(dx, bedRx, bedRyUp, exponent)),
      x2: round(x),
      y2: round(HEAD_CENTER_Y + verticalExtent(dx, bedRx, bedRyDown, exponent)),
    });
  }

  const crossYs: number[] = [];
  const crosses: SchematicLine[] = [];
  const bedHeight = bedRyUp + bedRyDown;
  for (let j = 0; j < pattern.crosses; j += 1) {
    const t = (j + 0.5) / pattern.crosses;
    const y = HEAD_CENTER_Y - bedRyUp + bedHeight * t;
    const dy = y - HEAD_CENTER_Y;
    const ry = dy < 0 ? bedRyUp : bedRyDown;
    crossYs.push(y);
    const half = horizontalExtent(dy, ry, bedRx, exponent);
    crosses.push({
      x1: round(HEAD_CENTER_X - half),
      y1: round(y),
      x2: round(HEAD_CENTER_X + half),
      y2: round(y),
    });
  }

  // ---- 위빙 ----
  // 메인과 크로스를 그냥 겹쳐 그리면 격자로 보인다. 실제 스트링은 한 칸씩 엇갈려
  // 위아래로 엮인다. 크로스를 다 그린 뒤, 엇갈린 교차점에서만 메인을 다시 덧그린다.
  const weaveSpan = (bedHeight / pattern.crosses) * 0.62;
  const weaveOverlays: SchematicLine[] = [];
  for (let i = 0; i < mainXs.length; i += 1) {
    for (let j = 0; j < crossYs.length; j += 1) {
      if ((i + j) % 2 !== 0) continue;

      const x = mainXs[i];
      const y = crossYs[j];
      const dx = x - HEAD_CENTER_X;
      const dy = y - HEAD_CENTER_Y;
      const ry = dy < 0 ? bedRyUp : bedRyDown;
      // 스트링 베드 밖의 교차점은 실재하지 않는다.
      const inside =
        (Math.abs(dx) / bedRx) ** exponent + (Math.abs(dy) / ry) ** exponent <= 1;
      if (!inside) continue;

      weaveOverlays.push({
        x1: round(x),
        y1: round(y - weaveSpan / 2),
        x2: round(x),
        y2: round(y + weaveSpan / 2),
      });
    }
  }

  // ---- 프레임 ----
  const outer = sampleShape(rx, ryUp, ryDown, exponent, () => 0);
  const inner = sampleShape(rx, ryUp, ryDown, exponent, (angle) =>
    beamWidthAtAngle(angle, beam),
  );
  // 바깥 고리를 정방향, 안쪽 고리를 역방향으로 이어 붙이면 두께가 있는 링이 된다.
  const hoopPath = `${pointsToPath(outer)} ${pointsToPath([...inner].reverse())}`;

  // 범퍼가드 — 팁 부분만 덮는 짧은 호.
  const bumperStart = Math.PI * 1.22;
  const bumperEnd = Math.PI * 1.78;
  const bumperOuter: { x: number; y: number }[] = [];
  const bumperInner: { x: number; y: number }[] = [];
  for (let index = 0; index <= 40; index += 1) {
    const angle = bumperStart + ((bumperEnd - bumperStart) * index) / 40;
    const { fx, fy } = superellipseFactor(angle, exponent);
    const ry = fy < 0 ? ryUp : ryDown;
    bumperOuter.push({
      x: HEAD_CENTER_X + fx * rx,
      y: HEAD_CENTER_Y + fy * ry,
    });
    const shrink = beamWidthAtAngle(angle, beam) * 0.55;
    bumperInner.push({
      x: HEAD_CENTER_X + fx * (rx - shrink),
      y: HEAD_CENTER_Y + fy * (ry - shrink),
    });
  }
  const bumperPath = `${pointsToPath(bumperOuter)} ${pointsToPath([...bumperInner].reverse())}`;

  // ---- 스로트와 손잡이 ----
  const hoopBottomY = HEAD_CENTER_Y + ryDown;
  const shaftHalf = HANDLE_HALF_WIDTH + 1;
  const throatPath = [
    `M ${round(HEAD_CENTER_X - rx * 0.66)} ${round(hoopBottomY - ryDown * 0.24)}`,
    `C ${round(HEAD_CENTER_X - rx * 0.5)} ${round(hoopBottomY + 34)}`,
    `${round(HEAD_CENTER_X - shaftHalf)} ${round(HANDLE_TOP_Y - 42)}`,
    `${round(HEAD_CENTER_X - shaftHalf)} ${round(HANDLE_TOP_Y)}`,
    `L ${round(HEAD_CENTER_X + shaftHalf)} ${round(HANDLE_TOP_Y)}`,
    `C ${round(HEAD_CENTER_X + shaftHalf)} ${round(HANDLE_TOP_Y - 42)}`,
    `${round(HEAD_CENTER_X + rx * 0.5)} ${round(hoopBottomY + 34)}`,
    `${round(HEAD_CENTER_X + rx * 0.66)} ${round(hoopBottomY - ryDown * 0.24)}`,
  ].join(" ");

  return {
    head: {
      cx: HEAD_CENTER_X,
      cy: HEAD_CENTER_Y,
      rx: round(rx),
      ryUp: round(ryUp),
      ryDown: round(ryDown),
      exponent,
    },
    stringBed: {
      rx: round(bedRx),
      ryUp: round(bedRyUp),
      ryDown: round(bedRyDown),
    },
    mains,
    crosses,
    weaveOverlays,
    hoopPath,
    innerPath: pointsToPath(inner),
    bumperPath,
    throatPath,
    handle: {
      x: HEAD_CENTER_X - HANDLE_HALF_WIDTH,
      y: HANDLE_TOP_Y,
      width: HANDLE_HALF_WIDTH * 2,
      height: HANDLE_BOTTOM_Y - HANDLE_TOP_Y,
    },
  };
}

export type RacketRenderSpec = {
  headSize: string | null;
  pattern: string | null;
  beamWidth?: string | null;
  brand?: string | null;
  model?: string | null;
};

/**
 * 라켓 스펙에서 렌더를 만든다.
 *
 * 헤드 면적과 스트링 패턴이 없으면 null — 추측해서 그리지 않는다.
 * 빔 두께와 브랜드는 없으면 표준값으로 떨어질 뿐 렌더를 막지 않는다.
 */
export function schematicFromSpec(
  spec: RacketRenderSpec,
): SchematicGeometry | null {
  const headSizeSqIn = parseHeadSizeSqIn(spec.headSize);
  const pattern = parseStringPattern(spec.pattern);
  if (headSizeSqIn === null || pattern === null) return null;

  return buildSchematicGeometry(
    headSizeSqIn,
    pattern,
    resolveHeadShape(spec.brand ?? null, spec.model ?? null),
    parseBeamProfileMm(spec.beamWidth ?? null) ?? DEFAULT_BEAM_MM,
  );
}
