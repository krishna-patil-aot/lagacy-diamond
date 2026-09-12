"use client";

import React from "react";
import Image from "next/image";
import { IDiamond, DiamondShape, DiamondColor, DiamondClarity, DiamondCut, CertificationLab } from "@/types/diamond.types";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { FormSelect, FormSelectOption } from "@/components/ui/FormSelect";
import { useAdminDiamondForm } from "@/hooks/useAdminDiamondForm";
import { formatPrice } from "@/lib/utils";
import { Plus, Trash2, Calculator, Sparkles, Image as ImageIcon } from "lucide-react";

const SHAPE_OPTIONS: FormSelectOption[] = [
  { value: "Round", label: "Round" },
  { value: "Princess", label: "Princess" },
  { value: "Cushion", label: "Cushion" },
  { value: "Emerald", label: "Emerald" },
  { value: "Oval", label: "Oval" },
  { value: "Radiant", label: "Radiant" },
  { value: "Pear", label: "Pear" },
  { value: "Marquise", label: "Marquise" },
  { value: "Asscher", label: "Asscher" },
  { value: "Heart", label: "Heart" },
];

const COLOR_OPTIONS: FormSelectOption[] = [
  { value: "D", label: "D (Colorless)" },
  { value: "E", label: "E (Colorless)" },
  { value: "F", label: "F (Colorless)" },
  { value: "G", label: "G (Near Colorless)" },
  { value: "H", label: "H (Near Colorless)" },
  { value: "I", label: "I (Near Colorless)" },
  { value: "J", label: "J (Near Colorless)" },
  { value: "K", label: "K (Faint Tint)" },
];

const CLARITY_OPTIONS: FormSelectOption[] = [
  { value: "FL", label: "FL (Flawless)" },
  { value: "IF", label: "IF (Internally Flawless)" },
  { value: "VVS1", label: "VVS1" },
  { value: "VVS2", label: "VVS2" },
  { value: "VS1", label: "VS1" },
  { value: "VS2", label: "VS2" },
  { value: "SI1", label: "SI1" },
  { value: "SI2", label: "SI2" },
];

const CUT_OPTIONS: FormSelectOption[] = [
  { value: "Ideal", label: "Ideal" },
  { value: "Excellent", label: "Excellent" },
  { value: "Very Good", label: "Very Good" },
  { value: "Good", label: "Good" },
];

const LAB_OPTIONS: FormSelectOption[] = [
  { value: "GIA", label: "GIA" },
  { value: "IGI", label: "IGI" },
  { value: "AGS", label: "AGS" },
  { value: "HRD", label: "HRD" },
];

const POLISH_OPTIONS: FormSelectOption[] = [
  { value: "Ideal", label: "Ideal" },
  { value: "Excellent", label: "Excellent" },
  { value: "Very Good", label: "Very Good" },
  { value: "Good", label: "Good" },
];

const FLUOR_OPTIONS: FormSelectOption[] = [
  { value: "None", label: "None" },
  { value: "Faint", label: "Faint" },
  { value: "Medium", label: "Medium" },
  { value: "Strong", label: "Strong" },
];

