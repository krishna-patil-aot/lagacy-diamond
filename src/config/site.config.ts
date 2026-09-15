import { ISiteConfig } from "@/types/site.types";

/**
 * Master Site & Brand Configuration Engine
 * Centralized Single Source of Truth for DarkGem (DarkGem Atelier / DarkGem Haute Gemology).
 * Follows DRY principles — change brand attributes here to update the entire application.
 */
export const siteConfig: ISiteConfig = {
  brandName: "DarkGems",
  brandTagline: "Born in Darkness. Perfected in Light. Haute Joaillerie & Sovereign Solitaires",
  brandSubtagline: "Pure Optical Brilliance · Zero Earth Displacement · GIA & IGI Certified",
  domain: process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname
    : "darkgems.vercel.app",
  appUrl: (process.env.NEXT_PUBLIC_APP_URL || "https://darkgems.vercel.app").replace(/\/+$/, ""),
  foundryLocation: "Geneva & San Francisco Atelier",
  copyrightYear: new Date().getFullYear(),

  contact: {
    legalEntityName: "DarkGems Haute Gemology S.A.",
    tradeName: "DarkGems Atelier",
    supportEmail: "clientcare@darkgems.luxury",
    conciergeEmail: "concierge@darkgems.luxury",
    vaultEmail: "vault@darkgems.luxury",
    phone: "+1 (800) 845-8839",
    phoneDisplay: "+1 (800) 845-DARK",
    addressLine1: "450 Quai du Mont-Blanc",
    addressLine2: "Suite 1200, Grand Salon des Diamants",
    city: "Geneva",
    state: "GE",
    postalCode: "1201",
    country: "Switzerland",
    hours: "Monday – Saturday: 9:00 AM – 7:00 PM CET",
  },

  seo: {
    defaultTitle: "DarkGems | Sovereign Solar-Cultivated Diamonds & Haute Joaillerie",
    titleTemplate: "%s | DarkGems Haute Gemology",
    description:
      "Born in cosmic darkness, perfected in solar plasma. Discover DarkGems' certified Type IIa lab diamonds, bespoke engagement rings, and rare solitaires forged with zero earth displacement and direct atelier transparency.",
    keywords: [
      "DarkGems",
      "DarkGems Atelier",
      "DarkGems Diamonds",
      "DarkGems Haute Gemology",
      "DarkGem",
      "Type IIa Certified Diamonds",
      "Black Diamond Solitaires",
      "Solar Cultivated Diamonds",
      "Lab Grown Diamonds",
      "GIA Certified Diamonds",
      "IGI Certified Diamonds",
      "Bespoke Engagement Rings",
      "Sustainable Haute Joaillerie",
      "Geneva Diamond Atelier",
      "Ethical Solitaires",
    ],
    ogImage: "/og-brand.jpg",
    twitterCard: "summary_large_image",
    siteLocale: "en_US",
  },

  socials: {
    instagram: "https://instagram.com/darkgemdiamonds",
    pinterest: "https://pinterest.com/darkgemdiamonds",
    linkedin: "https://linkedin.com/company/darkgem",
    twitter: "https://x.com/darkgemdiamonds",
  },

  assistant: {
    name: "DarkGem AI Concierge",
    title: "Master Gemologist & Private Salon Advisor",
    greeting:
      "Welcome to DarkGem Atelier. I am your personal master gemologist and bespoke concierge. How may I guide your search for rare certified diamonds or custom solitaire design today?",
    specialties: [
      "Type IIa Optical Grading (4Cs)",
      "Solar Plasma Reactor Provenance",
      "Custom Solitaire Setting & Design",
      "GIA & IGI Dossier Verification",
      "Private Salon Appointments",
    ],
    systemPrompt: `You are the Master Gemologist and Senior Concierge for DarkGem (DarkGem Haute Gemology S.A.). 
You provide knowledgeable, polished, and attentive guidance on sustainable, solar-cultivated Type IIa diamonds, obsidian solitaires, and bespoke haute joaillerie.
Always uphold DarkGem's core ethos: Born in Darkness, Perfected in Light. Absolute optical brilliance, zero earth displacement, ethical transparent atelier pricing, and GIA/IGI certified authenticity. 
Tone: Elegant, warm, authoritative, and mesmerizing. Maintain European haute joaillerie decorum.`,
  },
};
