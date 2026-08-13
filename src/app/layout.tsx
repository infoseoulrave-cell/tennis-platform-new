import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { GlobalNav } from "@/components/global-nav";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { Footer } from "@/components/footer";
import { CompareTray } from "@/components/compare-tray";

export const metadata: Metadata = {
  title: {
    default: "racket LAB — 라켓을 읽다",
    template: "%s | racket LAB",
  },
  description:
    "데이터 기반 5축 분석으로 당신에게 맞는 테니스 라켓을 찾아드립니다. 비교, 추천, 구매까지.",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "racket LAB",
    title: "racket LAB — 라켓을 읽다",
    description: "데이터 기반 5축 분석으로 당신에게 맞는 테니스 라켓을 찾아드립니다.",
  },
  robots: { index: true, follow: true },
};

// 이게 없으면 env(safe-area-inset-bottom) 이 항상 0 이라 하단 탭바가
// 아이폰 홈 인디케이터에 깔린다.
export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-[var(--color-bg)] text-[var(--color-text)] antialiased font-sans">
        <GlobalNav />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <CompareTray />
        <MobileTabBar />
        {/* 4개월간 유입 경로도 세그먼트 비중도 측정된 적이 없었다.
            계측이 없으면 이후의 모든 판단이 추측이 된다. */}
        <Analytics />
      </body>
    </html>
  );
}
