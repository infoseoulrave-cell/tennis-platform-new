import Link from "next/link";
import { players, type Player } from "@/data/players";
import { generateSlug } from "@/lib/queries";

export const dynamic = "force-dynamic";

const MALE_COUNT = 10;

function PlayerCard({ player }: { player: Player }) {
  const slug = generateSlug(player.racket.brand, player.racket.model, player.racket.year);

  return (
    <article className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm transition-colors hover:border-[var(--color-text-muted)]">
      <div className="mb-4 flex items-start gap-3">
        <div className="relative shrink-0">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-lg font-bold text-[var(--color-text-secondary)]">
            {player.initial}
          </div>
          <span
            className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-base leading-none shadow-sm"
            aria-hidden
          >
            {player.countryFlag}
          </span>
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <h3 className="truncate text-base font-bold text-[var(--color-text)]">{player.nameKo}</h3>
          <p className="truncate text-sm text-[var(--color-text-muted)]">{player.name}</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {player.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-[var(--color-bg-subtle)] px-2.5 py-0.5 text-xs text-[var(--color-text-secondary)]"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mb-3 rounded-xl bg-[var(--color-bg-subtle)] px-3 py-2.5">
        <Link
          href={`/rackets/${slug}`}
          className="block text-sm font-semibold text-[var(--color-text)] underline-offset-2 hover:underline"
        >
          <span className="text-xs font-normal text-[var(--color-text-muted)]">{player.racket.brand}</span>
          <span className="mt-0.5 block truncate">
            {player.racket.model} ({player.racket.year})
          </span>
        </Link>
      </div>

      <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">{player.synergy}</p>
    </article>
  );
}

function PlayerSection({ title, list }: { title: string; list: Player[] }) {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-[var(--color-border)]" />
        <h2 className="shrink-0 text-lg font-semibold tracking-tight text-[var(--color-text)]">{title}</h2>
        <div className="h-px flex-1 bg-[var(--color-border)]" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((player) => (
          <PlayerCard key={player.id} player={player} />
        ))}
      </div>
    </section>
  );
}

export default function PlayersPage() {
  const male = players.slice(0, MALE_COUNT);
  const female = players.slice(MALE_COUNT);

  return (
    <main className="min-h-screen bg-[var(--color-bg-subtle)] pb-16 pt-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="mb-12 text-center sm:mb-14">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl">프로 선수 × 라켓</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[var(--color-text-secondary)] sm:text-base">
            톱 프로가 선택한 라켓과 플레이 스타일이 맞물리는 지점을 한눈에 확인하세요.
          </p>
        </header>

        <div className="space-y-14 sm:space-y-16">
          <PlayerSection title="남자 선수" list={male} />
          <PlayerSection title="여자 선수" list={female} />
        </div>
      </div>
    </main>
  );
}
