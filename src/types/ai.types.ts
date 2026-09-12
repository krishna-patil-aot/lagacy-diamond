import { IDiamond, DiamondShape, DiamondColor, DiamondClarity, DiamondCut, CertificationLab } from "./diamond.types";

export type AIMessageRole = "user" | "assistant" | "system";

export interface IAIMessage {
  id: string;
  role: AIMessageRole;
  content: string;
  timestamp: string;
  recommendedDiamonds?: IDiamond[];
  toolCallName?: string;
}

export interface IDiamondSearchCriteria {
  shape?: DiamondShape;
  minCarat?: number;
  maxCarat?: number;
  minPrice?: number;
  maxPrice?: number;
  color?: DiamondColor;
  clarity?: DiamondClarity;
  cut?: DiamondCut;
  lab?: CertificationLab;
  maxResults?: number;
}

export interface IAIChatRequest {
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

export interface IAIChatResponse {
  success: boolean;
  reply: string;
  matchedDiamonds: IDiamond[];
  searchCriteria?: IDiamondSearchCriteria;
  error?: string;
}
