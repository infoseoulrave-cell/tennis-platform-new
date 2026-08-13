/**
 * VI 워드마크 — 산세리프 `racket`(Archivo 800, -0.02em) 과 세리프 이탤릭
 * `lab`(Instrument Serif) 의 대비. 두 단어 사이 간격은 소문자 o 의 1/4.
 * 라이트 배경에서는 둘 다 잉크, 다크 배경(on="dark")에서는 racket 초크 /
 * lab 라임 — VI 로고타입 페이지의 lockup 그대로다.
 * 제공된 SVG 는 웹폰트 참조 방식이라 <img> 로는 폰트가 살지 않아
 * HTML 로 재현한다.
 */
export function Wordmark({
  on = "light",
  className = "",
}: {
  on?: "light" | "dark" | "lime";
  className?: string;
}) {
  return (
    <span className={`inline-flex items-baseline whitespace-nowrap leading-none ${className}`}>
      <span
        className={`font-[800] tracking-[-0.02em] ${
          on === "dark" ? "text-[#F3F0EA]" : "text-[var(--color-text)]"
        }`}
      >
        racket
      </span>
      {/* lab 색: 라임 배경(reversed-lime lockup)에서는 잉크, 그 외에는 라임 —
          민호 지정. 라임 위 라임은 보이지 않는다. */}
      <span
        style={{ fontFamily: "var(--font-instrument), Georgia, serif" }}
        className={`italic ml-[0.07em] ${
          on === "lime" ? "text-[var(--color-text)]" : "text-[var(--color-accent)]"
        }`}
      >
        lab
      </span>
    </span>
  );
}
