import type { Metadata } from "next";
import "./globals.css";
import { GlobalNav } from "@/components/global-nav";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "racketlab | 한국 테니스 라켓 플랫폼",
  description:
    "한국에서 실제 판매 중인 테니스 라켓을 이해하고, 비교하고, 추천받고, 구매까지 연결하는 서비스입니다.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="bg-white text-[var(--color-text)] antialiased font-sans">
        <GlobalNav />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <MobileTabBar />
      </body>
    </html>
  );
}
