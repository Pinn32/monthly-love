import type { Metadata, Viewport } from "next";
import { Lora, Noto_Serif_SC } from "next/font/google";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import LangSwitch from "@/components/LangSwitch";
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

export const viewport: Viewport = {
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "monthly love",
    template: "%s · monthly love",
  },
  description: "",
  robots: { index: false, follow: false },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dict = getDict(await getLocale());

  return (
    <html lang={dict.htmlLang} className={`${lora.variable} ${notoSerifSC.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full antialiased" suppressHydrationWarning>
        <LangSwitch target={dict.switchTo} label={dict.switchLabel} />
        {children}
      </body>
    </html>
  );
}
