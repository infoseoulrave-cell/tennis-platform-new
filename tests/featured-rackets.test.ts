import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  selectRacketsByCatalogIdentities,
  type RacketListItem,
} from "../src/lib/queries";
import {
  featuredRacketCatalogIdentities,
  featuredRacketSpecs,
  featuredRacketTags,
  hydrateFeaturedRackets,
} from "../src/data/featured-rackets";

function catalogRacket(overrides: Partial<RacketListItem> = {}): RacketListItem {
  return {
    id: "pure-aero-id",
    slug: "babolat-pure-aero-2026",
    brand: "Babolat",
    model: "Pure Aero 2026",
    year: 2026,
    weight: "301g",
    headSize: '101"',
    pattern: "16x20",
    priceKrw: null,
    imageUrl: null,
    scores: {
      power: 2.4,
      control: 0.3,
      spin: 4.2,
      comfort: -1.1,
      stability: 1.7,
    },
    availableInKorea: true,
    ...overrides,
  };
}

test("featured hero hydrates scores and specs directly from catalog input", () => {
  const canonical = catalogRacket();
  const [hero] = hydrateFeaturedRackets([canonical]);

  assert.deepEqual(hero.scores, canonical.scores);
  assert.equal(hero.weight, canonical.weight);
  assert.equal(hero.headSize, canonical.headSize);
  assert.equal(hero.pattern, canonical.pattern);
  assert.deepEqual(featuredRacketSpecs(hero), [canonical.weight, canonical.headSize, canonical.pattern]);
  assert.deepEqual(
    featuredRacketTags(hero).map(({ label, value }) => [label, value]),
    [
      ["스핀", "+4"],
      ["파워", "+2"],
      ["데이터", "카탈로그 연동"],
    ],
  );
});

test("featured hero fallback never invents numeric scores or specs", () => {
  const fallback = hydrateFeaturedRackets([]);

  assert.equal(fallback.length, 3);
  assert.equal(fallback[0]?.model, "PURE AERO GEN 9");
  for (const racket of fallback) {
    assert.equal(racket.scores, null);
    assert.equal(racket.weight, null);
    assert.equal(racket.headSize, null);
    assert.equal(racket.pattern, null);

    const fallbackCopy = [
      ...featuredRacketTags(racket).map((tag) => tag.value),
      ...featuredRacketSpecs(racket),
    ].join(" ");
    assert.doesNotMatch(fallbackCopy, /[+-]?\d/);
    assert.match(fallbackCopy, /공식|지향|공격형|균형형/);
  }
});

test("home hero query selects only the three configured canonical identities", () => {
  const pureAero = catalogRacket();
  const speed = catalogRacket({
    id: "speed-id",
    slug: "head-speed-mp-2026",
    brand: "Head",
    model: "Speed MP 2026",
  });
  const unrelated = catalogRacket({
    id: "unrelated-id",
    slug: "head-pure-aero-2026",
    brand: "Head",
  });

  assert.deepEqual(
    selectRacketsByCatalogIdentities(
      [unrelated, speed, pureAero],
      featuredRacketCatalogIdentities,
    ).map((racket) => racket.slug),
    ["babolat-pure-aero-2026", "head-speed-mp-2026"],
  );

  const home = readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");
  assert.match(home, /getRacketsByCatalogIdentities/);
  assert.doesNotMatch(home, /getRackets\(\{\s*limit:\s*1000/);
});
