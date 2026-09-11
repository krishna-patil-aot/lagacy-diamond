import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { ScrollToTopButton } from "@/components/common/ScrollToTopButton";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Legacy Diamond | Lab-Grown Diamonds Directly from Our Foundry",
  description:
    "Cultivated in our cutting-edge laboratory with zero mining impact. Pure optical brilliance, IGI & GIA certifications, and direct-to-consumer foundry pricing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-[#faf8f5] text-stone-800 selection:bg-amber-100 selection:text-stone-900"
        suppressHydrationWarning
      >
        <ScrollToTopButton />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster richColors theme="light" position="bottom-right" closeButton />
      </body>
    </html>
  );
}
