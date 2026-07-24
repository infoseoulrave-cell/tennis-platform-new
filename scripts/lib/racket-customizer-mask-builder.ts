export type StringBedGeometry = {
  readonly cx: number;
  readonly cy: number;
  readonly rx: number;
  readonly ry: number;
  readonly rotationDeg: number;
  readonly mains: number;
  readonly crosses: number;
  readonly inset: number;
  readonly innerRimPath?: string;
  readonly mainPositions?: readonly number[];
  readonly crossPositions?: readonly number[];
};

export type MaskGeometry = {
  readonly slug: string;
  readonly productCode: string;
  readonly canvas: {
    readonly width: number;
    readonly height: number;
  };
  readonly stringBed: StringBedGeometry;
  readonly gripPaths: readonly string[];
};

function roundCoordinate(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return Object.is(rounded, -0) ? "0" : String(rounded);
}

function positions(count: number, radius: number, inset: number): number[] {
  const usableRadius = radius - inset;
  const step = (usableRadius * 2) / (count - 1);
  return Array.from(
    { length: count },
    (_, index) => -usableRadius + index * step,
  );
}

function ellipseExtent(
  offset: number,
  primaryRadius: number,
  secondaryRadius: number,
) {
  const normalized = offset / primaryRadius;
  return secondaryRadius * Math.sqrt(Math.max(0, 1 - normalized * normalized));
}

function safeSvgId(value: string): string {
  return value.replace(/[^A-Za-z0-9_.:-]/g, "_");
}

type PathBounds = {
  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;
};

const pathTokenPattern = /[MLCZ]|[-+]?(?:(?:\d+\.?\d*)|(?:\.\d+))(?:[eE][-+]?\d+)?/g;
const pathArity: Readonly<Record<"M" | "L" | "C" | "Z", number>> = {
  M: 2,
  L: 2,
  C: 6,
  Z: 0,
};

function parsePathBounds(path: string): PathBounds | null {
  const tokens = path.match(pathTokenPattern);
  if (!tokens || path.replace(pathTokenPattern, "").replace(/[\s,]/g, "") !== "") {
    return null;
  }

  let index = 0;
  let command: "M" | "L" | "C" | "Z" | undefined;
  let sawMove = false;
  let closed = false;
  const coordinates: number[] = [];
  while (index < tokens.length) {
    const token = tokens[index];
    if (token in pathArity) {
      command = token as "M" | "L" | "C" | "Z";
      index += 1;
      if (command === "Z") {
        closed = index === tokens.length;
        break;
      }
    }
    if (!command || command === "Z" || (command === "M" && sawMove)) {
      return null;
    }
    if (command === "M") sawMove = true;
    const arity = pathArity[command];
    if (index + arity > tokens.length) return null;
    const values = tokens.slice(index, index + arity).map(Number);
    if (values.some((value) => !Number.isFinite(value))) return null;
    coordinates.push(...values);
    index += arity;
    if (command === "M") command = "L";
  }

  if (!sawMove || !closed || coordinates.length < 2) return null;
  const xCoordinates = coordinates.filter((_, coordinateIndex) => coordinateIndex % 2 === 0);
  const yCoordinates = coordinates.filter((_, coordinateIndex) => coordinateIndex % 2 === 1);
  return {
    minX: Math.min(...xCoordinates),
    maxX: Math.max(...xCoordinates),
    minY: Math.min(...yCoordinates),
    maxY: Math.max(...yCoordinates),
  };
}

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/'/g, "&apos;");
}

function validatePositions(
  positions: readonly number[] | undefined,
  count: number,
  minimum: number,
  maximum: number,
  label: string,
): void {
  if (positions === undefined) return;
  if (
    positions.length !== count
    || positions.some((position) => !Number.isFinite(position))
    || positions.some((position, index) => index > 0 && position <= positions[index - 1])
    || positions.some((position) => position < minimum || position > maximum)
  ) {
    throw new Error(`${label} positions must be finite, strictly ascending, and within the declared head bounds.`);
  }
}

