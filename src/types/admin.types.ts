import {
  CertificationLab,
  DiamondClarity,
  DiamondColor,
  DiamondCut,
  DiamondShape,
  IDiamond,
} from "./diamond.types";

export interface IDiamondFormData {
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
  length: number;
  width: number;
  depth: number;
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

export interface IAdminInventoryStats {
  totalDiamonds: number;
  totalInventoryValue: number;
  totalCarats: number;
  featuredCount: number;
  outOfStockCount: number;
}

export interface IAdminTableState {
  searchQuery: string;
  selectedDiamond: IDiamond | null;
  isAddModalOpen: boolean;
  isEditModalOpen: boolean;
  isDeleteConfirmOpen: boolean;
  diamondToDelete: IDiamond | null;
  isSubmitting: boolean;
}

export interface ISoldProductItem {
  orderId: string;
  orderNumber: string;
  diamondId: string;
  name: string;
  sku: string;
  shape: DiamondShape;
  carat: number;
  color: DiamondColor;
  clarity: DiamondClarity;
  cut: DiamondCut;
  lab: CertificationLab;
  certificateNumber: string;
  imageUrl: string;
  soldPrice: number;
  originalPrice: number;
  buyerName: string;
  buyerEmail: string;
  buyerCity: string;
  buyerCountry: string;
  soldDate: string;
  orderStatus: string;
  paymentMethod: string;
}

export interface ISoldProductsStats {
  totalSoldUnits: number;
  totalRealizedRevenue: number;
  totalCaratsSold: number;
  avgOrderValue: number;
}
