/**
 * 세그멘테이션 결과를 커스터마이저 오버레이 산출물로 다듬는다.
 *
 * 제품 사진의 라켓은 스트링이 없는(unstrung) 상태라 "가닥 픽셀"이 존재하지
 * 않는다. 그래서 화면은 빈 스트링 베드 위에 합성 스트링을 그리고, 베드
 * 마스크로 잘라 후프 안쪽에만 남긴다. 여기서는 그 베드의 대표 성분과
 * 그립 마스크를 사진에서 구한다. 손으로 찍는 좌표는 없다.
 */

export type BBox = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

/**
 * 마스크에서 가장 큰 연결 성분만 남기고 그 바운딩 박스를 돌려준다.
 * 정면·측면 두 컷 사진에서 정면 베드(가장 큰 성분)만 스트링을 그릴 대상으로
 * 삼기 위한 것이다.
 */
export function largestComponent(
  mask: Uint8Array,
  width: number,
  height: number,
): { mask: Uint8Array; bbox: BBox } | null {
  const labels = new Int32Array(mask.length).fill(-1);
  const sizes: number[] = [];
  const stack: number[] = [];

  for (let start = 0; start < mask.length; start += 1) {
    if (!mask[start] || labels[start] !== -1) continue;
    const label = sizes.length;
    let size = 0;
    labels[start] = label;
    stack.push(start);

    while (stack.length > 0) {
      const index = stack.pop() as number;
      size += 1;
      const x = index % width;
      const y = (index - x) / width;
      const neighbours = [
        x > 0 ? index - 1 : -1,
        x < width - 1 ? index + 1 : -1,
        y > 0 ? index - width : -1,
        y < height - 1 ? index + width : -1,
      ];
      for (const neighbour of neighbours) {
        if (neighbour < 0) continue;
        if (!mask[neighbour] || labels[neighbour] !== -1) continue;
        labels[neighbour] = label;
        stack.push(neighbour);
      }
    }
    sizes.push(size);
  }

  if (sizes.length === 0) return null;

  let largestLabel = 0;
  for (let label = 1; label < sizes.length; label += 1) {
    if (sizes[label] > sizes[largestLabel]) largestLabel = label;
  }

  const kept = new Uint8Array(mask.length);
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let index = 0; index < mask.length; index += 1) {
    if (labels[index] !== largestLabel) continue;
    kept[index] = 255;
    const x = index % width;
    const y = (index - x) / width;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  return {
    mask: kept,
    bbox: {
      x: minX,
      y: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
    },
  };
}

/**
 * 후프 안쪽 베드만 남긴다.
 *
 * 클로징 후의 베드는 후프 안쪽과 스로트 창이 이어 붙는 경우가 있다(둘 사이
 * 프레임이 클로징 반경보다 얇을 때). 클로징 **전** 원시 빈틈에서 가장 큰
 * 성분을 고르면 후프 안쪽만 잡힌다. 그 안의 구멍(워터마크 등 어두운 픽셀)은
 * 구멍 메우기로 채운다 — 클로징과 달리 바깥 경계를 건드리지 않는다.
 * 흰색 프레임이 베드로 삼켜진 사진은 종횡비·채움비 게이트에서 걸러진다.
 */
export function refineBed(
  enclosedGaps: Uint8Array,
  width: number,
  height: number,
): { mask: Uint8Array; bbox: BBox; fillRatio: number } | null {
  const core = largestComponent(enclosedGaps, width, height);
  if (!core) return null;

  const mask = fillHoles(core.mask, width, height);
  let pixels = 0;
  for (let i = 0; i < mask.length; i += 1) {
    if (mask[i]) pixels += 1;
  }
  const { bbox } = core;
  const fillRatio = pixels / (bbox.width * bbox.height);

  return { mask, bbox, fillRatio };
}

/** 마스크 바깥에서 flood fill 로 닿지 못하는 0 픽셀(구멍)을 채운다. */
export function fillHoles(
  mask: Uint8Array,
  width: number,
  height: number,
): Uint8Array {
  const reachable = new Uint8Array(mask.length);
  const stack: number[] = [];
  const push = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const index = y * width + x;
    if (reachable[index] || mask[index]) return;
    reachable[index] = 1;
    stack.push(index);
  };

  for (let x = 0; x < width; x += 1) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    push(0, y);
    push(width - 1, y);
  }
  while (stack.length > 0) {
    const index = stack.pop() as number;
    const x = index % width;
    const y = (index - x) / width;
    push(x - 1, y);
    push(x + 1, y);
    push(x, y - 1);
    push(x, y + 1);
  }

  const filled = new Uint8Array(mask.length);
  for (let i = 0; i < mask.length; i += 1) {
    filled[i] = mask[i] || !reachable[i] ? 255 : 0;
  }
  return filled;
}

