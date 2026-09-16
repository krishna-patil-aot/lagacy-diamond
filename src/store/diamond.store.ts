import { create } from "zustand";
import { IDiamond } from "@/types/diamond.types";
import { IStoreDeleteDialogState, IStoreModalState } from "@/types/admin.types";

export interface DiamondStoreState {
  // List State
  items: IDiamond[];
  total: number;
  pageCount: number;
  page: number;
  limit: number;
  loading: boolean;
  error: string | null;
  search: string;
  shapeFilter: string;
  sortBy: "featured" | "price-asc" | "price-desc" | "carat-desc" | "carat-asc" | "newest";

  // Modal State
  modal: IStoreModalState<IDiamond>;

  // Delete Dialog State
  deleteDialog: IStoreDeleteDialogState;

  // Image Preview Modal State
  imagePreview: {
    isOpen: boolean;
    images: string[];
    title: string;
    sku: string;
    selectedIndex: number;
  };

  // Actions
  setItems: (items: IDiamond[], total: number, pageCount: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSearch: (search: string) => void;
  setShapeFilter: (shape: string) => void;
  setSortBy: (
    sort: "featured" | "price-asc" | "price-desc" | "carat-desc" | "carat-asc" | "newest"
  ) => void;
  resetFilters: () => void;

  // Modal Actions
  openCreateModal: () => void;
  openEditModal: (item: IDiamond) => void;
  closeModal: () => void;

  // Image Preview Actions
  openImagePreview: (
    images: string[],
    title: string,
    sku: string,
    initialIndex?: number
  ) => void;
  closeImagePreview: () => void;
  setPreviewIndex: (index: number) => void;

  // Delete Actions
  openDeleteDialog: (id: string, name: string) => void;
  closeDeleteDialog: () => void;
  setDeleteLoading: (loading: boolean) => void;

  // Optimistic List Updates
  updateItemInList: (item: IDiamond) => void;
  removeItemFromList: (id: string) => void;
}


export const useDiamondStore = create<DiamondStoreState>((set) => ({
  // List State Initial
  items: [],
  total: 0,
  pageCount: 1,
  page: 1,
  limit: 10,
  loading: false,
  error: null,
  search: "",
  shapeFilter: "ALL",
  sortBy: "newest",

  // Modal Initial
  modal: {
    isOpen: false,
    mode: "create",
    selectedItem: null,
  },

  // Delete Initial
  deleteDialog: {
    isOpen: false,
    id: null,
    name: "",
    loading: false,
  },

  // Image Preview Initial
  imagePreview: {
    isOpen: false,
    images: [],
    title: "",
    sku: "",
    selectedIndex: 0,
  },

  setItems: (items, total, pageCount) => set({ items, total, pageCount }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setPage: (page) => set({ page }),
  setLimit: (limit) => set({ limit, page: 1 }),
  setSearch: (search) => set({ search, page: 1 }),
  setShapeFilter: (shapeFilter) => set({ shapeFilter, page: 1 }),
  setSortBy: (sortBy) => set({ sortBy, page: 1 }),
  resetFilters: () => set({ search: "", shapeFilter: "ALL", sortBy: "newest", page: 1 }),

  openCreateModal: () =>
    set({
      modal: {
        isOpen: true,
        mode: "create",
        selectedItem: null,
      },
    }),

  openEditModal: (item: IDiamond) =>
    set({
      modal: {
        isOpen: true,
        mode: "edit",
        selectedItem: item,
      },
    }),

  closeModal: () =>
    set((state) => ({
      modal: {
        ...state.modal,
        isOpen: false,
      },
    })),

  openImagePreview: (images, title, sku, initialIndex = 0) =>
    set({
      imagePreview: {
        isOpen: true,
        images: images && images.length > 0 ? images : [],
        title,
        sku,
        selectedIndex: initialIndex,
      },
    }),

  closeImagePreview: () =>
    set((state) => ({
      imagePreview: {
        ...state.imagePreview,
        isOpen: false,
      },
    })),

  setPreviewIndex: (selectedIndex: number) =>
    set((state) => ({
      imagePreview: {
        ...state.imagePreview,
        selectedIndex,
      },
    })),


  openDeleteDialog: (id: string, name: string) =>
    set({
      deleteDialog: {
        isOpen: true,
        id,
        name,
        loading: false,
      },
    }),

  closeDeleteDialog: () =>
    set({
      deleteDialog: {
        isOpen: false,
        id: null,
        name: "",
        loading: false,
      },
    }),

  setDeleteLoading: (loading: boolean) =>
    set((state) => ({
      deleteDialog: {
        ...state.deleteDialog,
        loading,
      },
    })),

  updateItemInList: (item: IDiamond) =>
    set((state) => ({
      items: state.items.map((i) => (i._id === item._id ? item : i)),
    })),

  removeItemFromList: (id: string) =>
    set((state) => ({
      items: state.items.filter((i) => i._id !== id),
      total: Math.max(0, state.total - 1),
    })),
}));
