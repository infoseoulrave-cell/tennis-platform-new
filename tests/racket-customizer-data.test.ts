import assert from "node:assert/strict";
import test from "node:test";
import {
  GRIP_COLOR_OPTIONS,
  initialCustomizerState,
  reduceCustomizerState,
  STRING_COLOR_OPTIONS,
} from "../src/data/racket-customizer";

test("string color palette has the approved stable options", () => {
  assert.equal(STRING_COLOR_OPTIONS.length, 8);
  assert.equal(new Set(STRING_COLOR_OPTIONS.map(({ id }) => id)).size, 8);
  assert.deepEqual(STRING_COLOR_OPTIONS, [
    { id: "black", label: "검정", hex: "#171717" },
    { id: "white", label: "흰색", hex: "#F4F2E8" },
    { id: "natural", label: "내추럴", hex: "#D9C69C" },
    { id: "silver", label: "실버", hex: "#A8ADB4" },
    { id: "gold", label: "골드", hex: "#C7A34B" },
    { id: "flash-yellow", label: "형광 노랑", hex: "#D9F22A" },
    { id: "blue", label: "파랑", hex: "#2F65C8" },
    { id: "red", label: "빨강", hex: "#D44747" },
  ]);
});

test("grip color palette has the approved stable options", () => {
  assert.equal(GRIP_COLOR_OPTIONS.length, 8);
  assert.equal(new Set(GRIP_COLOR_OPTIONS.map(({ id }) => id)).size, 8);
  assert.deepEqual(GRIP_COLOR_OPTIONS, [
    { id: "white", label: "흰색", hex: "#F4F2E8" },
    { id: "black", label: "검정", hex: "#171717" },
    { id: "blue", label: "파랑", hex: "#315FA8" },
    { id: "red", label: "빨강", hex: "#C74449" },
    { id: "yellow", label: "노랑", hex: "#E5D33E" },
    { id: "green", label: "초록", hex: "#438A61" },
    { id: "pink", label: "분홍", hex: "#DE88A7" },
    { id: "purple", label: "보라", hex: "#76579C" },
  ]);
});

test("customizer reducer selects colors and resets state", () => {
  const withString = reduceCustomizerState(initialCustomizerState, {
    type: "select-string",
    colorId: "silver",
  });
  const withGrip = reduceCustomizerState(withString, {
    type: "select-grip",
    colorId: "blue",
  });

  assert.deepEqual(withGrip, { stringColorId: "silver", gripColorId: "blue" });
  assert.equal(
    reduceCustomizerState(withGrip, { type: "reset" }),
    initialCustomizerState,
  );
});
