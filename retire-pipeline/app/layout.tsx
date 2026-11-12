import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "퇴사 파이프라인",
  description: "월 1,000만 원 퇴사 파이프라인 데일리 체크리스트 — 2027.12.31 퇴사 D-day",
  appleWebApp: { capable: true, title: "퇴사 파이프라인", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f1f5f9",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-dvh font-sans antialiased">{children}</body>
    </html>
  );
}
