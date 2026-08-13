import type { Metadata, Viewport } from "next";
import { Archivo, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { GlobalNav } from "@/components/global-nav";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { Footer } from "@/components/footer";
import { CompareTray } from "@/components/compare-tray";

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
    default: "racket lab — 라켓을 읽다",
    template: "%s | racket lab",
  },
  description:
    "데이터 기반 5축 분석으로 당신에게 맞는 테니스 라켓을 찾아드립니다. 비교, 추천, 구매까지.",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "racket lab",
    title: "racket lab — 라켓을 읽다",
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
    <html lang="ko" className={`${archivo.variable} ${instrumentSerif.variable}`}>
      <body className="bg-[var(--color-bg)] text-[var(--color-text)] antialiased font-sans">
        <GlobalNav />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <CompareTray />
        <MobileTabBar />
      </body>
    </html>
  );
}
