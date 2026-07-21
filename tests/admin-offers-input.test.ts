import assert from "node:assert/strict";
import test from "node:test";

test("shipping input distinguishes blank from free shipping", async () => {
  const offersPage = await import("../src/app/admin/offers/page");
  const parse = offersPage.parseOptionalShippingFee;

  assert.equal(typeof parse, "function");
  if (!parse) return;
  assert.equal(parse(""), null);
  assert.equal(parse("   "), null);
  assert.equal(parse(null), null);
  assert.equal(parse("0"), 0);
  assert.equal(parse("3000"), 3000);
  assert.equal(parse("-1"), null);
  assert.equal(parse("not-a-number"), null);
});

test("offer product keys reject unknown string-prefixed values", async () => {
  const offersPage = await import("../src/app/admin/offers/page");
  const isAllowed = offersPage.isAllowedOfferProductKey;

  assert.equal(isAllowed("wilson-blade-98-16x19-v9-2024"), true);
  assert.equal(isAllowed("string:luxilon-alu-power-125"), true);
  assert.equal(isAllowed("string:not-in-the-catalog"), false);
  assert.equal(isAllowed(""), false);
});
