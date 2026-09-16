"use client";

import React from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";

export interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title?: string;
  description?: string;
  itemName?: string;
  isDeleting?: boolean;
}

export function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Permanently De-register Record",
  description,
  itemName,
  isDeleting = false,
}: DeleteModalProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-rose-700">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="font-serif text-lg font-bold">{title}</span>
        </div>
      }
      className="max-w-md"
    >
      <div className="space-y-4 pt-1">
        <p className="text-xs text-stone-600 leading-relaxed">
          {description || (
            <>
              Are you sure you want to permanently remove{" "}
              {itemName ? <strong className="text-stone-900 font-semibold">{itemName}</strong> : "this record"}{" "}
              from the vault inventory? This action cannot be reversed.
            </>
          )}
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="danger"
            size="sm"
            isLoading={isDeleting}
            onClick={onConfirm}
          >
            Confirm Permanent Removal
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
