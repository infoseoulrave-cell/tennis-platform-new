import Link from "next/link";
import { getRacketBySlug, type RacketDetail } from "@/lib/queries";
import { AXIS_LABELS, RadarChart } from "@/components/radar-chart";
import { ScoringMethodologyNote } from "@/components/scoring-methodology-note";
import { formatRacketName } from "@/lib/racket-name";
import { colorForRacket } from "@/lib/compare-colors";
import {
  formatPublicAxisScore,
  formatPublicTotal,
  PUBLIC_AXIS_KEYS,
  type PublicAxisScores5,
} from "@/lib/score-display";

export const dynamic = "force-dynamic";

function formatPrice(price: number | null): string {
  if (!price) return "—";
  return `₩${price.toLocaleString()}`;
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ slugs?: string }>;
}) {
  const params = await searchParams;
  const slugs = params.slugs?.split(",").filter(Boolean) ?? [];

  if (slugs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">라켓 비교</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mb-8">
          비교할 라켓을 선택해 주세요. 라켓 페이지에서 비교 담기 버튼을 눌러 추가할 수 있습니다.
        </p>
        <Link
          href="/rackets"
          className="inline-block px-5 py-2.5 bg-[var(--color-text)] text-white text-sm font-medium rounded-lg"
        >
          라켓 찾기 →
        </Link>
      </div>
    );
  }

  const rackets = (await Promise.all(
    slugs.slice(0, 3).map((slug) =>
      getRacketBySlug(slug).catch(() => null),
    ),
  )).filter((racket): racket is RacketDetail => racket !== null);

  if (rackets.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center text-[var(--color-text-muted)]">
        선택한 라켓을 찾을 수 없습니다.
      </div>
    );
  }

  // Combine all scores into a single radar chart with multiple polygons
  const racketsWithScores = rackets.filter(
    (r): r is RacketDetail & { scores: PublicAxisScores5 } => r.scores !== null,
  );
  const orderedRacketIds = rackets.map((r) => r.id);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-bold">라켓 비교</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-2">
          {rackets.length}개의 라켓을 5축 점수와 스펙으로 나란히 비교합니다.
        </p>
      </header>

      {/* Racket headers row */}
      <div className="grid gap-6 mb-10" style={{ gridTemplateColumns: `repeat(${rackets.length}, minmax(0, 1fr))` }}>
        {rackets.map((r) => (
          <div key={r.id} className="text-center">
            <div className="aspect-square bg-white rounded-xl flex items-center justify-center mb-3">
              {r.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.imageUrl} alt={r.model} className="object-contain w-full h-full p-4" />
              ) : (
                <span className="text-4xl opacity-20">🎾</span>
              )}
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">{r.brand}</p>
            <Link href={`/rackets/${r.slug}`} className="font-semibold text-sm hover:underline block">
              {formatRacketName(r.model, r.year)}
            </Link>
            {r.scores && (
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                총점{" "}
                <span className="font-semibold text-[var(--color-text)] tabular-nums">
                  {formatPublicTotal(r.scores)}
                </span>
              </p>
            )}
            <span className="inline-block w-3 h-3 rounded-full mt-2" style={{ backgroundColor: colorForRacket(r.id, orderedRacketIds) }} />
          </div>
        ))}
      </div>

      {/* Overlapping radar chart */}
      {racketsWithScores.length > 0 && (
        <section className="border border-[var(--color-border)] rounded-2xl p-8 mb-10">
          <h2 className="text-base font-semibold mb-6 text-center">5축 비교</h2>
          <div className="flex justify-center">
            <RadarChart
              scores={racketsWithScores[0].scores}
              series={racketsWithScores.map((r) => ({
                id: r.id,
                scores: r.scores,
                color: colorForRacket(r.id, orderedRacketIds),
              }))}
              showValues={false}
              size={280}
            />
          </div>
          <div className="flex justify-center gap-6 mt-6">
            {racketsWithScores.map((r) => (
              <div key={r.id} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colorForRacket(r.id, orderedRacketIds) }} />
                <span className="text-xs text-[var(--color-text-secondary)]">{r.model}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 overflow-x-auto">
            <table
              aria-label="5축 점수 비교"
              className="w-full min-w-[420px] text-xs"
            >
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th
                    scope="col"
                    className="py-2 pr-4 text-left font-normal text-[var(--color-text-muted)]"
                  >
                    축
                  </th>
                  {racketsWithScores.map((r) => (
                    <th
                      key={r.id}
                      scope="col"
                      className="px-3 py-2 text-center font-medium text-[var(--color-text-secondary)]"
                    >
                      {formatRacketName(r.model, r.year)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PUBLIC_AXIS_KEYS.map((axis) => (
                  <tr
                    key={axis}
                    data-compare-axis={axis}
                    className="border-b border-[var(--color-border)] last:border-0"
                  >
                    <th
                      scope="row"
                      className="py-2.5 pr-4 text-left font-normal text-[var(--color-text-muted)]"
                    >
                      {AXIS_LABELS[axis]}
                    </th>
                    {racketsWithScores.map((r) => (
                      <td
                        key={r.id}
                        className="px-3 py-2.5 text-center font-semibold tabular-nums text-[var(--color-text)]"
                      >
                        {formatPublicAxisScore(r.scores[axis])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6">
            <ScoringMethodologyNote />
          </div>
        </section>
      )}

      {/* Spec comparison table */}
      <section>
        <h2 className="text-base font-semibold mb-4">스펙 비교</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              <SpecCompareRow label="무게" rackets={rackets} get={(r) => r.weight} />
              <SpecCompareRow label="헤드사이즈" rackets={rackets} get={(r) => r.headSize} />
              <SpecCompareRow label="스트링 패턴" rackets={rackets} get={(r) => r.pattern} />
              <SpecCompareRow label="강성 (RA)" rackets={rackets} get={(r) => r.stiffness?.toString() ?? null} />
              <SpecCompareRow label="밸런스" rackets={rackets} get={(r) => (r.balanceMm ? `${r.balanceMm}mm` : null)} />
              <SpecCompareRow label="스윙웨이트" rackets={rackets} get={(r) => r.swingWeight?.toString() ?? null} />
              <SpecCompareRow label="가격" rackets={rackets} get={(r) => formatPrice(r.priceKrw)} />
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SpecCompareRow({
  label,
  rackets,
  get,
}: {
  label: string;
  rackets: RacketDetail[];
  get: (r: RacketDetail) => string | null | undefined;
}) {
  return (
    <tr className="border-b border-[var(--color-border)]">
      <th className="text-left py-3 pr-6 font-normal text-[var(--color-text-muted)] whitespace-nowrap">{label}</th>
      {rackets.map((r) => (
        <td key={r.id} className="text-center py-3 px-2 font-medium">
          {get(r) ?? "—"}
        </td>
      ))}
    </tr>
  );
}
