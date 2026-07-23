import assert from "node:assert/strict";
import test from "node:test";

import {
  PLAYERS_VERIFIED_AT,
  players,
} from "../src/data/players";
import { playerThumbnailUrl } from "../src/lib/player-images";

test("existing Commons thumbnails use the stable 250px variant", () => {
  const url = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/b/Player.jpg/960px-Player.jpg";

  assert.equal(
    playerThumbnailUrl(url),
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/b/Player.jpg/250px-Player.jpg",
  );
});

test("direct Commons originals become 250px thumbnails", () => {
  const url = "https://upload.wikimedia.org/wikipedia/commons/1/14/Player.jpg";

  assert.equal(
    playerThumbnailUrl(url),
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Player.jpg/250px-Player.jpg",
  );
});

test("Commons thumbnail normalization preserves encoded filenames", () => {
  const url = "https://upload.wikimedia.org/wikipedia/commons/1/14/Player_%282026_US_Open%29.jpg";

  assert.equal(
    playerThumbnailUrl(url),
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Player_%282026_US_Open%29.jpg/250px-Player_%282026_US_Open%29.jpg",
  );
});

test("non-Wikimedia image URLs remain unchanged", () => {
  const url = "https://images.example.com/players/Player.jpg";

  assert.equal(playerThumbnailUrl(url), url);
});

test("all published players carry verified photo and equipment provenance", () => {
  assert.equal(players.length, 20);

  for (const player of players) {
    assert.equal(player.verifiedAt, PLAYERS_VERIFIED_AT);
    assert.match(player.equipment.sourceUrl, /^https:\/\//);
    assert.ok(player.equipment.disclosure.length > 20);
    assert.match(player.photo.url, /^https:\/\/upload\.wikimedia\.org\//);
    assert.match(player.photo.sourceUrl, /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    assert.ok(player.photo.credit.length > 1);
    assert.match(player.photo.license, /^CC/);
  }
});

test("published equipment lines match the current official player sources", () => {
  const byId = Object.fromEntries(players.map((player) => [player.id, player]));

  assert.equal(byId.sinner.equipment.line, "Speed");
  assert.equal(byId.alcaraz.equipment.line, "Pure Aero 98");
  assert.equal(byId.fritz.equipment.line, "Radical");
  assert.equal(byId["de-minaur"].equipment.brand, "Wilson");
  assert.equal(byId["de-minaur"].equipment.line, "Ultra V5");
  assert.equal(
    byId["de-minaur"].equipment.sourceUrl,
    "https://www.wilson.com/en-gb/blog/tennis/unveiling-wilson-ultra-swing-with-power",
  );
  assert.equal(byId.swiatek.equipment.line, "T-FIGHT 300S");
  assert.equal(byId.gauff.equipment.line, "Boom");
  assert.equal(byId.paolini.equipment.brand, "Yonex");
  assert.equal(byId.paolini.equipment.line, "VCORE 100");
  assert.equal(byId.paolini.equipment.sourceUrl, "https://www.yonex.com/athletes/jasmine-paolini");
  assert.equal(byId.zheng.equipment.line, "Ultra V5");
  assert.equal(
    byId.zheng.equipment.sourceUrl,
    "https://www.wilson.com/en-gb/blog/tennis/unveiling-wilson-ultra-swing-with-power",
  );
  assert.notEqual(byId.zheng.equipment.line, "Ultra 99 Pro");
  assert.equal(byId.pegula.equipment.line, "EZONE 98");
  assert.equal(byId.navarro.equipment.line, "VCORE 98");
  assert.equal(
    byId.navarro.equipment.sourceUrl,
    "https://us.yonex.com/pages/athlete/emma-navarro",
  );
  assert.equal(byId.andreeva.equipment.line, "Blade V10");
  assert.equal(byId.kasatkina.country, "Australia");
  assert.equal(byId.kasatkina.countryFlag, "🇦🇺");
});

test("every player has two functional style-to-retail-line sentences without correction history", () => {
  const correctionHistoryTerms = /(바로잡|잘못된|교체|갱신|기존)/;

  for (const player of players) {
    const sentences = player.synergy
      .split(/(?<=[.!?])\s+/)
      .filter(Boolean);

    assert.equal(sentences.length, 2, `${player.id} should have exactly two sentences`);
    assert.match(sentences[1], /시판/, `${player.id} second sentence should identify the retail line`);
    assert.doesNotMatch(player.synergy, correctionHistoryTerms, `${player.id} should not expose correction history`);
  }
});

test("a broken guessed Commons filename is no longer published", () => {
  const navarro = players.find((player) => player.id === "navarro");
  assert.ok(navarro);
  assert.doesNotMatch(navarro.photo.url, /FP_Movement_Emma_Navarro_2026/);
});
