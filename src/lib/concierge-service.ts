import { getDiamonds } from "@/lib/diamond-repository";
import { IDiamond, DiamondShape, DiamondColor, DiamondClarity, DiamondCut, CertificationLab } from "@/types/diamond.types";
import { IDiamondSearchCriteria, IAIChatResponse } from "@/types/ai.types";

const ALL_SHAPES: DiamondShape[] = [
  "Round",
  "Princess",
  "Cushion",
  "Emerald",
  "Oval",
  "Radiant",
  "Pear",
  "Marquise",
  "Asscher",
  "Heart",
];

const ALL_COLORS: DiamondColor[] = ["D", "E", "F", "G", "H", "I", "J", "K"];
const ALL_CLARITIES: DiamondClarity[] = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2"];
const ALL_CUTS: DiamondCut[] = ["Ideal", "Excellent", "Very Good", "Good"];
const ALL_LABS: CertificationLab[] = ["GIA", "IGI", "AGS", "HRD"];

/**
 * Intelligent Gemological NLP Parser
 * Extracts diamond parameters from natural human language queries
 */
export function parseDiamondIntent(userQuery: string): IDiamondSearchCriteria {
  const query = userQuery.toLowerCase();
  const criteria: IDiamondSearchCriteria = {};

  // 1. Detect Shape
  for (const shape of ALL_SHAPES) {
    if (query.includes(shape.toLowerCase())) {
      criteria.shape = shape;
      break;
    }
  }

  // 2. Detect Budget / Price
  // Matches "$5000", "$5,000", "5000 dollars", "$5k", "under 6k", "max 7000"
  const underPriceMatch = query.match(/(?:under|below|less than|max|budget of|within|up to)\s*\$?([\d,]+)(?:\s*k)?/i);
  if (underPriceMatch) {
    const rawVal = underPriceMatch[1].replace(/,/g, "");
    let num = parseFloat(rawVal);
    if (underPriceMatch[0].toLowerCase().includes("k") && num < 1000) {
      num *= 1000;
    }
    criteria.maxPrice = num;
  } else {
    const directPriceMatch = query.match(/\$([\d,]+)(?:\s*k)?/i);
    if (directPriceMatch) {
      let num = parseFloat(directPriceMatch[1].replace(/,/g, ""));
      if (directPriceMatch[0].toLowerCase().includes("k") && num < 1000) {
        num *= 1000;
      }
      criteria.maxPrice = num;
    }
  }

  // 3. Detect Carat
  // Matches "1.5 carat", "2 ct", "1.2carat", "around 2 carats"
  const caratMatch = query.match(/([\d.]+)\s*(?:carat|carats|ct|cts)/i);
  if (caratMatch) {
    const ct = parseFloat(caratMatch[1]);
    if (!isNaN(ct) && ct > 0 && ct < 50) {
      criteria.minCarat = Math.max(0.1, Number((ct - 0.25).toFixed(2)));
      criteria.maxCarat = Number((ct + 0.35).toFixed(2));
    }
  }

  // 4. Detect Color
  for (const col of ALL_COLORS) {
    // Look for isolated word like "d color", "color f", "d-color" or standalone letter with boundary
    const regex = new RegExp(`(?:\\bcolor\\s+${col}\\b|\\b${col}\\s+color\\b|\\b${col}-color\\b)`, "i");
    if (regex.test(query)) {
      criteria.color = col;
      break;
    }
  }

  // 5. Detect Clarity
  for (const clar of ALL_CLARITIES) {
    const regex = new RegExp(`\\b${clar}\\b`, "i");
    if (regex.test(query)) {
      criteria.clarity = clar;
      break;
    }
  }

  // 6. Detect Cut
  for (const cut of ALL_CUTS) {
    if (query.includes(cut.toLowerCase())) {
      criteria.cut = cut;
      break;
    }
  }

  // 7. Detect Lab
  for (const lab of ALL_LABS) {
    const regex = new RegExp(`\\b${lab}\\b`, "i");
    if (regex.test(query)) {
      criteria.lab = lab;
      break;
    }
  }

  return criteria;
}

/**
 * Execute AI Diamond Concierge Query
 */
export async function executeConciergeInquiry(userMessage: string): Promise<IAIChatResponse> {
  const criteria = parseDiamondIntent(userMessage);

  // Query diamonds through repository
  const repoFilter = {
    shapes: criteria.shape ? [criteria.shape] : undefined,
    colors: criteria.color ? [criteria.color] : undefined,
    clarities: criteria.clarity ? [criteria.clarity] : undefined,
    cuts: criteria.cut ? [criteria.cut] : undefined,
    minPrice: criteria.minPrice !== undefined ? criteria.minPrice : 0,
    maxPrice: criteria.maxPrice !== undefined ? criteria.maxPrice : 150000,
    minCarat: criteria.minCarat !== undefined ? criteria.minCarat : 0.3,
    maxCarat: criteria.maxCarat !== undefined ? criteria.maxCarat : 10.0,
    limit: 6,
    sortBy: "price_asc" as const,
  };

  const { diamonds } = await getDiamonds(repoFilter);

  // Optional: Filter by certification lab if specified
  let matched = diamonds;
  if (criteria.lab) {
    const labFiltered = diamonds.filter((d) => d.lab.toUpperCase() === criteria.lab?.toUpperCase());
    if (labFiltered.length > 0) {
      matched = labFiltered;
    }
  }

  // Craft an expert, luxury gemologist consultation reply
  const reply = generateGemologistNarrative(userMessage, criteria, matched);

  return {
    success: true,
    reply,
    matchedDiamonds: matched,
    searchCriteria: criteria,
  };
}

import { siteConfig } from "@/config/site.config";

function generateGemologistNarrative(
  query: string,
  criteria: IDiamondSearchCriteria,
  diamonds: IDiamond[]
): string {
  if (diamonds.length === 0) {
    return `I searched our ${siteConfig.brandName} certified vault for ${criteria.shape || "gemstones"} matching your criteria, but did not find an exact match within this specific calibration. Would you like me to widen the carat or clarity parameters to reveal our closest certified solitaires?`;
  }

  const stoneCount = diamonds.length;
  const bestMatch = diamonds[0];

  const highlights: string[] = [];
  if (criteria.shape) highlights.push(`${criteria.shape} cut`);
  if (criteria.maxPrice) highlights.push(`under $${criteria.maxPrice.toLocaleString()}`);
  if (criteria.minCarat) highlights.push(`approx. ${((criteria.minCarat + (criteria.maxCarat || criteria.minCarat)) / 2).toFixed(2)} ct`);
  if (criteria.clarity) highlights.push(`${criteria.clarity} clarity`);
  if (criteria.lab) highlights.push(`${criteria.lab} certified`);

  const criteriaText = highlights.length > 0 ? highlights.join(", ") : "your specifications";

  return `Welcome to ${siteConfig.brandName}. Based on your curation request for **${criteriaText}**, I have selected **${stoneCount} certified solitaire${stoneCount > 1 ? "s" : ""}** from our solar-cultivated vault. 

Our premier recommendation is **${bestMatch.name}** (${bestMatch.carat} Carat, ${bestMatch.cut} Cut, ${bestMatch.color} Color, ${bestMatch.clarity} Clarity, ${bestMatch.lab} certified), available at **$${bestMatch.finalPrice.toLocaleString()}**. Each stone represents Type IIa optical perfection, accompanied by an authorized GIA/IGI dossier with zero earth displacement. 

Select any gemstone below to inspect the accredited lab certificate, 360° optical facet inspection, and vault specifications.`;
}
