import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getRacketBySlug, getSimilarRackets } from "@/lib/queries";
import { RadarBarCombo } from "@/components/radar-bar-combo";
import { RacketCard } from "@/components/racket-card";
import { RacketDetailActions } from "@/components/racket-detail-actions";
import { ScoringMethodologyNote } from "@/components/scoring-methodology-note";
import type { Metadata } from "next";
import type { Scores } from "@/components/radar-chart";
import { formatRacketName } from "@/lib/racket-name";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const racket = await getRacketBySlug(slug).catch(() => null);
  if (!racket) return {};
  return {
    title: `${racket.brand} ${formatRacketName(racket.model, racket.year)}`,
    description: `${racket.brand} ${racket.model} - ${racket.weight ?? ""} ${racket.headSize ?? ""} ${racket.pattern ?? ""}. 5축 분석과 스펙, 최저가 비교.`,
  };
}

function formatPrice(price: number | null): string {
  if (!price) return "가격 정보 없음";
  return `₩${price.toLocaleString()}`;
}

const SEGMENT_LABELS: Record<string, string> = {
  beginner: "입문자",
  intermediate: "중급자",
  advanced: "상급자",
  pro: "프로",
};

function getRecommendation(scores: Scores | null) {
  if (!scores) return null;
  const forWhom: string[] = [];
  const notForWhom: string[] = [];

  if (scores.spin >= 3) forWhom.push("탑스핀 위주의 공격적 플레이어");
  if (scores.control >= 3) forWhom.push("정밀한 배치를 중시하는 올라운더");
  if (scores.power >= 3) forWhom.push("파워풀한 플랫 히팅을 원하는 플레이어");
  if (scores.comfort >= 2) forWhom.push("상대적으로 낮은 강성 후보를 비교하려는 플레이어");
  if (scores.stability >= 3) forWhom.push("안정적인 랠리를 선호하는 플레이어");

  if (scores.comfort <= -2) notForWhom.push("높은 강성 후보를 피하려는 플레이어");
  if (scores.power <= -2) notForWhom.push("스윙 스피드가 느린 초보자");
  if (scores.spin <= -2) notForWhom.push("스핀을 적극 활용하는 스타일");

  if (forWhom.length === 0) forWhom.push("다양한 스타일에 적합한 올라운드 라켓");
  if (notForWhom.length === 0) notForWhom.push("특별한 제약 없이 폭넓은 레벨에서 사용 가능");

  return { forWhom, notForWhom };
}

function getStringRecommendation(scores: Scores | null) {
  if (!scores) return null;
  if (scores.spin >= 3) {
    return { string: "Luxilon ALU Power / Babolat RPM Blast", tension: "48-52 lbs", reason: "오픈 패턴에서 비교해 볼 수 있는 폴리 조합 예시." };
  }
  if (scores.control >= 3) {
    return { string: "Tecnifibre Razor Code / Solinco Confidential", tension: "50-54 lbs", reason: "컨트롤 성향을 비교하기 위한 폴리 조합 예시." };
  }
  if (scores.comfort >= 2) {
    return { string: "Wilson NXT / Tecnifibre X-One", tension: "48-52 lbs", reason: "멀티필라멘트 타구감을 비교하기 위한 출발 조합." };
  }
  return { string: "Yonex Poly Tour Pro / Head Lynx", tension: "48-52 lbs", reason: "중립적인 폴리 조합을 비교하기 위한 출발점." };
}

