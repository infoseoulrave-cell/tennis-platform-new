export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  formatPublicAxisScore,
  publicAxisScoreToPercent,
} from "@/lib/score-display";

const axes = [
  {
    key: "power",
    labelKo: "파워",
    labelEn: "Power",
    desc: "스윙웨이트(SW)를 중심으로 강성(RA), 헤드 크기, 빔 두께를 조합한 파워 성향 추정치입니다.",
  },
  {
    key: "control",
    labelKo: "컨트롤",
    labelEn: "Control",
    desc: "작은 헤드, 높은 스트링 밀도, 얇은 빔, 낮은 강성(RA)을 조합한 컨트롤 성향 프록시입니다.",
  },
  {
    key: "spin",
    labelKo: "스핀",
    labelEn: "Spin",
    desc: "낮은 스트링 밀도와 큰 헤드, 같은 노력에서 낮은 스윙웨이트(SW)를 조합한 스핀 접근성 프록시입니다.",
  },
  {
    key: "comfort",
    labelKo: "편안함",
    labelEn: "Comfort",
    desc: "낮은 강성(RA)을 중심으로 스윙웨이트(SW)와 정적 무게를 조합한 편안함 추정치입니다.",
  },
  {
    key: "stability",
    labelKo: "안정성",
    labelEn: "Stability",
    desc: "스윙웨이트(SW)와 정적 무게를 조합한 안정성 추정치입니다.",
  },
];

function AxisScaleDemo({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const pct = publicAxisScoreToPercent(value);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">
        <span>0</span>
        <span className="text-[var(--color-text-secondary)]">{label}</span>
        <span>5</span>
      </div>
      <div className="relative h-2 rounded-full bg-[var(--color-border)]">
        <div
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--color-text)] bg-white shadow"
          style={{ left: `${pct}%` }}
        />
      </div>
      <p className="text-right text-xs font-medium text-[var(--color-text)]">
        예: {formatPublicAxisScore(value)}
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
          각 축은 <strong className="text-[var(--color-text)]">0/5</strong>부터{" "}
          <strong className="text-[var(--color-text)]">5/5</strong>까지의 정수로
          표시하며, 다섯 축 합계는 정확히{" "}
          <strong className="text-[var(--color-text)]">10/15~15/15</strong>입니다.
          절대적인 ‘정답 숫자’나 품질 등급이 아니라 같은 카탈로그 안에서의
          성향 비교에 쓰입니다.
        </p>
      </header>

      <section className="mb-12 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-6">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">
          점수는 어떻게 나오나요?
        </h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
          제조사가 공개한 비스트링 정적 스펙(헤드 크기, 무게, 스트링 패턴,
          빔)을 기준으로, 가능한 경우 제조사와 별개의 리테일러가 공개한 스트링 장착
          스윙웨이트와 강성 측정을 보완해 각 축의 상대 점수를 산출합니다.
          사람이 라켓을 직접 쳐본 주관적 평가가 아니라,{" "}
          <span className="text-[var(--color-text)]">
            스펙에서 추론 가능한 성향
          </span>
          을 프록시와 추정치로 정리한 것입니다. 실제 체감은 플레이어의 기술과
          스윙, 스트링 종류와 장력, 개별 라켓의 실측 편차에 따라 달라질 수
          있습니다.
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
          아래는 같은 축 척도(0~5) 위에 마커를 올린 예시입니다. 실제 라켓
          카드에서는 다섯 축이 함께 표시됩니다.
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-[var(--color-border)] p-5 bg-white">
            <p className="text-xs font-medium text-[var(--color-text-muted)] mb-4">
              스핀 특화형 (예시)
            </p>
            <div className="space-y-5">
              <AxisScaleDemo label="스핀" value={5} />
              <AxisScaleDemo label="파워" value={3} />
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--color-border)] p-5 bg-white">
            <p className="text-xs font-medium text-[var(--color-text-muted)] mb-4">
              안정·컨트롤형 (예시)
            </p>
            <div className="space-y-5">
              <AxisScaleDemo label="안정성" value={4} />
              <AxisScaleDemo label="컨트롤" value={3} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
