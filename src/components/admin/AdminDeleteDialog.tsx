"use client";

import React from "react";
import { IDiamond } from "@/types/diamond.types";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface AdminDeleteDialogProps {
  diamond: IDiamond | null;
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function AdminDeleteDialog({
  diamond,
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}: AdminDeleteDialogProps) {
  if (!diamond) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
      className="max-w-md"
      title="De-register Certified Gemstone"
    >
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-800">
          <AlertTriangle className="h-5 w-5 text-rose-600 flex-shrink-0" />
          <p className="text-xs leading-relaxed">
            This action will permanently delete this lot from the public catalog and admin inventory database.
          </p>
        </div>

        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-xs space-y-1.5">
          <div className="font-semibold text-stone-900">{diamond.name}</div>
          <div className="text-amber-800 font-mono">SKU: {diamond.sku}</div>
          <div className="text-stone-500 font-mono">
            {diamond.carat} ct • {diamond.shape} • {diamond.color} / {diamond.clarity}
          </div>
          <div className="text-stone-900 font-mono font-bold pt-1">
            Valuation: {formatPrice(diamond.finalPrice)}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onConfirm}
            isLoading={isDeleting}
          >
            Confirm Deletion
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
