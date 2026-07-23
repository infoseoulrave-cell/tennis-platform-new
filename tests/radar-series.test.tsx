import assert from "node:assert/strict";
import test from "node:test";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { RadarChart, type Scores } from "../src/components/radar-chart";

const FIRST: Scores = { power: 10, control: 11.5, spin: 12.5, comfort: 14, stability: 15 };
const SECOND: Scores = { power: 15, control: 14, spin: 12.5, comfort: 11.5, stability: 10 };

Object.assign(globalThis, { React });

function primaryPoints(html: string): Array<[number, number]> {
  const match = html.match(
    /data-radar-series="primary"><polygon points="([^"]+)"/,
  );
  assert.ok(match);
  return match[1].split(" ").map((point) => {
    const [x, y] = point.split(",").map(Number);
    return [x, y];
  });
}

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

test("radar geometry maps 10 to center, 12.5 halfway, and 15 to the edge", () => {
  const renderUniform = (score: number) => renderToStaticMarkup(
    React.createElement(RadarChart, {
      scores: {
        power: score,
        control: score,
        spin: score,
        comfort: score,
        stability: score,
      },
      showValues: false,
      size: 200,
    }),
  );

  const minimum = primaryPoints(renderUniform(10));
  const midpoint = primaryPoints(renderUniform(12.5));
  const maximum = primaryPoints(renderUniform(15));

  assert.deepEqual(minimum[0], [100, 100]);
  assert.deepEqual(midpoint[0], [100, 62]);
  assert.deepEqual(maximum[0], [100, 24]);
  assert.equal(new Set(minimum.map((point) => point.join(","))).size, 1);
});

test("radar value labels use the public /15 format without signs", () => {
  const html = renderToStaticMarkup(
    React.createElement(RadarChart, { scores: FIRST }),
  );

  for (const label of ["10.0/15", "11.5/15", "12.5/15", "14.0/15", "15.0/15"]) {
    assert.match(html, new RegExp(label.replace(".", "\\.")));
  }
  assert.doesNotMatch(html, />[+-]\d/);
});
