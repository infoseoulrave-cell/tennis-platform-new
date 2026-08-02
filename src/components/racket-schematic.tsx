import {
  SCHEMATIC_VIEWBOX,
  type SchematicGeometry,
} from "@/lib/racket-schematic";

const NEUTRAL_FRAME = "#2B3440";

export type RacketPaint = {
  /** 프레임 주색. */
  readonly primary: string;
  /** 스로트·손잡이 쪽 보조색. */
  readonly secondary: string;
};

export const NEUTRAL_PAINT: RacketPaint = {
  primary: NEUTRAL_FRAME,
  secondary: "#1B222B",
};

/** 스트링 한 방향을 그늘 + 본색 두 패스로 그린다. */
function StringPass({
  lines,
  hex,
  keyPrefix,
}: {
  lines: readonly { x1: number; y1: number; x2: number; y2: number }[];
  hex: string;
  keyPrefix: string;
}) {
  return (
    <>
      <g stroke="#0B0F14" strokeOpacity={0.42} strokeWidth={2.9} fill="none">
        {lines.map((line, index) => (
          <line
            key={`${keyPrefix}-shadow-${index}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
          />
        ))}
      </g>
      <g stroke={hex} strokeWidth={1.7} fill="none">
        {lines.map((line, index) => (
          <line
            key={`${keyPrefix}-${index}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
          />
        ))}
      </g>
    </>
  );
}

export function RacketSchematic({
  geometry,
  stringHex,
  gripHex,
  paint = NEUTRAL_PAINT,
  pattern,
  title,
  idPrefix,
}: {
  geometry: SchematicGeometry;
  stringHex: string;
  gripHex: string;
  paint?: RacketPaint;
  pattern: string;
  title: string;
  /** 같은 페이지에 여러 개가 놓여도 그라디언트 id 가 충돌하지 않게 한다. */
  idPrefix: string;
}) {
  const { head, mains, crosses, weaveOverlays, handle } = geometry;
  const frameGradient = `${idPrefix}-frame`;
  const gripGradient = `${idPrefix}-grip`;
  const bedClip = `${idPrefix}-bed`;

  return (
    <svg
      viewBox={`0 0 ${SCHEMATIC_VIEWBOX.width} ${SCHEMATIC_VIEWBOX.height}`}
      role="img"
      aria-label={`${title} 렌더. 스트링 패턴 ${pattern}, 메인 ${mains.length}가닥, 크로스 ${crosses.length}가닥.`}
      className="h-full w-full"
    >
      <defs>
        {/* 왼쪽 위에서 빛이 든다고 보고 비대칭으로 음영을 준다. */}
        <linearGradient id={frameGradient} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={paint.primary} stopOpacity={1} />
          <stop offset="52%" stopColor={paint.primary} stopOpacity={0.94} />
          <stop offset="100%" stopColor={paint.secondary} stopOpacity={1} />
        </linearGradient>
        <linearGradient id={gripGradient} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#000" stopOpacity={0.22} />
          <stop offset="38%" stopColor="#fff" stopOpacity={0.16} />
          <stop offset="100%" stopColor="#000" stopOpacity={0.26} />
        </linearGradient>
        <clipPath id={bedClip}>
          <path d={geometry.innerPath} />
        </clipPath>
      </defs>

      {/* 스트링 베드 바탕 — 색이 옅어도 가닥이 읽히도록 아주 연하게 깐다. */}
      <path d={geometry.innerPath} fill={stringHex} opacity={0.1} />

      <g clipPath={`url(#${bedClip})`}>
        {/*
          위빙이 눈에 보이려면 색만으로는 부족하다. 실제 스트링은 아래로 지나가는
          쪽에 그늘이 진다. 그래서 각 가닥을 어두운 조금 넓은 선 위에 본래 색을
          덧그리는 두 번의 패스로 그린다. 나중에 그린 가닥의 그늘이 먼저 그린
          가닥을 덮으면서 교차점에 자연스러운 상하 관계가 생긴다.
        */}
        <StringPass lines={mains} hex={stringHex} keyPrefix="main" />
        <StringPass lines={crosses} hex={stringHex} keyPrefix="cross" />
        {/* 엇갈린 교차점에서만 메인을 다시 위로 올린다. */}
        <StringPass lines={weaveOverlays} hex={stringHex} keyPrefix="weave" />
        {/* 스트링 위로 아주 옅은 음영을 얹어 평면적으로 보이지 않게 한다. */}
        <ellipse
          cx={head.cx}
          cy={head.cy - head.ryUp * 0.35}
          rx={geometry.stringBed.rx}
          ry={geometry.stringBed.ryUp * 0.7}
          fill="#fff"
          opacity={0.07}
        />
      </g>

      {/* 그로밋 띠 — 프레임 안쪽 경계. */}
      <path
        d={geometry.innerPath}
        fill="none"
        stroke="#0E1319"
        strokeWidth={1.6}
        opacity={0.5}
      />

      {/* 후프. 빔 두께가 각도마다 달라 팁과 스로트가 얇고 중간이 두껍다. */}
      <path
        d={geometry.hoopPath}
        fill={`url(#${frameGradient})`}
        fillRule="evenodd"
        stroke="#0E1319"
        strokeWidth={0.7}
        strokeOpacity={0.55}
      />

      {/* 범퍼가드 */}
      <path
        d={geometry.bumperPath}
        fill="#0E1319"
        fillRule="evenodd"
        opacity={0.55}
      />

      <path
        d={geometry.throatPath}
        fill="none"
        stroke={`url(#${frameGradient})`}
        strokeWidth={9}
        strokeLinecap="round"
      />
      <path
        d={geometry.throatPath}
        fill="none"
        stroke="#0E1319"
        strokeWidth={0.7}
        strokeOpacity={0.4}
      />

      {/* 그립 */}
      <rect
        x={handle.x}
        y={handle.y}
        width={handle.width}
        height={handle.height}
        rx={5}
        fill={gripHex}
      />
      {/* 오버그립 감은 결. 장식이며 실측이 아니다. */}
      <g stroke="#0E1319" strokeWidth={0.9} opacity={0.3}>
        {Array.from({ length: 11 }, (_, index) => {
          const y = handle.y + ((index + 1) * handle.height) / 12;
          return (
            <line
              key={`wrap-${index}`}
              x1={handle.x}
              y1={y}
              x2={handle.x + handle.width}
              y2={y - 6}
            />
          );
        })}
      </g>
      {/* 원통이라는 느낌을 주는 세로 음영. */}
      <rect
        x={handle.x}
        y={handle.y}
        width={handle.width}
        height={handle.height}
        rx={5}
        fill={`url(#${gripGradient})`}
      />

      {/* 버트캡 */}
      <rect
        x={handle.x - 2.5}
        y={handle.y + handle.height - 7}
        width={handle.width + 5}
        height={11}
        rx={2.5}
        fill="#0E1319"
      />
    </svg>
  );
}
