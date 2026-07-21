import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("affiliate URLs only accept absolute HTTP(S) destinations", async () => {
  const offerUrl = await import("../src/lib/offer-url").catch(() => ({}));
  const isSafeOfferUrl = "isSafeOfferUrl" in offerUrl
    ? offerUrl.isSafeOfferUrl as (value: unknown) => boolean
    : undefined;

  assert.equal(typeof isSafeOfferUrl, "function");
  if (!isSafeOfferUrl) return;
  assert.equal(isSafeOfferUrl("https://shop.example/product"), true);
  assert.equal(isSafeOfferUrl("http://shop.example/product"), true);
  assert.equal(isSafeOfferUrl("javascript:alert(1)"), false);
  assert.equal(isSafeOfferUrl("data:text/html,hello"), false);
  assert.equal(isSafeOfferUrl("/relative"), false);
  assert.equal(isSafeOfferUrl(""), false);
});

test("offer creation and redirect both enforce the shared URL guard", () => {
  const offersAdmin = readFileSync(
    new URL("../src/app/admin/offers/page.tsx", import.meta.url),
    "utf8",
  );
  const redirectRoute = readFileSync(
    new URL("../src/app/go/[offerId]/route.ts", import.meta.url),
    "utf8",
  );

  assert.match(offersAdmin, /isSafeOfferUrl\(url\)/);
  assert.match(redirectRoute, /isSafeOfferUrl\(offer\.url\)/);
  assert.match(redirectRoute, /new URL\("\/rackets", request\.url\)/);
});
