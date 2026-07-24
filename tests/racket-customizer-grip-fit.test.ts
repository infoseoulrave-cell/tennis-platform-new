import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { RACKET_CUSTOMIZER_MASK_GEOMETRIES } from "../scripts/racket-customizer-mask-geometry";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

type GripReferenceAnchor = {
  readonly label:
    | "top-edge"
    | "top-settled"
    | "q25"
    | "q50"
    | "q75"
    | "flare-start"
    | "flare-widest"
    | "cap-return"
    | "bottom";
  readonly y: number;
  readonly leftX: number;
  readonly rightX: number;
    readonly edgeMethod:
    | "threshold8-seven-row-median"
    | "threshold8-single-terminal-row"
    | "threshold8-connected-component-row"
    | "human-reviewed-native-source";
};

type GripReferenceView = {
  readonly role: "left-profile" | "right-front";
  readonly topY: number;
  readonly bottomY: number;
  readonly anchors: readonly GripReferenceAnchor[];
  readonly sourceRows: readonly (
    readonly [y: number, leftX: number, rightX: number]
  )[];
};

type GripReference = {
  readonly slug: string;
  readonly productCode: string;
  readonly sourceUrl: string;
  readonly sourceSha256: string;
  readonly canvas: {
    readonly width: number;
    readonly height: number;
  };
  readonly coordinateConvention: string;
  readonly review: {
    readonly status: "human-reviewed";
    readonly method: string;
    readonly reviewedAt: string;
  };
  readonly views: readonly GripReferenceView[];
};

const gripReferences = JSON.parse(
  readFileSync(
    path.join(
      projectRoot,
      "tests",
      "fixtures",
      "racket-customizer-grip-reference.json",
    ),
    "utf8",
  ),
) as readonly GripReference[];

const localSourceDirectories = [
  path.join(projectRoot, "work", "racket-customizer-calibration"),
  path.join(projectRoot, "work", "racket-customizer-task5", "sources"),
  path.join(projectRoot, "work", "racket-customizer-task6", "sources"),
  path.join(projectRoot, "work", "racket-customizer-task7", "sources"),
] as const;

async function findLocalSource(productCode: string): Promise<string | null> {
  for (const directory of localSourceDirectories) {
    for (const fileName of [`${productCode}.jpg`, `${productCode}-1.jpg`]) {
      const candidate = path.join(directory, fileName);
      try {
        await access(candidate);
        return candidate;
      } catch {
        // The retained calibration corpus is intentionally local-only.
      }
    }
  }
  return null;
}

type PathPoint = {
  readonly x: number;
  readonly y: number;
};

function tracedPathSides(gripPath: string): {
  readonly left: readonly PathPoint[];
  readonly right: readonly PathPoint[];
} {
  const points = [...gripPath.matchAll(
    /[ML](-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g,
  )].map((match) => ({
    x: Number(match[1]),
    y: Number(match[2]),
  }));
  const firstDescendingPoint = points.findIndex(
    (point, index) => index > 0 && point.y < points[index - 1].y,
  );
  assert.ok(firstDescendingPoint > 1, "Traced grip path must descend along its second edge.");
  const turnIndex = firstDescendingPoint - 1;
  return {
    left: points.slice(0, turnIndex),
    right: points.slice(turnIndex).reverse(),
  };
}

function median(values: readonly number[]): number {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.floor(sorted.length / 2)];
}

function percentile(values: readonly number[], proportion: number): number {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[
    Math.min(sorted.length - 1, Math.floor(sorted.length * proportion))
  ];
}

function xAtY(points: readonly PathPoint[], y: number): number {
  const exact = points.find((point) => point.y === y);
  if (exact) return exact.x;
  const nextIndex = points.findIndex((point) => point.y > y);
  assert.ok(
    nextIndex > 0,
    `Contour does not span golden anchor row y=${y}.`,
  );
  const previous = points[nextIndex - 1];
  const next = points[nextIndex];
  const progress = (y - previous.y) / (next.y - previous.y);
  return previous.x + (next.x - previous.x) * progress;
}

