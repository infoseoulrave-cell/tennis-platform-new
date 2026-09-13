export type RacketSearchParams = {
  brand?: string | string[];
  q?: string;
  sort?: string;
  page?: string;
  minWeight?: string;
  maxWeight?: string;
  minHead?: string;
  maxHead?: string;
  segment?: string;
};

/** 정렬·검색·선택한 조건을 보존하며 지정한 키만 바꾼다. */
export function racketsHref(
  current: RacketSearchParams,
  overrides: Partial<RacketSearchParams> = {},
): string {
  const params = new URLSearchParams();
  for (const [key, rawValue] of Object.entries({ ...current, ...overrides })) {
    for (const value of Array.isArray(rawValue) ? rawValue : [rawValue]) {
      if (value) params.append(key, value);
    }
  }
  return `/rackets${params.size ? `?${params.toString()}` : ""}`;
}

/** 결과 범위가 바뀌면 이전 페이지 번호는 사용하지 않는다. */
export function racketFilterHref(
  current: RacketSearchParams,
  overrides: Partial<RacketSearchParams>,
): string {
  return racketsHref(current, { ...overrides, page: undefined });
}

export function activeRacketFilterCount(current: RacketSearchParams): number {
  const brands = Array.isArray(current.brand) ? current.brand : [current.brand];
  return [
    brands.some(Boolean),
    Boolean(current.minWeight || current.maxWeight),
    Boolean(current.minHead || current.maxHead),
    Boolean(current.segment),
  ].filter(Boolean).length;
}

export function resetRacketFiltersHref(current: RacketSearchParams): string {
  return racketFilterHref(current, {
    brand: undefined,
    minWeight: undefined,
    maxWeight: undefined,
    minHead: undefined,
    maxHead: undefined,
    segment: undefined,
  });
}
