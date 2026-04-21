import type { Metadata } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

const retroFont = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-retro",
});

export const metadata: Metadata = {
  title: "DevJourney",
  description: "A gamified developer challenge platform styled with LEGO and Minecraft aesthetics.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${pixelFont.variable} ${retroFont.variable}`}>
      <body className="font-retro min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <footer className="py-8 bg-lego-dark border-t-8 border-black text-center">
          <p className="font-pixel text-[8px] text-gray-500">
            © 2026 DEVJOURNEY - BUILT WITH BRICKS & CODE
          </p>
        </footer>
      </body>
    </html>
  );
}
