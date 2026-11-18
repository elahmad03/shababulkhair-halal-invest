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


/**
 * Calculates human-friendly duration between two dates (e.g. "3 Months", "1 Month", "2 Weeks", "5 Days").
 * Properly accounts for calendar months (e.g. Jan 1 to Mar 31 = 3 Months, Feb 1 to Feb 28 = 1 Month)
 * rather than truncating with naive 30-day divisions.
 */
export function formatDuration(
  start?: string | Date | null,
  end?: string | Date | null,
  fallback = "-"
): string {
  if (!start || !end) return fallback;
  const s = typeof start === "string" ? new Date(start) : start;
  const e = typeof end === "string" ? new Date(end) : end;
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return fallback;

  const startDay = s.getDate();
  const endDay = e.getDate();
  const lastDayOfEndMonth = new Date(e.getFullYear(), e.getMonth() + 1, 0).getDate();

  // If start is 1st of month and end is last day of month (e.g. Jan 1 to Mar 31)
  if (startDay === 1 && endDay >= lastDayOfEndMonth - 1) {
    const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) + 1;
    if (months > 0) return `${months} Month${months > 1 ? "s" : ""}`;
  }

  // Same day of month (e.g. Jan 15 to Apr 15)
  if (Math.abs(endDay - startDay) <= 2) {
    const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
    if (months > 0) return `${months} Month${months > 1 ? "s" : ""}`;
  }

  // General case by elapsed days
  const diffTime = Math.abs(e.getTime() - s.getTime());
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  const approxMonths = Math.round(diffDays / 30.4375);
  if (approxMonths >= 1) {
    return `${approxMonths} Month${approxMonths > 1 ? "s" : ""}`;
  }

  const weeks = Math.round(diffDays / 7);
  if (weeks >= 1) {
    return `${weeks} Week${weeks > 1 ? "s" : ""}`;
  }

  return `${diffDays} Day${diffDays > 1 ? "s" : ""}`;
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

/**
 * Convert NGN (Naira) amount to the format expected by API.
 * The server will handle the kobo conversion (NGN * 100).
 * This ensures the user input (e.g., 10000 NGN) is sent as-is.
 * Example: 10000 (NGN) => 10000 (sent to API)
 */
export function ngnToApiAmount(ngnAmount: string | number): number {
  const amount = typeof ngnAmount === 'string' ? parseFloat(ngnAmount) : ngnAmount;
  if (!Number.isFinite(amount)) {
    throw new Error(`Invalid NGN amount: ${ngnAmount}`);
  }
  return Math.round(amount);
}