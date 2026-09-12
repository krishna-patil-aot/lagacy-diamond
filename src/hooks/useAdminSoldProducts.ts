"use client";

import { useState, useMemo } from "react";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import { ISoldProductItem, ISoldProductsStats } from "@/types/admin.types";
import { CertificationLab, DiamondClarity, DiamondColor, DiamondCut, DiamondShape } from "@/types/diamond.types";

export interface IUseAdminSoldProductsReturn {
  soldProducts: ISoldProductItem[];
  filteredSoldProducts: ISoldProductItem[];
  paginatedSoldProducts: ISoldProductItem[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalPages: number;
  totalFilteredCount: number;
  stats: ISoldProductsStats;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  isLoading: boolean;
}

const CONFIRMED_SALE_STATUSES = [
  "APPROVED",
  "DISPATCHED",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export function useAdminSoldProducts(): IUseAdminSoldProductsReturn {
  const { orders, isUpdating } = useAdminOrders();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const soldProducts: ISoldProductItem[] = useMemo(() => {
    const list: ISoldProductItem[] = [];

    orders.forEach((order) => {
      // Include any orders that are approved or in transit/delivered
      if (CONFIRMED_SALE_STATUSES.includes(order.status)) {
        order.items.forEach((item) => {
          list.push({
            orderId: order.id,
            orderNumber: order.orderNumber || order.id,
            diamondId: item._id,
            name: item.name,
            sku: item.sku,
            shape: item.shape as DiamondShape,
            carat: item.carat,
            color: item.color as DiamondColor,
            clarity: item.clarity as DiamondClarity,
            cut: item.cut as DiamondCut,
            lab: item.lab as CertificationLab,
            certificateNumber: item.certificateNumber,
            imageUrl: item.images?.[0] || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80",
            soldPrice: item.finalPrice,
            originalPrice: item.price,
            buyerName: order.shippingAddress.fullName,
            buyerEmail: order.shippingAddress.email,
            buyerCity: order.shippingAddress.city,
            buyerCountry: order.shippingAddress.country,
            soldDate: order.approvedAt || (typeof order.createdAt === "string" ? order.createdAt : new Date(order.createdAt).toISOString()),
            orderStatus: order.status,
            paymentMethod: order.paymentInfo?.method || "VAULT_ESCROW",
          });
        });
      }
    });

    return list;
  }, [orders]);

  const stats: ISoldProductsStats = useMemo(() => {
    const totalSoldUnits = soldProducts.length;
    const totalRealizedRevenue = soldProducts.reduce((sum, item) => sum + item.soldPrice, 0);
    const totalCaratsSold = Number(
      soldProducts.reduce((sum, item) => sum + item.carat, 0).toFixed(2)
    );
    const avgOrderValue = totalSoldUnits > 0 ? Math.round(totalRealizedRevenue / totalSoldUnits) : 0;

    return {
      totalSoldUnits,
      totalRealizedRevenue,
      totalCaratsSold,
      avgOrderValue,
    };
  }, [soldProducts]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const filteredSoldProducts = useMemo(() => {
    return soldProducts.filter((item) => {
      const matchesStatus = statusFilter === "ALL" || item.orderStatus === statusFilter;
      if (!matchesStatus) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.certificateNumber.toLowerCase().includes(q) ||
        item.buyerName.toLowerCase().includes(q) ||
        item.buyerEmail.toLowerCase().includes(q) ||
        item.orderNumber.toLowerCase().includes(q)
      );
    });
  }, [soldProducts, searchQuery, statusFilter]);

  const totalFilteredCount = filteredSoldProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / pageSize));

  const paginatedSoldProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSoldProducts.slice(start, start + pageSize);
  }, [filteredSoldProducts, currentPage, pageSize]);

  return {
    soldProducts,
    filteredSoldProducts,
    paginatedSoldProducts,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalFilteredCount,
    stats,
    searchQuery,
    setSearchQuery: handleSearchChange,
    statusFilter,
    setStatusFilter: handleStatusFilterChange,
    isLoading: isUpdating,
  };
}
