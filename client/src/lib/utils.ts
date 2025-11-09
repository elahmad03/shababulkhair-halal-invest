import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}



/**
 * Convert a value stored in kobo (bigint | string | number) to NGN number.
 * Returns a JS number representing NGN (e.g., 100000 -> 1000.00 NGN when input is 100000 kobo)
 */
export function koboToNgn(value: number | bigint | string | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === 'bigint') return Number(value) / 100;
  if (typeof value === 'number') return value / 100; // treat numeric input as kobo by default
  const parsed = parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed / 100 : 0;
}

/**
 * Format currency for display. Input may be:
 * - bigint (interpreted as kobo)
 * - number (interpreted as NGN if fraction present, otherwise treated as kobo for backward compat)
 * - string (numeric string in kobo)
 * To keep behavior predictable, when a bigint is provided it's treated as kobo and converted.
 */
export function formatCurrency(amount: number | bigint | string | null | undefined): string {
  let ngnValue: number;
  if (amount == null) ngnValue = 0;
  else if (typeof amount === 'bigint') ngnValue = Number(amount) / 100;
  else if (typeof amount === 'number') {
    // Distinguish between callers passing NGN (with decimals) vs kobo as whole numbers.
    // If the number has a fractional part, assume it's already NGN. Otherwise treat as kobo.
    ngnValue = Number.isInteger(amount) ? amount / 100 : amount;
  } else {
    // string
    const parsed = parseFloat(amount);
    ngnValue = Number.isFinite(parsed) ? parsed / 100 : 0;
  }

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(ngnValue);
}


export function parseMarkdownToJson(markdownText: string): unknown | null {
  const regex = /```json\n([\s\S]+?)\n```/;
  const match = markdownText.match(regex);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1]);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return null;
    }
  }
  console.error("No valid JSON found in markdown text.");
  return null;
}

export function getFirstWord(input: string = ""): string {
  return input.trim().split(/\s+/)[0] || "";
}

// Format key function for converting camelCase to Title Case
export const formatKey = (key: string) => {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
};

/**
 * Formats a cycle month string (YYYY-MM) to a more readable format, e.g., "2025-05" => "May 2025"
 */
export function formatCycleMonth(cycleMonth: string): string {
  if (!cycleMonth) return "-";
  const [year, month] = cycleMonth.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleString("default", { month: "long", year: "numeric" });
}

/**
 * Formats a JS date string or Date object to 'YYYY-MM'.
 * Accepts ISO date string or Date object.
 */
export function formatDateToYYYYMM(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Capitalizes the first letter of each word in a name
 * Example: "john doe" => "John Doe"
 */
export function formatName(name: string): string {
  if (!name) return "";
  return name
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}