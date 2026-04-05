import Link from "next/link";
import { TrustBadge } from "@/components/trust-badge";

type Partner = {
  id: string;
  name: string;
  type: string;
  services: string[];
  distance: string;
  address: string;
};

const MOCK_PARTNERS: Partner[] = [
  {
    id: "p1",
    name: "테니스고고 강남점",
    type: "전문 매장",
    services: ["시타/데모", "스트링 서비스", "피팅 상담"],
    distance: "1.2km",
    address: "서울 강남구 역삼동 123-4",
  },
  {
    id: "p2",
    name: "라켓스튜디오 판교점",
    type: "피팅 전문",
    services: ["스트링 서비스", "피팅 상담", "라켓 커스텀"],
    distance: "3.5km",
    address: "경기 성남시 분당구 판교동 456-7",
  },
  {
    id: "p3",
    name: "서울 테니스 아카데미",
    type: "레슨/코칭",
    services: ["레슨 상담", "장비 추천", "데모 라켓"],
    distance: "4.2km",
    address: "서울 송파구 잠실동 789-0",
  },
];

export default function PartnersPage() {
  return (
    <main className="min-h-screen bg-white pb-32">
      {/* Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-100 px-6 py-3 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link href="/results" className="text-sm text-gray-600">
            ← 추천 결과
          </Link>
          <h1 className="text-sm font-semibold">가까운 매장</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="px-6 pt-6">
        <div className="max-w-lg mx-auto">
          <h2 className="text-lg font-bold mb-1">
            가까운 매장에서 시타해보기
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            추천 라켓을 직접 쳐볼 수 있는 매장입니다
          </p>

          {/* Map placeholder */}
          <div className="w-full h-40 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
            <div className="text-center">
              <span className="text-2xl">🗺️</span>
              <p className="text-xs text-gray-400 mt-1">
                서울/경기 지역 매장 지도
              </p>
            </div>
          </div>

          {/* Partner list */}
          <div className="space-y-3">
            {MOCK_PARTNERS.map((partner) => (
              <div
                key={partner.id}
                className="border border-gray-200 rounded-2xl p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📍</span>
                      <h3 className="font-bold text-sm text-gray-900">
                        {partner.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">
                        {partner.type}
                      </span>
                      <span className="text-xs text-gray-300">|</span>
                      <span className="text-xs text-blue-600 font-medium">
                        {partner.distance}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {partner.services.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 text-xs bg-gray-50 text-gray-600 rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <div className="text-xs text-gray-400 mb-4">
                  {partner.address}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex-1 py-2.5 text-center text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    시타 예약하기
                  </button>
                  <button
                    type="button"
                    className="py-2.5 px-4 text-center text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    상담 예약
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Shared info notice */}
          <section className="mt-6 bg-gray-50 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-2">
              공유되는 정보
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              매장에 전달되는 정보:
            </p>
            <ul className="text-xs text-gray-500 list-disc list-inside mt-1 space-y-0.5">
              <li>추천 라켓 및 진단 요약</li>
              <li>플레이 프로필 (이름/연락처 제외)</li>
            </ul>
            <p className="text-xs text-gray-400 mt-2">
              예약 시점에 연락처를 입력합니다
            </p>
          </section>

          {/* Neutrality */}
          <div className="mt-6 text-center">
            <TrustBadge variant="neutrality" />
            <p className="text-xs text-gray-400 mt-2">
              매장은 추천 결과와 무관하게 거리순으로 표시됩니다
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
