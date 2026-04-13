export const dynamic = "force-dynamic";

import Link from "next/link";

const guides = [
  {
    href: "/guide/dna",
    emoji: "🧬",
    title: "라켓 DNA",
    description: "5축 점수가 의미하는 것과 읽는 법",
  },
  {
    href: "/guide/strings",
    emoji: "🧵",
    title: "스트링 가이드",
    description: "소재·장력·플레이 스타일별 세팅",
  },
  {
    href: "/guide/grip",
    emoji: "✋",
    title: "그립 사이즈 가이드",
    description: "G1~G5 기준과 재는 방법",
  },
];

export default function GuideHubPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)]">
          테니스 가이드
        </h1>
        <p className="mt-3 text-[var(--color-text-secondary)] leading-relaxed">
          라켓 선택부터 스트링 세팅까지, 알면 달라지는 테니스 지식
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-1">
        {guides.map((g) => (
          <li key={g.href}>
            <Link
              href={g.href}
              className="group flex gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-5 transition-colors hover:border-[var(--color-text-muted)]"
            >
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-2xl shadow-sm border border-[var(--color-border)]"
                aria-hidden
              >
                {g.emoji}
              </span>
              <div className="min-w-0">
                <h2 className="font-semibold text-[var(--color-text)] group-hover:underline underline-offset-4">
                  {g.title}
                </h2>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  {g.description}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
