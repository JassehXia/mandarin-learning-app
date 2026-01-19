import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Chat with Locals - Learn Mandarin by Living It",
  description: "Immersive Mandarin learning application where you navigate real-life scenarios in China.",
};

import { Header } from "@/components/layout/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${playfair.variable} ${inter.variable} font-sans antialiased bg-stone-50 text-stone-900`}>
          <Header />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
