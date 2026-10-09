import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MVP Delivery | Sorveteria Água na Boca",
    template: "%s | MVP Delivery",
  },
  description: "Peça açaí, sorvetes e sobremesas na Sorveteria Água na Boca.",
  applicationName: "MVP Delivery",
  openGraph: {
    title: "Sorveteria Água na Boca",
    description: "Açaí, sorvetes e muito mais do seu jeito.",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
