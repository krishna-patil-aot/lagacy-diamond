import type { Metadata } from "next";
import { getDiamondById } from "@/lib/diamond-repository";
import { siteConfig } from "@/config/site.config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const diamond = await getDiamondById(id);

  if (!diamond) {
    return {
      title: `Gemstone Specification | ${siteConfig.brandName}`,
      description: `Explore certified solar-cultivated diamonds at ${siteConfig.brandName}.`,
    };
  }

  const title = `${diamond.carat}ct ${diamond.shape} Diamond (${diamond.color}/${diamond.clarity}, ${diamond.cut}) | ${siteConfig.brandName}`;
  const description = `Certified ${diamond.carat} ct ${diamond.shape} solar-cultivated Type IIa diamond (${diamond.color} Color, ${diamond.clarity} Clarity, ${diamond.cut} Cut) with official ${diamond.lab} certificate #${diamond.certificateNumber}. Direct atelier pricing: $${diamond.finalPrice.toLocaleString()}.`;

  return {
    title,
    description,
    keywords: [
      `${diamond.shape} Solitaire`,
      `${diamond.carat} Carat Diamond`,
      `${diamond.color} Color Diamond`,
      `${diamond.clarity} Clarity`,
      `${diamond.lab} Certified Diamond`,
      siteConfig.brandName,
      "Solar Cultivated Diamond",
    ],
    openGraph: {
      title,
      description,
      url: `${siteConfig.appUrl}/diamonds/${diamond._id}`,
      siteName: siteConfig.brandName,
      images: diamond.images && diamond.images.length > 0 ? [{ url: diamond.images[0] }] : undefined,
    },
  };
}

export default function DiamondDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
