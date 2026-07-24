import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { RacketVisualCustomizer } from "../src/components/racket-visual-customizer";

test("customizer begins with the original photo and accessible color groups", () => {
  const html = renderToStaticMarkup(
    <RacketVisualCustomizer
      slug="head-gravity-mp-2025"
      imageUrl="https://img.tennis-warehouse.com/watermark/rs.php?path=HGMPG-1.jpg&nw=500"
      alt="Head Gravity MP 2025"
    />,
  );

  assert.match(html, /Head Gravity MP 2025/);
  assert.match(html, /<fieldset/);
  assert.match(html, /스트링 색상/);
  assert.match(html, /그립 색상/);
  assert.match(html, /원본으로 초기화/);
  assert.match(html, /색상 시뮬레이션/);
  assert.match(html, /판매 재고를 의미하지 않습니다/);
});
