"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";
import { cn } from "@/lib/utils";

export interface FormSelectOption {
  value: string;
  label: string;
}

export interface FormSelectProps {
  label?: string;
  error?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (val: string) => void;
  options: FormSelectOption[];
  disabled?: boolean;
  className?: string;
}

export function FormSelect({
  label,
  error,
  placeholder = "Select an option",
  value,
  defaultValue,
  onValueChange,
  options,
  disabled,
  className,
}: FormSelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-1.5 text-xs font-medium text-stone-700">
          {label}
        </label>
      )}
      <Select
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger className={cn(error && "border-rose-400", className)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
}
