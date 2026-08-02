"use client";

import Link from "next/link";
import { useId, useReducer } from "react";

import { RacketPhotoCustomizer } from "@/components/racket-photo-customizer";
import {
  NEUTRAL_PAINT,
  RacketSchematic,
  type RacketPaint,
} from "@/components/racket-schematic";
import {
  GRIP_COLOR_OPTIONS,
  initialCustomizerState,
  reduceCustomizerState,
  STRING_COLOR_OPTIONS,
} from "@/data/racket-customizer";
import type { CustomizerPhoto } from "@/data/racket-customizer-photos.generated";
import type { SchematicGeometry } from "@/lib/racket-schematic";

/** 색을 고르기 전 도식에 쓰는 기본값. */
const DEFAULT_STRING_HEX = "#8B8F96";
const DEFAULT_GRIP_HEX = "#2B3440";

type RacketVisualCustomizerProps = {
  geometry: SchematicGeometry;
  /** `16x19` 같은 원문 표기. */
  pattern: string;
  headSize: string;
  racketName: string;
  /** 제품 사진에서 추출한 도색. 없으면 중립색으로 그린다. */
  paint?: RacketPaint;
  /** 사진 모드용. 마스크 검출에 성공한 라켓만 값이 있다 — 없으면 도식으로 그린다. */
  slug?: string;
  photo?: CustomizerPhoto;
};

export function RacketVisualCustomizer({
  geometry,
  pattern,
  headSize,
  racketName,
  paint = NEUTRAL_PAINT,
  slug,
  photo,
}: RacketVisualCustomizerProps) {
  const [state, dispatch] = useReducer(
    reduceCustomizerState,
    initialCustomizerState,
  );
  const groupId = useId();

  const stringColor = STRING_COLOR_OPTIONS.find(
    ({ id }) => id === state.stringColorId,
  );
  const gripColor = GRIP_COLOR_OPTIONS.find(
    ({ id }) => id === state.gripColorId,
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <div className="relative flex aspect-[3/4] items-center justify-center rounded-2xl border border-[var(--color-border)] bg-white p-6">
          {photo && slug ? (
            <RacketPhotoCustomizer
              slug={slug}
              photo={photo}
              geometry={geometry}
              stringHex={stringColor?.hex ?? DEFAULT_STRING_HEX}
              gripHex={gripColor?.hex ?? null}
              racketName={racketName}
            />
          ) : (
            <RacketSchematic
              geometry={geometry}
              stringHex={stringColor?.hex ?? DEFAULT_STRING_HEX}
              gripHex={gripColor?.hex ?? DEFAULT_GRIP_HEX}
              paint={paint}
              pattern={pattern}
              title={racketName}
              idPrefix={groupId.replace(/[^a-zA-Z0-9-]/g, "")}
            />
          )}
        </div>

        {photo && slug ? (
          <p className="mt-3 text-xs leading-relaxed text-[var(--color-text-muted)]">
            <strong className="font-semibold text-[var(--color-text)]">실제 제품 사진</strong> 위에
            스트링 패턴 {pattern}대로 메인 {geometry.mains.length}가닥 ·
            크로스 {geometry.crosses.length}가닥을 그려 넣었습니다. 사진 속
            라켓은 스트링이 없는 판매 상태이며, 스트링과 그립 색은 사진에서
            자동 검출한 영역에만 입힙니다.
          </p>
        ) : (
          <p className="mt-3 text-xs leading-relaxed text-[var(--color-text-muted)]">
            이 그림은 사진이 아니라 <strong className="font-semibold text-[var(--color-text)]">스펙에서 그린 렌더</strong>입니다.
            헤드 {headSize}, 스트링 패턴 {pattern}을 그대로 반영해
            메인 {geometry.mains.length}가닥 · 크로스 {geometry.crosses.length}가닥으로 엮었습니다.
            로고와 문양은 재현하지 않습니다.
          </p>
        )}
      </div>

      <section
        aria-labelledby={`${groupId}-title`}
        className="rounded-2xl border border-[var(--color-border)] p-5"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={`${groupId}-title`} className="text-sm font-semibold">
              색 조합 비교
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-muted)]">
              색 조합이 어떤 느낌인지 보기 위한 것입니다. 판매 재고나 주문 옵션이 아닙니다.
            </p>
          </div>
          <button
            type="button"
            disabled={!state.stringColorId && !state.gripColorId}
            onClick={() => dispatch({ type: "reset" })}
            className="min-h-11 shrink-0 rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium hover:border-[var(--color-text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            처음으로
          </button>
        </div>

        <ColorFieldset
          legend="스트링 색"
          name={`${groupId}-string-color`}
          options={STRING_COLOR_OPTIONS}
          selectedId={state.stringColorId}
          onSelect={(colorId) =>
            dispatch({
              type: "select-string",
              colorId: colorId as typeof STRING_COLOR_OPTIONS[number]["id"],
            })
          }
        />

        <ColorFieldset
          legend="그립 색"
          name={`${groupId}-grip-color`}
          options={GRIP_COLOR_OPTIONS}
          selectedId={state.gripColorId}
          onSelect={(colorId) =>
            dispatch({
              type: "select-grip",
              colorId: colorId as typeof GRIP_COLOR_OPTIONS[number]["id"],
            })
          }
        />

        <p className="sr-only" aria-live="polite">
          {stringColor ? `스트링 ${stringColor.label}` : "스트링 기본"},{" "}
          {gripColor ? `그립 ${gripColor.label}` : "그립 기본"}
        </p>

        <p className="mt-6 border-t border-[var(--color-border)] pt-4 text-xs leading-relaxed text-[var(--color-text-secondary)]">
          실제로 어떤 스트링을 넣을지는{" "}
          <Link href="/strings" className="underline">
            스트링 찾기
          </Link>
          에서 소재와 장력으로 고르세요. 색보다 소재가 타구감을 훨씬 크게 바꿉니다.
        </p>
      </section>
    </div>
  );
}

function ColorFieldset({
  legend,
  name,
  options,
  selectedId,
  onSelect,
}: {
  legend: string;
  name: string;
  options: readonly { id: string; label: string; hex: string }[];
  selectedId: string | null;
  onSelect: (colorId: string) => void;
}) {
  return (
    <fieldset className="mt-5">
      <legend className="text-xs font-semibold">{legend}</legend>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {options.map((option) => {
          const selected = selectedId === option.id;

          return (
            <label
              key={option.id}
              className={`relative flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs ${
                selected
                  ? "border-[var(--color-text)] bg-[var(--color-bg-subtle)] font-semibold"
                  : "border-[var(--color-border)]"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option.id}
                checked={selected}
                onChange={() => onSelect(option.id)}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-xl peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-accent)] peer-focus-visible:ring-offset-2"
              />
              <span
                aria-hidden="true"
                className="h-5 w-5 shrink-0 rounded-full border border-black/20"
                style={{ backgroundColor: option.hex }}
              />
              <span>{option.label}</span>
              {selected && <span className="sr-only">선택됨</span>}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
