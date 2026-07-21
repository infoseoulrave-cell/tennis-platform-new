import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  formatTopRacketName,
  topRacketHref,
  topRacketsFallback,
} from "../src/components/top-rackets-list";
import { featuredRackets } from "../src/data/featured-rackets";
import { omegaPlayerShowcase } from "../src/data/omega-player-showcase";
import { players } from "../src/data/players";

test("Omega hero starts with Pure Aero Gen 9 and keeps three slides", () => {
  assert.equal(featuredRackets[0]?.model, "PURE AERO GEN 9");
  assert.equal(featuredRackets.length, 3);
});

test("Omega Top 5 fallback remains available when the database has no rows", () => {
  assert.deepEqual(
    topRacketsFallback.map(({ brand, model, weight, headSize, priceKrw }) => ({
      brand,
      model,
      weight,
      headSize,
      priceKrw,
    })),
    [
      {
        brand: "Yonex",
        model: "EZONE 100 2025",
        weight: "300g",
        headSize: '100"',
        priceKrw: 345000,
      },
      {
        brand: "Dunlop",
        model: "CX 200 2025",
        weight: "305g",
        headSize: '98"',
        priceKrw: 280000,
      },
      {
        brand: "Yonex",
        model: "VCORE 100L 2026",
        weight: "280g",
        headSize: '100"',
        priceKrw: 315000,
      },
      {
        brand: "Yonex",
        model: "EZONE 98 2025",
        weight: "305g",
        headSize: '98"',
        priceKrw: 345000,
      },
      {
        brand: "Dunlop",
        model: "FX 500 2025",
        weight: "300g",
        headSize: '100"',
        priceKrw: 280000,
      },
    ],
  );

  assert.deepEqual(topRacketsFallback.map(formatTopRacketName), [
    "EZONE 100 2025",
    "CX 200 2025",
    "VCORE 100L 2026",
    "EZONE 98 2025",
    "FX 500 2025",
  ]);

  for (const racket of topRacketsFallback) {
    const href = new URL(topRacketHref(racket), "https://example.com");
    assert.equal(href.pathname, "/rackets");
    assert.equal(href.searchParams.get("brand"), racket.brand);
    assert.equal(href.searchParams.get("q"), racket.model);
  }

  const list = readFileSync(
    new URL("../src/components/top-rackets-list.tsx", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(list, /href=\{`\/rackets\/\$\{racket\.slug\}`\}/);
  assert.match(list, /new URLSearchParams/);
});

test("home player showcase keeps the Omega short names", () => {
  assert.deepEqual(
    omegaPlayerShowcase.map((player) => player.nameKo),
    ["시너", "알카라스", "조코비치", "즈베레프", "메드베데프", "프리츠", "루드", "드 미노르", "루블료프"],
  );

  const section = readFileSync(
    new URL("../src/components/player-synergy-card.tsx", import.meta.url),
    "utf8",
  );
  assert.match(section, /omegaPlayerShowcase\.map/);
  assert.doesNotMatch(section, /generateSlug/);
  assert.doesNotMatch(section, /AxisBars/);
  assert.match(section, /equipment\.disclosure/);
  assert.match(section, /equipment\.sourceUrl/);

  const verifiedById = new Map(players.map((player) => [player.id, player]));
  for (const showcase of omegaPlayerShowcase) {
    const verified = verifiedById.get(showcase.id);
    assert.ok(verified);
    assert.deepEqual(showcase.tags, verified.tags);
    assert.deepEqual(showcase.equipment, verified.equipment);
    assert.deepEqual(showcase.photo, verified.photo);
    assert.equal(showcase.synergy, verified.synergy);
    assert.equal(showcase.verifiedAt, verified.verifiedAt);
  }

  const showcaseData = readFileSync(
    new URL("../src/data/omega-player-showcase.ts", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(showcaseData, /axisScores|scores:/);
});

test("Omega hero shows compact source and verification links", () => {
  const hero = readFileSync(
    new URL("../src/components/hero-carousel.tsx", import.meta.url),
    "utf8",
  );
  assert.match(hero, /racket\.imageSourceUrl/);
  assert.match(hero, /racket\.specSourceUrl/);
  assert.match(hero, /racket\.verifiedAt/);
  assert.match(hero, /import Image from "next\/image"/);
  assert.match(hero, /<Image/);
  assert.match(hero, /preload=\{index === 0\}/);
  assert.doesNotMatch(hero, /<img/);
});

test("partners page renders the inquiry form", () => {
  const partners = readFileSync(
    new URL("../src/app/partners/page.tsx", import.meta.url),
    "utf8",
  );
  assert.match(partners, /<PartnerInquiryForm \/>/);
});
