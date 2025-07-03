import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "工具集 - 100款实用小工具",
  description: "一个包含100个实用小工具的在线工具集合，涵盖文本处理、颜色设计、图片处理、编码加密等多个分类",
  keywords: "工具集,在线工具,文本处理,颜色选择器,图片压缩,Base64编码,时间戳转换,密码生成器",
  icons: {
    icon: "/me.svg",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
