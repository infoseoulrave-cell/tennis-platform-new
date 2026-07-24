import Link from "next/link";
import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";
import { Suspense } from "react";
import {
  getRacketBySlug,
  getSimilarRackets,
  type RacketSpecSources,
} from "@/lib/queries";
import { RadarBarCombo } from "@/components/radar-bar-combo";
import { RacketCard } from "@/components/racket-card";
import { RacketDetailActions } from "@/components/racket-detail-actions";
import { PriceComparison } from "@/components/price-comparison";
import { ScoringMethodologyNote } from "@/components/scoring-methodology-note";
import type { Metadata } from "next";
import {
  formatPublicTotal,
  type RawAxisScores100,
} from "@/lib/score-display";
import { formatRacketName } from "@/lib/racket-name";
import { recommendStringPairings } from "@/lib/string-pairing";
import { stringOfferId } from "@/data/strings";

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

function getRecommendation(rawScores: RawAxisScores100 | null) {
  if (!rawScores) return null;
  const forWhom: string[] = [];
  const notForWhom: string[] = [];

  if (rawScores.spin >= 80) forWhom.push("탑스핀 위주의 공격적 플레이어");
  if (rawScores.control >= 80) forWhom.push("정밀한 배치를 중시하는 올라운더");
  if (rawScores.power >= 80) forWhom.push("파워풀한 플랫 히팅을 원하는 플레이어");
  if (rawScores.comfort >= 70) forWhom.push("상대적으로 낮은 강성 후보를 비교하려는 플레이어");
  if (rawScores.stability >= 80) forWhom.push("안정적인 랠리를 선호하는 플레이어");

  if (rawScores.comfort <= 30) notForWhom.push("높은 강성 후보를 피하려는 플레이어");
  if (rawScores.power <= 30) notForWhom.push("스윙 스피드가 느린 초보자");
  if (rawScores.spin <= 30) notForWhom.push("스핀을 적극 활용하는 스타일");

  if (forWhom.length === 0) forWhom.push("다양한 스타일에 적합한 올라운드 라켓");
  if (notForWhom.length === 0) notForWhom.push("특별한 제한 없음");

  return { forWhom, notForWhom };
}

