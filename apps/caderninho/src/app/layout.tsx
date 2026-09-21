import type { Metadata } from "next";
import { Fraunces, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans-app",
  subsets: ["latin"],
});

const display = Fraunces({
  variable: "--font-display-app",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MAI LAB",
  description: "Escritório interno da MAI LAB CORP.",
  icons: { icon: "/mai-logo.png" },
  robots: { index: false, follow: false },
};

const temaScript = `try{if(localStorage.getItem("mai-tema")==="escuro")document.documentElement.classList.add("dark")}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${sans.variable} ${display.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: temaScript }} />
      </head>
      <body className="relative min-h-full">{children}</body>
    </html>
  );
}
