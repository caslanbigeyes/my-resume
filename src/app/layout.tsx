import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "李凌峰的博客",
  description: "李凌峰的博客",
  keywords: "李凌峰,博客,技术分享,个人成长,生活感悟",
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
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-lite-webfont@1.1.0/style.css" 
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-wenkai antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
