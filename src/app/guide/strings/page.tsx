import Link from "next/link";

const types = [
  {
    name: "폴리에스터",
    traits: ["내구성", "스핀", "경직감"],
    body: "컷팅과 스핀에 강하고 오래 갑니다. 편안함은 상대적으로 떨어질 수 있어 장력·게이지 조절이 중요합니다.",
  },
  {
    name: "멀티필라멘트",
    traits: ["편안함", "파워"],
    body: "합성 다발 구조로 타구감이 부드럽고 볼이 잘 나가는 편입니다. 컨트롤은 폴리 대비 느슨해질 수 있습니다.",
  },
  {
    name: "내추럴 거트",
    traits: ["최상의 타구감", "고가"],
    body: "천연 소재로 감촉과 파워의 균형이 뛰어납니다. 비와 습기에 약하고 가격이 높아 관리 비용이 큽니다.",
  },
  {
    name: "하이브리드",
    traits: ["밸런스"],
    body: "메인과 크로스에 서로 다른 소재를 조합합니다. 폴리의 스핀·내구와 멀티/거트의 감촉을 맞춤형으로 섞을 수 있습니다.",
  },
];

const setups = [
  {
    style: "올라운드",
    rec: "멀티 단독 또는 하이브리드(메인 폴리 + 크로스 멀티). 중간 장력에서 시작해 컨트롤/파워 밸런스를 맞춥니다.",
  },
  {
    style: "베이스라인 스핀",
    rec: "폴리 또는 스핀 지향 폴리 하이브리드. 장력은 너무 높이지 말고 스윙 스피드에 맞춰 조절합니다.",
  },
  {
    style: "네트 앞·발리 위주",
    rec: "조금 더 탄탄한 느낌을 원하면 장력을 소폭 올리거나, 컨트롤형 폴리/하이브리드를 고려합니다.",
  },
  {
    style: "팔 피로·팔꿈치 보호",
    rec: "멀티필라멘트 또는 크로스에 멀티/거트를 두는 하이브리드. 폴리 단독·고장력은 부담이 될 수 있습니다.",
  },
];

export default function GuideStringsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <nav className="mb-8 text-sm text-[var(--color-text-secondary)]">
        <Link href="/guide" className="hover:text-[var(--color-text)]">
          가이드
        </Link>
        <span className="mx-2 text-[var(--color-text-muted)]">/</span>
        <span className="text-[var(--color-text)]">스트링</span>
      </nav>

      <header className="mb-10">
        <h1 className="text-3xl font-bold text-[var(--color-text)]">
          스트링 가이드
        </h1>
        <p className="mt-3 text-[var(--color-text-secondary)] leading-relaxed">
          소재 특성과 장력은 타구감·내구·스핀에 직결됩니다. 먼저 네 가지
          대표 타입을 이해한 뒤, 장력과 조합을 맞추면 됩니다.
        </p>
        <Link
          href="/strings"
          className="mt-5 inline-flex rounded-lg bg-[var(--color-text)] px-4 py-2.5 text-sm font-semibold text-[var(--color-bg)] hover:opacity-85 transition-opacity"
        >
          스트링 판매처 보기
        </Link>
      </header>

      <section className="mb-12">
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
          네 가지 스트링 타입
        </h2>
        <ul className="space-y-4">
          {types.map((t) => (
            <li
              key={t.name}
              className="rounded-2xl border border-[var(--color-border)] p-5"
            >
              <h3 className="font-semibold text-[var(--color-text)]">
                {t.name}
              </h3>
              <p className="mt-2 flex flex-wrap gap-2">
                {t.traits.map((x) => (
                  <span
                    key={x}
                    className="rounded-full bg-[var(--color-bg-subtle)] px-2.5 py-0.5 text-xs text-[var(--color-text-secondary)] border border-[var(--color-border)]"
                  >
                    {x}
                  </span>
                ))}
              </p>
              <p className="mt-3 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {t.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-12 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-6">
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-3">
          장력 가이드
        </h2>
        <ul className="space-y-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
          <li>
            <span className="font-medium text-[var(--color-text)]">
              높은 장력
            </span>
            : 스트링 베드가 덜 튀어{" "}
            <span className="text-[var(--color-text)]">컨트롤</span>과 방향성이
            좋아지는 경향이 있습니다. 파워는 다소 줄 수 있습니다.
          </li>
          <li>
            <span className="font-medium text-[var(--color-text)]">
              낮은 장력
            </span>
            : 트램폴린 효과로{" "}
            <span className="text-[var(--color-text)]">파워</span>와 볼이 묻는
            느낌이 살아날 수 있습니다. 컨트롤은 느슨해질 수 있어요.
          </li>
        </ul>
        <p className="mt-4 text-xs text-[var(--color-text-muted)]">
          라켓 추천 장력 범위 안에서 1~2 lbs 단위로 조정하며 본인 스윙에 맞는
          스팟을 찾는 방식이 일반적입니다.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
          플레이 스타일별 추천 방향
        </h2>
        <ul className="space-y-3">
          {setups.map((s) => (
            <li
              key={s.style}
              className="rounded-xl border border-[var(--color-border)] p-4"
            >
              <h3 className="text-sm font-semibold text-[var(--color-text)]">
                {s.style}
              </h3>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {s.rec}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
