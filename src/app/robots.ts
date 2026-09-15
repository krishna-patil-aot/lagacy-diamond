import { MetadataRoute } from "next";
import { siteConfig } from "@/config/site.config";

/**
 * Dynamic Next.js Robots.txt Generator
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/"],
      },
    ],
    sitemap: `${siteConfig.appUrl}/sitemap.xml`,
  };
}
