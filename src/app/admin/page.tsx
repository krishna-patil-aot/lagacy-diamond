"use client";

import React from "react";
import Link from "next/link";
import { useAdminDiamonds } from "@/hooks/useAdminDiamonds";
import { useAuthStore } from "@/store/useAuthStore";
import { useDiamondStore } from "@/store/diamond.store";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminStatsGrid } from "@/components/admin/AdminStatsGrid";
import { DiamondManagementIndex } from "@/app/admin/diamonds/components/index";
import { AdminOrderApprovalList } from "@/components/admin/AdminOrderApprovalList";
import { AdminSoldProductsTable } from "@/components/admin/AdminSoldProductsTable";
import { AdminInquiriesTable } from "@/components/admin/AdminInquiriesTable";
import { useAdminInquiries } from "@/hooks/useAdminInquiries";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import { useInquiryStore } from "@/store/useInquiryStore";
import { Button } from "@/components/ui/Button";
import { ShieldAlert, LogIn, Gem, ShoppingBag, BadgePercent, MessageSquare } from "lucide-react";

export default function AdminPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { pendingCount: pendingOrdersCount } = useAdminOrders();
  const { stats: inquiryStats } = useAdminInquiries();
  const { unreadCount: unreadInquiriesCount } = useInquiryStore();
  const { openCreateModal } = useDiamondStore();
  const [adminTab, setAdminTab] = React.useState<"INVENTORY" | "ORDERS" | "SOLD" | "INQUIRIES">("INVENTORY");
  const { stats, error, refetch } = useAdminDiamonds();

  const isAdmin = isAuthenticated && user?.role === "ADMIN";

  if (!authLoading && !isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-800 border border-amber-200">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-light text-stone-900">
            Foundry Curator Access Restricted
          </h1>
          <p className="text-xs text-stone-500 leading-relaxed max-w-sm mx-auto">
            The diamond inventory vault and CRUD operations require verified Gemologist Admin credentials.
          </p>
        </div>

        <div className="pt-2">
          <Link href="/login">
            <Button variant="luxury" className="w-full justify-center text-xs">
              <LogIn className="h-4 w-4 mr-2" />
              Sign In with Admin Credentials
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* 1. Admin Header (Actions, Seeder, Add New) */}
      <AdminHeader
        onAddNew={openCreateModal}
        onRefresh={refetch}
        unreadMessagesCount={unreadInquiriesCount}
        onOpenInquiries={() => setAdminTab("INQUIRIES")}
      />

      {/* 2. Top Metric KPI Cards */}
      <AdminStatsGrid stats={stats} />

      {/* Error Alert */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Tab Navigation Switcher with Mobile Horizontal Scroll */}
      <div className="overflow-x-auto no-scrollbar scroll-smooth border-b border-stone-200 pb-1 -mb-px">
        <div className="flex items-center gap-2 sm:gap-4 min-w-max pb-1">
          <button
            onClick={() => setAdminTab("INVENTORY")}
            className={`flex items-center gap-2 py-2 px-2 text-xs sm:text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
              adminTab === "INVENTORY"
                ? "border-stone-900 text-stone-900 font-semibold"
                : "border-transparent text-stone-500 hover:text-stone-900"
            }`}
          >
            <Gem className="h-4 w-4 shrink-0" />
            <span>Gemstone Inventory Lots</span>
            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] text-stone-700 font-mono whitespace-nowrap shrink-0">
              {stats.totalDiamonds}
            </span>
          </button>

          <button
            onClick={() => setAdminTab("ORDERS")}
            className={`flex items-center gap-2 py-2 px-2 text-xs sm:text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
              adminTab === "ORDERS"
                ? "border-stone-900 text-stone-900 font-semibold"
                : "border-transparent text-stone-500 hover:text-stone-900"
            }`}
          >
            <ShoppingBag className="h-4 w-4 shrink-0" />
            <span>Client Vault Orders & Approvals</span>
            {pendingOrdersCount > 0 && (
              <span className="rounded-full bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 text-[11px] font-mono font-bold animate-pulse whitespace-nowrap shrink-0">
                {pendingOrdersCount} New
              </span>
            )}
          </button>

          <button
            onClick={() => setAdminTab("SOLD")}
            className={`flex items-center gap-2 py-2 px-2 text-xs sm:text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
              adminTab === "SOLD"
                ? "border-stone-900 text-stone-900 font-semibold"
                : "border-transparent text-stone-500 hover:text-stone-900"
            }`}
          >
            <BadgePercent className="h-4 w-4 shrink-0" />
            <span>Sold Gemstones & Realized Sales</span>
          </button>

          <button
            onClick={() => setAdminTab("INQUIRIES")}
            className={`flex items-center gap-2 py-2 px-2 text-xs sm:text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
              adminTab === "INQUIRIES"
                ? "border-stone-900 text-stone-900 font-semibold"
                : "border-transparent text-stone-500 hover:text-stone-900"
            }`}
          >
            <MessageSquare className="h-4 w-4 shrink-0" />
            <span>Customer Messages & Inquiries</span>
            {(unreadInquiriesCount > 0 || inquiryStats.newCount > 0) && (
              <span className="rounded-full bg-amber-500 text-white font-mono font-bold px-2 py-0.5 text-[11px] animate-pulse shadow-xs whitespace-nowrap shrink-0">
                {unreadInquiriesCount > 0 ? unreadInquiriesCount : inquiryStats.newCount} New
              </span>
            )}
          </button>
        </div>
      </div>

      {adminTab === "INVENTORY" && <DiamondManagementIndex />}

      {adminTab === "ORDERS" && <AdminOrderApprovalList />}

      {adminTab === "SOLD" && <AdminSoldProductsTable />}

      {adminTab === "INQUIRIES" && <AdminInquiriesTable />}
    </div>
  );
}

