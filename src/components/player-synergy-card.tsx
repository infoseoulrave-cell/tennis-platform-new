import Image from "next/image";
import Link from "next/link";
import { players, type Player } from "@/data/players";

export function buildPlayerRacketHref(brand: string, line: string): string {
  const catalogBrand = brand === brand.toUpperCase()
    ? `${brand.slice(0, 1)}${brand.slice(1).toLowerCase()}`
    : brand;
  const params = new URLSearchParams({ brand: catalogBrand, q: line });
  return `/rackets?${params.toString()}`;
}
import { playerThumbnailUrl } from "@/lib/player-images";

export function PlayerCard({ player }: { player: Player }) {
  return (
    <article className="bg-[var(--color-bg-white)] rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center gap-4 mb-5">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-[var(--color-bg-subtle)]">
          <Image
            src={playerThumbnailUrl(player.photo.url)}
            alt={`${player.nameKo}(${player.name}) 경기 사진`}
            fill
            sizes="64px"
            unoptimized
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base truncate">{player.nameKo}</h3>
            <span className="text-base">{player.countryFlag}</span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] truncate">{player.name}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-5">
        {player.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs px-2.5 py-1 bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="bg-[var(--color-bg-subtle)] rounded-xl p-4 mb-4">
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-[var(--color-text-muted)]">{player.equipment.brand}</p>
            <p className="font-semibold text-sm">{player.equipment.line}</p>
          </div>
          <span className="rounded-full border border-[var(--color-border)] bg-white px-2 py-1 text-[10px] text-[var(--color-text-secondary)]">
            {player.equipment.relationship === "official-endorsement" ? "공식 후원 라인" : "공식 선수 등록"}
          </span>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-text-muted)]">
          {player.equipment.disclosure}
        </p>
      </div>

      <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 mb-4">
        <p className="text-xs font-semibold text-amber-900 mb-1">검증 메모</p>
        <p className="text-xs text-amber-900/80 leading-relaxed">{player.synergy}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--color-text-muted)]">
        <a href={player.equipment.sourceUrl} target="_blank" rel="noreferrer" className="hover:underline">
          장비 출처 · {player.verifiedAt}
        </a>
        <a href={player.photo.sourceUrl} target="_blank" rel="noreferrer" className="hover:underline">
          사진 {player.photo.credit} · {player.photo.license}
        </a>
      </div>
      <Link
        href={buildPlayerRacketHref(player.equipment.brand, player.equipment.line)}
        className="mt-3 inline-block text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:underline"
      >
        대응 리테일 라인 검색 →
      </Link>
    </article>
  );
}

export function PlayerSynergySection() {
  return (
    <section className="bg-[var(--color-brand-subtle)] py-16 border-y border-[var(--color-border)]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-10">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.15em] text-[var(--color-brand)] uppercase mb-1">Pro Players</p>
            <h2 className="text-2xl font-bold tracking-tight">프로 선수 × 라켓 시너지</h2>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] mt-2">
            세계 톱 선수들은 왜 이 라켓을 선택했을까?
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {players.slice(0, 9).map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/players"
            className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
          >
            전체 선수 보기 →
          </Link>
        </div>
      </div>
    </section>
  );
}
