import type { Metadata } from "next";
import { Lora } from "next/font/google";
import "./globals.css";

// Lora is a warm serif that suits personal writing.
// Change to any Google Font — update variable name below too.
const lora = Lora({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "monthly love",
    template: "%s · monthly love",
  },
  description: "",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${lora.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
