"use client";

import React from "react";
import {
  DiamondShape,
  DiamondColor,
  DiamondCut,
  DiamondClarity,
} from "@/types/diamond.types";
import { useFilterStore } from "@/store/useFilterStore";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { formatPrice } from "@/lib/utils";
import { RotateCcw, SlidersHorizontal } from "lucide-react";

const SHAPES: { shape: DiamondShape; label: string }[] = [
  { shape: "Round", label: "Round" },
  { shape: "Princess", label: "Princess" },
  { shape: "Cushion", label: "Cushion" },
  { shape: "Emerald", label: "Emerald" },
  { shape: "Oval", label: "Oval" },
  { shape: "Radiant", label: "Radiant" },
  { shape: "Pear", label: "Pear" },
  { shape: "Marquise", label: "Marquise" },
];

const COLORS: DiamondColor[] = ["D", "E", "F", "G", "H", "I", "J", "K"];
const CUTS: DiamondCut[] = ["Ideal", "Excellent", "Very Good", "Good"];
const CLARITIES: DiamondClarity[] = [
  "FL",
  "IF",
  "VVS1",
  "VVS2",
  "VS1",
  "VS2",
  "SI1",
  "SI2",
];

const DISCOUNTS: { value: number; label: string }[] = [
  { value: 0, label: "All Items" },
  { value: 10, label: "10%+ Off" },
  { value: 20, label: "20%+ Off" },
  { value: 30, label: "30%+ Off" },
];

export function DiamondFilterSidebar() {
  const {
    shapes,
    minPrice,
    maxPrice,
    minCarat,
    maxCarat,
    colors,
    cuts,
    clarities,
    minDiscount,
    inStockOnly,
    toggleShape,
    setPriceRange,
    setCaratRange,
    toggleColor,
    toggleCut,
    toggleClarity,
    setMinDiscount,
    setInStockOnly,
    resetFilters,
    activeFilterCount,
  } = useFilterStore();

  const count = activeFilterCount();

  return (
    <div className="w-full space-y-6 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-stone-700" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-900">
            Precision Filter Engine
          </h2>
          {count > 0 && (
            <span className="rounded-full bg-stone-900 px-2 py-0.5 text-[10px] font-mono font-bold text-white">
              {count}
            </span>
          )}
        </div>

        {count > 0 && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
        {/* 1. Visual Shape Selector */}
        <div className="space-y-2">
          <div className="flex justify-between items-center font-medium text-stone-800">
            <span>Diamond Silhouette</span>
            <span className="text-stone-400 font-normal text-[11px]">
              {shapes.length > 0 ? `${shapes.length} active` : "All Shapes"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {SHAPES.map(({ shape, label }) => {
              const isSelected = shapes.includes(shape);
              return (
                <button
                  key={shape}
                  onClick={() => toggleShape(shape)}
                  className={`flex items-center justify-center rounded-lg border px-2 py-1.5 text-xs transition-all ${
                    isSelected
                      ? "border-stone-900 bg-stone-900 text-white font-medium shadow-xs"
                      : "border-stone-200 bg-stone-50/70 text-stone-700 hover:border-stone-300 hover:bg-stone-100"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Price Range & Carat Sliders */}
        <div className="space-y-4">
          {/* Price */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center font-medium text-stone-800">
              <span>Direct Foundry Price</span>
              <span className="font-mono text-stone-900 font-semibold">
                {formatPrice(minPrice)} - {formatPrice(maxPrice)}
              </span>
            </div>
            <Slider
              min={0}
              max={100000}
              step={1000}
              value={[maxPrice]}
              onValueChange={(vals) => setPriceRange(minPrice, vals[0])}
              className="py-1"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-mono">
              <span>$0</span>
              <span>$50k</span>
              <span>$100k+</span>
            </div>
          </div>

          {/* Carat */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center font-medium text-stone-800">
              <span>Carat Weight</span>
              <span className="font-mono text-stone-900 font-semibold">
                {minCarat.toFixed(2)} - {maxCarat.toFixed(2)} ct
              </span>
            </div>
            <Slider
              min={0.3}
              max={10.0}
              step={0.1}
              value={[maxCarat]}
              onValueChange={(vals) => setCaratRange(minCarat, vals[0])}
              className="py-1"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-mono">
              <span>0.30 ct</span>
              <span>5.00 ct</span>
              <span>10.00 ct</span>
            </div>
          </div>
        </div>

        {/* 3. Color (GIA Scale D-K) & Cut */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center font-medium text-stone-800">
              <span>Color Grade</span>
              <span className="text-[10px] text-stone-400">Colorless → Faint</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {COLORS.map((color) => {
                const isSelected = colors.includes(color);
                return (
                  <button
                    key={color}
                    onClick={() => toggleColor(color)}
                    className={`flex h-7 items-center justify-center rounded-lg border text-xs font-mono font-medium transition-all ${
                      isSelected
                        ? "border-stone-900 bg-stone-900 text-white"
                        : "border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-300"
                    }`}
                  >
                    {color}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center font-medium text-stone-800">
              <span>Cut Grade</span>
              <span className="text-[10px] text-stone-400">Light Performance</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {CUTS.map((cut) => {
                const isSelected = cuts.includes(cut);
                return (
                  <button
                    key={cut}
                    onClick={() => toggleCut(cut)}
                    className={`flex items-center justify-center rounded-lg border px-2 py-1 text-xs transition-all ${
                      isSelected
                        ? "border-stone-900 bg-stone-900 text-white font-medium"
                        : "border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-300"
                    }`}
                  >
                    {cut}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. Clarity & Discounts */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center font-medium text-stone-800">
              <span>Clarity Grade</span>
              <span className="text-[10px] text-stone-400">FL → SI2</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {CLARITIES.map((clarity) => {
                const isSelected = clarities.includes(clarity);
                return (
                  <button
                    key={clarity}
                    onClick={() => toggleClarity(clarity)}
                    className={`flex h-7 items-center justify-center rounded-lg border text-[11px] font-mono transition-all ${
                      isSelected
                        ? "border-stone-900 bg-stone-900 text-white font-semibold"
                        : "border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-300"
                    }`}
                  >
                    {clarity}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center font-medium text-stone-800">
              <span>Direct Promotions</span>
              <span className="text-[10px] text-amber-800 font-mono">Foundry Lots</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {DISCOUNTS.map(({ value, label }) => {
                const isSelected = minDiscount === value;
                return (
                  <button
                    key={value}
                    onClick={() => setMinDiscount(value)}
                    className={`flex items-center justify-center rounded-lg border px-2 py-1 text-xs transition-all ${
                      isSelected
                        ? "border-amber-700 bg-amber-50 text-amber-900 font-medium"
                        : "border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-300"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer of filter tray */}
      <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <input
            id="inStockOnly"
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-400 cursor-pointer"
          />
          <label htmlFor="inStockOnly" className="text-stone-700 cursor-pointer select-none">
            Show only immediately available foundry inventory
          </label>
        </div>

        {count > 0 && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="text-stone-500 hover:text-stone-900">
            Clear all {count} active filters
          </Button>
        )}
      </div>
    </div>
  );
}
