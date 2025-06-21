
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Currency formatting utility for components that don't have access to hooks
export const formatCurrencyStatic = (amount: number, currencySymbol: string = '£') => {
  return `${currencySymbol}${amount.toFixed(2)}`;
};
