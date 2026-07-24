import {
  PLAYERS_VERIFIED_AT,
  players,
  type Player,
} from "@/data/players";
import { PlayerCard } from "@/components/player-synergy-card";

const MALE_COUNT = 10;
const VERIFIED_AT_LABEL = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
}).format(new Date(`${PLAYERS_VERIFIED_AT}T00:00:00Z`));

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
            {VERIFIED_AT_LABEL} 확인한 공식 후원 라인과 재사용 라이선스가 검증된 선수 사진입니다.
          </p>
          <p className="mx-auto mt-2 max-w-2xl text-xs leading-relaxed text-[var(--color-text-muted)]">
            프로 선수의 실제 프레임은 도색과 다른 구형 몰드 또는 커스텀 사양일 수 있어, 시판 모델의 무게·밸런스와 동일하다고 단정하지 않습니다.
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
