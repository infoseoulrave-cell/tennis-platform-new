import test from "node:test";
import assert from "node:assert/strict";

import { newsItems } from "../src/data/news";

test("news copy does not equate endorsement paintjobs with retail frames", () => {
  const copy = newsItems.map((item) => `${item.title} ${item.summary}`).join(" ");
  assert.doesNotMatch(copy, /실전 투입 확인|시너\/조코비치 사용 모델/);
  assert.match(copy, /실제 투어 프레임/);
});
