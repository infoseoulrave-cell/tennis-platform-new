export default function ResultsLoading() {
  return (
    <main
      role="status"
      aria-live="polite"
      className="min-h-screen bg-white px-6 pb-32 pt-16"
    >
      <span className="sr-only">추천 결과를 불러오는 중입니다.</span>
      <div aria-hidden className="mx-auto max-w-lg space-y-4">
        <div className="h-24 rounded-xl bg-gray-50" />
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-48 rounded-xl bg-gray-50" />
        ))}
      </div>
    </main>
  );
}
