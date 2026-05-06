import { Badge } from "@/components/ui/badge";

// Backend enum
type ApiStatus =
  | "PENDING"
  | "OPEN_FOR_INVESTMENT"
  | "ACTIVE"
  | "COMPLETED";

// UI config with semantic colors
const statusConfig = {
  PENDING: {
    label: "Pending",
    variant: "secondary" as const,
    className: "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200",
  },
  OPEN_FOR_INVESTMENT: {
    label: "Open for Investment",
    variant: "default" as const,
    className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200",
  },
  ACTIVE: {
    label: "Active",
    variant: "default" as const,
    className: "bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200",
  },
  COMPLETED: {
    label: "Completed",
    variant: "outline" as const,
    className: "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200",
  },
} as const;

interface CycleStatusBadgeProps {
  status: ApiStatus | null;
}

export function CycleStatusBadge({ status }: CycleStatusBadgeProps) {
  if (!status) return null;

  const config = statusConfig[status];

  if (!config) return null;

  return (
    <Badge
      variant={config.variant}
      className={config.className}
    >
      {config.label}
    </Badge>
  );
}