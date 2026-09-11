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
