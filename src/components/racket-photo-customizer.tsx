"use client";

import type { CustomizerPhoto } from "@/data/racket-customizer-photos.generated";
import type { SchematicGeometry } from "@/lib/racket-schematic";

/**
 * 실제 제품 사진 위에 색을 입히는 프리뷰.
 *
 * 제품 사진의 라켓은 스트링이 없는(unstrung) 상태라, 사진에서 자동 검출한
 * 베드 마스크 안에 스펙 패턴(메인·크로스 가닥 수)대로 합성 스트링을 그린다.
 * 그립은 검출된 그립 마스크에 선택한 색을 덧입힌다. 마스크는 전부 오프라인
 * 스크립트가 사진에서 구한 것이며 손으로 찍은 좌표는 없다.
 */
type RacketPhotoCustomizerProps = {
  slug: string;
  photo: CustomizerPhoto;
  geometry: SchematicGeometry;
  stringHex: string;
  /** null 이면 사진의 원본 그립을 그대로 둔다. */
  gripHex: string | null;
  racketName: string;
};

export function RacketPhotoCustomizer({
  slug,
  photo,
  geometry,
  stringHex,
  gripHex,
  racketName,
}: RacketPhotoCustomizerProps) {
  const { width, height, bed } = photo;
  const base = `/images/customizer/${encodeURIComponent(slug)}`;

  const mainCount = geometry.mains.length;
  const crossCount = geometry.crosses.length;

  // 베드 바운딩 박스에 가닥을 고르게 편다. 끝은 마스크가 후프 모양대로 자른다.
  const insetX = bed.width * 0.02;
  const insetY = bed.height * 0.015;
  const mains = Array.from({ length: mainCount }, (_, index) => {
    const x =
      bed.x + insetX + ((bed.width - insetX * 2) * (index + 0.5)) / mainCount;
    return { x1: x, y1: bed.y, x2: x, y2: bed.y + bed.height };
  });
  const crosses = Array.from({ length: crossCount }, (_, index) => {
    const y =
      bed.y + insetY + ((bed.height - insetY * 2) * (index + 0.5)) / crossCount;
    return { x1: bed.x, y1: y, x2: bed.x + bed.width, y2: y };
  });

  const bedMaskStyle: React.CSSProperties = {
    maskImage: `url(${base}-bed.png)`,
    WebkitMaskImage: `url(${base}-bed.png)`,
    maskSize: "100% 100%",
    WebkitMaskSize: "100% 100%",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
  };
  const gripMaskStyle: React.CSSProperties = {
    maskImage: `url(${base}-grip.png)`,
    WebkitMaskImage: `url(${base}-grip.png)`,
    maskSize: "100% 100%",
    WebkitMaskSize: "100% 100%",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
  };

  return (
    <div
      className="relative mx-auto h-full max-h-[560px]"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- 마스크와 픽셀
          정렬이 필요해 원본 크기 그대로 내려받은 로컬 사본을 쓴다. */}
      <img
        src={`${base}.jpg`}
        alt={`${racketName} 제품 사진`}
        width={width}
        height={height}
        className="absolute inset-0 h-full w-full"
      />

      <div aria-hidden="true" className="absolute inset-0" style={bedMaskStyle}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          {mains.map((line, index) => (
            <line
              key={`m${index}`}
              {...line}
              stroke={stringHex}
              strokeWidth={bed.width / (mainCount * 11)}
            />
          ))}
          {crosses.map((line, index) => (
            <line
              key={`c${index}`}
              {...line}
              stroke={stringHex}
              strokeWidth={bed.height / (crossCount * 13)}
            />
          ))}
        </svg>
      </div>

      {gripHex && (
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ ...gripMaskStyle, backgroundColor: gripHex, opacity: 0.88 }}
        />
      )}
    </div>
  );
}
