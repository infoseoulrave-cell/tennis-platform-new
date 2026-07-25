import assert from "node:assert/strict";
import test from "node:test";

import {
  resolveRacketCustomizerRoute,
  type RacketCustomizerCandidate,
} from "../src/lib/racket-customizer-route";

const imageUrl =
  "https://img.tennis-warehouse.com/watermark/rs.php?path=HGMPG-1.jpg&nw=500";

test("canonical supported rackets resolve ready", async () => {
  const racket = {
    slug: "head-gravity-mp-2025",
    imageUrl,
    brand: "Head",
  };

  const result = await resolveRacketCustomizerRoute(racket.slug, async (slug) => {
    assert.equal(slug, "head-gravity-mp-2025");
    return racket;
  });

  assert.equal(result.kind, "ready");
  if (result.kind !== "ready") return;
  assert.equal(result.racket, racket);
  assert.equal(result.imageUrl, imageUrl);
  assert.equal(result.profile.productCode, "HGMPG");
});

test("database aliases redirect to the supported canonical route", async () => {
  const result = await resolveRacketCustomizerRoute("gravity-mp", async () => ({
    slug: "head-gravity-mp-2025",
    imageUrl,
  }));

  assert.deepEqual(result, {
    kind: "redirect",
    location: "/customizer/head-gravity-mp-2025",
  });
});

test("missing or unsupported rackets resolve not-found", async () => {
  const scenarios: Array<{
    label: string;
    racket: RacketCustomizerCandidate | null;
  }> = [
    { label: "missing racket", racket: null },
    {
      label: "missing image",
      racket: { slug: "head-gravity-mp-2025", imageUrl: null },
    },
    {
      label: "missing profile",
      racket: { slug: "head-speed-pro-2026", imageUrl },
    },
  ];

  for (const { label, racket } of scenarios) {
    const result = await resolveRacketCustomizerRoute(
      label,
      async () => racket,
    );
    assert.deepEqual(result, { kind: "not-found" }, label);
  }
});

test("loader failures propagate to the route error boundary", async () => {
  const failure = new Error("database unavailable");

  await assert.rejects(
    () =>
      resolveRacketCustomizerRoute("head-gravity-mp-2025", async () => {
        throw failure;
      }),
    (error) => error === failure,
  );
});
