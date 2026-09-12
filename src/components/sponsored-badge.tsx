/**
 * "광고" 배지.
 *
 * 유료 노출 슬롯에는 반드시 붙는다(표시광고법·공정위 추천보증 심사지침).
 * 배지는 노출 사실만 알리고, 점수·순위는 광고와 무관하다는 고지는
 * 슬롯 쪽 `disclosure` 문구가 맡는다.
 */
export function SponsoredBadge({
  on = "light",
  className = "",
}: {
  on?: "light" | "dark";
  className?: string;
}) {
  const tone =
    on === "dark"
      ? "border-white/30 text-white/80"
      : "border-[var(--color-text-muted)] text-[var(--color-text-secondary)]";
  return (
    <span
      data-sponsored-badge=""
      className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold leading-none tracking-wide ${tone} ${className}`}
    >
      광고
    </span>
  );
}
