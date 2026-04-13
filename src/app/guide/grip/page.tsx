export const dynamic = "force-dynamic";

import Link from "next/link";

const sizes = [
  { code: "G1", inches: '4 1/8"', mm: "약 101mm", note: "가장 작은 일반 규격" },
  { code: "G2", inches: '4 1/4"', mm: "약 108mm", note: "" },
  { code: "G3", inches: '4 3/8"', mm: "약 111mm", note: "국내에서 가장 흔한 사이즈 중 하나" },
  { code: "G4", inches: '4 1/2"', mm: "약 114mm", note: "" },
  { code: "G5", inches: '4 5/8"', mm: "약 118mm", note: "가장 큰 일반 규격" },
];

export default function GuideGripPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <nav className="mb-8 text-sm text-[var(--color-text-secondary)]">
        <Link href="/guide" className="hover:text-[var(--color-text)]">
          가이드
        </Link>
        <span className="mx-2 text-[var(--color-text-muted)]">/</span>
        <span className="text-[var(--color-text)]">그립 사이즈</span>
      </nav>

      <header className="mb-10">
        <h1 className="text-3xl font-bold text-[var(--color-text)]">
          그립 사이즈 가이드
        </h1>
        <p className="mt-3 text-[var(--color-text-secondary)] leading-relaxed">
          그립은 너무 크면 손목에 부담이 가고, 너무 작으면 과도하게
          헛돌려 잡게 됩니다. 아래 표준 규격과 재는 방법을 참고하세요.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
          표준 사이즈 (G1 ~ G5)
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-bg-subtle)] text-left text-[var(--color-text-secondary)]">
                <th className="px-4 py-3 font-medium">코드</th>
                <th className="px-4 py-3 font-medium">둘레 (인치)</th>
                <th className="px-4 py-3 font-medium">참고 (mm)</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">
                  비고
                </th>
              </tr>
            </thead>
            <tbody className="text-[var(--color-text)]">
              {sizes.map((row) => (
                <tr
                  key={row.code}
                  className="border-t border-[var(--color-border)]"
                >
                  <td className="px-4 py-3 font-semibold">{row.code}</td>
                  <td className="px-4 py-3">{row.inches}</td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {row.mm}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)] hidden sm:table-cell text-xs">
                    {row.note || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-[var(--color-text-muted)]">
          브랜드·모델에 따라 라벨 표기(W1 등)가 다를 수 있으니 구매 전 스펙을
          확인하세요.
        </p>
      </section>

      <section className="mb-12 space-y-6">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">
          재는 방법
        </h2>
        <div className="rounded-2xl border border-[var(--color-border)] p-5">
          <h3 className="font-semibold text-[var(--color-text)]">
            자(룰러) 방법
          </h3>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
            주로 쓰는 손의 주먹을 살짝 쥔 상태에서, 주먹 측면 가장 넓은 부분
            둘레를 재거나, 손바닥 길이(손목 주름에서 중지 끝까지)를 측정해
            제조사·매장의 변환표와 대조합니다.
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] p-5">
          <h3 className="font-semibold text-[var(--color-text)]">
            라켓을 잡아보는 방법
          </h3>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
            동서 그립으로 잡았을 때 검지 손가락 하나가 손바닥과 그립 베벨
            사이에 들어갈 정도가 흔한 기준입니다. 들어가지 않으면 한 단계 작은
            사이즈, 여유가 많으면 한 단계 큰 사이즈를 시도해 보세요.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-6">
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-3">
          선택 팁
        </h2>
        <ul className="list-disc list-inside space-y-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
          <li>
            애매하면 보통{" "}
            <span className="text-[var(--color-text)]">작은 쪽</span>을 고르고
            오버그립으로 미세 조정하는 경우가 많습니다.
          </li>
          <li>
            이중 그립을 많이 감으면 실질적으로 한 단계 이상 커지므로, 본래
            그립 사이즈와 함께 고려하세요.
          </li>
          <li>
            레슨·매장에서 실제 라켓을 잡아보고 피팅 받는 것이 가장 정확합니다.
          </li>
        </ul>
      </section>
    </div>
  );
}
