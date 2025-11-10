import "./globals.css";
import type { Metadata } from "next";

export const metadata = {
  title: "FASTLOAN | 빠르고 간편한 대출 접수 플랫폼",
  description:
    "FASTLOAN은 개인 및 사업자를 위한 쉽고 빠른 대출 접수 서비스입니다. 모든 금융사 견적을 한 번에 비교하세요.",
  keywords:
    "대출, 개인사업자 대출, 신용대출, 사업자 대출, 비대면 대출, 대출 비교, 빠른대출, 사업자 일수, 일수대출, 급전, 급전 대출, 개인돈, 대부, 대부업체, P2P, 개인 자금, 개인 대출",
  openGraph: {
    title: "FASTLOAN | 빠르고 간편한 대출 접수 플랫폼",
    description:
      "FASTLOAN은 모든 금융사의 대출을 한번에 비교하고 접수할 수 있는 스마트 플랫폼입니다.",
    url: "https://fastloan.space",
    siteName: "FASTLOAN",
    images: [
      {
        url: "https://fastloan.space/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FASTLOAN",
    description: "빠르고 간편한 대출 접수 플랫폼",
    images: ["https://fastloan.space/og-image.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
