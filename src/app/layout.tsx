import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { ScrollToTopButton } from "@/components/common/ScrollToTopButton";
import { DiamondConciergeTrigger } from "@/components/ai/DiamondConciergeTrigger";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://legacydiamond.luxury"),
  title: {
    default: "Legacy Diamond | Sustainable Lab-Grown Diamonds & Fine Jewelry",
    template: "%s | Legacy Diamond Foundry",
  },
  description:
    "Cultivated in high-temperature solar plasma reactors with zero earth displacement. 100% conflict-free, Type IIa certified diamonds, GIA & IGI grading reports, and direct foundry pricing.",
  keywords: [
    "Legacy Diamond",
    "Lab Grown Diamonds",
    "Certified Lab Diamonds",
    "GIA Certified Diamonds",
    "IGI Diamonds",
    "Sustainable Fine Jewelry",
    "Type IIa Diamonds",
    "Conflict Free Engagement Rings",
    "Foundry Direct Diamonds",
  ],
  authors: [{ name: "Legacy Diamond Foundry" }],
  creator: "Legacy Diamond",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://legacydiamond.luxury",
    siteName: "Legacy Diamond",
    title: "Legacy Diamond | Sustainable Lab-Grown Diamonds Directly from Our Foundry",
    description:
      "Pure optical brilliance cultivated in solar reactors with zero earth displacement. IGI & GIA certifications with direct foundry value.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Legacy Diamond | Sustainable Lab-Grown Diamonds",
    description: "Pure optical brilliance cultivated in solar reactors with zero earth displacement.",
  },
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
        <DiamondConciergeTrigger />
        <Toaster richColors theme="light" position="bottom-right" closeButton />
      </body>
    </html>
  );
}
