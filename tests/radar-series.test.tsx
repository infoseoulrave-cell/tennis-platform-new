import assert from "node:assert/strict";
import test from "node:test";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { RacketCard } from "../src/components/racket-card";
import {
  AXIS_LABELS,
  RadarChart,
  type Scores,
} from "../src/components/radar-chart";
import { PUBLIC_AXIS_KEYS } from "../src/lib/score-display";

const FIRST: Scores = { power: 0, control: 1, spin: 2, comfort: 4, stability: 5 };
const SECOND: Scores = { power: 5, control: 4, spin: 3, comfort: 1, stability: 0 };

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

test("radar geometry maps 0 to center, 3 proportionally, and 5 to the edge", () => {
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

  const minimum = primaryPoints(renderUniform(0));
  const upperMiddle = primaryPoints(renderUniform(3));
  const maximum = primaryPoints(renderUniform(5));

  assert.deepEqual(minimum[0], [100, 100]);
  assert.equal(upperMiddle[0][0], 100);
  assert.ok(Math.abs(upperMiddle[0][1] - 54.4) < 1e-9);
  assert.deepEqual(maximum[0], [100, 24]);
  assert.equal(new Set(minimum.map((point) => point.join(","))).size, 1);
});

test("radar value labels use integer public-axis /5 format without signs or decimals", () => {
  const html = renderToStaticMarkup(
    React.createElement(RadarChart, { scores: FIRST }),
  );

  for (const label of ["0/5", "1/5", "2/5", "4/5", "5/5"]) {
    assert.match(html, new RegExp(label));
  }
  assert.doesNotMatch(html, />[+-]\d/);
  assert.doesNotMatch(html, /\d+\.\d+\/5/);
});

test("racket card shows the derived total and every public axis once in canonical order", () => {
  const html = renderToStaticMarkup(
    React.createElement(RacketCard, {
      racket: {
        slug: "five-axis",
        brand: "Test",
        model: "Five Axis",
        scores: FIRST,
      },
    }),
  );

  assert.match(html, /총점 12\/15/);
  assert.deepEqual(
    [...html.matchAll(/data-racket-axis="([^"]+)"/g)].map((match) => match[1]),
    [...PUBLIC_AXIS_KEYS],
  );
  for (const axis of PUBLIC_AXIS_KEYS) {
    const cell = html.match(
      new RegExp(`data-racket-axis="${axis}"[^>]*>([\\s\\S]*?)</div>`),
    );
    assert.ok(cell);
    assert.match(
      cell[1],
      new RegExp(`${AXIS_LABELS[axis]}[\\s\\S]*${FIRST[axis]}\\/5`),
    );
  }
  assert.doesNotMatch(html, /\d+\.\d+\/(?:5|15)/);
});