interface AdminDiamondFormModalProps {
  diamond: IDiamond | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminDiamondFormModal({
  diamond,
  isOpen,
  onClose,
  onSuccess,
}: AdminDiamondFormModalProps) {
  const {
    form,
    imageUrlInput,
    setImageUrlInput,
    handleAddImage,
    handleRemoveImage,
    calculatedFinalPrice,
    calculatedSavings,
    isSubmitting,
    formError,
    submitDiamond,
  } = useAdminDiamondForm(diamond, () => {
    onSuccess();
    onClose();
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const images = watch("images") || [];

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
      title={diamond ? "Edit Certified Gemstone" : "Register New Rare Diamond"}
      description="Update gemological attributes, certification, and price/discount structures in the vault catalog."
      className="max-w-4xl"
    >
      <form onSubmit={handleSubmit(submitDiamond)} className="space-y-6 pt-2">
        {formError && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
            {formError}
          </div>
        )}

        {/* 1. Basic Identifiers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-xs font-medium text-stone-700">
              Diamond Name / Lot Title *
            </label>
            <Input
              placeholder="e.g. The Celestial Brilliant Round"
              {...register("name")}
              error={errors.name?.message}
            />
          </div>

          <div>
            <label className="block mb-1 text-xs font-medium text-stone-700">
              SKU Identifier *
            </label>
            <Input
              placeholder="e.g. DIA-RND-204-D"
              {...register("sku")}
              error={errors.sku?.message}
            />
          </div>
        </div>

        {/* 2. The 4 Cs (Carat, Shape, Color, Clarity, Cut) */}
        <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800 font-mono">
            <Sparkles className="h-3.5 w-3.5" />
            <span>The 4 Cs Specification</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <FormSelect
                label="Shape *"
                value={watch("shape")}
                onValueChange={(val) => setValue("shape", val as DiamondShape)}
                options={SHAPE_OPTIONS}
                error={errors.shape?.message}
              />
            </div>

            <div>
              <label className="block mb-1 text-xs font-medium text-stone-700">
                Carat Weight (ct) *
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="2.04"
                {...register("carat")}
                error={errors.carat?.message}
              />
            </div>

            <div>
              <FormSelect
                label="Color Grade *"
                value={watch("color")}
                onValueChange={(val) => setValue("color", val as DiamondColor)}
                options={COLOR_OPTIONS}
                error={errors.color?.message}
              />
            </div>

            <div>
              <FormSelect
                label="Clarity Grade *"
                value={watch("clarity")}
                onValueChange={(val) => setValue("clarity", val as DiamondClarity)}
                options={CLARITY_OPTIONS}
                error={errors.clarity?.message}
              />
            </div>

            <div>
              <FormSelect
                label="Cut Grade *"
                value={watch("cut")}
                onValueChange={(val) => setValue("cut", val as DiamondCut)}
                options={CUT_OPTIONS}
                error={errors.cut?.message}
              />
            </div>
          </div>
        </div>

        {/* 3. Pricing, Real-time Discount & Savings Calculator */}
        <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-700 font-mono">
              <Calculator className="h-3.5 w-3.5 text-emerald-600" />
              <span>Valuation & Dynamic Discount Engine</span>
            </div>

            {calculatedSavings > 0 && (
              <span className="text-xs font-mono text-emerald-700 font-semibold">
                Client Saves {formatPrice(calculatedSavings)} ({watch("discountPercentage")}%)
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block mb-1 text-xs font-medium text-stone-700">
                Original Retail Price ($) *
              </label>
              <Input
                type="number"
                step="100"
                placeholder="25000"
                {...register("price")}
                error={errors.price?.message}
              />
            </div>

            <div>
              <label className="block mb-1 text-xs font-medium text-stone-700">
                Promotional Discount (%)
              </label>
              <Input
                type="number"
                min="0"
                max="90"
                placeholder="15"
                {...register("discountPercentage")}
                error={errors.discountPercentage?.message}
              />
            </div>

            <div className="rounded-lg border border-stone-200 bg-white p-3 flex flex-col justify-center shadow-xs">
              <span className="text-[10px] uppercase font-mono text-stone-500">
                Calculated Final Price
              </span>
              <span className="text-xl font-bold font-mono text-stone-900">
                {formatPrice(calculatedFinalPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Certification & Proportions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <FormSelect
              label="Certification Lab *"
              value={watch("lab")}
              onValueChange={(val) => setValue("lab", val as CertificationLab)}
              options={LAB_OPTIONS}
              error={errors.lab?.message}
            />
          </div>

          <div>
            <label className="block mb-1 text-xs font-medium text-stone-700">
              Certificate No. *
            </label>
            <Input
              placeholder="e.g. GIA-2215984310"
              {...register("certificateNumber")}
              error={errors.certificateNumber?.message}
            />
          </div>

          <div>
            <label className="block mb-1 text-xs font-medium text-stone-700">
              Table Percentage (%)
            </label>
            <Input
              type="number"
              step="0.1"
              placeholder="57.0"
              {...register("tablePercentage")}
            />
          </div>

          <div>
            <label className="block mb-1 text-xs font-medium text-stone-700">
              Depth Percentage (%)
            </label>
            <Input
              type="number"
              step="0.1"
              placeholder="61.5"
              {...register("depthPercentage")}
            />
          </div>
        </div>

        {/* Measurements (Length, Width, Depth) */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          <div>
            <label className="block mb-1 text-xs font-medium text-stone-700">
              Length (mm)
            </label>
            <Input type="number" step="0.01" {...register("length")} />
          </div>
          <div>
            <label className="block mb-1 text-xs font-medium text-stone-700">
              Width (mm)
            </label>
            <Input type="number" step="0.01" {...register("width")} />
          </div>
          <div>
            <label className="block mb-1 text-xs font-medium text-stone-700">
              Depth (mm)
            </label>
            <Input type="number" step="0.01" {...register("depth")} />
          </div>
          <div>
            <FormSelect
              label="Polish"
              value={watch("polish")}
              onValueChange={(val) =>
                setValue(
                  "polish",
                  val as "Ideal" | "Excellent" | "Very Good" | "Good"
                )
              }
              options={POLISH_OPTIONS}
            />
          </div>
          <div>
            <FormSelect
              label="Symmetry"
              value={watch("symmetry")}
              onValueChange={(val) =>
                setValue(
                  "symmetry",
                  val as "Ideal" | "Excellent" | "Very Good" | "Good"
                )
              }
              options={POLISH_OPTIONS}
            />
          </div>
          <div>
            <FormSelect
              label="Fluorescence"
              value={watch("fluorescence")}
              onValueChange={(val) =>
                setValue(
                  "fluorescence",
                  val as "None" | "Faint" | "Medium" | "Strong"
                )
              }
              options={FLUOR_OPTIONS}
            />
          </div>
        </div>

        {/* 5. Image Management */}
        <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-700 font-mono">
            <ImageIcon className="h-3.5 w-3.5 text-amber-600" />
            <span>High-Resolution Imagery ({images.length})</span>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Paste image URL (https://images.unsplash.com/...)"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddImage}
              className="flex-shrink-0"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Image
            </Button>
          </div>

          {errors.images && (
            <p className="text-xs text-rose-600">{errors.images.message}</p>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            {images.map((imgUrl, idx) => (
              <div
                key={idx}
                className="group relative h-16 w-16 overflow-hidden rounded-lg border border-stone-300 bg-stone-100"
              >
                <Image
                  src={imgUrl}
                  alt={`Preview ${idx}`}
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute inset-0 flex items-center justify-center bg-rose-950/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove image"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1 text-xs font-medium text-stone-700">
            Gemological Description & Provenance Notes *
          </label>
          <Textarea
            rows={3}
            className="text-xs"
            placeholder="Describe facet proportion, scintillation, and optical dispersion..."
            {...register("description")}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-rose-600 font-medium">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Stock & Featured Switches */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-stone-200">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-stone-700">
                Quantity in Vault:
              </label>
              <input
                type="number"
                min="0"
                className="w-20 rounded-md border border-stone-200 bg-white px-2 py-1 text-xs font-mono text-stone-900"
                {...register("stockQuantity")}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featuredDiamond"
                className="h-4 w-4 rounded border-stone-300 bg-white text-stone-900 focus:ring-stone-400 cursor-pointer"
                {...register("featured")}
              />
              <label
                htmlFor="featuredDiamond"
                className="text-xs font-medium text-stone-700 cursor-pointer"
              >
                Feature in Frontpage Showcase
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="luxury" isLoading={isSubmitting}>
              {diamond ? "Update Diamond" : "Register to Vault"}
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
