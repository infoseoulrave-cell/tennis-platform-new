import Link from "next/link";

const types = [
  {
    icon: "⬡",
    name: "폴리에스터",
    pros: "내구성이 뛰어남",
    cons: "팔 부담이 큼",
  },
  {
    icon: "〰",
    name: "멀티필라멘트",
    pros: "편안한 타구감",
    cons: "내구성이 낮음",
  },
  {
    icon: "◎",
    name: "내추럴 거트",
    pros: "최고의 타구감과 반발력",
    cons: "매우 비쌈 (5~8만원)",
  },
  {
    icon: "⫘",
    name: "하이브리드",
    pros: "스핀과 편안함의 균형",
    cons: "세팅이 복잡함",
  },
];

export function StringGuide() {
  return (
    <section className="py-16">
      <div className="border-t border-[var(--color-border)] pt-12">
        <div className="max-w-2xl mb-10">
          <h2 className="text-2xl font-bold mb-3">스트링이 라켓보다 중요한 이유</h2>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            같은 라켓이라도 스트링에 따라 완전히 다른 라켓이 됩니다. 종류별 특성과 추천 세팅을 확인하세요.
          </p>
          <Link
            href="/guide/strings"
            className="inline-block mt-4 text-sm font-medium text-[var(--color-text)] hover:underline"
          >
            가이드 읽기 →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {types.map((type) => (
            <div key={type.name} className="space-y-2">
              <div className="text-2xl text-[var(--color-text-secondary)]">{type.icon}</div>
              <h3 className="font-semibold text-sm">{type.name}</h3>
              <p className="text-xs text-[var(--color-text-secondary)]">👍 {type.pros}</p>
              <p className="text-xs text-[var(--color-text-muted)]">👎 {type.cons}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
