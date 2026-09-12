import type { Metadata } from "next";
import { getDiamondById } from "@/lib/diamond-repository";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const diamond = await getDiamondById(id);

  if (!diamond) {
    return {
      title: "Diamond Specification | Legacy Diamond Foundry",
      description: "Explore certified lab-grown diamonds at Legacy Diamond.",
    };
  }

  const title = `${diamond.carat}ct ${diamond.shape} Diamond (${diamond.color}/${diamond.clarity}, ${diamond.cut}) | Legacy Diamond`;
  const description = `Certified ${diamond.carat} ct ${diamond.shape} lab-grown diamond (${diamond.color} Color, ${diamond.clarity} Clarity, ${diamond.cut} Cut) with official ${diamond.lab} certificate #${diamond.certificateNumber}. Available at direct foundry valuation: $${diamond.finalPrice.toLocaleString()}.`;

  return {
    title,
    description,
    keywords: [
      `${diamond.shape} Diamond`,
      `${diamond.carat} Carat Diamond`,
      `${diamond.color} Color Diamond`,
      `${diamond.clarity} Clarity`,
      `${diamond.lab} Certified Diamond`,
      "Legacy Diamond",
      "Lab Grown Diamond",
    ],
    openGraph: {
      title,
      description,
      url: `https://legacydiamond.luxury/diamonds/${diamond._id}`,
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
