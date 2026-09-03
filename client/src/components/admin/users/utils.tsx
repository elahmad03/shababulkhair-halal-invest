// components/admin/users/utils.ts

export function initials(first?: string, last?: string) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?";
}

export function titleCase(value?: string) {
  if (!value) return "—";
  return value
    .toLowerCase()
    .split(/[_\s]+/)
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

// No wallet currency comes back from the API — infer it from the member's
// country so a Nigerian member's figures render in ₦ rather than a hardcoded $.
export function currencyForCountry(code?: string) {
  return code === "NG" ? "NGN" : "USD";
}

export function money(amount: number | string | undefined, currencyCode = "NGN") {
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat(currencyCode === "NGN" ? "en-NG" : "en-US", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(
  iso?: string,
  opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }
) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", opts).format(d);
}

export type Tone = "success" | "warning" | "danger" | "neutral";

const TONE_CLASS: Record<Tone, string> = {
  success: "border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400",
  danger: "border-transparent bg-destructive/10 text-destructive",
  neutral: "border-transparent bg-muted text-muted-foreground",
};

export function toneClass(tone: Tone) {
  return TONE_CLASS[tone];
}

export function accountTone(status?: string): Tone {
  const v = (status ?? "").toUpperCase();
  if (v === "ACTIVE") return "success";
  if (v === "SUSPENDED") return "warning";
  if (v === "BANNED") return "danger";
  return "neutral";
}

export function kycTone(status?: string): Tone {
  const v = (status ?? "").toUpperCase();
  if (["APPROVED", "VERIFIED"].includes(v)) return "success";
  if (["PENDING", "SUBMITTED", "IN_REVIEW"].includes(v)) return "warning";
  if (v === "REJECTED") return "danger";
  return "neutral";
}

export function investmentTone(status?: string): Tone {
  const v = (status ?? "").toUpperCase();
  if (["ACTIVE", "CONFIRMED", "COMPLETED", "SUCCESS"].includes(v)) return "success";
  if (["PENDING", "PROCESSING"].includes(v)) return "warning";
  if (["FAILED", "REJECTED", "CANCELLED"].includes(v)) return "danger";
  return "neutral";
}

// Cloudinary "authenticated" delivery URLs already carry a signed token and
// are viewable as-is for a window of time. This is the one seam to change
// if/when a dedicated signed-URL endpoint needs to be called instead.
export function resolveDocumentUrl(url?: string | null) {
  return url ?? undefined;
}