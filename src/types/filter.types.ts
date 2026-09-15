import {
  DiamondClarity,
  DiamondColor,
  DiamondCut,
  DiamondShape,
} from "./diamond.types";

export type DiamondSortOption =
  | "featured"
  | "price_asc"
  | "price_desc"
  | "carat_asc"
  | "carat_desc"
  | "discount_desc"
  | "newest";

export type DiamondPageSize = 4 | 8 | 12 | 16;
export const DIAMOND_PAGE_SIZES: readonly DiamondPageSize[] = [4, 8, 12, 16] as const;

export interface IDiamondFilterState {
  searchQuery: string;
  shapes: DiamondShape[];
  minPrice: number;
  maxPrice: number;
  minCarat: number;
  maxCarat: number;
  colors: DiamondColor[];
  clarities: DiamondClarity[];
  cuts: DiamondCut[];
  minDiscount: number;
  inStockOnly: boolean;
  sortBy: DiamondSortOption;
  page: number;
  limit: number;
}

export interface IFilterMeta {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  priceRange: {
    min: number;
    max: number;
  };
  caratRange: {
    min: number;
    max: number;
  };
}
