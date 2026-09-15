import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans, Space_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { ScrollToTopButton } from "@/components/common/ScrollToTopButton";
import { DiamondConciergeTrigger } from "@/components/ai/DiamondConciergeTrigger";
import { Toaster } from "sonner";

import { siteConfig } from "@/config/site.config";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.appUrl),
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: ["/favicon.svg"],
    apple: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  title: {
    default: siteConfig.seo.defaultTitle,
    template: siteConfig.seo.titleTemplate,
  },
  description: siteConfig.seo.description,
  keywords: siteConfig.seo.keywords,
  authors: [{ name: siteConfig.contact.legalEntityName, url: siteConfig.appUrl }],
  creator: siteConfig.brandName,
  publisher: siteConfig.contact.legalEntityName,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: siteConfig.seo.siteLocale,
    url: siteConfig.appUrl,
    siteName: siteConfig.brandName,
    title: siteConfig.seo.defaultTitle,
    description: siteConfig.seo.description,
    images: [
      {
        url: siteConfig.seo.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.brandName} - ${siteConfig.brandTagline}`,
      },
    ],
  },
  twitter: {
    card: siteConfig.seo.twitterCard,
    title: siteConfig.seo.defaultTitle,
    description: siteConfig.seo.description,
    creator: "@darkgemdiamonds",
    images: [siteConfig.seo.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLdSchema = {
  "@context": "https://schema.org",
  "@type": "JewelryStore",
  name: siteConfig.brandName,
  legalName: siteConfig.contact.legalEntityName,
  description: siteConfig.seo.description,
  url: siteConfig.appUrl,
  telephone: siteConfig.contact.phone,
  email: siteConfig.contact.conciergeEmail,
  address: {
    "@type": "PostalAddress",
    streetAddress: `${siteConfig.contact.addressLine1}, ${siteConfig.contact.addressLine2}`,
    addressLocality: siteConfig.contact.city,
    addressRegion: siteConfig.contact.state,
    postalCode: siteConfig.contact.postalCode,
    addressCountry: siteConfig.contact.country,
  },
  priceRange: "$$$$",
  openingHours: "Mo-Sa 09:00-19:00",
  sameAs: [
    siteConfig.socials.instagram,
    siteConfig.socials.pinterest,
    siteConfig.socials.linkedin,
    siteConfig.socials.twitter,
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${cormorant.variable} ${spaceMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-[#faf8f5] text-stone-800 selection:bg-amber-100 selection:text-stone-900"
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
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
