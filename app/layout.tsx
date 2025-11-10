import "./globals.css";
import type { Metadata } from "next";

export const metadata = {
  title: 'FastLoan',
  description: '쉽고 빠른 당일대출',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
