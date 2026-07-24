import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { RACKET_CUSTOMIZER_PROFILES } from "../src/data/racket-customizer-profiles.generated";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const PILOT_SLUGS = [
  "babolat-pure-aero-2026",
  "head-gravity-mp-2025",
  "yonex-ezone-100-2025",
] as const;

const BABOLAT_DUNLOP_REMAINDER = [
  "babolat-pure-aero-98-2026",
  "babolat-pure-aero-lite-2026",
  "babolat-pure-aero-team-2026",
  "babolat-pure-drive-2025",
  "babolat-pure-drive-98-gen11-2025",
  "babolat-pure-drive-lite-2025",
  "babolat-pure-drive-team-2025",
  "babolat-pure-strike-100-2024",
  "babolat-pure-strike-98-16x19-2024",
  "dunlop-cx-200-2025",
  "dunlop-fx-500-2025",
  "dunlop-fx-500-tour-2025",
  "dunlop-sx-300-2025",
  "dunlop-sx-300-tour-2025",
] as const;

const EXPECTED_SLUGS = [...PILOT_SLUGS, ...BABOLAT_DUNLOP_REMAINDER];

test("the pilot and Babolat/Dunlop remainder have generated profiles and masks", async () => {
  assert.deepEqual(
    RACKET_CUSTOMIZER_PROFILES.map(({ slug }) => slug).sort(),
    [...EXPECTED_SLUGS].sort(),
  );

  await Promise.all(
    EXPECTED_SLUGS.flatMap((slug) => [
      access(path.join(projectRoot, "public", "images", "racket-customizer", `${slug}-strings.svg`)),
      access(path.join(projectRoot, "public", "images", "racket-customizer", `${slug}-grip.svg`)),
    ]),
  );
});
