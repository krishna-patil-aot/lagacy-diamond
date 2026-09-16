"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm, useWatch, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { diamondFormSchema, DiamondFormValues } from "@/lib/validations/diamond.schema";
import { useDiamondStore } from "@/store/diamond.store";
import {
  createDiamondAction,
  updateDiamondAction,
  deleteDiamondAction,
} from "@/actions/diamond.action";
import { apiHandler } from "@/utils/api-handler";
import { calculateDiscountedPrice } from "@/lib/utils";
import { broadcastDiamondEvent, DIAMOND_EVENTS } from "@/lib/diamond-events";

const DEFAULT_DIAMOND_VALUES: DiamondFormValues = {
  name: "",
  sku: "",
  shape: "Round",
  carat: 1.0,
  color: "F",
  clarity: "VS1",
  cut: "Ideal",
  price: 5000,
  discountPercentage: 0,
  lab: "GIA",
  certificateNumber: "",
  length: 6.5,
  width: 6.5,
  depth: 4.0,
  tablePercentage: 57,
  depthPercentage: 61.5,
  polish: "Excellent",
  symmetry: "Excellent",
  fluorescence: "None",
  images: [
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80",
  ],
  description: "",
  stockQuantity: 1,
  featured: false,
};

export interface UseSaveDiamondDataReturn {
  form: UseFormReturn<DiamondFormValues>;
  isSubmitting: boolean;
  handleSave: (values: DiamondFormValues) => Promise<void>;
  handleConfirmDelete: () => Promise<void>;
  calculatedFinalPrice: number;
  calculatedSavings: number;
  isDeleting: boolean;
}

export function useSaveDiamondData(onSuccessRefresh?: () => void): UseSaveDiamondDataReturn {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const {
    modal,
    closeModal,
    deleteDialog,
    closeDeleteDialog,
    setDeleteLoading,
    updateItemInList,
    removeItemFromList,
  } = useDiamondStore();

  const form = useForm<DiamondFormValues>({
    resolver: zodResolver(diamondFormSchema),
    defaultValues: DEFAULT_DIAMOND_VALUES,
  });

  const { reset, control } = form;
  const currentPrice = useWatch({ control, name: "price" }) || 0;
  const currentDiscount = useWatch({ control, name: "discountPercentage" }) || 0;

  const calculatedFinalPrice = useMemo(
    () => calculateDiscountedPrice(Number(currentPrice), Number(currentDiscount)),
    [currentPrice, currentDiscount]
  );
  const calculatedSavings = useMemo(
    () => Number(currentPrice) - calculatedFinalPrice,
    [currentPrice, calculatedFinalPrice]
  );

  useEffect(() => {
    if (modal.isOpen && modal.selectedItem) {
      const item = modal.selectedItem;
      reset({
        name: item.name,
        sku: item.sku,
        shape: item.shape,
        carat: item.carat,
        color: item.color,
        clarity: item.clarity,
        cut: item.cut,
        price: item.price,
        discountPercentage: item.discountPercentage,
        lab: item.lab,
        certificateNumber: item.certificateNumber,
        length: item.dimensions.length,
        width: item.dimensions.width,
        depth: item.dimensions.depth,
        tablePercentage: item.tablePercentage,
        depthPercentage: item.depthPercentage,
        polish: item.polish,
        symmetry: item.symmetry,
        fluorescence: item.fluorescence,
        images: item.images && item.images.length > 0 ? item.images : DEFAULT_DIAMOND_VALUES.images,
        description: item.description,
        stockQuantity: item.stockQuantity,
        featured: item.featured,
      });
    } else if (modal.isOpen && !modal.selectedItem) {
      reset(DEFAULT_DIAMOND_VALUES);
    }
  }, [modal.isOpen, modal.selectedItem, reset]);

  const handleSave = async (values: DiamondFormValues): Promise<void> => {
    setIsSubmitting(true);

    if (modal.mode === "edit" && modal.selectedItem) {
      const selectedId = modal.selectedItem._id;
      const result = await apiHandler(
        () => updateDiamondAction(selectedId, values),
        {
          successMessage: `Vault lot ${values.sku} updated successfully`,
          errorMessage: "Failed to update diamond",
        }
      );

      if (result.success && result.data) {
        updateItemInList(result.data);
        broadcastDiamondEvent(
          DIAMOND_EVENTS.DIAMOND_UPDATED,
          result.data._id,
          result.data.stockQuantity
        );
        closeModal();
        onSuccessRefresh?.();
      }
    } else {
      const result = await apiHandler(
        () => createDiamondAction(values),
        {
          successMessage: `New diamond ${values.sku} registered to vault`,
          errorMessage: "Failed to create diamond",
        }
      );

      if (result.success && result.data) {
        broadcastDiamondEvent(
          DIAMOND_EVENTS.DIAMOND_CREATED,
          result.data._id,
          result.data.stockQuantity
        );
        closeModal();
        onSuccessRefresh?.();
      }
    }

    setIsSubmitting(false);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (!deleteDialog.id) return;
    setDeleteLoading(true);

    const targetId = deleteDialog.id;
    const result = await apiHandler(
      () => deleteDiamondAction(targetId),
      {
        successMessage: `${deleteDialog.name} permanently de-registered`,
        errorMessage: "Failed to delete diamond record",
      }
    );

    if (result.success) {
      removeItemFromList(targetId);
      broadcastDiamondEvent(DIAMOND_EVENTS.DIAMOND_DELETED, targetId);
      closeDeleteDialog();
      onSuccessRefresh?.();
    }

    setDeleteLoading(false);
  };

  return {
    form,
    isSubmitting,
    handleSave,
    handleConfirmDelete,
    calculatedFinalPrice,
    calculatedSavings,
    isDeleting: deleteDialog.loading,
  };
}
