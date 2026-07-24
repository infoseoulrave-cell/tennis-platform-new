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

function isClosedPath(path: string): boolean {
  return /(?:^|\s)M/i.test(path) && /Z\s*$/i.test(path.trim());
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
  if (innerRimPath !== undefined && !isClosedPath(innerRimPath)) {
    throw new Error("The custom inner-rim path must be a closed M...Z path.");
  }
  if (geometry.gripPaths.some((path) => !isClosedPath(path))) {
    throw new Error("Every grip path must be a closed M...Z path.");
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
  } = geometry.stringBed;
  const clipId = `${safeSvgId(geometry.slug)}-string-bed`;
  const rotation = `rotate(${roundCoordinate(rotationDeg)} ${roundCoordinate(cx)} ${roundCoordinate(cy)})`;

  const mainLines = positions(mains, rx, inset).map((x) => {
    if (innerRimPath) {
      return `<line x1="${roundCoordinate(cx + x)}" y1="${roundCoordinate(cy - ry)}" x2="${roundCoordinate(cx + x)}" y2="${roundCoordinate(cy + ry)}"/>`;
    }
    const y = ellipseExtent(x, rx - inset, ry - inset);
    return `<line x1="${roundCoordinate(cx + x)}" y1="${roundCoordinate(cy - y)}" x2="${roundCoordinate(cx + x)}" y2="${roundCoordinate(cy + y)}"/>`;
  });

  const crossLines = positions(crosses, ry, inset).map((y) => {
    if (innerRimPath) {
      return `<line x1="${roundCoordinate(cx - rx)}" y1="${roundCoordinate(cy + y)}" x2="${roundCoordinate(cx + rx)}" y2="${roundCoordinate(cy + y)}"/>`;
    }
    const x = ellipseExtent(y, ry - inset, rx - inset);
    return `<line x1="${roundCoordinate(cx - x)}" y1="${roundCoordinate(cy + y)}" x2="${roundCoordinate(cx + x)}" y2="${roundCoordinate(cy + y)}"/>`;
  });

  const clipShape = innerRimPath
    ? `<path d="${innerRimPath}"/>`
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
  if (geometry.gripPaths.length === 0) {
    throw new Error("Grip mask requires at least one closed path.");
  }

  const { width, height } = geometry.canvas;
  return [
    `<svg viewBox="0 0 ${width} ${height}">`,
    '<g fill="#fff">',
    ...geometry.gripPaths.map((path) => `<path d="${path}"/>`),
    "</g>",
    "</svg>",
    "",
  ].join("\n");
}

export function buildGeneratedProfilesModule(
  geometries: readonly MaskGeometry[],
): string {
  const profiles = [...geometries]
    .sort((a, b) => a.slug.localeCompare(b.slug))
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
