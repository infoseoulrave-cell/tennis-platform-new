import Link from "next/link";

/**
 * 홈 최상단 초심자 진입점.
 *
 * 기존 홈은 히어로 캐러셀과 5축 점수부터 나와서, 테니스를 모르는 사람은
 * 어디서 시작할지 알 수 없다는 피드백이 있었다. 그래서 첫 화면 맨 위에
 * 문항 3개짜리 경로 하나만 크게 노출한다.
 */
export function BeginnerBanner() {
  return (
    <section className="border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold tracking-tight">
            테니스 처음이신가요?
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            3가지만 답하면 맞는 라켓을 골라드립니다. 스펙은 몰라도 됩니다.
          </p>
        </div>
        <Link
          href="/start"
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-text)] px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          라켓 추천받기
        </Link>
      </div>
    </section>
  );
}
