import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import { RacketVisualCustomizer } from "@/components/racket-visual-customizer";
import { resolveRacketCustomizerRoute } from "@/lib/racket-customizer-route";
import { formatRacketName } from "@/lib/racket-name";
import { getRacketBySlug } from "@/lib/queries";
import { colorwayForSlug } from "@/data/racket-colorways.generated";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resolution = await resolveRacketCustomizerRoute(
    slug,
    getRacketBySlug,
  );

  if (resolution.kind !== "ready") {
    return {};
  }

  const { racket } = resolution;
  const racketName = `${racket.brand} ${formatRacketName(racket.model, racket.year)}`;

  return {
    title: `${racketName} 색상 커스터마이저`,
    description: `${racketName}의 스트링과 그립 색상 조합을 시각적으로 비교해 보세요.`,
  };
}

export default async function RacketCustomizerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resolution = await resolveRacketCustomizerRoute(
    slug,
    getRacketBySlug,
  );

  if (resolution.kind === "not-found") {
    notFound();
  }

  if (resolution.kind === "redirect") {
    permanentRedirect(resolution.location);
  }

  const { racket, geometry } = resolution;
  const racketName = `${racket.brand} ${formatRacketName(racket.model, racket.year)}`;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 md:py-12">
      <nav aria-label="현재 위치" className="mb-8">
        <ol className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-secondary)]">
          <li>
            <Link
              href="/rackets"
              className="rounded-sm hover:text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-text)] focus-visible:ring-offset-2"
            >
              라켓
            </Link>
          </li>
          <li aria-hidden="true" className="text-[var(--color-text-muted)]">
            /
          </li>
          <li>
            <Link
              href={`/rackets/${encodeURIComponent(racket.slug)}`}
              className="rounded-sm hover:text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-text)] focus-visible:ring-offset-2"
            >
              {racketName}
            </Link>
          </li>
          <li aria-hidden="true" className="text-[var(--color-text-muted)]">
            /
          </li>
          <li aria-current="page" className="text-[var(--color-text)]">
            색상 커스터마이저
          </li>
        </ol>
      </nav>

      <header className="border-b border-[var(--color-border)] pb-8">
        <p className="text-xs font-semibold tracking-[0.18em] text-[var(--color-text-muted)] uppercase">
          Color Lab
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
          {racketName} 색상 커스터마이저
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
          이 라켓의 스펙으로 그린 도식 위에서 스트링과 그립 색상 조합을 비교해
          보세요.
        </p>
      </header>

      <aside
        aria-label="도식 안내"
        className="my-6 border-y border-[var(--color-border)] py-4 text-xs leading-relaxed text-[var(--color-text-secondary)]"
      >
        <strong className="font-semibold text-[var(--color-text)]">
          도식 안내.
        </strong>{" "}
        아래 그림은 제품 사진이 아니라 이 라켓의 헤드 면적과 스트링 패턴으로
        그려낸 도식입니다. 프레임 색은 제품 사진에서 자동으로 뽑은 대표색이라
        실제와 가깝지만 도색과 문양까지 재현하지는 않습니다. 스트링과 그립 색은
        조합을 비교하기 위한 것이며 판매 재고나 주문 옵션을 의미하지 않습니다.
      </aside>

      {/* 프레임 색은 제품 사진에서 자동 추출한 값이다. 추출에 실패한 라켓은
          여기서 null 이 되고 도식은 중립색으로 그려진다 — 색을 지어내지 않는다. */}
      <RacketVisualCustomizer
        geometry={geometry}
        pattern={racket.pattern ?? ""}
        headSize={racket.headSize ?? ""}
        racketName={racketName}
        paint={colorwayForSlug(racket.slug) ?? undefined}
      />
    </div>
  );
}
