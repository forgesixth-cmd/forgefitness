import type { Metadata } from "next";
import { Archivo_Black, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const archiveBlack = Archivo_Black({
  variable: "--font-archivo-black",
  weight: "400",
  subsets: ["latin"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FORGEFITNESS",
  description:
    "FORGEFITNESS is a high-discipline training workspace for body metrics, habits, nutrition, programming, and gym performance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archiveBlack.variable} ${instrumentSans.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[var(--forge-ink)] font-[family-name:var(--font-instrument-sans)] text-[var(--forge-silver)]">
        {children}
      </body>
    </html>
  );
}
