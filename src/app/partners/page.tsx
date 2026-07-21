"use client";

import { useEffect } from "react";
import Link from "next/link";
import { TrustBadge } from "@/components/trust-badge";
import { trackEvent } from "@/lib/track-event";

export default function PartnersPage() {
  useEffect(() => {
    trackEvent("page_view", { path: "/partners", pageType: "partner_prelaunch" });
  }, []);

  return (
    <main className="min-h-screen bg-white pb-32">
      <header className="border-b border-gray-100 px-6 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button onClick={() => window.history.back()} className="text-sm text-gray-600 min-h-11">
            ← 추천 결과
          </button>
          <h1 className="text-sm font-semibold">제휴 매장</h1>
          <div className="w-16" />
        </div>
      </header>

      <div className="px-6 pt-16">
        <section className="max-w-lg mx-auto rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
          <span className="text-3xl" aria-hidden="true">🎾</span>
          <h2 className="mt-4 text-xl font-bold">제휴 매장 준비 중</h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            현재 검증된 제휴 매장과 실제 예약 시스템을 준비하고 있습니다. 매장명·거리·예약 가능 여부가 확인되기 전에는 임시 정보를 표시하지 않습니다.
          </p>
          <Link href="/rackets" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-gray-900 px-5 text-sm font-semibold text-white">
            라켓 카탈로그로 돌아가기
          </Link>
        </section>

        <div className="max-w-lg mx-auto mt-6 text-center">
          <TrustBadge variant="neutrality" />
          <p className="mt-2 text-xs text-gray-400">제휴 여부는 라켓 점수와 추천 순위에 반영하지 않습니다.</p>
        </div>
      </div>
    </main>
  );
}
