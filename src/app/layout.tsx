import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "테니스 장비 진단 | 라켓 추천",
  description:
    "플레이스타일 진단을 통한 맞춤 라켓 추천. 한국 테니스 플레이어를 위한 장비 가이드.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
