import Link from "next/link";
import { notFound } from "next/navigation";
import { getRacketBySlug, getSimilarRackets } from "@/lib/queries";
import { RadarBarCombo } from "@/components/radar-bar-combo";
import { RacketCard } from "@/components/racket-card";
import { RacketDetailActions } from "@/components/racket-detail-actions";
import type { Metadata } from "next";
import type { Scores } from "@/components/radar-chart";

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
    title: `${racket.brand} ${racket.model}${racket.year ? ` (${racket.year})` : ""}`,
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
  if (scores.comfort >= 2) forWhom.push("팔 보호가 필요한 장시간 플레이어");
  if (scores.stability >= 3) forWhom.push("안정적인 랠리를 선호하는 플레이어");

  if (scores.comfort <= -2) notForWhom.push("팔꿈치/손목 통증이 있는 플레이어");
  if (scores.power <= -2) notForWhom.push("스윙 스피드가 느린 초보자");
  if (scores.spin <= -2) notForWhom.push("스핀을 적극 활용하는 스타일");

  if (forWhom.length === 0) forWhom.push("다양한 스타일에 적합한 올라운드 라켓");
  if (notForWhom.length === 0) notForWhom.push("특별한 제한 없음");

  return { forWhom, notForWhom };
}

function getStringRecommendation(scores: Scores | null) {
  if (!scores) return null;
  if (scores.spin >= 3) {
    return { string: "Luxilon ALU Power / Babolat RPM Blast", tension: "48-52 lbs", reason: "스핀 포텐셜을 최대로 활용. 폴리 스트링으로 내구성과 스핀을 동시에 확보." };
  }
  if (scores.control >= 3) {
    return { string: "Tecnifibre Razor Code / Solinco Confidential", tension: "52-55 lbs", reason: "높은 컨트롤을 살리는 폴리 스트링. 장력을 약간 높여 정밀도 극대화." };
  }
  if (scores.comfort >= 2) {
    return { string: "Wilson NXT / Tecnifibre X-One", tension: "50-54 lbs", reason: "멀티필라멘트로 편안한 타구감 유지. 팔 부담 최소화." };
  }
  return { string: "Yonex Poly Tour Pro / Head Lynx", tension: "50-53 lbs", reason: "올라운드 성능의 폴리 스트링. 균형 잡힌 세팅 추천." };
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

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
        <Link href="/rackets" className="hover:text-[var(--color-text)]">
          ← 라켓
        </Link>
        <span>/</span>
        <span>{racket.brand}</span>
      </nav>

      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12">
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="aspect-square bg-[var(--color-bg-subtle)] rounded-2xl flex items-center justify-center">
            {racket.imageUrl ? (
              <img
                src={racket.imageUrl}
                alt={racket.model}
                className="object-contain w-full h-full p-8"
              />
            ) : (
              <span className="text-7xl opacity-20">🎾</span>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <p className="text-xs text-[var(--color-text-muted)] tracking-wider uppercase">{racket.brand}</p>
            <h1 className="text-3xl md:text-4xl font-bold mt-2 tracking-tight">
              {racket.model}{racket.year ? ` (${racket.year})` : ""}
            </h1>
            {racket.segment && (
              <p className="text-sm text-[var(--color-text-secondary)] mt-3">
                {SEGMENT_LABELS[racket.segment] ?? racket.segment} 라켓
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {racket.weight && (
              <span className="text-xs px-3 py-1.5 bg-[var(--color-bg-subtle)] rounded-full">{racket.weight}</span>
            )}
            {racket.headSize && (
              <span className="text-xs px-3 py-1.5 bg-[var(--color-bg-subtle)] rounded-full">{racket.headSize}</span>
            )}
            {racket.pattern && (
              <span className="text-xs px-3 py-1.5 bg-[var(--color-bg-subtle)] rounded-full">{racket.pattern}</span>
            )}
          </div>

          {racket.scores && (
            <section className="border border-[var(--color-border)] rounded-2xl p-6">
              <h2 className="text-sm font-semibold mb-4">5축 능력 분석</h2>
              <RadarBarCombo scores={racket.scores} />
            </section>
          )}

          <div className="border-t border-[var(--color-border)] pt-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">최저가</p>
                <p className="text-2xl font-bold mt-1">{formatPrice(racket.priceKrw)}</p>
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

      {recommendation && (
        <section className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="border border-[var(--color-border)] rounded-2xl p-6">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <span className="text-green-500">✓</span> 이런 분에게 추천
            </h2>
            <ul className="space-y-2">
              {recommendation.forWhom.map((text, i) => (
                <li key={i} className="text-sm text-[var(--color-text-secondary)] flex items-start gap-2">
                  <span className="text-green-400 mt-0.5 shrink-0">•</span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-[var(--color-border)] rounded-2xl p-6">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <span className="text-orange-500">!</span> 주의할 점
            </h2>
            <ul className="space-y-2">
              {recommendation.notForWhom.map((text, i) => (
                <li key={i} className="text-sm text-[var(--color-text-secondary)] flex items-start gap-2">
                  <span className="text-orange-400 mt-0.5 shrink-0">•</span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {stringRec && (
        <section className="mt-8 border border-[var(--color-border)] rounded-2xl p-6">
          <h2 className="text-sm font-semibold mb-4">추천 스트링 세팅</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-[var(--color-text-muted)] mb-1">추천 스트링</p>
              <p className="text-sm font-medium">{stringRec.string}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)] mb-1">추천 장력</p>
              <p className="text-sm font-medium">{stringRec.tension}</p>
            </div>
            <div className="sm:col-span-1">
              <p className="text-xs text-[var(--color-text-muted)] mb-1">이유</p>
              <p className="text-sm text-[var(--color-text-secondary)]">{stringRec.reason}</p>
            </div>
          </div>
        </section>
      )}

      <section className="mt-16 border-t border-[var(--color-border)] pt-12">
        <h2 className="text-xl font-bold mb-6">상세 스펙</h2>
        <dl className="grid sm:grid-cols-2 gap-x-12">
          <SpecRow label="헤드사이즈" value={racket.headSize} />
          <SpecRow label="무게" value={racket.weight} />
          <SpecRow label="스트링 패턴" value={racket.pattern} />
          <SpecRow label="강성 (RA)" value={racket.stiffness?.toString()} />
          <SpecRow label="길이" value={racket.lengthMm ? `${racket.lengthMm}mm` : null} />
          <SpecRow label="프레임 두께" value={racket.beamWidth ? `${racket.beamWidth}mm` : null} />
          <SpecRow label="밸런스" value={racket.balanceMm ? `${racket.balanceMm}mm` : null} />
          <SpecRow label="스윙웨이트" value={racket.swingWeight?.toString()} />
        </dl>
      </section>

      {similarRackets.length > 0 && (
        <section className="mt-16 border-t border-[var(--color-border)] pt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">비슷한 라켓</h2>
            <Link href={`/rackets?brand=${encodeURIComponent(racket.brand)}`} className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">
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
  );
}

function SpecRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between py-3 border-b border-[var(--color-border)] last:border-0">
      <dt className="text-sm text-[var(--color-text-secondary)]">{label}</dt>
      <dd className="text-sm font-medium">{value ?? "—"}</dd>
    </div>
  );
}
