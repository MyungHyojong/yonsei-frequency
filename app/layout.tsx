import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3001";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "YONSEI FREQUENCY · 연세 주파수",
  description: "연세대학교 신촌캠퍼스의 장소와 음악, 이야기를 발견하는 위치 기반 사운드맵.",
  openGraph: {
    title: "YONSEI FREQUENCY · 연세 주파수",
    description: "연세대학교 신촌캠퍼스의 장소와 음악, 이야기를 발견하세요.",
    type: "website",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "YONSEI FREQUENCY" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "YONSEI FREQUENCY · 연세 주파수",
    description: "연세대학교 신촌캠퍼스의 장소와 음악, 이야기를 발견하세요.",
    images: ["/og.png"],
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
