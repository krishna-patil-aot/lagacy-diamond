"use client";

import React from "react";
import { useDiamondStore } from "@/store/diamond.store";
import { useDiamondColumns } from "@/hooks/columns/use-diamond-columns";
import { useFetchDiamondData } from "@/hooks/use-fetch-diamond-data";
import { useSaveDiamondData } from "@/hooks/use-save-diamond-data";
import { DataTable } from "@/components/ui/data-table";
import { DiamondCardItem } from "./diamond-card-view";
import { DiamondAddEditModal } from "./add-edit-modal";
import { DeleteModal } from "@/components/shared/delete-modal";
import { ImagePreviewModal } from "@/components/shared/image-preview-modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DIAMOND_SHAPE_OPTIONS } from "@/utils/constants";
import { IDiamondSearchParams } from "@/types/diamond.types";
import { Plus, RefreshCw } from "lucide-react";

export function DiamondManagementIndex({
  initialParams,
}: {
  initialParams?: IDiamondSearchParams;
}) {
  const store = useDiamondStore();
  const columns = useDiamondColumns();
  const { refetch } = useFetchDiamondData(initialParams);
  const saveHook = useSaveDiamondData(refetch);

  const shapeOptions = [
    { label: "All Shapes", value: "ALL" },
    ...DIAMOND_SHAPE_OPTIONS,
  ];

  return (
    <div className="space-y-4 rounded-2xl border border-stone-200/80 bg-white p-4 sm:p-6 shadow-xs">
      {/* Module Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
            <span>Gemstone Inventory Lots</span>
            <Badge variant="cyan" className="text-[11px] font-mono">
              {store.total} Lots
            </Badge>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Hook-driven TanStack Table on desktop and responsive luxury card view on mobile &amp; tablet.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-8 gap-1 text-xs"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${store.loading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </Button>
          <Button
            variant="luxury"
            size="sm"
            onClick={store.openCreateModal}
            className="h-8 gap-1 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Register Lot</span>
          </Button>
        </div>
      </div>

      {/* Dual-Mode Responsive Data Table (Table on Desktop, Cards on Mobile/Tablet) */}
      <DataTable
        columns={columns}
        data={store.items}
        totalCount={store.total}
        pageCount={store.pageCount}
        currentPage={store.page}
        pageSize={store.limit}
        isLoading={store.loading}
        onPageChange={store.setPage}
        onPageSizeChange={store.setLimit}
        searchPlaceholder="Search lots by SKU, name, certificate..."
        searchValue={store.search}
        onSearchChange={store.setSearch}
        filterDropdowns={[
          {
            label: "Shape",
            value: store.shapeFilter,
            options: shapeOptions,
            onChange: store.setShapeFilter,
          },
        ]}
        onResetFilters={store.resetFilters}
        renderMobileCard={(diamond) => <DiamondCardItem diamond={diamond} />}
      />

      {/* Dynamic Add / Edit Modal */}
      <DiamondAddEditModal saveHook={saveHook} />

      {/* Generic Delete Confirmation Modal */}
      <DeleteModal
        isOpen={store.deleteDialog.isOpen}
        onClose={store.closeDeleteDialog}
        onConfirm={saveHook.handleConfirmDelete}
        itemName={store.deleteDialog.name}
        isDeleting={saveHook.isDeleting}
      />

      {/* High-Resolution Laboratory Specimen Image Preview Modal */}
      <ImagePreviewModal />
    </div>
  );
}
