import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { NextRequest } from "next/server";

import { POST } from "../src/app/api/partner-inquiries/route";
import { partnerInquirySchema } from "../src/lib/partner-inquiry";

const validInquiry = {
  inquiryType: "shop",
  name: "테니스 샵",
  contact: "contact@example.com",
};

test("partner inquiry honeypot rejects automated submissions", async () => {
  assert.equal(
    partnerInquirySchema.safeParse({ ...validInquiry, website: "https://spam.example" }).success,
    false,
  );
  assert.equal(
    partnerInquirySchema.safeParse({ ...validInquiry, website: "" }).success,
    true,
  );

  const response = await POST(new NextRequest("https://example.com/api/partner-inquiries", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...validInquiry, website: "bot-filled" }),
  }));
  assert.equal(response.status, 400);
});

test("partner form submits the honeypot field", () => {
  const form = readFileSync(
    new URL("../src/components/partner-inquiry-form.tsx", import.meta.url),
    "utf8",
  );
  assert.match(form, /name="website"/);
  assert.match(form, /data\.get\("website"\)/);
});
