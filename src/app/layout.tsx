import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PromptCard — 你的 AI 提示词卡片库',
  description: '把散落的提示词，变成可分享、可版本化、可复用的卡片。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
