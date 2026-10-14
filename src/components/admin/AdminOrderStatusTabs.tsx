"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { OrderStatus } from "@/types/order.types";
import { IAdminOrderStatusTabsProps } from "@/types/admin.types";

interface ITabDefinition {
  id: OrderStatus | "ALL";
  label: string;
  count: number;
}

export function AdminOrderStatusTabs({
  statusFilter,
  setStatusFilter,
  counts,
}: IAdminOrderStatusTabsProps) {
  const tabs: ITabDefinition[] = [
    { id: "ALL", label: "All Orders", count: counts.all },
    { id: "PENDING_APPROVAL", label: "Pending Review", count: counts.pending },
    { id: "APPROVED", label: "Approved", count: counts.approved },
    { id: "DISPATCHED", label: "In Transit", count: counts.dispatched },
    { id: "DELIVERED", label: "Delivered", count: counts.delivered },
    { id: "CANCELLED", label: "Cancelled", count: counts.cancelled },
  ];

  return (
    <div className="overflow-x-auto pb-1 -mt-1 scrollbar-none">
      <div className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-100/80 p-1 text-xs min-w-max">
        {tabs.map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <Button
              key={tab.id}
              variant={isActive ? "luxury" : "ghost"}
              size="sm"
              onClick={() => setStatusFilter(tab.id)}
              className={`h-8 px-3.5 text-xs font-medium transition-all whitespace-nowrap shrink-0 rounded-lg ${
                isActive
                  ? "bg-stone-900 text-white shadow-xs hover:bg-stone-800 font-semibold"
                  : "text-stone-600 hover:text-stone-900 hover:bg-white/80"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-mono leading-none ${
                    isActive
                      ? "bg-stone-800 text-amber-300 font-bold"
                      : "bg-stone-200/90 text-stone-700"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
