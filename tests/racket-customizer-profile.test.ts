import assert from "node:assert/strict";
import test from "node:test";

import {
  imageProductCode,
  matchesCustomizerDimensions,
  resolveCustomizerProfile,
} from "../src/lib/racket-customizer";

const image =
  "https://img.tennis-warehouse.com/watermark/rs.php?path=HGMPG-1.jpg&nw=500";

test("profile resolution requires the exact slug and product code", () => {
  const profile = resolveCustomizerProfile("head-gravity-mp-2025", image);

  assert.equal(profile?.productCode, "HGMPG");
  assert.equal(resolveCustomizerProfile("head-speed-pro-2026", image), null);
  assert.equal(
    resolveCustomizerProfile(
      "head-gravity-mp-2025",
      "https://img.tennis-warehouse.com/watermark/rs.php?path=EZ10BB-1.jpg",
    ),
    null,
  );
});

test("profile resolution fails closed for malformed or non-canonical image URLs", () => {
  const invalidUrls = [
    "http://img.tennis-warehouse.com/watermark/rs.php?path=HGMPG-1.jpg",
    "https://images.tennis-warehouse.com/watermark/rs.php?path=HGMPG-1.jpg",
    "https://img.tennis-warehouse.com/watermark/other.php?path=HGMPG-1.jpg",
    "https://img.tennis-warehouse.com/watermark/rs.php?path=HGMPG-2.jpg",
    "https://img.tennis-warehouse.com/watermark/rs.php?path=HGMPG-1.png",
    "https://img.tennis-warehouse.com/watermark/rs.php?path=NOT-HGMPG-1.jpg",
    "https://img.tennis-warehouse.com/watermark/rs.php?nw=500",
    "not a URL",
  ];

  for (const imageUrl of invalidUrls) {
    assert.equal(imageProductCode(imageUrl), null);
    assert.equal(resolveCustomizerProfile("head-gravity-mp-2025", imageUrl), null);
  }
});

test("intrinsic dimensions must be finite positive exact calibration matches", () => {
  const profile = resolveCustomizerProfile("head-gravity-mp-2025", image);
  assert.ok(profile);

  assert.equal(
    matchesCustomizerDimensions(
      profile,
      profile.intrinsicWidth,
      profile.intrinsicHeight,
    ),
    true,
  );

  for (const [naturalWidth, naturalHeight] of [
    [400, 400],
    [Infinity, profile.intrinsicHeight],
    [Number.NaN, profile.intrinsicHeight],
    [0, profile.intrinsicHeight],
    [-1, profile.intrinsicHeight],
    [profile.intrinsicWidth, 0],
    [profile.intrinsicWidth, -1],
  ]) {
    assert.equal(
      matchesCustomizerDimensions(profile, naturalWidth, naturalHeight),
      false,
    );
  }
});