test("the tracked golden fixture covers every calibrated grip view", () => {
  const geometryBySlug = new Map<
    string,
    (typeof RACKET_CUSTOMIZER_MASK_GEOMETRIES)[number]
  >(
    RACKET_CUSTOMIZER_MASK_GEOMETRIES.map((geometry) => [
      geometry.slug,
      geometry,
    ]),
  );
  assert.equal(gripReferences.length, geometryBySlug.size);
  assert.equal(new Set(gripReferences.map(({ slug }) => slug)).size, gripReferences.length);

  for (const reference of gripReferences) {
    const geometry = geometryBySlug.get(reference.slug);
    assert.ok(geometry, `Unknown golden fixture slug: ${reference.slug}`);
    assert.equal(reference.productCode, geometry.productCode);
    assert.deepEqual(reference.canvas, geometry.canvas);
    assert.equal(
      reference.sourceUrl,
      `https://img.tennis-warehouse.com/watermark/rs.php?path=${reference.productCode}-1.jpg&nw=500`,
    );
    assert.match(reference.sourceSha256, /^[a-f0-9]{64}$/);
    assert.equal(
      reference.coordinateConvention,
      "anchors/sourceRows/topY/bottomY are zero-based source pixel indices; SVG path boundaries may differ by <= 1 because fills sample pixel centers; sourceRows use max RGB distance from white >= 8 with a centered seven-row median in the body and a flare-seeded 8-connected single-row trace in the terminal, while human-reviewed overrides are labeled per anchor; mask covers the replaceable grip body including its wrapped butt flare; excludes shaft/throat, finishing collar, detached shadow, and JPEG halo; bottomY is the last connected main-grip row",
    );
    assert.deepEqual(reference.review, {
      status: "human-reviewed",
      method: "native-source contact sheets, all 108 views",
      reviewedAt: "2026-07-24",
    });
    assert.equal(reference.views.length, geometry.gripPaths.length);

    for (const [viewIndex, view] of reference.views.entries()) {
      assert.equal(
        view.role,
        viewIndex === 0 ? "left-profile" : "right-front",
      );
      assert.ok(view.topY >= 0);
      assert.ok(view.bottomY > view.topY);
      assert.ok(view.bottomY < geometry.canvas.height);
      assert.ok(
        view.anchors.length >= 8,
        `${reference.slug} view ${viewIndex + 1} needs at least eight anchors`,
      );
      assert.ok(
        view.anchors[0].y <= view.topY + 12,
        `${reference.slug} view ${viewIndex + 1} lacks a collar/top anchor`,
      );
      assert.ok(
        view.anchors.at(-1)!.y >= view.bottomY - 12,
        `${reference.slug} view ${viewIndex + 1} lacks a wrap-termination anchor`,
      );
      assert.deepEqual(
        view.anchors.map(({ label }) => label),
        [
          "top-edge",
          "top-settled",
          "q25",
          "q50",
          "q75",
          "flare-start",
          "flare-widest",
          "cap-return",
          "bottom",
        ],
      );
      assert.deepEqual(
        view.sourceRows.map(([y]) => y),
        Array.from(
          { length: view.bottomY - view.topY + 1 },
          (_, index) => view.topY + index,
        ),
      );
      for (const [, leftX, rightX] of view.sourceRows) {
        assert.ok(leftX < rightX);
      }
      for (const [anchorIndex, anchor] of view.anchors.entries()) {
        assert.ok(anchor.y >= view.topY && anchor.y <= view.bottomY);
        assert.ok(anchor.leftX < anchor.rightX);
        assert.match(
          anchor.edgeMethod,
          /^(?:threshold8-seven-row-median|threshold8-single-terminal-row|threshold8-connected-component-row|human-reviewed-native-source)$/,
        );
        if (anchorIndex > 0) {
          assert.ok(anchor.y > view.anchors[anchorIndex - 1].y);
        }
      }
    }
  }
});

test("every grip uses a dense source-traced silhouette instead of a coarse approximation", () => {
  const violations = RACKET_CUSTOMIZER_MASK_GEOMETRIES.flatMap(({ slug, gripPaths }) =>
    gripPaths.flatMap((gripPath, viewIndex) => {
      const lineSegments = gripPath.match(/\bL/g)?.length ?? 0;
      return lineSegments >= 40
        ? []
        : [`${slug} view ${viewIndex + 1}: ${lineSegments} traced line segments`];
    }),
  );

  assert.deepEqual(violations, []);
});

