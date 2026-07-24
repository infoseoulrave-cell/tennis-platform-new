export default function CompareLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto max-w-6xl px-6 py-12"
    >
      <span className="sr-only">라켓 비교 정보를 불러오는 중입니다.</span>
      <div aria-hidden>
        <div className="h-9 w-36 rounded bg-[var(--color-bg-subtle)]" />
        <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="aspect-square rounded-xl bg-[var(--color-bg-subtle)]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
