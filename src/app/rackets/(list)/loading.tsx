export default function RacketsLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto max-w-6xl px-6 py-12"
    >
      <span className="sr-only">라켓 목록을 불러오는 중입니다.</span>
      <div aria-hidden>
        <div className="h-9 w-36 rounded bg-[var(--color-bg-subtle)]" />
        <div className="mt-3 h-4 w-72 max-w-full rounded bg-[var(--color-bg-subtle)]" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="aspect-[4/3] rounded-xl bg-[var(--color-bg-subtle)]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
