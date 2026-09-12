import { useState, useEffect, useCallback, useMemo } from "react";
import { IDiamond } from "@/types/diamond.types";
import { IAdminInventoryStats } from "@/types/admin.types";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

export interface IUseAdminDiamondsReturn {
  diamonds: IDiamond[];
  filteredDiamonds: IDiamond[];
  paginatedDiamonds: IDiamond[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalPages: number;
  totalFilteredCount: number;
  stats: IAdminInventoryStats;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedDiamond: IDiamond | null;
  setSelectedDiamond: (diamond: IDiamond | null) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  isEditModalOpen: boolean;
  setIsEditModalOpen: (open: boolean) => void;
  isDeleteConfirmOpen: boolean;
  setIsDeleteConfirmOpen: (open: boolean) => void;
  diamondToDelete: IDiamond | null;
  setDiamondToDelete: (diamond: IDiamond | null) => void;
  isDeleting: boolean;
  handleDeleteDiamond: () => Promise<boolean>;
  openEditModal: (diamond: IDiamond) => void;
  openDeleteModal: (diamond: IDiamond) => void;
  refetch: () => void;
}

export function useAdminDiamonds(): IUseAdminDiamondsReturn {
  const [diamonds, setDiamonds] = useState<IDiamond[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [selectedDiamond, setSelectedDiamond] = useState<IDiamond | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [diamondToDelete, setDiamondToDelete] = useState<IDiamond | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const { token } = useAuthStore();

  const fetchDiamonds = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/diamonds?limit=100&sortBy=newest");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load inventory");
      }
      setDiamonds(json.data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Inventory load error";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadInitial() {
      try {
        const res = await fetch("/api/diamonds?limit=100&sortBy=newest");
        const json = await res.json();
        if (!ignore) {
          if (!res.ok || !json.success) {
            throw new Error(json.error || "Failed to load inventory");
          }
          setDiamonds(json.data);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : "Inventory load error";
          setError(msg);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadInitial();

    return () => {
      ignore = true;
    };
  }, []);

  const filteredDiamonds = useMemo(() => {
    if (!searchQuery.trim()) return diamonds;
    const q = searchQuery.toLowerCase();
    return diamonds.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.sku.toLowerCase().includes(q) ||
        d.certificateNumber.toLowerCase().includes(q) ||
        d.shape.toLowerCase().includes(q)
    );
  }, [diamonds, searchQuery]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const totalFilteredCount = filteredDiamonds.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / pageSize));

  const paginatedDiamonds = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDiamonds.slice(start, start + pageSize);
  }, [filteredDiamonds, currentPage, pageSize]);

  const stats = useMemo<IAdminInventoryStats>(() => {
    const totalDiamonds = diamonds.length;
    const totalInventoryValue = diamonds.reduce((acc, d) => acc + d.finalPrice * d.stockQuantity, 0);
    const totalCarats = diamonds.reduce((acc, d) => acc + d.carat * d.stockQuantity, 0);
    const featuredCount = diamonds.filter((d) => d.featured).length;
    const outOfStockCount = diamonds.filter((d) => d.stockQuantity <= 0).length;

    return {
      totalDiamonds,
      totalInventoryValue,
      totalCarats: Math.round(totalCarats * 100) / 100,
      featuredCount,
      outOfStockCount,
    };
  }, [diamonds]);

  const openEditModal = (diamond: IDiamond) => {
    setSelectedDiamond(diamond);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (diamond: IDiamond) => {
    setDiamondToDelete(diamond);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteDiamond = async (): Promise<boolean> => {
    if (!diamondToDelete) return false;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/diamonds/${diamondToDelete._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to delete diamond");
      }

      setDiamonds((prev) => prev.filter((d) => d._id !== diamondToDelete._id));
      setIsDeleteConfirmOpen(false);
      toast.success("Diamond De-registered from Vault", {
        description: `${diamondToDelete.name} (${diamondToDelete.sku}) permanently removed.`,
      });
      setDiamondToDelete(null);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Deletion failed";
      setError(msg);
      toast.error("Failed to delete diamond", { description: msg });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    diamonds,
    filteredDiamonds,
    paginatedDiamonds,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalFilteredCount,
    stats,
    isLoading,
    error,
    searchQuery,
    setSearchQuery: handleSearchChange,
    selectedDiamond,
    setSelectedDiamond,
    isAddModalOpen,
    setIsAddModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isDeleteConfirmOpen,
    setIsDeleteConfirmOpen,
    diamondToDelete,
    setDiamondToDelete,
    isDeleting,
    handleDeleteDiamond,
    openEditModal,
    openDeleteModal,
    refetch: fetchDiamonds,
  };
}