function racketNumber(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
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
  if (slug !== racket.slug) permanentRedirect(`/rackets/${racket.slug}`);

  const recommendation = getRecommendation(racket.rawScores);
  const stringPairings = recommendStringPairings({
    stiffnessRa: racket.stiffness,
    weightG: racketNumber(racket.weight),
    headSizeSqIn: racketNumber(racket.headSize),
    stringPattern: racket.pattern,
    segment: racket.segment,
    rawScores: racket.rawScores,
  });

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
          <div className="relative aspect-square bg-white rounded-2xl flex items-center justify-center overflow-hidden">
            {racket.imageUrl ? (
              <Image
                src={racket.imageUrl}
                alt={`${racket.brand} ${racket.model}`}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                unoptimized
                className="object-contain p-8"
              />
            ) : (
              <span className="px-8 text-center text-sm text-[var(--color-text-muted)]">검증된 제품 이미지 준비 중</span>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <p className="text-xs text-[var(--color-text-muted)] tracking-wider uppercase">{racket.brand}</p>
            <h1 className="text-3xl md:text-4xl font-bold mt-2 tracking-tight">
              {formatRacketName(racket.model, racket.year)}
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
              <div className="mb-4 flex items-baseline justify-between gap-4">
                <h2 className="text-sm font-semibold">5축 스펙 성향</h2>
                <p className="text-xs text-[var(--color-text-muted)]">
                  총점{" "}
                  <strong className="font-semibold text-[var(--color-text)] tabular-nums">
                    {formatPublicTotal(racket.scores)}
                  </strong>
                </p>
              </div>
              <RadarBarCombo scores={racket.scores} />
              <div className="mt-5">
                <ScoringMethodologyNote />
              </div>
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

          <Suspense fallback={<PriceComparisonFallback />}>
            <PriceComparison slug={racket.slug} />
          </Suspense>
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

      <section className="mt-8 border border-[var(--color-border)] rounded-2xl p-6">
        <h2 className="text-sm font-semibold mb-2">스트링 시타 출발점</h2>
        <p className="mb-4 text-xs leading-relaxed text-[var(--color-text-muted)]">
          확인 가능한 라켓 사양(RA·무게·헤드·패턴)과 5축 성향으로 만든 비교용 출발점입니다. 장력은 소재별 일반 가이드 안의 편집 시작값이며, 라켓 표시 범위와 부상 이력을 우선해 전문점 또는 의료 전문가와 결정하세요.
        </p>
        {stringPairings.length === 0 ? (
          <p className="rounded-xl bg-[var(--color-bg-subtle)] p-4 text-xs text-[var(--color-text-secondary)]">
            추천을 만들 근거가 부족합니다. 라켓 사양이 확인되면 조합을 표시합니다.
          </p>
        ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {stringPairings.map((pairing) => (
            <article
              key={pairing.mode}
              className="rounded-xl bg-[var(--color-bg-subtle)] p-4"
            >
              <p className="text-[10px] font-semibold tracking-wider text-[var(--color-text-muted)] uppercase">
                {pairing.modeLabel}
              </p>
              <Link
                href={`/strings#${stringOfferId(pairing.product.offerKey)}`}
                className="mt-1 inline-flex text-sm font-semibold hover:underline"
              >
                {pairing.product.brand} {pairing.product.name}
              </Link>
              <p className="mt-2 text-xs font-medium">
                편집 시작값 {pairing.tensionLbs.min}–{pairing.tensionLbs.max} lbs
              </p>
              <p className="mt-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                {pairing.reason}
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-[var(--color-text-muted)]">
                주의: {pairing.tradeoff}
              </p>
            </article>
          ))}
        </div>
        )}
        <Link
          href="/strings"
          className="mt-5 inline-flex text-sm font-semibold text-[var(--color-text)] hover:underline"
        >
          스트링 전체 카탈로그 보기 →
        </Link>
      </section>

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
        <SpecSourceLinks sources={racket.specSources} />
      </section>

      <Suspense fallback={<SimilarRacketsFallback />}>
        <SimilarRacketsSection racketId={racket.id} brand={racket.brand} />
      </Suspense>
    </div>
  );
}

function PriceComparisonFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-2xl border border-[var(--color-border)] p-6"
    >
      <span className="sr-only">판매처 가격을 불러오는 중입니다.</span>
      <div aria-hidden className="h-4 w-32 rounded bg-[var(--color-bg-subtle)]" />
    </div>
  );
}

async function SimilarRacketsSection({
  racketId,
  brand,
}: {
  racketId: string;
  brand: string;
}) {
  const similarRackets = await getSimilarRackets(racketId, brand).catch(() => []);
  if (similarRackets.length === 0) return null;

  return (
    <section className="mt-16 border-t border-[var(--color-border)] pt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">비슷한 라켓</h2>
        <Link
          href={`/rackets?brand=${encodeURIComponent(brand)}`}
          className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
        >
          {brand} 전체 보기 →
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
        {similarRackets.map((racket) => (
          <RacketCard key={racket.id} racket={racket} />
        ))}
      </div>
    </section>
  );
}

function SimilarRacketsFallback() {
  return (
    <section
      role="status"
      aria-live="polite"
      className="mt-16 border-t border-[var(--color-border)] pt-12"
    >
      <span className="sr-only">비슷한 라켓을 불러오는 중입니다.</span>
      <div aria-hidden className="h-6 w-28 rounded bg-[var(--color-bg-subtle)]" />
    </section>
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

function SpecSourceLinks({ sources }: { sources: RacketSpecSources }) {
  const items = [
    {
      source: sources.manufacturer_static,
      label: "정적 스펙 · 제조사 비스트링",
    },
    {
      source: sources.tennis_warehouse_measured,
      label: "SW/RA 측정 · 스트링 장착",
    },
  ].filter((item) => item.source !== null);

  if (items.length === 0) return null;

  return (
    <div className="mt-4 space-y-1.5 text-xs text-[var(--color-text-muted)]">
      {items.map(({ source, label }) => source && (
        <p key={source.role} className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <a
            href={source.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--color-text-secondary)] underline underline-offset-2 hover:text-[var(--color-text)]"
          >
            {label}
          </a>
          {source.capturedAt && (
            <time dateTime={source.capturedAt}>
              검증 {source.capturedAt.slice(0, 10)}
            </time>
          )}
        </p>
      ))}
    </div>
  );
}
