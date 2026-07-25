import type { Metadata } from "next";
import "./globals.css";

const siteHost =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  process.env.VERCEL_URL ||
  "http://localhost:3000";
const siteUrl = siteHost.startsWith("http") ? siteHost : `https://${siteHost}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "연세의 소리 — Yonsei Sound Map",
  description:
    "신촌캠퍼스 곳곳에 남겨진 노래와 사연을 발견하고, 나만의 기억을 지도에 남겨보세요.",
  openGraph: {
    title: "연세의 소리",
    description: "신촌캠퍼스 곳곳에 남겨진 노래와 사연을 발견해보세요.",
    type: "website",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "연세의 소리" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "연세의 소리",
    description: "신촌캠퍼스 곳곳에 남겨진 노래와 사연을 발견해보세요.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
