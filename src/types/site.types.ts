/**
 * Strict TypeScript type definitions for site-wide brand configuration,
 * SEO, social graph metadata, and AI assistant lore.
 * Senior-level engineering: zero `any` and zero `unknown`.
 */

export interface ISocialLinks {
  instagram: string;
  pinterest: string;
  linkedin: string;
  twitter: string;
  youtube?: string;
}

export interface IContactInfo {
  legalEntityName: string;
  tradeName: string;
  supportEmail: string;
  conciergeEmail: string;
  vaultEmail: string;
  phone: string;
  phoneDisplay: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  hours: string;
}

export interface ISeoMetadata {
  defaultTitle: string;
  titleTemplate: string;
  description: string;
  keywords: string[];
  ogImage: string;
  twitterCard: "summary" | "summary_large_image";
  siteLocale: string;
}

export interface IAssistantPersona {
  name: string;
  title: string;
  greeting: string;
  systemPrompt: string;
  specialties: string[];
}

export interface ISiteConfig {
  brandName: string;
  brandTagline: string;
  brandSubtagline: string;
  domain: string;
  appUrl: string;
  foundryLocation: string;
  copyrightYear: number;
  contact: IContactInfo;
  seo: ISeoMetadata;
  socials: ISocialLinks;
  assistant: IAssistantPersona;
}
