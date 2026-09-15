import { MetadataRoute } from "next";
import { siteConfig } from "@/config/site.config";

/**
 * Dynamic Next.js Sitemap Generator for Search Engines
 * Indexes primary collections, informational pages, and legal routes.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.appUrl;

  const routes = [
    "",
    "/diamonds",
    "/about",
    "/sustainability",
    "/gemology",
    "/orders",
    "/wishlist",
    "/contact",
    "/faq",
    "/shipping",
    "/terms",
    "/privacy",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/diamonds" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route === "/diamonds" ? 0.9 : 0.7,
  }));
}
