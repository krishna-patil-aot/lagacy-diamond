import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";

export const metadata: Metadata = {
  title: `Certified Solar-Cultivated Diamonds | ${siteConfig.brandName}`,
  description:
    `Explore rare Type IIa certified diamonds cultivated in proprietary solar plasma reactors. Filter by shape, 4Cs, GIA/IGI certification, and acquire directly from ${siteConfig.brandName}.`,
  keywords: [
    ...siteConfig.seo.keywords,
    "Certified Solitaire Gemstones",
    "Round Brilliant",
    "Oval Solitaires",
    "Emerald Cut",
    "Bespoke Diamond Registry",
  ],
  openGraph: {
    title: `Certified Solar-Cultivated Diamonds | ${siteConfig.brandName}`,
    description:
      "Explore rare Type IIa diamonds certified by GIA and IGI. Zero earth displacement with direct atelier valuation.",
    url: `${siteConfig.appUrl}/diamonds`,
    siteName: siteConfig.brandName,
  },
};

export default function DiamondsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