test("source-traced grip edges stay continuous without isolated pixel spikes", () => {
  const violations: string[] = [];
  const referencesBySlug = new Map(
    gripReferences.map((reference) => [reference.slug, reference]),
  );
  for (const { slug, gripPaths } of RACKET_CUSTOMIZER_MASK_GEOMETRIES) {
    const reference = referencesBySlug.get(slug);
    assert.ok(reference);
    for (const [viewIndex, gripPath] of gripPaths.entries()) {
      const goldenView = reference.views[viewIndex];
      const anchorByLabel = new Map(
        goldenView.anchors.map((anchor) => [anchor.label, anchor]),
      );
      const flareStart = anchorByLabel.get("flare-start");
      const capReturn = anchorByLabel.get("cap-return");
      const bottom = anchorByLabel.get("bottom");
      assert.ok(flareStart);
      assert.ok(capReturn);
      assert.ok(bottom);
      const terminalSpan = bottom.y - capReturn.y;
      assert.ok(terminalSpan > 0);
      const sides = tracedPathSides(gripPath);
      for (const [sideName, points] of Object.entries(sides)) {
        const terminalEdgeDelta = sideName === "left"
          ? Math.abs(bottom.leftX - capReturn.leftX)
          : Math.abs(bottom.rightX - capReturn.rightX);
        const terminalEdgeSlope = terminalEdgeDelta / terminalSpan;
        for (let index = 1; index < points.length; index += 1) {
          const previous = points[index - 1];
          const current = points[index];
          const xDelta = Math.abs(current.x - previous.x);
          const yDelta = current.y - previous.y;
          const inBody =
            current.y >= goldenView.topY + 12
            && current.y < flareStart.y;
          const inTerminal = current.y > capReturn.y;
          const maximumStep = inBody
            ? 3
            : inTerminal
              ? Math.ceil(terminalEdgeSlope * yDelta) + 2
              : 6;
          const neighborhood = points.slice(
            Math.max(0, index - 2),
            Math.min(points.length, index + 3),
          );
          const localDeviation = Math.abs(
            current.x - median(neighborhood.map(({ x }) => x)),
          );
          const maximumDeviation = inBody
            ? 3
            : inTerminal
              ? Math.ceil(terminalEdgeSlope * 2) + 2
              : 4;
          if (
            yDelta <= 0
            || yDelta > 2
            || xDelta > maximumStep
            || localDeviation > maximumDeviation
          ) {
            violations.push(
              `${slug} view ${viewIndex + 1} ${sideName}`
              + ` (${previous.x},${previous.y})→(${current.x},${current.y})`,
            );
          }
        }
      }

      let previousWidth: number | null = null;
      let previousY: number | null = null;
      const capWidth = capReturn.rightX - capReturn.leftX;
      const bottomWidth = bottom.rightX - bottom.leftX;
      const terminalWidthSlope = Math.abs(bottomWidth - capWidth) / terminalSpan;
      for (const point of sides.left) {
        const width = xAtY(sides.right, point.y) - point.x;
        const priorY = previousY;
        const inTerminal =
          priorY !== null
          && point.y > capReturn.y;
        const maximumWidthStep = priorY !== null && point.y > capReturn.y
          ? Math.ceil(terminalWidthSlope * (point.y - priorY)) + 3
          : 6;
        if (
          previousWidth !== null
          && (
            Math.abs(width - previousWidth) > maximumWidthStep
            || (inTerminal && width > previousWidth + 1)
          )
        ) {
          violations.push(
            `${slug} view ${viewIndex + 1} width changes by`
            + ` ${Math.abs(width - previousWidth)}px at y=${point.y}`,
          );
        }
        previousWidth = width;
        previousY = point.y;
      }
    }
  }

  assert.deepEqual(violations, []);
});

