export default function StringsLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto max-w-6xl px-6 py-12 md:py-16"
    >
      <span className="sr-only">스트링 판매처를 불러오는 중입니다.</span>
      <div aria-hidden>
        <div className="h-10 w-48 rounded bg-[var(--color-bg-subtle)]" />
        <div className="mt-10 space-y-5">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="h-52 rounded-2xl bg-[var(--color-bg-subtle)]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
