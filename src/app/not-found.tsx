import Link from "next/link";

const destinations = [
  { href: "/", label: "홈으로" },
  { href: "/rackets", label: "라켓 찾기" },
  { href: "/strings", label: "스트링 찾기" },
];

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-24 text-center">
      <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center text-[var(--color-brand)]" aria-hidden="true">
        <svg width={42} height={42} viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12,1 23,8.5 19.5,21 4.5,21 1,8.5" />
        </svg>
      </div>
      <p className="text-xs font-semibold tracking-[0.15em] text-[var(--color-text-muted)]">PAGE NOT FOUND</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">요청한 페이지를 찾을 수 없습니다</h1>
      <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
        주소를 다시 확인하거나 아래 경로에서 탐색을 이어가세요.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {destinations.map((destination, index) => (
          <Link
            key={destination.href}
            href={destination.href}
            className={index === 0
              ? "rounded-lg bg-[var(--color-text)] px-4 py-2.5 text-sm font-semibold text-[var(--color-bg)]"
              : "rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-text-muted)]"}
          >
            {destination.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