/** 행 하나에서 틈이 maxGap 이하인 실루엣 run 개수를 센다. */
export function countRuns(
  silhouette: Uint8Array,
  width: number,
  row: number,
  maxGap: number,
): number {
  const offset = row * width;
  let runs = 0;
  let lastHit = -1;
  for (let x = 0; x < width; x += 1) {
    if (!silhouette[offset + x]) continue;
    if (lastHit === -1 || x - lastHit > maxGap) runs += 1;
    lastHit = x;
  }
  return runs;
}

/**
 * 그립 행 범위를 손잡이 구간으로 좁힌다.
 *
 * 실루엣 폭 기준의 그립 검출은 스로트 두 갈래 암까지 그립으로 삼킨다. 손잡이
 * 구간은 행마다 run 개수가 바닥과 같지만(라켓당 1개), 스로트에 들어서면 암이
 * 갈라져 run 이 늘어난다. 아래에서 위로 올라가며 run 개수가 바닥 기준을
 * 넘는 첫 행에서 자른다. 흰 프레임처럼 run 개수로 스로트를 못 가르는 사진을
 * 위해 `maxRows` 상한을 함께 받는다 — 성인 라켓은 전장 27인치에 그립이 약
 * 7.5인치로 고정 비율이라, 실루엣 세로 길이에서 상한을 구할 수 있다.
 */
export function trimGripRows(
  silhouette: Uint8Array,
  width: number,
  gripRows: { top: number; bottom: number },
  maxGap: number,
  maxRows: number,
): { top: number; bottom: number } {
  const { top, bottom } = gripRows;
  const sample: number[] = [];
  for (let y = bottom; y > bottom - 10 && y >= top; y -= 1) {
    sample.push(countRuns(silhouette, width, y, maxGap));
  }
  const sorted = [...sample].sort((left, right) => left - right);
  const baseline = sorted[Math.floor(sorted.length / 2)] ?? 0;
  if (baseline === 0) return gripRows;

  const capTop = Math.max(top, bottom - maxRows + 1);
  let trimmedTop = bottom;
  for (let y = bottom; y >= capTop; y -= 1) {
    if (countRuns(silhouette, width, y, maxGap) > baseline) break;
    trimmedTop = y;
  }
  return { top: trimmedTop, bottom };
}

/**
 * 그립 행 구간에서 실루엣의 x-run 사이 짧은 틈을 메워 그립 마스크를 만든다.
 *
 * 흰색 그립은 배경 flood fill 에 먹혀 실루엣에 테두리 선만 남는다. 행마다
 * 실루엣 픽셀의 run 을 찾고 `maxGap` 이하의 틈을 이어 붙이면 그립 단면이
 * 통째로 채워진다. 두 컷 사진이면 행마다 run 이 두 개 나와 각각 채워진다.
 */
export function buildGripMask(
  silhouette: Uint8Array,
  width: number,
  height: number,
  gripRows: { top: number; bottom: number },
  bedMask: Uint8Array,
  maxGap: number,
): { mask: Uint8Array; pixels: number } {
  const mask = new Uint8Array(width * height);
  let pixels = 0;

  for (let y = gripRows.top; y <= gripRows.bottom; y += 1) {
    const row = y * width;
    // 실루엣 픽셀 x 목록에서 틈이 maxGap 이하인 구간을 하나의 run 으로 본다.
    let runStart = -1;
    let lastHit = -1;
    const commit = (from: number, to: number) => {
      for (let x = from; x <= to; x += 1) {
        const index = row + x;
        if (bedMask[index]) continue;
        if (!mask[index]) {
          mask[index] = 255;
          pixels += 1;
        }
      }
    };
    for (let x = 0; x < width; x += 1) {
      if (!silhouette[row + x]) continue;
      if (runStart === -1) {
        runStart = x;
      } else if (x - lastHit > maxGap) {
        commit(runStart, lastHit);
        runStart = x;
      }
      lastHit = x;
    }
    if (runStart !== -1) commit(runStart, lastHit);
  }

  return { mask, pixels };
}

/**
 * 그립 마스크가 얼룩 없이 채워졌는지 본다. 행마다 채워진 픽셀 수를 세고,
 * 중앙값 대비 크게 빈 행의 비율이 낮아야 한다. 흰 그립이 통째로 먹힌
 * 사진을 fail-closed 로 거르기 위한 밀도 지표다.
 */
export function gripRowCoverage(
  mask: Uint8Array,
  width: number,
  height: number,
  gripRows: { top: number; bottom: number },
): number {
  const counts: number[] = [];
  for (let y = gripRows.top; y <= gripRows.bottom; y += 1) {
    let count = 0;
    const row = y * width;
    for (let x = 0; x < width; x += 1) {
      if (mask[row + x]) count += 1;
    }
    counts.push(count);
  }
  if (counts.length === 0) return 0;

  const sorted = [...counts].sort((left, right) => left - right);
  const median = sorted[Math.floor(sorted.length / 2)];
  if (median === 0) return 0;

  const filled = counts.filter((count) => count >= median * 0.5).length;
  return filled / counts.length;
}
