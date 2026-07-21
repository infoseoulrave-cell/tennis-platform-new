export const dynamic = "force-dynamic";

import Link from "next/link";

const axes = [
  {
    key: "power",
    labelKo: "파워",
    labelEn: "Power",
    desc: "평타·서브에서 볼이 나가는 쉬움과 깊이. 헤드 라이트·낮은 스윙웨이트는 상대적으로 낮게, 헤드 헤비·긴 레버리지는 높게 평가될 수 있어요.",
  },
  {
    key: "control",
    labelKo: "컨트롤",
    labelEn: "Control",
    desc: "원하는 코스와 길이로 볼을 묶는 느낌. 패턴 스윙에서 실수 여지가 줄어드는 방향으로 해석됩니다.",
  },
  {
    key: "spin",
    labelKo: "스핀",
    labelEn: "Spin",
    desc: "스트링 패턴·프레임 형상·스윙 피벗과 맞물려 탑스핀/슬라이스가 ‘묻는’ 정도를 나타냅니다.",
  },
  {
    key: "comfort",
    labelKo: "편안함",
    labelEn: "Comfort",
    desc: "팔·팔꿈치로 전달되는 진동과 충격. 재질·두께·밸런스·추천 스트링 조합이 함께 반영됩니다.",
  },
  {
    key: "stability",
    labelKo: "안정성",
    labelEn: "Stability",
    desc: "오프센터 타구에서 흔들림이 적고 방향성이 유지되는 성향입니다. 트위스트·비틀림 강성 등이 관련됩니다.",
  },
];

function AxisScaleDemo({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const pct = ((value + 5) / 10) * 100;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">
        <span>−5</span>
        <span className="text-[var(--color-text-secondary)]">{label}</span>
        <span>+5</span>
      </div>
      <div className="relative h-2 rounded-full bg-[var(--color-border)]">
        <div
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--color-text)] bg-white shadow"
          style={{ left: `${pct}%` }}
        />
      </div>
      <p className="text-right text-xs font-medium text-[var(--color-text)]">
        예: {value > 0 ? "+" : ""}
        {value}
      </p>
    </div>
  );
}

export default function GuideDnaPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <nav className="mb-8 text-sm text-[var(--color-text-secondary)]">
        <Link href="/guide" className="hover:text-[var(--color-text)]">
          가이드
        </Link>
        <span className="mx-2 text-[var(--color-text-muted)]">/</span>
        <span className="text-[var(--color-text)]">라켓 DNA</span>
      </nav>

      <header className="mb-10">
        <h1 className="text-3xl font-bold text-[var(--color-text)]">
          5축 점수 이해하기
        </h1>
        <p className="mt-3 text-[var(--color-text-secondary)] leading-relaxed">
          각 축은 <strong className="text-[var(--color-text)]">−5</strong>부터{" "}
          <strong className="text-[var(--color-text)]">+5</strong>까지의 상대
          척도입니다. 절대적인 ‘정답 숫자’가 아니라, 같은 카탈로그 안에서의 성향
          비교에 쓰입니다.
        </p>
      </header>

      <section className="mb-12 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-6">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">
          점수는 어떻게 나오나요?
        </h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
          스펙(헤드 크기, 무게, 밸런스, 스트링 패턴, 프레임 단면, 재질 등)과
          공개된 설계 특성을 입력으로,{" "}
          <span className="text-[var(--color-text)]">
            AI 기반 분석 파이프라인
          </span>
          이 각 축에 대한 상대 점수를 산출합니다. 사람이 라켓을 직접 쳐본
          주관적 평가가 아니라,{" "}
          <span className="text-[var(--color-text)]">
            스펙에서 추론 가능한 성향
          </span>
          을 숫자로 정리한 것입니다.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
          다섯 가지 축
        </h2>
        <ul className="space-y-4">
          {axes.map((a) => (
            <li
              key={a.key}
              className="rounded-2xl border border-[var(--color-border)] p-5"
            >
              <h3 className="font-semibold text-[var(--color-text)]">
                {a.labelKo}{" "}
                <span className="text-[var(--color-text-muted)] font-normal text-sm">
                  / {a.labelEn}
                </span>
              </h3>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {a.desc}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">
          시각 예시
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          아래는 같은 척도(−5 ~ +5) 위에 마커를 올린 예시입니다. 실제 라켓
          카드에서는 다섯 축이 함께 표시됩니다.
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-[var(--color-border)] p-5 bg-white">
            <p className="text-xs font-medium text-[var(--color-text-muted)] mb-4">
              스핀 특화형 (예시)
            </p>
            <div className="space-y-5">
              <AxisScaleDemo label="스핀" value={4} />
              <AxisScaleDemo label="파워" value={1} />
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--color-border)] p-5 bg-white">
            <p className="text-xs font-medium text-[var(--color-text-muted)] mb-4">
              안정·컨트롤형 (예시)
            </p>
            <div className="space-y-5">
              <AxisScaleDemo label="안정성" value={3} />
              <AxisScaleDemo label="컨트롤" value={2} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
