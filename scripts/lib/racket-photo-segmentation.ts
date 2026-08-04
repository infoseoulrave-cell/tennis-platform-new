/**
 * 제품 사진에서 스트링 베드와 그립을 픽셀 단위로 검출한다.
 *
 * 이전 실패는 "사진 위에 색을 얹는다"는 발상 때문이 아니라, 얹을 영역을 사람이
 * 타원으로 어림잡아 그렸기 때문이다. 여기서는 영역을 사진에서 직접 구한다.
 *
 * 순서
 *  1. 이미지 테두리에서 흰 배경을 flood fill 한다 → 바깥
 *  2. 바깥에 닿지 못한 밝은 픽셀 = 프레임에 둘러싸인 빈틈 (스트링 가닥 사이)
 *  3. 그 빈틈들을 모폴로지 닫기로 이어 붙이면 스트링 베드 전체가 된다
 *  4. 베드 안의 어두운 픽셀이 곧 스트링 가닥이다
 *
 * 이렇게 하면 프레임이 스트링으로 잘못 잡히지 않고, 사진에 라켓이 둘이어도
 * 각각의 베드가 자동으로 잡힌다.
 */

export type Rgba = {
  readonly data: Uint8Array | Uint8ClampedArray | Buffer;
  readonly width: number;
  readonly height: number;
  readonly channels: number;
};

export type SegmentationOptions = {
  /** 이 밝기 이상이고 채도가 낮으면 배경/빈틈 후보. */
  readonly backgroundLuma: number;
  readonly backgroundSaturation: number;
  /** 스트링 베드 안에서 이 밝기 이하면 가닥으로 본다. */
  readonly strandMaxLuma: number;
  /** 가닥 사이를 이어 붙일 반경(px). 스트링 간격보다 커야 한다. */
  readonly closingRadius: number;
  /** 가장 큰 베드 대비 이 비율 미만인 덩어리는 버린다(스로트 구멍 등). */
  readonly minComponentRatio: number;
  /** 이 픽셀 수 미만인 실루엣 덩어리는 배경 압축 잡티로 보고 버린다. */
  readonly minSilhouettePixels: number;
};

export const DEFAULT_SEGMENTATION: SegmentationOptions = {
  backgroundLuma: 232,
  backgroundSaturation: 26,
  strandMaxLuma: 225,
  closingRadius: 5,
  minComponentRatio: 0.18,
  minSilhouettePixels: 0,
};

/**
 * 오버레이 마스크를 만들 때 쓰는 설정.
 *
 * 카탈로그 사진의 배경은 정확히 255 다. 그런데 흰 그립은 231~246, 흰
 * 프레임 도색도 그 근처라 `DEFAULT_SEGMENTATION` 의 임계 232 로는 라켓의
 * 흰 부분이 통째로 배경으로 빨려 들어갔다. head speed 3종·pure aero
 * lite/team·vcore 100 이 그래서 그립 검출에 실패했고, speed MP L 은 후프
 * 안쪽까지 바깥으로 새어 베드를 못 잡았다. 배경만 배경으로 보도록 임계를
 * 배경값 가까이 올린다. 246~250 구간에서 54종이 모두 통과한다.
 *
 * 프레임 대표색 추출(`racket-colorway-extraction`)은 이 설정을 쓰지 않는다.
 * 거기서는 흰 그립이 실루엣에 들어오든 아니든 하이라이트 화소로 어차피
 * 버려지고, 임계를 옮기면 이미 눈으로 확인해 둔 색이 흔들리기 때문이다.
 */
export const OVERLAY_SEGMENTATION: SegmentationOptions = {
  ...DEFAULT_SEGMENTATION,
  backgroundLuma: 248,
  // 임계를 배경에 붙이면 JPEG 잡음이 배경에 실루엣 티끌을 남긴다. 카탈로그
  // 54종 실측으로 진짜 성분은 57,000px 이상, 잡티는 8px 이하라 경계가 뚜렷하다.
  minSilhouettePixels: 64,
};

export type SegmentationResult = {
  /** 스트링 가닥 픽셀. */
  readonly stringMask: Uint8Array;
  /** 그립 픽셀. */
  readonly gripMask: Uint8Array;
  /** 스트링 베드 전체(가닥 + 빈틈). 디버그와 품질 판정에 쓴다. */
  readonly bedMask: Uint8Array;
  /** 모폴로지 닫기 전의 원시 빈틈. 후프 안쪽과 스로트 창을 구분할 때 쓴다. */
  readonly enclosedGaps: Uint8Array;
  readonly width: number;
  readonly height: number;
  readonly stringPixels: number;
  readonly gripPixels: number;
  readonly bedPixels: number;
  /** 검출된 스트링 베드 덩어리 수. 정면/측면 두 컷이면 보통 1~2다. */
  readonly bedComponents: number;
};