export function validateMaskGeometry(geometry: MaskGeometry): void {
  const { width, height } = geometry.canvas;
  if (
    !Number.isFinite(width)
    || !Number.isFinite(height)
    || width < 400
    || width > 1000
    || height < 400
    || height > 1000
  ) {
    throw new Error("Mask canvas dimensions must be between 400 and 1000.");
  }

  const {
    cx,
    cy,
    rx,
    ry,
    rotationDeg,
    mains,
    crosses,
    inset,
    innerRimPath,
    mainPositions,
    crossPositions,
  } = geometry.stringBed;
  if (
    ![cx, cy, rx, ry, rotationDeg, inset].every(Number.isFinite)
    || rx <= 0
    || ry <= 0
    || inset < 0
    || inset >= Math.min(rx, ry)
  ) {
    throw new Error("String-bed measurements must be finite and positive.");
  }

  const angle = (rotationDeg * Math.PI) / 180;
  const xExtent = Math.sqrt(
    (rx * Math.cos(angle)) ** 2 + (ry * Math.sin(angle)) ** 2,
  );
  const yExtent = Math.sqrt(
    (rx * Math.sin(angle)) ** 2 + (ry * Math.cos(angle)) ** 2,
  );
  if (
    cx - xExtent < 0
    || cx + xExtent > width
    || cy - yExtent < 0
    || cy + yExtent > height
  ) {
    throw new Error("String-bed bounds must remain inside the canvas.");
  }

  if (!Number.isInteger(mains) || mains < 14 || mains > 20) {
    throw new Error("String-bed mains must be an integer from 14 to 20.");
  }
  if (!Number.isInteger(crosses) || crosses < 15 || crosses > 21) {
    throw new Error("String-bed crosses must be an integer from 15 to 21.");
  }
  validatePositions(mainPositions, mains, cx - rx + inset, cx + rx - inset, "Main");
  validatePositions(crossPositions, crosses, cy - ry + inset, cy + ry - inset, "Cross");
  if (innerRimPath !== undefined) {
    const bounds = parsePathBounds(innerRimPath);
    const tolerance = inset;
    if (
      !bounds
      || bounds.minX < 0
      || bounds.maxX > width
      || bounds.minY < 0
      || bounds.maxY > height
      || bounds.minX < cx - rx - tolerance
      || bounds.maxX > cx + rx + tolerance
      || bounds.minY < cy - ry - tolerance
      || bounds.maxY > cy + ry + tolerance
    ) {
      throw new Error("The custom inner-rim path must be a safe closed path within the declared head bounds.");
    }
  }
  if (geometry.gripPaths.length === 0) {
    throw new Error("Grip mask requires at least one closed path.");
  }
  if (geometry.gripPaths.some((path) => !parsePathBounds(path))) {
    throw new Error("Every grip path must use the safe closed path grammar.");
  }
}

