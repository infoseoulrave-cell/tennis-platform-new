export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <header className="mb-12">
        <p className="text-sm font-medium text-[var(--color-text-muted)]">
          racketlab
        </p>
        <h1 className="mt-2 text-3xl font-bold text-[var(--color-text)]">
          About
        </h1>
      </header>

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-3">
          미션
        </h2>
        <p className="text-[var(--color-text-secondary)] leading-relaxed">
          한국에서 실제 판매 중인 테니스 라켓을 이해하고, 비교하고, 추천받고,
          구매까지 연결하는 서비스
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
          무엇이 다른가요?
        </h2>
        <ul className="space-y-4">
          <li className="rounded-2xl border border-[var(--color-border)] p-5">
            <h3 className="font-semibold text-[var(--color-text)]">
              5축 스코어링
            </h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
              파워·컨트롤·스핀·편안함·안정성을 한눈에 비교할 수 있도록
              스펙 기반으로 정리합니다.
            </p>
          </li>
          <li className="rounded-2xl border border-[var(--color-border)] p-5">
            <h3 className="font-semibold text-[var(--color-text)]">
              AI 추천
            </h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
              플레이 스타일과 조건을 입력하면 후보 라켓을 좁혀 이유와 함께
              제안합니다.
            </p>
          </li>
          <li className="rounded-2xl border border-[var(--color-border)] p-5">
            <h3 className="font-semibold text-[var(--color-text)]">
              한국 실판매 가격
            </h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
              해외 기준가가 아니라 국내에서 실제로 움직이는 가격 맥락을
              반영하는 것을 지향합니다.
            </p>
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-6">
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-3">
          팀 · 서비스
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          racketlab은 테니스 장비 데이터와 추천 로직을 계속 다듬는 소규모
          프로덕트 팀으로 운영됩니다. 카탈로그·가격·파트너 정보는 시장 상황에
          따라 업데이트되며, 추천과 스코어는 참고용 정보이며 최종 선택은 항상
          본인의 피팅과 체험을 우선합니다.
        </p>
      </section>
    </div>
  );
}
