import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import CustomizerError, {
  reportCustomizerError,
} from "../src/app/customizer/[slug]/error";

test("customizer errors expose retry and catalog recovery targets", async () => {
  const html = renderToStaticMarkup(
    <CustomizerError
      error={new Error("database unavailable")}
      unstable_retry={() => undefined}
    />,
  );

  assert.match(html, /커스터마이저를 불러오지 못했습니다/);
  assert.match(html, />다시 시도</);
  assert.match(html, /href="\/rackets"/);
  assert.equal(html.match(/min-h-11/g)?.length, 2);
  assert.equal(
    html.match(/focus-visible:ring-\[var\(--color-text\)\]/g)?.length,
    2,
  );
});

test("customizer errors are reported with their original identity", async () => {
  const originalConsoleError = console.error;
  const captured: unknown[] = [];
  console.error = (...values: unknown[]) => {
    captured.push(...values);
  };

  try {
    const failure = new Error("database unavailable");
    reportCustomizerError(failure);
    assert.deepEqual(captured, [failure]);
  } finally {
    console.error = originalConsoleError;
  }
});
