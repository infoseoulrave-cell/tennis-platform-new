import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("admin offer and partner server actions revalidate the admin session", () => {
  const offers = read("src/app/admin/offers/page.tsx");
  const partners = read("src/app/admin/partners/page.tsx");

  assert.equal(offers.match(/await requireAdminSession\(\);/g)?.length, 3);
  assert.equal(partners.match(/await requireAdminSession\(\);/g)?.length, 1);

  for (const source of [offers, partners]) {
    assert.match(source, /cookies\(\)/);
    assert.match(source, /isValidAdminToken/);
    assert.match(source, /createAdminSessionToken/);
  }
});

test("admin dashboard separates commercial offers from partner inquiries", () => {
  const dashboard = read("src/app/admin/page.tsx");

  assert.match(dashboard, /href="\/admin\/offers"/);
  assert.match(dashboard, /Offers · Monetization/);
  assert.match(dashboard, /href="\/admin\/partners"/);
  assert.match(dashboard, /Partner Inquiries/);
  assert.doesNotMatch(dashboard, /<strong>Partner Offers<\/strong>/);
});
