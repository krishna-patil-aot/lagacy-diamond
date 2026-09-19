export type DiamondShape =
  | "Round"
  | "Princess"
  | "Cushion"
  | "Emerald"
  | "Oval"
  | "Radiant"
  | "Pear"
  | "Marquise"
  | "Asscher"
  | "Heart";

export type DiamondColor =
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K";

export type DiamondClarity =
  | "FL"
  | "IF"
  | "VVS1"
  | "VVS2"
  | "VS1"
  | "VS2"
  | "SI1"
  | "SI2";

export type DiamondCut =
  | "Ideal"
  | "Excellent"
  | "Very Good"
  | "Good";

export type CertificationLab =
  | "GIA"
  | "IGI"
  | "AGS"
  | "HRD";

export interface IDiamondDimensions {
  length: number;
  width: number;
  depth: number;
}

export interface IDiamond {
  _id: string;
  id?: string;
  name: string;
  sku: string;
  shape: DiamondShape;
  carat: number;
  color: DiamondColor;
  clarity: DiamondClarity;
  cut: DiamondCut;
  price: number;
  discountPercentage: number;
  finalPrice: number;
  lab: CertificationLab;
  certificateNumber: string;
  dimensions: IDiamondDimensions;
  tablePercentage: number;
  depthPercentage: number;
  polish: DiamondCut;
  symmetry: DiamondCut;
  fluorescence: "None" | "Faint" | "Medium" | "Strong";
  images: string[];
  description: string;
  stockQuantity: number;
  cartQuantity?: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IDiamondSummary {
  _id: string;
  name: string;
  sku: string;
  shape: DiamondShape;
  carat: number;
  color: DiamondColor;
  clarity: DiamondClarity;
  cut: DiamondCut;
  price: number;
  discountPercentage: number;
  finalPrice: number;
  images: string[];
  stockQuantity: number;
  featured: boolean;
}

export interface IDiamondFilterQuery {
  shapes?: DiamondShape[];
  colors?: DiamondColor[];
  cuts?: DiamondCut[];
  clarities?: DiamondClarity[];
  minPrice?: number;
  maxPrice?: number;
  minCarat?: number;
  maxCarat?: number;
  minDiscount?: number;
  inStockOnly?: boolean;
  featured?: boolean;
  search?: string;
  sortBy?: "featured" | "price-asc" | "price-desc" | "carat-desc" | "carat-asc" | "newest";
  page?: number;
  limit?: number;
}

export interface IDiamondApiResponse {
  items: IDiamond[];
  total: number;
  pageCount: number;
  page: number;
  limit: number;
}

export interface IDiamondMutationPayload {
  name: string;
  sku: string;
  shape: DiamondShape;
  carat: number;
  color: DiamondColor;
  clarity: DiamondClarity;
  cut: DiamondCut;
  price: number;
  discountPercentage: number;
  lab: CertificationLab;
  certificateNumber: string;
  dimensions: IDiamondDimensions;
  tablePercentage: number;
  depthPercentage: number;
  polish: DiamondCut;
  symmetry: DiamondCut;
  fluorescence: "None" | "Faint" | "Medium" | "Strong";
  images: string[];
  description: string;
  stockQuantity: number;
  featured: boolean;
}

export interface IDiamondSearchParams {
  page?: string;
  limit?: string;
  search?: string;
  shape?: string | string[];
  color?: string | string[];
  cut?: string | string[];
  clarity?: string | string[];
  sortBy?: string;
  featured?: string;
}
