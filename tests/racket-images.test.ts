import assert from "node:assert/strict";
import test from "node:test";

import { RACKET_SCORE_EVIDENCE } from "../src/data/racket-score-evidence";
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

test("corrected Prestige and T-Fight identities accept canonical and legacy slugs", () => {
  const prestige =
    "https://img.tennis-warehouse.com/watermark/rs.php?path=HPRMP-1.jpg&nw=500";
  const tfight =
    "https://img.tennis-warehouse.com/watermark/rs.php?path=ISO305-1.jpg&nw=500";

  assert.ok(resolveRacketImage(prestige, "head-prestige-mp-2023"));
  assert.ok(resolveRacketImage(prestige, "head-prestige-mp-2025"));
  assert.ok(resolveRacketImage(tfight, "tecnifibre-t-fight-305-isoflex-2022"));
  assert.ok(resolveRacketImage(tfight, "tecnifibre-t-fight-305-isoflex-2024"));
});

test("known mismatched catalog image codes are corrected to exact TW products", () => {
  const corrected = [
    ["BRPTR", "babolat-pure-drive-team-2025"],
    ["PS1019", "babolat-pure-strike-100-2024"],
    ["WSP300D", "wilson-shift-99-v1-2024"],
    ["HGMPG", "head-gravity-mp-2025"],
    ["HREM24", "head-extreme-mp-2024"],
    ["EZ10BB", "yonex-ezone-100-2025"],
    ["ISO305", "tecnifibre-t-fight-305-isoflex-2022"],
  ] as const;

  for (const [code, slug] of corrected) {
    const url =
      `https://img.tennis-warehouse.com/watermark/rs.php?path=${code}-1.jpg&nw=500`;
    assert.ok(resolveRacketImage(url, slug), `${code} should resolve ${slug}`);
  }
});

test("all manifest product images pass the exact canonical slug allowlist", () => {
  for (const { identity } of RACKET_SCORE_EVIDENCE) {
    const modelHasYear = new RegExp(
      `(?:^|\\D)${identity.releaseYear}(?:\\D|$)`,
    ).test(identity.modelName);
    const slug = [
      identity.brand,
      identity.modelName,
      modelHasYear ? "" : identity.releaseYear,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .replace(/[()]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const imageUrl =
      `https://img.tennis-warehouse.com/watermark/rs.php?path=${identity.productCode}-1.jpg&nw=500`;

    assert.ok(
      resolveRacketImage(imageUrl, slug),
      `${identity.productCode} should resolve ${slug}`,
    );
  }
});
