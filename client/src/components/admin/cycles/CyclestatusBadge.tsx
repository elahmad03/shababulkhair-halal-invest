import { Badge } from "@/components/ui/badge";

// Backend enum
export type ApiStatus =
  | "PENDING"
  | "OPEN_FOR_INVESTMENT"
  | "ACTIVE"
  | "CLOSING"
  | "COMPLETED";

// UI config with semantic colors
const statusConfig: Record<
  ApiStatus,
  { label: string; variant: "secondary" | "default" | "outline"; className: string }
> = {
  PENDING: {
    label: "Pending",
    variant: "secondary",
    className: "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200",
  },
  OPEN_FOR_INVESTMENT: {
    label: "Open for Investment",
    variant: "default",
    className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200",
  },
  ACTIVE: {
    label: "Active",
    variant: "default",
    className: "bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200",
  },
  CLOSING: {
    label: "Closing Window",
    variant: "default",
    className: "bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-200",
  },
  COMPLETED: {
    label: "Completed",
    variant: "outline",
    className: "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200",
  },
};

interface CycleStatusBadgeProps {
  status: string | null | undefined;
}

export function CycleStatusBadge({ status }: CycleStatusBadgeProps) {
  if (!status) return null;

  const normalized = status.toUpperCase().trim() as ApiStatus;
  const config = statusConfig[normalized];

  if (!config) {
    return <Badge variant="outline">{status}</Badge>;
  }

  return (
    <Badge
      variant={config.variant}
      className={config.className}
    >
      {config.label}
    </Badge>
  );
}