function luma(r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function saturation(r: number, g: number, b: number): number {
  return Math.max(r, g, b) - Math.min(r, g, b);
}

export function fillOuterBackground(
  image: Rgba,
  options: SegmentationOptions,
): Uint8Array {
  const { width, height, channels, data } = image;
  const outside = new Uint8Array(width * height);
  const stack: number[] = [];

  const isBackgroundish = (index: number): boolean => {
    const offset = index * channels;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    // 밝기만 보면 노란 프레임 같은 밝은 도색을 배경으로 삼킨다. 채도까지 본다.
    return (
      luma(r, g, b) >= options.backgroundLuma
      && saturation(r, g, b) <= options.backgroundSaturation
    );
  };

  const push = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const index = y * width + x;
    if (outside[index] || !isBackgroundish(index)) return;
    outside[index] = 1;
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

  return dropSilhouetteSpecks(
    outside,
    width,
    height,
    options.minSilhouettePixels,
  );
}

/**
 * 배경에 흩어진 실루엣 티끌을 배경으로 되돌린다.
 *
 * 배경 임계를 배경 자체(255)에 바싹 붙이면 JPEG 압축 잡음이 몇 픽셀짜리
 * 성분으로 남는다. 그대로 두면 실루엣의 맨 아랫줄이 티끌 위치로 밀려나
 * 그립 구간 검출이 통째로 어긋난다. 진짜 성분(라켓 두 컷)과 잡티는 크기가
 * 수만 배 차이 나므로 작은 성분만 지우면 된다.
 */
function dropSilhouetteSpecks(
  outside: Uint8Array,
  width: number,
  height: number,
  minPixels: number,
): Uint8Array {
  if (minPixels <= 0) return outside;

  const result = new Uint8Array(outside);
  const seen = new Uint8Array(outside.length);
  const stack: number[] = [];
  const component: number[] = [];

  for (let start = 0; start < outside.length; start += 1) {
    if (outside[start] || seen[start]) continue;
    component.length = 0;
    seen[start] = 1;
    stack.push(start);

    while (stack.length > 0) {
      const index = stack.pop() as number;
      component.push(index);
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
        if (outside[neighbour] || seen[neighbour]) continue;
        seen[neighbour] = 1;
        stack.push(neighbour);
      }
    }

    if (component.length < minPixels) {
      for (const index of component) result[index] = 1;
    }
  }

  return result;
}

/** 체비셰프 거리 기준 사각 커널 팽창. */
export function dilate(
  mask: Uint8Array,
  width: number,
  height: number,
  radius: number,
): Uint8Array {
  const horizontal = new Uint8Array(mask.length);
  for (let y = 0; y < height; y += 1) {
    const row = y * width;
    for (let x = 0; x < width; x += 1) {
      let hit = 0;
      const from = Math.max(0, x - radius);
      const to = Math.min(width - 1, x + radius);
      for (let k = from; k <= to; k += 1) {
        if (mask[row + k]) {
          hit = 1;
          break;
        }
      }
      horizontal[row + x] = hit;
    }
  }

  const result = new Uint8Array(mask.length);
  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < height; y += 1) {
      let hit = 0;
      const from = Math.max(0, y - radius);
      const to = Math.min(height - 1, y + radius);
      for (let k = from; k <= to; k += 1) {
        if (horizontal[k * width + x]) {
          hit = 1;
          break;
        }
      }
      result[y * width + x] = hit;
    }
  }
  return result;
}

export function erode(
  mask: Uint8Array,
  width: number,
  height: number,
  radius: number,
): Uint8Array {
  const inverted = new Uint8Array(mask.length);
  for (let i = 0; i < mask.length; i += 1) inverted[i] = mask[i] ? 0 : 1;
  const dilated = dilate(inverted, width, height, radius);
  const result = new Uint8Array(mask.length);
  for (let i = 0; i < mask.length; i += 1) result[i] = dilated[i] ? 0 : 1;
  return result;
}

/** 팽창 후 침식. 가닥 사이 빈틈을 이어 붙여 베드를 하나의 덩어리로 만든다. */
export function close(
  mask: Uint8Array,
  width: number,
  height: number,
  radius: number,
): Uint8Array {
  return erode(dilate(mask, width, height, radius), width, height, radius);
}

/**
 * 연결 성분을 찾아 가장 큰 것 대비 일정 비율 이상인 덩어리만 남긴다.
 * 스로트 구멍이나 로고 주변의 작은 구멍을 걸러낸다.
 */
