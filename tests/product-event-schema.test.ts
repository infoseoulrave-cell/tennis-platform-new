import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { NextRequest } from "next/server";
import { POST } from "../src/app/api/events/route";
import { players } from "../src/data/players";
import { GRIP_COLOR_OPTIONS, STRING_COLOR_OPTIONS } from "../src/data/racket-customizer";
import { eventTypeEnum } from "../src/db/schema/events";
import { eventSchema, productInteractionSchemas } from "../src/events/product-interaction-schema";
import { EVENT_TYPES } from "../src/events/taxonomy";

const validPayloads = {
  string_pairing_click: {
    source: "racket_detail",
    racketSlug: "head-speed-mp-2026",
    stringOfferKey: "string:head-lynx-tour-125",
    mode: "balanced",
  },
  customizer_change: {
    racketSlug: "head-speed-mp-2026",
    renderMode: "photo",
    action: "select-string",
    stringColorId: "white",
    gripColorId: null,
  },
  player_racket_click: { source: "home", playerId: "sinner" },
} as const;

const envelope = (eventType: string, payload?: unknown) => ({
  sessionId: "test-product-event-session",
  eventType,
  payload,
  pageUrl: "https://racketlab.kr/rackets/head-speed-mp-2026",
});

test("product events preserve their public identifiers and permitted tracking context", () => {
  for (const [eventType, payload] of Object.entries(validPayloads)) {
    const input = envelope(eventType, {
      ...payload,
      campaign: {
        utm_source: "codex_qa",
        utm_medium: "referral",
        utm_campaign: "a".repeat(100),
        utm_content: "product-demo",
      },
      trafficType: "internal",
    });
    assert.deepEqual(eventSchema.parse(input), input);
    assert.equal(eventSchema.safeParse(envelope(eventType, { ...payload, trafficType: "unclassified" })).success, true);
    assert.equal(eventSchema.safeParse(envelope(eventType, payload)).success, true);
  }
});

test("both string sources and all three recommendation modes are accepted", () => {
  for (const source of ["racket_detail", "diagnosis_result"]) {
    for (const mode of ["comfort", "balanced", "spin-control"]) {
      assert.equal(productInteractionSchemas.string_pairing_click.safeParse({
        ...validPayloads.string_pairing_click, source, mode,
      }).success, true);
    }
  }
});

test("all public colors and players can be recorded without extra profile data", () => {
  for (const renderMode of ["photo", "schematic"]) {
    for (const { id: stringColorId } of STRING_COLOR_OPTIONS) {
      for (const { id: gripColorId } of GRIP_COLOR_OPTIONS) {
        assert.equal(productInteractionSchemas.customizer_change.safeParse({
          ...validPayloads.customizer_change, renderMode, stringColorId, gripColorId,
        }).success, true);
      }
    }
    assert.equal(productInteractionSchemas.customizer_change.safeParse({
      ...validPayloads.customizer_change, renderMode, action: "select-grip", stringColorId: null, gripColorId: "white",
    }).success, true);
    assert.equal(productInteractionSchemas.customizer_change.safeParse({
      ...validPayloads.customizer_change, renderMode, action: "reset", stringColorId: null, gripColorId: null,
    }).success, true);
  }
  for (const { id: playerId } of players) {
    for (const source of ["home", "players"]) {
      assert.equal(productInteractionSchemas.player_racket_click.safeParse({ source, playerId }).success, true);
    }
  }
});

test("new events reject sensitive and arbitrary payload fields instead of silently stripping them", () => {
  for (const [eventType, payload] of Object.entries(validPayloads)) {
    for (const key of ["diagnosis", "runId", "profileId", "formula", "weights", "query", "email", "extra"]) {
      const result = eventSchema.safeParse(envelope(eventType, { ...payload, [key]: "private" }));
      assert.equal(result.success, false, `${eventType}: ${key}`);
    }
    for (const campaign of [{ email: "private@example.com" }, { utm_term: "private" }, { utm_source: "x".repeat(101) }, { utm_medium: 1 }]) {
      assert.equal(eventSchema.safeParse(envelope(eventType, { ...payload, campaign })).success, false);
    }
    assert.equal(eventSchema.safeParse(envelope(eventType, { ...payload, trafficType: "customer" })).success, false);
    assert.equal(eventSchema.safeParse(envelope(eventType)).success, false);
  }
});

test("new events reject invalid identifiers, action states, and source classifications", () => {
  for (const racketSlug of ["", "x".repeat(201), "head-speed?profileId=secret", "../private", "https://example.com", "head speed", "HEAD-Speed"]) {
    assert.equal(productInteractionSchemas.string_pairing_click.safeParse({ ...validPayloads.string_pairing_click, racketSlug }).success, false);
    assert.equal(productInteractionSchemas.customizer_change.safeParse({ ...validPayloads.customizer_change, racketSlug }).success, false);
  }
  for (const stringOfferKey of ["head-lynx-tour-125", "string:", "string:head?query=secret", "string:" + "x".repeat(201)]) {
    assert.equal(productInteractionSchemas.string_pairing_click.safeParse({ ...validPayloads.string_pairing_click, stringOfferKey }).success, false);
  }
  for (const invalid of [{ mode: "best" }, { source: "diagnosis-input" }]) {
    assert.equal(productInteractionSchemas.string_pairing_click.safeParse({ ...validPayloads.string_pairing_click, ...invalid }).success, false);
  }
  for (const invalid of [
    { renderMode: "3d" }, { action: "order" }, { stringColorId: "orange" }, { gripColorId: "silver" },
    { stringColorId: null }, { action: "select-grip" }, { action: "reset" },
  ]) {
    assert.equal(productInteractionSchemas.customizer_change.safeParse({ ...validPayloads.customizer_change, ...invalid }).success, false);
  }
  for (const invalid of [{ source: "profile" }, { playerId: "unknown-player" }]) {
    assert.equal(productInteractionSchemas.player_racket_click.safeParse({ ...validPayloads.player_racket_click, ...invalid }).success, false);
  }
});

test("legacy events keep optional and open payloads while unknown events remain rejected", () => {
  for (const eventType of EVENT_TYPES) {
    if (Object.hasOwn(validPayloads, eventType)) continue;
    assert.equal(eventSchema.safeParse(envelope(eventType)).success, true, eventType);
    const input = envelope(eventType, { runId: "existing-id", arbitraryExistingField: { query: "existing" } });
    assert.deepEqual(eventSchema.parse(input), input);
  }
  assert.equal(eventSchema.safeParse(envelope("unregistered_event", {})).success, false);
});

test("events API rejects private product payloads before attempting database access", async () => {
  for (const [eventType, payload] of Object.entries(validPayloads)) {
    const response = await POST(new NextRequest("https://racketlab.kr/api/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(envelope(eventType, { ...payload, runId: "private-id" })),
    }));
    assert.equal(response.status, 400);
    const result = await response.json();
    assert.equal(result.error, "Validation failed");
    assert.ok(result.issues.some((issue: { path: string[] }) => issue.path[0] === "payload"));
  }
});

test("API taxonomy and the prepared database snapshot share the complete event allowlist", () => {
  assert.deepEqual(EVENT_TYPES, eventTypeEnum.enumValues);
  const snapshot = JSON.parse(readFileSync(new URL("../src/db/migrations/meta/0007_snapshot.json", import.meta.url), "utf8"));
  assert.deepEqual(snapshot.enums["public.event_type"].values, [...EVENT_TYPES]);
});
