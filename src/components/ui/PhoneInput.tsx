"use client";

import React, { useId } from "react";
import { Check, Phone, AlertCircle } from "lucide-react";
import { usePhoneInput } from "@/hooks/usePhoneInput";
import { IPhoneInputProps, SupportedCountryCode } from "@/types/phone.types";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { cn } from "@/lib/utils";

export const PhoneInput: React.FC<IPhoneInputProps> = ({
  value,
  onChange,
  defaultCountry = "IN",
  country: controlledCountry,
  onCountryChange,
  label,
  placeholder,
  required = false,
  disabled = false,
  error: customError,
  className,
  id,
  name = "phone",
  showValidationIcon = true,
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  const {
    country,
    countryInfo,
    availableCountries,
    displayValue,
    isValid,
    error: hookError,
    setCountry,
    handleInputChange,
  } = usePhoneInput({
    initialValue: value,
    defaultCountry,
    country: controlledCountry,
    onCountryChange,
    onValidChange: (res) => {
      // Pass the normalized E.164 number if valid, or the formatted value
      onChange(res.isValid ? res.e164 : res.formattedInternational || value, res);
    },
  });

  const displayError = customError || hookError;

  return (
    <div className={cn("w-full space-y-1.5 font-sans", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <Label htmlFor={inputId} className="text-xs font-medium text-stone-700">
            {label} {required && <span className="text-amber-700">*</span>}
          </Label>
          {showValidationIcon && isValid && displayValue && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 font-medium animate-in fade-in duration-200">
              <Check className="h-3 w-3 stroke-[2.5]" />
              <span>Valid Mobile</span>
            </span>
          )}
        </div>
      )}

      <div
        className={cn(
          "relative flex items-center rounded-xl border bg-white shadow-2xs transition-all",
          displayError
            ? "border-rose-400 focus-within:ring-1 focus-within:ring-rose-400"
            : isValid && displayValue
              ? "border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-400"
              : "border-stone-200 focus-within:border-amber-600 focus-within:ring-1 focus-within:ring-amber-600",
          disabled && "opacity-50 cursor-not-allowed bg-stone-50"
        )}
      >
        {/* Country Code Selector */}
        <div className="shrink-0 border-r border-stone-200">
          <Select
            value={country}
            onValueChange={(val) => setCountry(val as SupportedCountryCode)}
            disabled={disabled}
          >
            <SelectTrigger
              className="h-10 px-2.5 sm:px-3 text-xs bg-stone-50/70 hover:bg-stone-100/70 border-0 rounded-l-xl rounded-r-none focus:ring-0 focus:border-0 cursor-pointer text-stone-800"
              aria-label="Select Country Code"
            >
              <SelectValue>
                <span className="flex items-center gap-1.5 font-mono text-xs">
                  <span className="text-base leading-none">{countryInfo.flag}</span>
                  <span className="font-semibold text-stone-700">{countryInfo.dialCode}</span>
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-60 bg-white border border-stone-200 shadow-xl rounded-xl z-50">
              {availableCountries.map((c) => (
                <SelectItem
                  key={c.code}
                  value={c.code}
                  className="text-xs py-2 cursor-pointer focus:bg-amber-50"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{c.flag}</span>
                    <span className="font-medium text-stone-800">{c.name}</span>
                    <span className="font-mono text-stone-400 ml-auto">{c.dialCode}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Phone Icon Decoration */}
        <Phone className="h-3.5 w-3.5 text-stone-400 ml-2.5 shrink-0 hidden xs:block" />

        {/* Formatted Number Input */}
        <input
          id={inputId}
          name={name}
          type="tel"
          autoComplete="tel"
          value={displayValue}
          onChange={(e) => {
            handleInputChange(e);
            onChange(e.target.value);
          }}
          disabled={disabled}
          placeholder={placeholder || countryInfo.formatPlaceholder}
          className="flex-1 h-10 px-2.5 sm:px-3 text-xs sm:text-sm text-stone-900 bg-transparent placeholder:text-stone-400 focus:outline-hidden disabled:cursor-not-allowed font-sans"
        />

        {/* Inline Status Icon */}
        <div className="pr-3 shrink-0 flex items-center">
          {isValid && displayValue ? (
            <div
              className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700"
              title="Verified standard mobile number"
            >
              <Check className="h-3 w-3 stroke-[2.5]" />
            </div>
          ) : displayError && displayValue ? (
            <div
              className="h-5 w-5 rounded-full bg-rose-100 flex items-center justify-center text-rose-600"
              title={displayError}
            >
              <AlertCircle className="h-3 w-3" />
            </div>
          ) : null}
        </div>
      </div>

      {displayError && (
        <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1 animate-in fade-in duration-150">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>{displayError}</span>
        </p>
      )}

      {/* Helpful Hint on standard international format */}
      {!displayError && !isValid && displayValue && (
        <p className="text-[10px] text-stone-400 font-mono">
          Standard format: {countryInfo.dialCode} {countryInfo.formatPlaceholder}
        </p>
      )}
    </div>
  );
};