export function buildStringMaskSvg(geometry: MaskGeometry): string {
  validateMaskGeometry(geometry);

  const { width, height } = geometry.canvas;
  const {
    cx,
    cy,
    rx,
    ry,
    rotationDeg,
    mains,
    crosses,
    inset,
    innerRimPath,
    mainPositions,
    crossPositions,
  } = geometry.stringBed;
  const clipId = `${safeSvgId(geometry.slug)}-string-bed`;
  const rotation = `rotate(${roundCoordinate(rotationDeg)} ${roundCoordinate(cx)} ${roundCoordinate(cy)})`;

  const mainOffsets = mainPositions?.map((position) => position - cx) ?? positions(mains, rx, inset);
  const crossOffsets = crossPositions?.map((position) => position - cy) ?? positions(crosses, ry, inset);
  const mainLines = mainOffsets.map((x) => {
    if (innerRimPath) {
      return `<line x1="${roundCoordinate(cx + x)}" y1="${roundCoordinate(cy - ry)}" x2="${roundCoordinate(cx + x)}" y2="${roundCoordinate(cy + ry)}"/>`;
    }
    const y = ellipseExtent(x, rx - inset, ry - inset);
    return `<line x1="${roundCoordinate(cx + x)}" y1="${roundCoordinate(cy - y)}" x2="${roundCoordinate(cx + x)}" y2="${roundCoordinate(cy + y)}"/>`;
  });

  const crossLines = crossOffsets.map((y) => {
    if (innerRimPath) {
      return `<line x1="${roundCoordinate(cx - rx)}" y1="${roundCoordinate(cy + y)}" x2="${roundCoordinate(cx + rx)}" y2="${roundCoordinate(cy + y)}"/>`;
    }
    const x = ellipseExtent(y, ry - inset, rx - inset);
    return `<line x1="${roundCoordinate(cx - x)}" y1="${roundCoordinate(cy + y)}" x2="${roundCoordinate(cx + x)}" y2="${roundCoordinate(cy + y)}"/>`;
  });

  const clipShape = innerRimPath
    ? `<path d="${escapeAttribute(innerRimPath)}"/>`
    : `<ellipse cx="${roundCoordinate(cx)}" cy="${roundCoordinate(cy)}" rx="${roundCoordinate(rx - inset)}" ry="${roundCoordinate(ry - inset)}" transform="${rotation}"/>`;

  return [
    `<svg viewBox="0 0 ${width} ${height}">`,
    `<defs><clipPath id="${clipId}">${clipShape}</clipPath></defs>`,
    `<g clip-path="url(#${clipId})" transform="${rotation}" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round">`,
    ...mainLines,
    ...crossLines,
    "</g>",
    "</svg>",
    "",
  ].join("\n");
}

export function buildGripMaskSvg(geometry: MaskGeometry): string {
  validateMaskGeometry(geometry);
  const { width, height } = geometry.canvas;
  return [
    `<svg viewBox="0 0 ${width} ${height}">`,
    '<g fill="#fff">',
    ...geometry.gripPaths.map((path) => `<path d="${escapeAttribute(path)}"/>`),
    "</g>",
    "</svg>",
    "",
  ].join("\n");
}

export function buildGeneratedProfilesModule(
  geometries: readonly MaskGeometry[],
): string {
  const profiles = [...geometries]
    .sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0))
    .map((geometry) => {
      validateMaskGeometry(geometry);
      return [
        "  {",
        `    slug: ${JSON.stringify(geometry.slug)},`,
        `    productCode: ${JSON.stringify(geometry.productCode)},`,
        '    sourceLayout: "tw-front-side-v1",',
        `    intrinsicWidth: ${geometry.canvas.width},`,
        `    intrinsicHeight: ${geometry.canvas.height},`,
        `    stringMaskUrl: ${JSON.stringify(`/images/racket-customizer/${geometry.slug}-strings.svg`)},`,
        `    gripMaskUrl: ${JSON.stringify(`/images/racket-customizer/${geometry.slug}-grip.svg`)},`,
        "  },",
      ].join("\n");
    });

  return [
    "// This file is generated by scripts/generate-racket-customizer-masks.ts.",
    "// Do not edit it by hand.",
    "",
    "export type RacketCustomizerProfile = {",
    "  readonly slug: string;",
    "  readonly productCode: string;",
    '  readonly sourceLayout: "tw-front-side-v1";',
    "  readonly intrinsicWidth: number;",
    "  readonly intrinsicHeight: number;",
    "  readonly stringMaskUrl: string;",
    "  readonly gripMaskUrl: string;",
    "};",
    "",
    "export const RACKET_CUSTOMIZER_PROFILES = [",
    ...profiles,
    "] as const satisfies readonly RacketCustomizerProfile[];",
    "",
  ].join("\n");
}
