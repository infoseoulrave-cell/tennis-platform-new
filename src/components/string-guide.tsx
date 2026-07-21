import Link from "next/link";

const types = [
  {
    color: "var(--color-court-blue)",
    name: "폴리에스터",
    pros: "내구성이 뛰어남",
    cons: "팔 부담이 큼",
  },
  {
    color: "var(--color-court-grass)",
    name: "멀티필라멘트",
    pros: "편안한 타구감",
    cons: "내구성이 낮음",
  },
  {
    color: "var(--color-court-clay)",
    name: "내추럴 거트",
    pros: "최고의 타구감과 반발력",
    cons: "매우 비쌈 (5~8만원)",
  },
  {
    color: "var(--color-brand)",
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
          <p className="text-[10px] font-semibold tracking-[0.15em] text-[var(--color-brand)] uppercase mb-1">String Guide</p>
          <h2 className="text-2xl font-bold mb-3 tracking-tight">스트링 가이드</h2>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            같은 라켓이라도 스트링에 따라 완전히 다른 라켓이 됩니다.
          </p>
          <Link
            href="/guide/strings"
            className="inline-block mt-4 text-sm font-medium text-[var(--color-brand)] hover:underline"
          >
            가이드 읽기 →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {types.map((type) => (
            <div key={type.name} className="bg-[var(--color-bg-white)] rounded-xl p-4 shadow-sm">
              <div className="w-8 h-1 rounded-full mb-3" style={{ backgroundColor: type.color }} />
              <h3 className="font-semibold text-sm mb-2">{type.name}</h3>
              <p className="text-xs text-[var(--color-text-secondary)]">+ {type.pros}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">− {type.cons}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
