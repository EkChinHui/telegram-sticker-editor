import type { Metadata } from "next";
import { JetBrains_Mono, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "StickerMaker - Telegram Sticker Editor",
  description:
    "Auto-crop, resize to 512px, and enhance your PNG stickers for Telegram. Free browser-based tool with real-time preview.",
  keywords: ["telegram", "sticker", "editor", "png", "resize", "crop", "512px"],
  openGraph: {
    title: "StickerMaker - Telegram Sticker Editor",
    description: "Auto-crop, resize, and enhance PNG stickers for Telegram",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
