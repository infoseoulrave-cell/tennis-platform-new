import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col justify-center px-6 pt-16 pb-8">
        <div className="max-w-lg mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium mb-6">
            🎾 AI 기반 라켓 매칭
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-3">
            당신에게 맞는 라켓,
            <br />
            <span className="text-blue-600">3분이면</span> 찾을 수 있습니다
          </h1>
          <p className="text-gray-500 text-base mb-8 leading-relaxed">
            플레이스타일 진단으로 나에게 딱 맞는 라켓을 추천받으세요.
            <br />
            300+ 라켓 데이터 · 5축 AI 해석 · 광고 없는 추천
          </p>
          <Link
            href="/diagnosis"
            className="inline-flex items-center justify-center w-full max-w-xs px-6 py-4 bg-blue-600 text-white font-semibold rounded-2xl text-base hover:bg-blue-700 active:bg-blue-800 transition-colors"
          >
            내 라켓 진단 시작하기 →
          </Link>
          <Link
            href="#how-it-works"
            className="block mt-4 text-sm text-gray-400 underline underline-offset-2"
          >
            진단 방법 알아보기
          </Link>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-t border-gray-100 px-6 py-5">
        <div className="max-w-lg mx-auto flex justify-center gap-6 text-xs text-gray-400">
          <span className="flex items-center gap-1">🛡️ 광고 없는 추천</span>
          <span className="flex items-center gap-1">📊 5축 AI 해석</span>
          <span className="flex items-center gap-1">🎾 300+ 라켓 분석</span>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-gray-50 px-6 py-12">
        <div className="max-w-lg mx-auto">
          <h2 className="text-lg font-bold text-center mb-8">
            3단계로 맞춤 추천
          </h2>
          <div className="space-y-6">
            {[
              {
                step: "1",
                title: "플레이스타일 진단",
                desc: "6가지 질문으로 나의 플레이 성향과 목표를 파악합니다",
              },
              {
                step: "2",
                title: "AI 5축 매칭",
                desc: "파워·컨트롤·스핀·편안함·안정성 5축으로 라켓을 분석합니다",
              },
              {
                step: "3",
                title: "맞춤 추천 & 비교",
                desc: "왜 이 라켓인지 설명과 함께 3가지 추천을 받습니다",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-900">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample card */}
      <section className="px-6 py-12">
        <div className="max-w-lg mx-auto">
          <h2 className="text-lg font-bold text-center mb-6">
            추천 결과 예시
          </h2>
          <div className="border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center gap-1 text-xs text-blue-600 font-medium mb-2">
              🏆 Best Fit · 매칭도 92%
            </div>
            <h3 className="font-bold text-base">Wilson Blade 98 v8</h3>
            <p className="text-sm text-gray-500 mt-1">
              &quot;컨트롤과 안정성을 높이면서 파워 손실은 최소화&quot;
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                ✅ 컨트롤 향상
              </span>
              <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                ✅ 편안한 타구감
              </span>
              <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 text-xs rounded-full">
                ⚠️ 파워 소폭 감소
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="bg-gray-50 px-6 py-8">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-700">1,247명</span>이 진단을 완료했습니다
          </p>
        </div>
      </section>

      {/* Sticky CTA */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 safe-bottom">
        <div className="max-w-lg mx-auto">
          <Link
            href="/diagnosis"
            className="flex items-center justify-center w-full px-6 py-3.5 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 active:bg-blue-800 transition-colors"
          >
            무료 진단 시작하기
          </Link>
        </div>
      </div>

      {/* Neutrality footer */}
      <footer className="px-6 py-8 text-center">
        <p className="text-xs text-gray-400 leading-relaxed">
          추천은 광고나 유료 배치 없이 진단 결과만으로 생성됩니다.
          <br />
          <Link href={"/methodology" as never} className="underline">
            추천 방법론 알아보기
          </Link>
        </p>
      </footer>
    </main>
  );
}
