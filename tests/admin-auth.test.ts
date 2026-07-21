import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";

import {
  createAdminSessionToken,
  isAdminRequest,
  isValidAdminToken,
} from "../src/lib/admin-auth";
import { POST as authenticateAdmin } from "../src/app/api/admin/auth/route";
import { POST as importCatalog } from "../src/app/api/admin/catalog/import/route";
import { GET as listRackets } from "../src/app/api/admin/catalog/rackets/route";
import { GET as reviewCatalog } from "../src/app/api/admin/catalog/review/route";
import { GET as getTemplate } from "../src/app/api/admin/catalog/template/route";
import { POST as transitionSpec } from "../src/app/api/admin/catalog/specs/[id]/transition/route";
import { POST as resolveSpec } from "../src/app/api/admin/catalog/specs/[id]/resolve/route";

test("admin cookie validation denies missing secrets and uses the request cookie", () => {
  assert.equal(isValidAdminToken(undefined, undefined), false);
  assert.equal(isValidAdminToken(123, "secret"), false);
  assert.equal(isValidAdminToken("secret", "secret"), true);
  assert.equal(isValidAdminToken("wrong", "secret"), false);

  const sessionToken = createAdminSessionToken("secret");
  assert.notEqual(sessionToken, "secret");
  const request = new NextRequest("https://example.com/api/admin/catalog/template", {
    headers: { cookie: `admin_token=${sessionToken}` },
  });
  assert.equal(isAdminRequest(request, "secret"), true);

  const rawSecretRequest = new NextRequest("https://example.com/api/admin/catalog/template", {
    headers: { cookie: "admin_token=secret" },
  });
  assert.equal(isAdminRequest(rawSecretRequest, "secret"), false);
});

test("login stores a derived httpOnly session token instead of the admin secret", async () => {
  const previousSecret = process.env.ADMIN_SECRET;
  process.env.ADMIN_SECRET = "admin-password";

  try {
    const response = await authenticateAdmin(new NextRequest("https://example.com/api/admin/auth", {
      method: "POST",
      body: JSON.stringify({ secret: "admin-password" }),
      headers: { "content-type": "application/json" },
    }));
    const cookie = response.headers.get("set-cookie") ?? "";

    assert.equal(response.status, 200);
    assert.match(cookie, /admin_token=/);
    assert.match(cookie, /HttpOnly/i);
    assert.doesNotMatch(cookie, /admin-password/);
    assert.match(cookie, new RegExp(createAdminSessionToken("admin-password")));
  } finally {
    process.env.ADMIN_SECRET = previousSecret;
  }
});

test("every catalog API rejects a request without the httpOnly admin session cookie", async () => {
  const getRequest = () => new NextRequest("https://example.com/api/admin/catalog");
  const postRequest = () => new NextRequest("https://example.com/api/admin/catalog", {
    method: "POST",
    body: "{}",
    headers: { "content-type": "application/json" },
  });
  const params = { params: Promise.resolve({ id: "spec-id" }) };

  const responses = await Promise.all([
    listRackets(getRequest()),
    reviewCatalog(getRequest()),
    getTemplate(getRequest()),
    importCatalog(postRequest()),
    transitionSpec(postRequest(), params),
    resolveSpec(postRequest(), params),
  ]);

  assert.deepEqual(responses.map((response) => response.status), [401, 401, 401, 401, 401, 401]);
});
