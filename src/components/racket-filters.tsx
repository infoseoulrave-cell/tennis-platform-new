"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type FilterParams = {
  brand?: string | string[];
  sort?: string;
  minWeight?: string;
  maxWeight?: string;
  minHead?: string;
  maxHead?: string;
  segment?: string;
};

const WEIGHT_RANGES = [
  { label: "전체", min: "", max: "" },
  { label: "~270g (초경량)", min: "", max: "270" },
  { label: "270-290g (경량)", min: "270", max: "290" },
  { label: "290-310g (표준)", min: "290", max: "310" },
  { label: "310g+ (중량)", min: "310", max: "" },
];

const HEAD_RANGES = [
  { label: "전체", min: "", max: "" },
  { label: "~97\" (소형)", min: "", max: "97" },
  { label: "98-100\" (표준)", min: "98", max: "100" },
  { label: "100\"+ (대형)", min: "100", max: "" },
];

const SEGMENTS = [
  { value: "", label: "전체" },
  { value: "beginner", label: "입문자" },
  { value: "intermediate", label: "중급자" },
  { value: "advanced", label: "상급자" },
  { value: "pro", label: "프로" },
];

export function RacketFiltersPanel({ currentParams }: { currentParams: FilterParams }) {
  const router = useRouter();
  const [selectedWeight, setSelectedWeight] = useState(() => {
    if (currentParams.minWeight || currentParams.maxWeight) {
      return WEIGHT_RANGES.findIndex(
        (r) => r.min === (currentParams.minWeight ?? "") && r.max === (currentParams.maxWeight ?? "")
      );
    }
    return 0;
  });
  const [selectedHead, setSelectedHead] = useState(() => {
    if (currentParams.minHead || currentParams.maxHead) {
      return HEAD_RANGES.findIndex(
        (r) => r.min === (currentParams.minHead ?? "") && r.max === (currentParams.maxHead ?? "")
      );
    }
    return 0;
  });
  const [selectedSegment, setSelectedSegment] = useState(currentParams.segment ?? "");

  function applyFilters(overrides: Partial<FilterParams> = {}) {
    const wr = WEIGHT_RANGES[selectedWeight];
    const hr = HEAD_RANGES[selectedHead];
    const params = new URLSearchParams();

    const brand = overrides.brand ?? currentParams.brand;
    if (brand) {
      const b = Array.isArray(brand) ? brand[0] : brand;
      if (b) params.set("brand", b);
    }
    if (currentParams.sort) params.set("sort", currentParams.sort);

    const wMin = overrides.minWeight ?? wr.min;
    const wMax = overrides.maxWeight ?? wr.max;
    if (wMin) params.set("minWeight", wMin);
    if (wMax) params.set("maxWeight", wMax);

    const hMin = overrides.minHead ?? hr.min;
    const hMax = overrides.maxHead ?? hr.max;
    if (hMin) params.set("minHead", hMin);
    if (hMax) params.set("maxHead", hMax);

    const seg = overrides.segment ?? selectedSegment;
    if (seg) params.set("segment", seg);

    router.push(`/rackets?${params.toString()}`);
  }

  return (
    <>
      <div>
        <h3 className="font-semibold text-sm mb-3">무게</h3>
        <div className="space-y-1">
          {WEIGHT_RANGES.map((range, i) => (
            <button
              key={range.label}
              onClick={() => {
                setSelectedWeight(i);
                applyFilters({ minWeight: range.min, maxWeight: range.max });
              }}
              className={`block w-full text-left text-sm py-1.5 px-2 rounded transition-colors ${
                selectedWeight === i
                  ? "text-[var(--color-text)] font-medium bg-[var(--color-bg-subtle)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm mb-3">헤드사이즈</h3>
        <div className="space-y-1">
          {HEAD_RANGES.map((range, i) => (
            <button
              key={range.label}
              onClick={() => {
                setSelectedHead(i);
                applyFilters({ minHead: range.min, maxHead: range.max });
              }}
              className={`block w-full text-left text-sm py-1.5 px-2 rounded transition-colors ${
                selectedHead === i
                  ? "text-[var(--color-text)] font-medium bg-[var(--color-bg-subtle)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm mb-3">레벨</h3>
        <div className="space-y-1">
          {SEGMENTS.map((seg) => (
            <button
              key={seg.value}
              onClick={() => {
                setSelectedSegment(seg.value);
                applyFilters({ segment: seg.value });
              }}
              className={`block w-full text-left text-sm py-1.5 px-2 rounded transition-colors ${
                selectedSegment === seg.value
                  ? "text-[var(--color-text)] font-medium bg-[var(--color-bg-subtle)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              }`}
            >
              {seg.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
