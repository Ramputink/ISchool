import type { Metadata, Viewport } from "next";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-montserrat",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Quriuos — Descubre tu camino con la voz",
  description:
    "Plataforma de voz con IA que ayuda a adolescentes a descubrir sus intereses, conversar con referentes inspiradores y encontrar su camino académico y profesional.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#13131b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`dark ${montserrat.variable} ${inter.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="mesh-gradient min-h-screen font-body-md">
        {children}
      </body>
    </html>
  );
}