test("generated contours match every golden anchor and source-traced silhouette", () => {
  const geometryBySlug = new Map<
    string,
    (typeof RACKET_CUSTOMIZER_MASK_GEOMETRIES)[number]
  >(
    RACKET_CUSTOMIZER_MASK_GEOMETRIES.map((geometry) => [
      geometry.slug,
      geometry,
    ]),
  );
  const violations: string[] = [];

  for (const reference of gripReferences) {
    const geometry = geometryBySlug.get(reference.slug);
    assert.ok(geometry);
    for (const [viewIndex, goldenView] of reference.views.entries()) {
      const sides = tracedPathSides(geometry.gripPaths[viewIndex]);
      const actualTopY = Math.min(sides.left[0].y, sides.right[0].y);
      const actualBottomY = Math.max(
        sides.left.at(-1)!.y,
        sides.right.at(-1)!.y,
      );
      if (Math.abs(actualTopY - goldenView.topY) > 1) {
        violations.push(
          `${reference.slug} view ${viewIndex + 1} top`
          + ` expected ${goldenView.topY}, received ${actualTopY}`,
        );
      }
      if (Math.abs(actualBottomY - goldenView.bottomY) > 1) {
        violations.push(
          `${reference.slug} view ${viewIndex + 1} bottom`
          + ` expected ${goldenView.bottomY}, received ${actualBottomY}`,
        );
      }

      for (const anchor of goldenView.anchors) {
        const actualLeftX = xAtY(sides.left, anchor.y);
        const actualRightX = xAtY(sides.right, anchor.y);
        if (
          Math.abs(actualLeftX - anchor.leftX) > 2
          || Math.abs(actualRightX - anchor.rightX) > 2
        ) {
          violations.push(
            `${reference.slug} view ${viewIndex + 1} y=${anchor.y}`
            + ` expected ${anchor.leftX}..${anchor.rightX},`
            + ` received ${actualLeftX}..${actualRightX}`,
          );
        }
      }
      const sourceEdgeErrors = goldenView.sourceRows.flatMap(
        ([y, leftX, rightX]) => [
          Math.abs(xAtY(sides.left, y) - leftX),
          Math.abs(xAtY(sides.right, y) - rightX),
        ],
      );
      const p95 = percentile(sourceEdgeErrors, 0.95);
      const withinTwoRate =
        sourceEdgeErrors.filter((error) => error <= 2).length
        / sourceEdgeErrors.length;
      if (p95 > 2 || withinTwoRate < 0.95) {
        violations.push(
          `${reference.slug} view ${viewIndex + 1}`
          + ` source silhouette p95=${p95}px`
          + ` within2=${(withinTwoRate * 100).toFixed(1)}%`,
        );
      }
      const capReturnY = goldenView.anchors.find(
        ({ label }) => label === "cap-return",
      )?.y;
      assert.ok(capReturnY !== undefined);
      const terminalEdgeErrors = goldenView.sourceRows
        .filter(([y]) => y >= capReturnY)
        .flatMap(([y, leftX, rightX]) => [
          Math.abs(xAtY(sides.left, y) - leftX),
          Math.abs(xAtY(sides.right, y) - rightX),
        ]);
      const terminalMaximumError = Math.max(...terminalEdgeErrors);
      if (terminalMaximumError > 2) {
        violations.push(
          `${reference.slug} view ${viewIndex + 1}`
          + ` terminal max=${terminalMaximumError}px`,
        );
      }
    }
  }

  assert.deepEqual(violations, []);
});

test("the retained local calibration corpus matches the golden source hashes", async (t) => {
  const sources = await Promise.all(
    gripReferences.map(async (reference) => ({
      reference,
      sourcePath: await findLocalSource(reference.productCode),
    })),
  );
  const availableSources = sources.filter(
    (entry): entry is typeof entry & { sourcePath: string } =>
      entry.sourcePath !== null,
  );

  if (availableSources.length === 0) {
    t.skip("The ignored 54-photo calibration corpus is not available in this checkout.");
    return;
  }
  assert.equal(
    availableSources.length,
    gripReferences.length,
    "A partial local calibration corpus must not produce a partial hash audit.",
  );

  const violations: string[] = [];
  for (const { reference, sourcePath } of availableSources) {
    const actualHash = createHash("sha256")
      .update(await readFile(sourcePath))
      .digest("hex");
    if (actualHash !== reference.sourceSha256) {
      violations.push(
        `${reference.productCode}: expected ${reference.sourceSha256}, received ${actualHash}`,
      );
    }
  }

  assert.deepEqual(violations, []);
});