export default async function RacketDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let racket;
  try {
    racket = await getRacketBySlug(slug);
  } catch {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center text-[var(--color-text-muted)]">
        라켓 정보를 불러올 수 없습니다.
      </div>
    );
  }

  if (!racket) notFound();

  const similarRackets = await getSimilarRackets(racket.id, racket.brand).catch(() => []);
  const recommendation = getRecommendation(racket.scores);
  const stringRec = getStringRecommendation(racket.scores);
  const segmentLabel = racket.segment ? (SEGMENT_LABELS[racket.segment] ?? racket.segment) : null;

  return (
    <div>
      {/* 헤더: 화이트 섹션 */}
      <section className="bg-[var(--color-bg-white)]">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <Link href="/rackets" className="hover:text-[var(--color-text)]">라켓</Link>
            <span>/</span>
            <Link href={`/rackets?brand=${encodeURIComponent(racket.brand)}`} className="hover:text-[var(--color-text)]">
              {racket.brand}
            </Link>
            <span>/</span>
            <span className="text-[var(--color-text-secondary)]">{racket.model}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-square flex items-center justify-center py-8">
              {racket.imageUrl ? (
                <Image
                  src={racket.imageUrl}
                  alt={racket.model}
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  unoptimized
                  className="object-contain"
                />
              ) : (
                <span className="px-8 text-center text-sm text-[var(--color-text-muted)]">검증된 제품 이미지 준비 중</span>
              )}
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.15em] text-[var(--color-brand)] uppercase">
                  {racket.brand}
                </p>
                <h1 className="text-3xl md:text-4xl font-bold mt-1 tracking-tight leading-tight">
                  {racket.model}
                </h1>
                {racket.year && (
                  <span className="inline-block text-xs px-2 py-0.5 bg-[var(--color-brand-subtle)] text-[var(--color-brand)] font-medium rounded mt-2">
                    {racket.year}
                  </span>
                )}
              </div>

              {segmentLabel && (
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {segmentLabel}용 라켓
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                {racket.weight && (
                  <span className="text-xs px-3 py-1.5 bg-[var(--color-bg-subtle)] rounded-full font-medium">{racket.weight}</span>
                )}
                {racket.headSize && (
                  <span className="text-xs px-3 py-1.5 bg-[var(--color-bg-subtle)] rounded-full font-medium">{racket.headSize}</span>
                )}
                {racket.pattern && (
                  <span className="text-xs px-3 py-1.5 bg-[var(--color-bg-subtle)] rounded-full font-medium">{racket.pattern}</span>
                )}
                {segmentLabel && (
                  <span className="text-xs px-3 py-1.5 bg-[var(--color-bg-subtle)] rounded-full font-medium">{segmentLabel}용</span>
                )}
              </div>

              <div className="flex items-end justify-between pt-4 border-t border-[var(--color-border)]">
                <div>
                  <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">최저가</p>
                  <p className="text-3xl font-bold tracking-tight">{formatPrice(racket.priceKrw)}</p>
                </div>
                <RacketDetailActions
                  slug={racket.slug}
                  brand={racket.brand}
                  model={racket.model}
                  year={racket.year}
                  imageUrl={racket.imageUrl}
                  priceKrw={racket.priceKrw}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5축 분석: 다크 섹션 */}
      {racket.scores && (
        <section className="bg-[var(--color-bg-dark)] text-white py-12">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-[10px] font-semibold tracking-[0.15em] text-[var(--color-accent)] uppercase mb-1">
              Analysis
            </p>
            <h2 className="text-xl font-bold tracking-tight mb-8">5축 능력 분석</h2>
            <RadarBarCombo scores={racket.scores} dark />
          </div>
        </section>
      )}

      <div className="max-w-6xl mx-auto px-6">
        {racket.scores && (
          <div className="pt-6">
            <ScoringMethodologyNote compact />
          </div>
        )}

        {recommendation && (
          <section className="py-10 grid md:grid-cols-2 gap-5">
            <div className="bg-[var(--color-brand-subtle)] rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-[var(--color-brand)] text-white text-xs flex items-center justify-center font-bold">✓</span>
                <h2 className="text-sm font-bold">이런 분에게 추천</h2>
              </div>
              <ul className="space-y-2.5">
                {recommendation.forWhom.map((text, i) => (
                  <li key={i} className="text-sm text-[var(--color-text-secondary)] flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-[var(--color-brand)] mt-2 shrink-0" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-orange-50 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">!</span>
                <h2 className="text-sm font-bold">주의할 점</h2>
              </div>
              <ul className="space-y-2.5">
                {recommendation.notForWhom.map((text, i) => (
                  <li key={i} className="text-sm text-[var(--color-text-secondary)] flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-orange-400 mt-2 shrink-0" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {stringRec && (
          <section className="bg-[var(--color-brand)] text-white rounded-2xl p-6 mb-10">
            <p className="text-[10px] font-semibold tracking-[0.15em] text-blue-200/70 uppercase mb-1">String Setup</p>
            <h2 className="text-base font-bold mb-5">추천 스트링 세팅</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <p className="text-[10px] text-blue-200/60 uppercase tracking-wide mb-1">스트링</p>
                <p className="text-sm font-semibold">{stringRec.string}</p>
              </div>
              <div>
                <p className="text-[10px] text-blue-200/60 uppercase tracking-wide mb-1">장력</p>
                <p className="text-sm font-semibold">{stringRec.tension}</p>
              </div>
              <div>
                <p className="text-[10px] text-blue-200/60 uppercase tracking-wide mb-1">이유</p>
                <p className="text-sm text-blue-100/80 leading-relaxed">{stringRec.reason}</p>
              </div>
            </div>
            <p className="mt-5 text-[10px] text-blue-200/50 leading-relaxed">
              위 범위는 처방이 아닌 비교용 예시입니다. 실제 장력은 제조사 허용 범위, 스트링 게이지, 부상 이력에 따라 전문점 또는 의료 전문가와 결정하세요.
            </p>
          </section>
        )}

        <section className="pb-12">
          <p className="text-[10px] font-semibold tracking-[0.15em] text-[var(--color-brand)] uppercase mb-1">Specifications</p>
          <h2 className="text-xl font-bold tracking-tight mb-6">상세 스펙</h2>
          <div className="bg-[var(--color-bg-white)] rounded-2xl shadow-sm overflow-hidden">
            <dl>
              <SpecRow label="헤드사이즈" value={racket.headSize} zebra />
              <SpecRow label="무게" value={racket.weight} />
              <SpecRow label="스트링 패턴" value={racket.pattern} zebra />
              <SpecRow label="강성 (RA)" value={racket.stiffness?.toString()} />
              <SpecRow label="길이" value={racket.lengthMm ? `${racket.lengthMm}mm` : null} zebra />
              <SpecRow label="프레임 두께" value={racket.beamWidth ? `${racket.beamWidth}mm` : null} />
              <SpecRow label="밸런스" value={racket.balanceMm ? `${racket.balanceMm}mm` : null} zebra />
              <SpecRow label="스윙웨이트" value={racket.swingWeight?.toString()} />
            </dl>
          </div>
        </section>

        {similarRackets.length > 0 && (
          <section className="border-t border-[var(--color-border)] pt-12 pb-16">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.15em] text-[var(--color-brand)] uppercase mb-1">Similar</p>
                <h2 className="text-xl font-bold tracking-tight">비슷한 성격의 라켓</h2>
              </div>
              <Link
                href={`/rackets?brand=${encodeURIComponent(racket.brand)}`}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                {racket.brand} 전체 보기 →
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {similarRackets.map((r) => (
                <RacketCard key={r.id} racket={r} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function SpecRow({
  label,
  value,
  zebra = false,
}: {
  label: string;
  value: string | null | undefined;
  zebra?: boolean;
}) {
  return (
    <div className={`flex justify-between items-center px-6 py-4 ${zebra ? "bg-[var(--color-bg-subtle)]" : ""}`}>
      <dt className="text-sm text-[var(--color-text-secondary)]">{label}</dt>
      <dd className="text-sm font-semibold">{value ?? "—"}</dd>
    </div>
  );
}
