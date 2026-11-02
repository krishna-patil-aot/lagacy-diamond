export type SupportedCountryCode =
  | "IN"
  | "US"
  | "GB"
  | "AE"
  | "CH"
  | "CA"
  | "AU"
  | "SG"
  | "DE"
  | "FR"
  | "IT"
  | "SA"
  | "QA"
  | "HK"
  | "JP";

export interface ICountryInfo {
  code: SupportedCountryCode;
  name: string;
  dialCode: string;
  flag: string;
  formatPlaceholder: string;
  nationalLength: number; // typical mobile digits
  mobilePrefixRegex: RegExp;
  formatPattern: (digits: string) => string;
}

export interface IPhoneValidationResult {
  isValid: boolean;
  isMobile: boolean;
  e164: string;
  formattedInternational: string;
  formattedNational: string;
  country?: SupportedCountryCode;
  countryCallingCode?: string;
  error?: string;
}

export interface IPhoneInputProps {
  value: string;
  onChange: (value: string, validation?: IPhoneValidationResult) => void;
  defaultCountry?: SupportedCountryCode;
  country?: SupportedCountryCode;
  onCountryChange?: (country: SupportedCountryCode) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  id?: string;
  name?: string;
  showValidationIcon?: boolean;
}
