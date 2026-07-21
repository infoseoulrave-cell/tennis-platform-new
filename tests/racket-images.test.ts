import assert from "node:assert/strict";
import test from "node:test";

import { resolveRacketImage } from "../src/lib/racket-images";

test("unverified generated local artwork is never presented as a product photo", () => {
  assert.equal(
    resolveRacketImage("/images/rackets/babolat-pure-aero-2026.png", "babolat-pure-aero-2026"),
    null,
  );
  assert.equal(
    resolveRacketImage("/images/rackets/head-speed-pro-2026.svg", "head-speed-pro-2026"),
    null,
  );
});

test("a retailer image is accepted only when its product code matches the exact slug", () => {
  const correct =
    "https://img.tennis-warehouse.com/watermark/rs.php?path=HSPDP6-1.jpg&nw=500";
  const wrong =
    "https://img.tennis-warehouse.com/watermark/rs.php?path=WB9816-1.jpg&nw=500";

  assert.deepEqual(resolveRacketImage(correct, "head-speed-pro-2026"), {
    url: correct,
    source: "Tennis Warehouse",
    kind: "verified-retailer-photo",
  });
  assert.equal(resolveRacketImage(wrong, "head-speed-pro-2026"), null);
});

test("unknown external and malformed image URLs fail closed", () => {
  assert.equal(resolveRacketImage("https://example.com/racket.jpg", "head-speed-pro-2026"), null);
  assert.equal(resolveRacketImage("not-a-url", "head-speed-pro-2026"), null);
  assert.equal(resolveRacketImage(null, "head-speed-pro-2026"), null);
});