export function keepLargeComponents(
  mask: Uint8Array,
  width: number,
  height: number,
  minRatio: number,
): { mask: Uint8Array; components: number } {
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

  if (sizes.length === 0) {
    return { mask: new Uint8Array(mask.length), components: 0 };
  }

  const largest = Math.max(...sizes);
  const threshold = largest * minRatio;
  const kept = new Uint8Array(mask.length);
  let components = 0;
  const keepLabel = sizes.map((size) => {
    const keep = size >= threshold;
    if (keep) components += 1;
    return keep;
  });

  for (let index = 0; index < mask.length; index += 1) {
    const label = labels[index];
    if (label >= 0 && keepLabel[label]) kept[index] = 1;
  }

  return { mask: kept, components };
}

export function rowWidths(
  silhouette: Uint8Array,
  width: number,
  height: number,
): Int32Array {
  const widths = new Int32Array(height);
  for (let y = 0; y < height; y += 1) {
    let count = 0;
    const rowStart = y * width;
    for (let x = 0; x < width; x += 1) {
      if (silhouette[rowStart + x]) count += 1;
    }
    widths[y] = count;
  }
  return widths;
}

/**
 * 그립 구간을 행 범위로 찾는다.
 * 아래에서 위로 올라가며 실루엣 폭이 급격히 넓어지기 직전까지가 손잡이다.
 */
export function findGripRows(
  widths: Int32Array,
  height: number,
): { top: number; bottom: number } | null {
  let bottom = -1;
  for (let y = height - 1; y >= 0; y -= 1) {
    if (widths[y] > 0) {
      bottom = y;
      break;
    }
  }
  if (bottom < 0) return null;

  // 버트캡은 손잡이보다 살짝 넓으므로 조금 위에서 기준 폭을 잡는다.
  const referenceY = Math.max(0, bottom - Math.round(height * 0.05));
  const reference = widths[referenceY];
  if (reference <= 0) return null;

  let top = referenceY;
  for (let y = referenceY; y >= 0; y -= 1) {
    if (widths[y] > reference * 1.8) break;
    top = y;
  }

  return bottom - top >= height * 0.06 ? { top, bottom } : null;
}

export function segmentRacketPhoto(
  image: Rgba,
  options: SegmentationOptions = DEFAULT_SEGMENTATION,
): SegmentationResult {
  const { width, height, channels, data } = image;
  const outside = fillOuterBackground(image, options);

  // 바깥에 닿지 못한 밝은 픽셀 = 프레임 안쪽의 빈틈.
  const enclosedGaps = new Uint8Array(width * height);
  const silhouette = new Uint8Array(width * height);
  for (let index = 0; index < silhouette.length; index += 1) {
    if (outside[index]) continue;
    silhouette[index] = 1;

    const offset = index * channels;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    if (
      luma(r, g, b) >= options.backgroundLuma
      && saturation(r, g, b) <= options.backgroundSaturation
    ) {
      enclosedGaps[index] = 1;
    }
  }

  // 빈틈을 이어 붙이면 스트링 베드가 통째로 드러난다.
  const closed = close(enclosedGaps, width, height, options.closingRadius);
  const { mask: bedMask, components: bedComponents } = keepLargeComponents(
    closed,
    width,
    height,
    options.minComponentRatio,
  );

  const widths = rowWidths(silhouette, width, height);
  const grip = findGripRows(widths, height);

  const stringMask = new Uint8Array(width * height);
  const gripMask = new Uint8Array(width * height);
  let stringPixels = 0;
  let gripPixels = 0;
  let bedPixels = 0;

  for (let y = 0; y < height; y += 1) {
    const inGripRows = grip !== null && y >= grip.top && y <= grip.bottom;
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      if (!silhouette[index]) continue;

      if (inGripRows && !bedMask[index]) {
        gripMask[index] = 255;
        gripPixels += 1;
        continue;
      }
      if (!bedMask[index]) continue;

      bedPixels += 1;
      const offset = index * channels;
      const pixelLuma = luma(data[offset], data[offset + 1], data[offset + 2]);
      // 베드 안의 어두운 픽셀만 가닥이다. 프레임은 베드 밖이므로 여기 오지 않는다.
      if (pixelLuma <= options.strandMaxLuma) {
        stringMask[index] = 255;
        stringPixels += 1;
      }
    }
  }

  return {
    stringMask,
    gripMask,
    bedMask,
    enclosedGaps,
    width,
    height,
    stringPixels,
    gripPixels,
    bedPixels,
    bedComponents,
  };
}
