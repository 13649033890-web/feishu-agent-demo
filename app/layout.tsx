import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '爆炒空心菜的飞书 CLI · 智能体演示',
  description: '飞书桌面端智能体产品原型：个人 PM 管家与老板驾驶舱。',
  openGraph: {
    title: '爆炒空心菜的飞书 CLI · 智能体演示',
    description: '把飞书里的资料、讨论和任务，持续转成可追溯的知识、可审核的行动和可解释的经营判断。',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '爆炒空心菜的飞书 CLI · 智能体演示',
    description: '个人 PM 管家与老板驾驶舱的交互式网页原型。',
  },
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
        {children}
      </body>
    </html>
  );
}
