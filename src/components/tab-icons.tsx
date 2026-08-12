/**
 * racket LAB 탭 아이콘 — 24 그리드 · stroke 1.75 · round cap
 *
 * 조각(JOGAK) BRAND-SPEC §10 의 아이콘 규율을 가져오되 톤은 이쪽으로 옮겼다.
 * 조각은 잉크 바 위의 흰 글리프라 stroke 2 로 눌러 그렸다. 여기는 흰 바 위의
 * 잉크 글리프이고 `.impeccable.md` 가 "미니멀·프리미엄·에디토리얼"을 요구하므로
 * 1.75 로 낮췄다. 같은 무게로 그리면 흰 배경에서 탁해 보인다.
 *
 * 상태 문법(조각과 동일):
 * - 몸통이 있는 글리프(홈·후프·막대·하트)는 켜질 때 면으로 찬다.
 * - 선으로만 된 글리프는 색으로만 말한다.
 * - 색은 전부 `currentColor` 다. 켜짐/꺼짐은 부모의 text 색이 정한다.
 *
 * 다섯 글리프는 전부 라켓 한 자루에서 나왔다. 이모지 다섯 개는 서로 출신이
 * 달라서(플랫폼마다 다르게 그려지고 무게도 제각각이다) 한 줄에 세우면 조악해진다.
 * `찾기` 는 **비어 있는 프레임**, `스트링` 은 **베드가 채워진 프레임** 이고
 * 손잡이의 유무로 둘을 가른다.
 */

export type TabIconName = "home" | "racket" | "strings" | "compare" | "wishlist";

const STROKE = 1.75;
/** 스트링 가닥은 프레임보다 얇다. 24px 에서 텍스처로 읽혀야 하고 선으로 읽히면 안 된다. */
const STRING_STROKE = 1;

type Props = {
  name: TabIconName;
  active?: boolean;
  size?: number;
  className?: string;
};

export function TabIcon({ name, active = false, size = 23, className }: Props) {
  const body = active ? "currentColor" : "none";
  /** 켜진 면 위의 가닥은 배경색으로 뚫는다. 꺼지면 본체와 같은 색의 텍스처다. */
  const knockout = active ? "var(--color-bg-white)" : "currentColor";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      data-tab-icon={name}
      data-tab-icon-state={active ? "on" : "off"}
    >
      {name === "home" && (
        <path d="M3.8 10.1 12 3.7l8.2 6.4v9.3a1.3 1.3 0 0 1-1.3 1.3H5.1a1.3 1.3 0 0 1-1.3-1.3z" fill={body} />
      )}

      {name === "racket" && (
        <>
          {/* 온전한 라켓. 베드가 있어야 23px 에서 라켓으로 읽힌다 —
              빈 후프는 stroke 1.75 가 스로트 구멍을 메워 막대사탕이 된다.
              스로트 두 가닥은 반드시 한 점(12,17.8)에서 만난다. */}
          <ellipse cx={12} cy={8.6} rx={5.6} ry={6.4} fill={body} />
          <g stroke={knockout} strokeWidth={STRING_STROKE}>
            {/* 메인 */}
            <path d="M12 3.4v10.4M9.4 4.2v9M14.6 4.2v9" />
            {/* 크로스 */}
            <path d="M7 8.6h10M7.8 6.4h8.4M7.8 10.8h8.4" />
          </g>
          <path d="M9.3 14.2 12 17.8M14.7 14.2 12 17.8M12 17.8v3.6" />
        </>
      )}

      {name === "strings" && (
        <>
          {/* 스트링 릴 — 실제로 사는 형태다. 라켓과 실루엣이 겹치지 않아야
              둘이 한 줄에 서도 구분된다. */}
          <rect x={6.4} y={3.4} width={11.2} height={2.4} rx={1.2} fill={body} />
          <rect x={6.4} y={18.2} width={11.2} height={2.4} rx={1.2} fill={body} />
          <rect x={8.9} y={5.8} width={6.2} height={12.4} rx={0.8} fill={body} />
          {/* 감긴 가닥 — 켜지면 면 위로 뚫려 나온다(knockout) */}
          <g stroke={knockout} strokeWidth={STRING_STROKE}>
            <path d="M8.9 9.2h6.2M8.9 12h6.2M8.9 14.8h6.2" />
          </g>
        </>
      )}

      {name === "compare" && (
        <>
          {/* 나란히 선 두 개. 셋 이상이면 차트로 읽히므로 정확히 둘이다 */}
          <rect x={5.2} y={11.2} width={5.4} height={7.6} rx={1.5} fill={body} />
          <rect x={13.4} y={6.4} width={5.4} height={12.4} rx={1.5} fill={body} />
          <path d="M4.6 20.6h14.8" />
        </>
      )}

      {name === "wishlist" && (
        <path
          d="M12 20.4C12 20.4 4 15.6 4 10.1A4.4 4.4 0 0 1 12 7.5 4.4 4.4 0 0 1 20 10.1c0 5.5-8 10.3-8 10.3z"
          fill={body}
        />
      )}
    </svg>
  );
}
