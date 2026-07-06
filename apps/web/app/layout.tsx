import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import BottomNav from "@/components/BottomNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "탈탈 — 방탈출 통합 플랫폼",
  description: "자물쇠도 고민도 탈탈. 실시간 예약 검색 · 게이미피케이션 스탯 · 안전 에스크로 동행 매칭 · AI 추천",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-zinc-50">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col bg-[var(--background)] shadow-sm">
          <div className="flex-1">{children}</div>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
