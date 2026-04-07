import Link from "next/link";
import { notFound } from "next/navigation";
import { getRacketBySlug } from "@/lib/queries";
import { RadarBarCombo } from "@/components/radar-bar-combo";

export const dynamic = "force-dynamic";

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

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
        <Link href="/rackets" className="hover:text-[var(--color-text)]">
          ← 라켓
        </Link>
        <span>/</span>
        <span>{racket.brand}</span>
      </nav>

      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12">
        {/* Image side */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="aspect-square bg-[var(--color-bg-subtle)] rounded-2xl flex items-center justify-center">
            {racket.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
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

        {/* Info side */}
        <div className="space-y-8">
          {/* Header */}
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

          {/* Spec badges */}
          <div className="flex flex-wrap gap-2">
            {racket.weight && (
              <span className="text-xs px-3 py-1.5 bg-[var(--color-bg-subtle)] rounded-full">
                {racket.weight}
              </span>
            )}
            {racket.headSize && (
              <span className="text-xs px-3 py-1.5 bg-[var(--color-bg-subtle)] rounded-full">
                {racket.headSize}
              </span>
            )}
            {racket.pattern && (
              <span className="text-xs px-3 py-1.5 bg-[var(--color-bg-subtle)] rounded-full">
                {racket.pattern}
              </span>
            )}
          </div>

          {/* 5-axis chart */}
          {racket.scores && (
            <section className="border border-[var(--color-border)] rounded-2xl p-6">
              <h2 className="text-sm font-semibold mb-4">5축 능력 분석</h2>
              <RadarBarCombo scores={racket.scores} />
            </section>
          )}

          {/* Price + CTA */}
          <div className="border-t border-[var(--color-border)] pt-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">최저가</p>
                <p className="text-2xl font-bold mt-1">{formatPrice(racket.priceKrw)}</p>
              </div>
              <button className="px-6 py-3 bg-[var(--color-text)] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity">
                구매처 보기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed sections */}
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
