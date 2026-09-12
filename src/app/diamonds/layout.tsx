import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Certified Lab-Grown Diamonds Collection | Legacy Diamond",
  description:
    "Explore over 500+ certified Type IIa lab-grown diamonds directly from our solar-powered foundry. Filter by carat, shape, color, clarity, cut, and GIA & IGI certifications.",
  keywords: [
    "Lab Grown Diamonds",
    "Buy Lab Diamonds",
    "GIA Certified Diamonds",
    "IGI Diamonds",
    "Round Brilliant",
    "Oval Diamonds",
    "Cushion Diamonds",
    "Emerald Cut Diamonds",
    "Legacy Diamond Collection",
  ],
  openGraph: {
    title: "Certified Lab-Grown Diamonds Collection | Legacy Diamond",
    description:
      "Explore rare Type IIa lab-grown diamonds certified by GIA and IGI. Zero mining footprint with direct foundry pricing.",
    url: "https://legacydiamond.luxury/diamonds",
  },
};

export default function DiamondsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
