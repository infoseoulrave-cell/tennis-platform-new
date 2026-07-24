export default function RacketDetailLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto max-w-6xl px-6 py-8"
    >
      <span className="sr-only">라켓 상세 정보를 불러오는 중입니다.</span>
      <div aria-hidden className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div className="aspect-square rounded-2xl bg-white" />
        <div className="space-y-6 pt-4">
          <div className="h-3 w-20 rounded bg-[var(--color-bg-subtle)]" />
          <div className="h-10 w-3/4 rounded bg-[var(--color-bg-subtle)]" />
          <div className="h-44 rounded-2xl bg-[var(--color-bg-subtle)]" />
        </div>
      </div>
    </div>
  );
}
