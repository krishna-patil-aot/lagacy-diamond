"use client";

import React from "react";
import { DynamicFormModal } from "@/components/shared/dynamic-form-modal";
import { DIAMOND_FORM_FIELDS } from "@/utils/constants";
import { useDiamondStore } from "@/store/diamond.store";
import { UseSaveDiamondDataReturn } from "@/hooks/use-save-diamond-data";
import { formatPrice } from "@/lib/utils";
import { Calculator, Sparkles } from "lucide-react";

export interface DiamondAddEditModalProps {
  saveHook: UseSaveDiamondDataReturn;
}

export function DiamondAddEditModal({ saveHook }: DiamondAddEditModalProps) {
  const { modal, closeModal } = useDiamondStore();
  const {
    form,
    isSubmitting,
    handleSave,
    calculatedFinalPrice,
    calculatedSavings,
  } = saveHook;

  const isEdit = modal.mode === "edit";
  const title = isEdit ? "Modify Gemstone Record" : "Register New Diamond Lot";
  const description = isEdit
    ? "Update pricing, gemological specs, cut parameters, and certificate inscriptions."
    : "Enroll a newly certified lab-grown diamond lot into the digital vault inventory.";

  const priceCalculationSummary = (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200/80 bg-amber-50/60 p-3 text-xs">
      <div className="flex items-center gap-2 text-stone-700">
        <Calculator className="h-4 w-4 text-amber-600" />
        <span className="font-semibold">Calculated Final Atelier Valuation:</span>
      </div>
      <div className="flex items-center gap-3">
        {calculatedSavings > 0 && (
          <span className="font-mono text-stone-500">
            Savings: <strong className="text-emerald-700 font-semibold">{formatPrice(calculatedSavings)}</strong>
          </span>
        )}
        <span className="font-mono text-sm font-bold text-stone-900 bg-white px-2.5 py-1 rounded-lg border border-amber-300/80 shadow-xs flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-600" />
          {formatPrice(calculatedFinalPrice)}
        </span>
      </div>
    </div>
  );

  return (
    <DynamicFormModal
      isOpen={modal.isOpen}
      onClose={closeModal}
      title={title}
      description={description}
      fields={DIAMOND_FORM_FIELDS}
      form={form}
      onSubmit={handleSave}
      isSubmitting={isSubmitting}
      submitLabel={isEdit ? "Update Diamond Record" : "Register Lot to Vault"}
      calculatedSummary={priceCalculationSummary}
    />
  );
}
