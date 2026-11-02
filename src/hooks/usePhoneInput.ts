"use client";

import { useState, useCallback, useMemo } from "react";
import {
  validateMobileNumber,
  formatPhoneAsYouType,
  detectCountryFromPhone,
  POPULAR_COUNTRIES,
  extractDigits,
} from "@/lib/phone-validation";
import {
  SupportedCountryCode,
  ICountryInfo,
  IPhoneValidationResult,
} from "@/types/phone.types";

export interface IUsePhoneInputOptions {
  initialValue?: string;
  defaultCountry?: SupportedCountryCode;
  country?: SupportedCountryCode;
  onValidChange?: (validation: IPhoneValidationResult) => void;
  onCountryChange?: (country: SupportedCountryCode) => void;
}

export interface IUsePhoneInputReturn {
  country: SupportedCountryCode;
  countryInfo: ICountryInfo;
  availableCountries: ICountryInfo[];
  displayValue: string;
  e164Value: string;
  validation: IPhoneValidationResult;
  isValid: boolean;
  error?: string;
  setCountry: (country: SupportedCountryCode) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setPhoneNumber: (value: string) => void;
  resetPhone: () => void;
}

export function usePhoneInput(options: IUsePhoneInputOptions = {}): IUsePhoneInputReturn {
  const {
    initialValue = "",
    defaultCountry = "IN",
    country: controlledCountry,
    onValidChange,
    onCountryChange,
  } = options;

  const detectedInitial = useMemo(() => {
    return detectCountryFromPhone(initialValue, controlledCountry || defaultCountry);
  }, [initialValue, controlledCountry, defaultCountry]);

  // Internal state for uncontrolled usage or user override
  const [internalCountry, setInternalCountry] = useState<SupportedCountryCode>(
    controlledCountry || detectedInitial.country
  );

  // Synchronize internal country with controlled prop changes during render (no useEffect)
  const [prevControlledCountry, setPrevControlledCountry] = useState<SupportedCountryCode | undefined>(
    controlledCountry
  );
  if (controlledCountry !== prevControlledCountry) {
    setPrevControlledCountry(controlledCountry);
    if (controlledCountry) {
      setInternalCountry(controlledCountry);
    }
  }

  const activeCountry = controlledCountry || internalCountry;

  const [displayValue, setDisplayValue] = useState<string>(() => {
    return initialValue ? formatPhoneAsYouType(initialValue, activeCountry) : "";
  });

  // Reformat display value when active country changes during render
  const [prevActiveCountry, setPrevActiveCountry] = useState<SupportedCountryCode>(activeCountry);
  if (prevActiveCountry !== activeCountry) {
    setPrevActiveCountry(activeCountry);
    if (displayValue && !displayValue.startsWith("+")) {
      setDisplayValue(formatPhoneAsYouType(displayValue, activeCountry));
    }
  }

  // Adjust displayValue during render when initialValue changes externally
  const [prevInitialValue, setPrevInitialValue] = useState<string>(initialValue);
  if (initialValue !== prevInitialValue) {
    setPrevInitialValue(initialValue);
    const cleanDigits = extractDigits(initialValue);
    const cleanCurrent = extractDigits(displayValue);
    if (cleanDigits !== cleanCurrent) {
      const detected = detectCountryFromPhone(initialValue, activeCountry);
      setDisplayValue(initialValue ? formatPhoneAsYouType(initialValue, detected.country) : "");
      if (!controlledCountry && detected.country !== internalCountry) {
        setInternalCountry(detected.country);
      }
    }
  }

  const countryInfo = useMemo<ICountryInfo>(() => {
    return (
      POPULAR_COUNTRIES.find((c) => c.code === activeCountry) || POPULAR_COUNTRIES[0]
    );
  }, [activeCountry]);

  const validation = useMemo<IPhoneValidationResult>(() => {
    return validateMobileNumber(displayValue, activeCountry);
  }, [displayValue, activeCountry]);

  const handleApplyValue = useCallback(
    (raw: string, currentCountry: SupportedCountryCode) => {
      // Auto-detect country switch if user types a new + dial code
      let targetCountry = currentCountry;
      if (raw.startsWith("+")) {
        const detected = detectCountryFromPhone(raw, currentCountry);
        if (detected.country !== currentCountry) {
          targetCountry = detected.country;
          setInternalCountry(detected.country);
          if (onCountryChange) {
            onCountryChange(detected.country);
          }
        }
      }

      const formatted = formatPhoneAsYouType(raw, targetCountry);
      setDisplayValue(formatted);

      const result = validateMobileNumber(formatted, targetCountry);
      if (onValidChange) {
        onValidChange(result);
      }
    },
    [onValidChange, onCountryChange]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleApplyValue(e.target.value, activeCountry);
    },
    [activeCountry, handleApplyValue]
  );

  const setCountry = useCallback(
    (newCountry: SupportedCountryCode) => {
      setInternalCountry(newCountry);
      if (onCountryChange) {
        onCountryChange(newCountry);
      }
      if (displayValue && !displayValue.startsWith("+")) {
        const reformatted = formatPhoneAsYouType(displayValue, newCountry);
        setDisplayValue(reformatted);
      }
    },
    [displayValue, onCountryChange]
  );

  const setPhoneNumber = useCallback(
    (value: string) => {
      handleApplyValue(value, activeCountry);
    },
    [activeCountry, handleApplyValue]
  );

  const resetPhone = useCallback(() => {
    setDisplayValue("");
    setInternalCountry(defaultCountry);
  }, [defaultCountry]);

  const digits = extractDigits(displayValue);

  return {
    country: activeCountry,
    countryInfo,
    availableCountries: POPULAR_COUNTRIES,
    displayValue,
    e164Value: validation.isValid ? validation.e164 : displayValue,
    validation,
    isValid: validation.isValid,
    error: digits.length >= 3 && !validation.isValid ? validation.error : undefined,
    setCountry,
    handleInputChange,
    setPhoneNumber,
    resetPhone,
  };
}
