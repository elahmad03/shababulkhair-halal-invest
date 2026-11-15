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
  { label: string; variant: "secondary" | "default" | "outline"; className?: string }
> = {
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
    variant: "secondary",
  },
  CLOSING: {
    label: "Closing Window",
    variant: "outline",
    className: "border-primary text-primary",
  },
  COMPLETED: {
    label: "Completed",
    variant: "outline",
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
