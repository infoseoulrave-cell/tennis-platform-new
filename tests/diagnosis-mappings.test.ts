import test from "node:test";
import assert from "node:assert/strict";

import {
  EXPERIENCES,
  EXPERIENCE_MAP,
  PLAY_STYLES,
  PLAY_STYLE_MAP,
  PAIN_POINTS,
  PAIN_POINT_MAP,
} from "../src/lib/diagnosis-mappings";

test("every visible diagnosis label maps to a backend key", () => {
  for (const label of EXPERIENCES) assert.ok(EXPERIENCE_MAP[label], label);
  for (const label of PLAY_STYLES) assert.ok(PLAY_STYLE_MAP[label], label);
  for (const label of PAIN_POINTS) assert.ok(PAIN_POINT_MAP[label], label);
});

test("critical recommendation labels retain their intended meaning", () => {
  assert.equal(EXPERIENCE_MAP["1년 미만"], "less_1_year");
  assert.equal(PLAY_STYLE_MAP["강한 파워/스핀"], "power_spin");
  assert.equal(PAIN_POINT_MAP["팔꿈치/손목 통증"], "elbow_pain");
  assert.equal(PAIN_POINT_MAP["컨트롤이 안됨"], "inconsistent_serve");
});
