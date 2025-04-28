import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "计算器",
  description: "后端：Go+ConnectRPC，前端：Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
