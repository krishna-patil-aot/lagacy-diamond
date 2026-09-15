import { useCallback, useMemo } from "react";
import { useFilterStore } from "@/store/useFilterStore";
import { IFilterMeta, DiamondPageSize, DIAMOND_PAGE_SIZES } from "@/types/filter.types";

export interface IUseDiamondPaginationProps {
  meta: IFilterMeta | null;
  targetScrollElementId?: string;
}

export interface IUseDiamondPaginationReturn {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  pageSizeOptions: readonly DiamondPageSize[];
  startRecord: number;
  endRecord: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  pageNumbers: (number | "ellipsis")[];
  goToPage: (pageNumber: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  setPageSize: (size: DiamondPageSize) => void;
}

export function useDiamondPagination({
  meta,
  targetScrollElementId = "diamonds-catalog-section",
}: IUseDiamondPaginationProps): IUseDiamondPaginationReturn {
  const { page, limit, setPage, setLimit } = useFilterStore();

  const totalPages = meta?.totalPages ?? 1;
  const totalCount = meta?.totalCount ?? 0;
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const startRecord = totalCount === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endRecord = Math.min(currentPage * limit, totalCount);

  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const scrollToTop = useCallback(() => {
    if (typeof window === "undefined") return;
    const el = targetScrollElementId
      ? document.getElementById(targetScrollElementId)
      : null;
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [targetScrollElementId]);

  const goToPage = useCallback(
    (pageNumber: number) => {
      const target = Math.min(Math.max(1, pageNumber), totalPages);
      if (target !== page) {
        setPage(target);
        scrollToTop();
      }
    },
    [totalPages, page, setPage, scrollToTop]
  );

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      goToPage(currentPage + 1);
    }
  }, [hasNextPage, goToPage, currentPage]);

  const prevPage = useCallback(() => {
    if (hasPrevPage) {
      goToPage(currentPage - 1);
    }
  }, [hasPrevPage, goToPage, currentPage]);

  const firstPage = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  const lastPage = useCallback(() => {
    goToPage(totalPages);
  }, [goToPage, totalPages]);

  const setPageSize = useCallback(
    (size: DiamondPageSize) => {
      setLimit(size);
      scrollToTop();
    },
    [setLimit, scrollToTop]
  );

  const pageNumbers = useMemo((): (number | "ellipsis")[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "ellipsis")[] = [];
    pages.push(1);

    if (currentPage > 3) {
      pages.push("ellipsis");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("ellipsis");
    }

    pages.push(totalPages);
    return pages;
  }, [currentPage, totalPages]);

  return {
    currentPage,
    totalPages,
    totalCount,
    limit,
    pageSizeOptions: DIAMOND_PAGE_SIZES,
    startRecord,
    endRecord,
    hasNextPage,
    hasPrevPage,
    pageNumbers,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    setPageSize,
  };
}
