import assert from "node:assert/strict";
import test from "node:test";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { RadarChart, type Scores } from "../src/components/radar-chart";

const FIRST: Scores = { power: 1, control: 2, spin: 3, comfort: 4, stability: 5 };
const SECOND: Scores = { power: -1, control: -2, spin: -3, comfort: -4, stability: -5 };

Object.assign(globalThis, { React });

test("comparison series share one SVG grid and one set of labels", () => {
  const html = renderToStaticMarkup(
    React.createElement(RadarChart, {
      scores: FIRST,
      series: [
        { id: "first", scores: FIRST, color: "#111111" },
        { id: "second", scores: SECOND, color: "#3b82f6" },
      ],
      showValues: false,
    }),
  );

  assert.equal((html.match(/<svg/g) ?? []).length, 1);
  assert.equal((html.match(/data-radar-grid=/g) ?? []).length, 3);
  assert.equal((html.match(/data-radar-series=/g) ?? []).length, 2);
  assert.equal((html.match(/data-radar-label=/g) ?? []).length, 5);
});
