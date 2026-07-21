import assert from "node:assert/strict";
import test from "node:test";

import { players } from "../src/data/players";

test("all published players carry verified photo and equipment provenance", () => {
  assert.equal(players.length, 20);

  for (const player of players) {
    assert.match(player.verifiedAt, /^2026-07-21$/);
    assert.match(player.equipment.sourceUrl, /^https:\/\//);
    assert.ok(player.equipment.disclosure.length > 20);
    assert.match(player.photo.url, /^https:\/\/upload\.wikimedia\.org\//);
    assert.match(player.photo.sourceUrl, /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    assert.ok(player.photo.credit.length > 1);
    assert.match(player.photo.license, /^CC/);
  }
});

test("known 2026 endorsement corrections replace the inaccurate retail claims", () => {
  const byId = Object.fromEntries(players.map((player) => [player.id, player]));

  assert.equal(byId.sinner.equipment.line, "Speed");
  assert.equal(byId.alcaraz.equipment.line, "Pure Aero 98");
  assert.equal(byId.fritz.equipment.line, "Radical");
  assert.equal(byId["de-minaur"].equipment.brand, "Wilson");
  assert.equal(byId.swiatek.equipment.line, "T-FIGHT 300S");
  assert.equal(byId.gauff.equipment.line, "Boom");
  assert.equal(byId.paolini.equipment.brand, "Yonex");
  assert.equal(byId.pegula.equipment.line, "EZONE 98");
  assert.equal(byId.navarro.equipment.line, "VCORE");
  assert.equal(byId.andreeva.equipment.line, "Blade V10");
  assert.equal(byId.kasatkina.country, "Australia");
  assert.equal(byId.kasatkina.countryFlag, "🇦🇺");
});

test("a broken guessed Commons filename is no longer published", () => {
  const navarro = players.find((player) => player.id === "navarro");
  assert.ok(navarro);
  assert.doesNotMatch(navarro.photo.url, /FP_Movement_Emma_Navarro_2026/);
});
