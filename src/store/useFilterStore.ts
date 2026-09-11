import { create } from "zustand";
import { toast } from "sonner";
import {
  DiamondClarity,
  DiamondColor,
  DiamondCut,
  DiamondShape,
} from "@/types/diamond.types";
import { DiamondSortOption, IDiamondFilterState } from "@/types/filter.types";

interface IFilterStoreState extends IDiamondFilterState {
  setSearchQuery: (query: string) => void;
  toggleShape: (shape: DiamondShape) => void;
  setPriceRange: (min: number, max: number) => void;
  setCaratRange: (min: number, max: number) => void;
  toggleColor: (color: DiamondColor) => void;
  toggleCut: (cut: DiamondCut) => void;
  toggleClarity: (clarity: DiamondClarity) => void;
  setMinDiscount: (discount: number) => void;
  setInStockOnly: (inStock: boolean) => void;
  setSortBy: (sort: DiamondSortOption) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
  activeFilterCount: () => number;
}

const DEFAULT_FILTERS: IDiamondFilterState = {
  searchQuery: "",
  shapes: [],
  minPrice: 0,
  maxPrice: 100000,
  minCarat: 0.3,
  maxCarat: 10.0,
  colors: [],
  clarities: [],
  cuts: [],
  minDiscount: 0,
  inStockOnly: false,
  sortBy: "featured",
  page: 1,
  limit: 12,
};

export const useFilterStore = create<IFilterStoreState>((set, get) => ({
  ...DEFAULT_FILTERS,

  setSearchQuery: (searchQuery: string) => set({ searchQuery, page: 1 }),

  toggleShape: (shape: DiamondShape) =>
    set((state) => {
      const exists = state.shapes.includes(shape);
      const shapes = exists
        ? state.shapes.filter((s) => s !== shape)
        : [...state.shapes, shape];
      return { shapes, page: 1 };
    }),

  setPriceRange: (minPrice: number, maxPrice: number) =>
    set({ minPrice, maxPrice, page: 1 }),

  setCaratRange: (minCarat: number, maxCarat: number) =>
    set({ minCarat, maxCarat, page: 1 }),

  toggleColor: (color: DiamondColor) =>
    set((state) => {
      const exists = state.colors.includes(color);
      const colors = exists
        ? state.colors.filter((c) => c !== color)
        : [...state.colors, color];
      return { colors, page: 1 };
    }),

  toggleCut: (cut: DiamondCut) =>
    set((state) => {
      const exists = state.cuts.includes(cut);
      const cuts = exists
        ? state.cuts.filter((c) => c !== cut)
        : [...state.cuts, cut];
      return { cuts, page: 1 };
    }),

  toggleClarity: (clarity: DiamondClarity) =>
    set((state) => {
      const exists = state.clarities.includes(clarity);
      const clarities = exists
        ? state.clarities.filter((c) => c !== clarity)
        : [...state.clarities, clarity];
      return { clarities, page: 1 };
    }),

  setMinDiscount: (minDiscount: number) => set({ minDiscount, page: 1 }),

  setInStockOnly: (inStockOnly: boolean) => set({ inStockOnly, page: 1 }),

  setSortBy: (sortBy: DiamondSortOption) => set({ sortBy, page: 1 }),

  setPage: (page: number) => set({ page }),

  resetFilters: () => {
    toast.info("All precision filters reset to default");
    set({
      ...DEFAULT_FILTERS,
    });
  },

  activeFilterCount: () => {
    const s = get();
    let count = 0;
    if (s.searchQuery.trim().length > 0) count++;
    if (s.shapes.length > 0) count += s.shapes.length;
    if (s.minPrice > 0 || s.maxPrice < 100000) count++;
    if (s.minCarat > 0.3 || s.maxCarat < 10.0) count++;
    if (s.colors.length > 0) count += s.colors.length;
    if (s.cuts.length > 0) count += s.cuts.length;
    if (s.clarities.length > 0) count += s.clarities.length;
    if (s.minDiscount > 0) count++;
    if (s.inStockOnly) count++;
    return count;
  },
}));
