import test from "node:test";
import assert from "node:assert/strict";
import {
  lowestPriceOfferId,
  sortOffersByPrice,
  totalPrice,
  type Offer,
} from "../src/lib/offers.js";
import { partnerInquirySchema } from "../src/lib/partner-inquiry.js";

function makeOffer(overrides: Partial<Offer>): Offer {
  return {
    id: crypto.randomUUID(),
    racketSlug: "test-racket",
    vendor: "other",
    vendorLabel: null,
    productName: null,
    url: "https://example.com",
    priceKrw: null,
    shippingFeeKrw: null,
    inStock: true,
    active: true,
    sortOrder: 0,
    lastCheckedAt: null,
    createdAt: new Date("2026-07-01"),
    updatedAt: new Date("2026-07-01"),
    ...overrides,
  };
}

test("totalPrice는 배송비를 포함하고, 가격 없으면 null", () => {
  assert.equal(totalPrice(makeOffer({ priceKrw: 100000, shippingFeeKrw: 3000 })), 103000);
  assert.equal(totalPrice(makeOffer({ priceKrw: 100000, shippingFeeKrw: 0 })), 100000);
  assert.equal(totalPrice(makeOffer({ priceKrw: 100000 })), 100000);
  assert.equal(totalPrice(makeOffer({})), null);
});

test("sortOffersByPrice: 재고 우선 → 총액 오름차순 → 가격 없음 뒤로", () => {
  const cheap = makeOffer({ priceKrw: 250000 });
  const mid = makeOffer({ priceKrw: 260000, shippingFeeKrw: 3000 });
  const noPrice = makeOffer({});
  const soldOut = makeOffer({ priceKrw: 200000, inStock: false });

  const sorted = sortOffersByPrice([soldOut, noPrice, mid, cheap]);
  assert.deepEqual(
    sorted.map((o) => o.id),
    [cheap.id, mid.id, noPrice.id, soldOut.id],
  );
});

test("lowestPriceOfferId: 재고 있는 최저가만 선택, 품절/무가격 제외", () => {
  const soldOutCheapest = makeOffer({ priceKrw: 100000, inStock: false });
  const realLowest = makeOffer({ priceKrw: 240000 });
  const noPrice = makeOffer({});

  assert.equal(
    lowestPriceOfferId([soldOutCheapest, realLowest, noPrice]),
    realLowest.id,
  );
  assert.equal(lowestPriceOfferId([soldOutCheapest, noPrice]), null);
  assert.equal(lowestPriceOfferId([]), null);
});

test("partnerInquirySchema: 필수값 검증", () => {
  assert.equal(
    partnerInquirySchema.safeParse({
      inquiryType: "shop",
      name: "서초 테니스마트",
      contact: "010-1234-5678",
    }).success,
    true,
  );
  // 유형 enum 밖
  assert.equal(
    partnerInquirySchema.safeParse({
      inquiryType: "hacker",
      name: "x",
      contact: "y",
    }).success,
    false,
  );
  // 이름/연락처 공백 불가
  assert.equal(
    partnerInquirySchema.safeParse({
      inquiryType: "brand",
      name: "  ",
      contact: "y",
    }).success,
    false,
  );
});
