import { Badge } from "@/components/ui/badge";

// Backend enum
type ApiStatus =
  | "PENDING"
  | "OPEN_FOR_INVESTMENT"
  | "ACTIVE"
  | "COMPLETED";

// UI config (clean + consistent)
const statusConfig = {
  PENDING: {
    label: "Pending",
    variant: "secondary",
  },
  OPEN_FOR_INVESTMENT: {
    label: "Open for Investment",
    variant: "default",
  },
  ACTIVE: {
    label: "Active",
    variant: "default",
  },
  COMPLETED: {
    label: "Completed",
    variant: "outline",
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
      className={
        status === "OPEN_FOR_INVESTMENT"
          ? "bg-green-600 hover:bg-green-700"
          : status === "ACTIVE"
          ? "bg-blue-600 hover:bg-blue-700"
          : ""
      }
    >
      {config.label}
    </Badge>
  );
}