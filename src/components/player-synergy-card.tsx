import Link from "next/link";
import { players, type Player } from "@/data/players";
import { AxisBars } from "./axis-bars";
import { generateSlug } from "@/lib/queries";

function PlayerCard({ player }: { player: Player }) {
  const slug = generateSlug(player.racket.brand, player.racket.model, player.racket.year);

  return (
    <article className="bg-[var(--color-bg-white)] rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      {/* Player header */}
      <div className="flex items-center gap-4 mb-5">
        {player.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={player.imageUrl}
            alt={player.name}
            className="w-14 h-14 rounded-full object-cover"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-[var(--color-bg-subtle)] border border-[var(--color-border)] flex items-center justify-center text-xl font-bold text-[var(--color-text-secondary)]">
            {player.initial}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base truncate">{player.nameKo}</h3>
            <span className="text-base">{player.countryFlag}</span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] truncate">{player.name}</p>
        </div>
      </div>

      {/* Tags */}
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

      {/* Racket section */}
      <div className="bg-[var(--color-bg-subtle)] rounded-xl p-4 mb-4">
        <div className="flex justify-between items-start mb-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-[var(--color-text-muted)]">{player.racket.brand}</p>
            <p className="font-semibold text-sm truncate">{player.racket.model} ({player.racket.year})</p>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] shrink-0 ml-2">
            {player.racket.weight} · {player.racket.headSize}
          </p>
        </div>
        <AxisBars scores={player.racket.scores} />
      </div>

      {/* Synergy */}
      <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 mb-4">
        <p className="text-xs font-semibold text-amber-900 mb-1">💡 시너지 분석</p>
        <p className="text-xs text-amber-900/80 leading-relaxed">{player.synergy}</p>
      </div>

      <Link
        href={`/rackets/${slug}`}
        className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:underline"
      >
        {player.racket.model} ({player.racket.year}) 자세히 보기 →
      </Link>
    </article>
  );
}

export function PlayerSynergySection() {
  return (
    <section className="bg-[var(--color-bg-subtle)] py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-10">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.15em] text-[var(--color-brand-dark)] uppercase mb-1">Pro Players</p>
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
