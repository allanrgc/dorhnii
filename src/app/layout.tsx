import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProviderWrapper } from "./auth-wrapper";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dohrnii — Santuário de Serenidade e Toque Terapêutico",
  description:
    "Descubra o equilíbrio perfeito entre corpo e mente no Dohrnii. Massagens terapêuticas exclusivas, ambiente premium e cuidado personalizado em Lisboa.",
  keywords: [
    "massagem",
    "wellness",
    "spa",
    "Lisboa",
    "massagem terapêutica",
    "relaxamento",
    "Dohrnii",
    "bem-estar",
  ],
  openGraph: {
    title: "Dohrnii — Santuário de Serenidade e Toque Terapêutico",
    description:
      "Massagens terapêuticas exclusivas num ambiente de luxo sereno em Lisboa.",
    type: "website",
    locale: "pt_PT",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt"
      className={`${inter.variable} ${playfair.variable} h-full`}
    >
      <body className="min-h-full flex flex-col font-sans antialiased bg-canvas text-text-primary">
        <AuthProviderWrapper>{children}</AuthProviderWrapper>
      </body>
    </html>
  );
}
