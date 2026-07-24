import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  STRING_OFFER_KEYS,
  STRING_TENSION_METHODOLOGY,
  getStringProduct,
  stringProducts,
  type StringOfferKey,
} from "../src/data/strings";
import {
  isSafetyCompatibleString,
  recommendStringPairings,
  requiresComfortSafetyGate,
  type StringPairingInput,
} from "../src/lib/string-pairing";

const read = (path: string) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const completeAxes = (
  overrides: Partial<Record<"power" | "control" | "spin" | "comfort" | "stability", number>> = {},
) => ({
  power: 60,
  control: 60,
  spin: 60,
  comfort: 60,
  stability: 60,
  ...overrides,
});

test("official string catalog contains 24 complete, unique, sourced products", () => {
  assert.equal(stringProducts.length, 24);
  assert.equal(new Set(STRING_OFFER_KEYS).size, 24);
  assert.equal(new Set(stringProducts.map((product) => product.sourceUrl)).size, 24);

  const legacyKeys: StringOfferKey[] = [
    "string:luxilon-alu-power-125",
    "string:babolat-rpm-blast-12m",
    "string:yonex-polytour-pro",
    "string:tecnifibre-x-one-biphase-12m",
  ];
  for (const key of legacyKeys) assert.ok(STRING_OFFER_KEYS.includes(key));

  for (const product of stringProducts) {
    assert.ok(product.brand.trim());
    assert.ok(product.name.trim());
    assert.ok(product.material.trim());
    assert.ok(product.gaugeMm > 0);
    assert.ok(product.officialTraits.length > 0);
    assert.ok(product.editorialTags.length > 0);
    assert.ok(
      product.officialTraits.every((trait) => (
        trait.text.trim()
        && (trait.evidence === "fact" || trait.evidence === "manufacturer_claim")
      )),
    );
    assert.ok(Number.isInteger(product.startTensionLbs.min));
    assert.ok(Number.isInteger(product.startTensionLbs.max));
    assert.ok(product.startTensionLbs.min <= product.startTensionLbs.max);
    assert.equal(product.startTensionLbs.evidence, "editorial");
    assert.ok(product.startTensionLbs.rationale.trim());
    assert.equal(
      product.startTensionLbs.sourceUrl,
      STRING_TENSION_METHODOLOGY.sourceUrl,
    );
    if (product.materialType === "polyester") {
      assert.ok(product.startTensionLbs.min >= 44);
      assert.ok(product.startTensionLbs.max <= 54);
    } else {
      assert.ok(product.startTensionLbs.min >= 50);
      assert.ok(product.startTensionLbs.max <= 60);
    }
    assert.match(product.sourceUrl, /^https:\/\//);
    assert.match(product.verifiedAt, /^\d{4}-\d{2}-\d{2}$/);
  }

  assert.equal(STRING_TENSION_METHODOLOGY.evidence, "editorial");
  assert.match(STRING_TENSION_METHODOLOGY.sourceUrl, /^https:\/\/www\.wilson\.com\//);
  assert.match(STRING_TENSION_METHODOLOGY.summary, /44–54 lbs/);
  assert.match(STRING_TENSION_METHODOLOGY.summary, /50–60 lbs/);
  assert.match(STRING_TENSION_METHODOLOGY.summary, /제품별/);
});

test("pairing engine is deterministic, distinct, in-catalog, and tension-bounded", () => {
  const input: StringPairingInput = {
    stiffnessRa: 64,
    weightG: 300,
    headSizeSqIn: 100,
    stringPattern: "16x19",
    segment: "advanced",
    rawScores: completeAxes({ spin: 82, control: 76 }),
  };
  const first = recommendStringPairings(input);
  const second = recommendStringPairings(input);

  assert.deepEqual(first, second);
  assert.deepEqual(first.map((item) => item.mode), [
    "comfort",
    "balanced",
    "spin-control",
  ]);
  assert.equal(new Set(first.map((item) => item.product.offerKey)).size, 3);

  for (const item of first) {
    assert.ok(STRING_OFFER_KEYS.includes(item.product.offerKey));
    const catalogProduct = getStringProduct(item.product.offerKey);
    assert.equal(item.product.name, catalogProduct.name);
    assert.ok(item.reason.length > 0);
    assert.ok(item.tradeoff.length > 0);
    assert.ok(item.tensionLbs.min >= catalogProduct.startTensionLbs.min);
    assert.ok(item.tensionLbs.max <= catalogProduct.startTensionLbs.max);
  }
});

test("high stiffness or low comfort excludes every polyester option", () => {
  const input: StringPairingInput = {
    stiffnessRa: 70,
    weightG: 305,
    headSizeSqIn: 100,
    stringPattern: "16x19",
    rawScores: completeAxes({ comfort: 35 }),
  };
  assert.equal(requiresComfortSafetyGate(input), true);
  const pairings = recommendStringPairings(input);
  assert.ok(pairings.every((pairing) => isSafetyCompatibleString(pairing.product)));
  assert.ok(pairings.every((pairing) => pairing.product.materialType !== "polyester"));
  assert.match(pairings[0].reason, /RA 70/);
  assert.match(pairings[0].reason, /편안함 35점/);
});

test("beginner and arm-sensitive profiles exclude every polyester full-bed option", () => {
  const pairings = recommendStringPairings({
    stiffnessRa: 64,
    weightG: 290,
    headSizeSqIn: 102,
    stringPattern: "16x19",
    beginner: true,
    armSensitive: true,
    rawScores: completeAxes({ spin: 80 }),
  });
  assert.ok(pairings.every((pairing) => pairing.product.materialType !== "polyester"));
});

test("open spin case receives a catalog spin product with input-grounded reason", () => {
  const pairing = recommendStringPairings({
    stiffnessRa: 64,
    weightG: 300,
    headSizeSqIn: 100,
    stringPattern: "16x19",
    rawScores: completeAxes({ spin: 88, control: 75 }),
  }).find((item) => item.mode === "spin-control");

  assert.ok(pairing);
  assert.ok(pairing.product.editorialTags.includes("spin"));
  assert.match(pairing.reason, /16x19/);
  assert.match(pairing.reason, /스핀 88점/);
  assert.match(pairing.reason, /오픈 패턴/);
});

test("dense low-power case favors power support and dense-pattern control", () => {
  const pairings = recommendStringPairings({
    stiffnessRa: 62,
    weightG: 310,
    headSizeSqIn: 97,
    stringPattern: "18x20",
    rawScores: completeAxes({
      power: 35,
      control: 85,
      spin: 45,
      stability: 80,
    }),
  });
  const balanced = pairings.find((item) => item.mode === "balanced");
  const spinControl = pairings.find((item) => item.mode === "spin-control");

  assert.ok(balanced);
  assert.ok(spinControl);
  assert.ok(balanced.product.editorialTags.includes("power"));
  assert.ok(spinControl.product.editorialTags.includes("control"));
  assert.match(balanced.reason, /파워 35점/);
  assert.match(spinControl.reason, /18x20/);
  assert.match(spinControl.reason, /촘촘한 패턴/);
});

test("missing meaningful evidence returns no string recommendation", () => {
  assert.deepEqual(recommendStringPairings({}), []);
  assert.deepEqual(recommendStringPairings({
    stiffnessRa: null,
    weightG: null,
    headSizeSqIn: null,
    stringPattern: " ",
    segment: null,
    rawScores: {
      power: undefined,
      control: undefined,
      spin: undefined,
      comfort: undefined,
      stability: undefined,
    },
  }), []);
});

test("candidate exhaustion fails closed without bypassing catalog filters", () => {
  const originalProducts = [...stringProducts];
  stringProducts.splice(
    0,
    stringProducts.length,
    ...originalProducts.filter((product) => product.materialType === "polyester"),
  );
  try {
    assert.deepEqual(recommendStringPairings({
      stiffnessRa: 70,
      rawScores: completeAxes({ comfort: 30 }),
    }), []);
  } finally {
    stringProducts.splice(0, stringProducts.length, ...originalProducts);
  }
});

test("Black Code does not carry an unsupported over-300g manufacturer claim", () => {
  const blackCode = getStringProduct("string:tecnifibre-black-code-124");
  assert.ok(blackCode.officialTraits.every((trait) => !trait.text.includes("300g")));
});

test("racket detail and diagnosis results use the same shared pairing engine", () => {
  const detail = read("src/app/rackets/[slug]/page.tsx");
  const results = read("src/app/results/[id]/page.tsx");

  for (const source of [detail, results]) {
    assert.match(source, /recommendStringPairings/);
    assert.match(source, /stringOfferId/);
    assert.match(source, /\/strings#/);
  }
  assert.doesNotMatch(detail, /getStringRecommendation/);
  assert.doesNotMatch(results, /function suggestString/);
  assert.match(results, /result\.axisScores/);
  assert.match(results, /pain_points/);
});
