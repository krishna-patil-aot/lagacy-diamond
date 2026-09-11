import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateDiscountedPrice(price: number, discountPercentage: number): number {
  if (!discountPercentage || discountPercentage <= 0) return price;
  const discountAmount = (price * discountPercentage) / 100;
  return Math.round(price - discountAmount);
}

export function formatCarat(carat: number): string {
  return `${carat.toFixed(2)} ct`;
}
