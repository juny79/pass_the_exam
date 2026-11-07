import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PassForge - 자격증 시험 합격전략 플랫폼",
  description: "정보보안기사, 산업안전기사, 개인정보관리사(CPPG) 종합 족보 및 AI 합격전략",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col font-sans bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
