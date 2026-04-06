import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Caring AI - ことばの対話パートナー",
  description: "子どもの日本語学習を励ます対話型AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
