import type { Metadata, Viewport } from "next";
import { Archivo, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { GlobalNav } from "@/components/global-nav";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { Footer } from "@/components/footer";
import { CompareTray } from "@/components/compare-tray";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PageViewTracker } from "@/components/page-view-tracker";

// VI: Archivo 는 정보(라틴·숫자), Instrument Serif Italic 은 목소리(로고 lab·
// 시리즈명·인용 전용). 한글 본문은 --font-sans 폴백의 Pretendard 가 받는다.
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "800"],
  variable: "--font-archivo",
  display: "swap",
});
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "racket lab — 라켓부터 테니스 의류·용품까지",
    template: "%s | racket lab",
  },
  description:
    "나에게 맞는 라켓을 추천·비교하고 테니스 의류, 공, 액세서리의 공식 구매처를 찾아보세요.",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "racket lab",
    title: "racket lab — 라켓부터 테니스 의류·용품까지",
    description: "라켓 추천·비교와 여러 브랜드의 테니스 의류·공·액세서리 탐색을 한곳에서.",
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
    <html lang="ko" className={`${archivo.variable} ${instrumentSerif.variable}`}>
      <body className="bg-[var(--color-bg)] text-[var(--color-text)] antialiased font-sans">
        <GlobalNav />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <CompareTray />
        <MobileTabBar />
        <PageViewTracker />
        {/* 방문·경로 집계. Vercel 프로젝트에서 Web Analytics 를 켜야 수집이 시작된다. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
