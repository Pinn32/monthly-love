import type { Metadata } from "next";
import { Lora, Noto_Serif_SC } from "next/font/google";
import "./globals.css";

const lora = Lora({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

// Noto Serif SC covers Chinese glyphs and harmonises with Lora's warm serif tone.
const notoSerifSC = Noto_Serif_SC({
  variable: "--font-serif-cjk",
  weight: ["400", "500", "600", "700"],
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
    <html lang="zh-CN" className={`${lora.variable} ${notoSerifSC.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
