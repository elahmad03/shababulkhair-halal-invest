import { Badge } from "@/components/ui/badge";
import type { InvestmentCycle } from "@/db/types";

// FIX: Use NonNullable to remove 'null' from the possible types
type CycleStatus = NonNullable<InvestmentCycle["status"]>;

const statusConfig: Record<
  CycleStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pending: {
    label: "Pending",
    variant: "secondary",
  },
  open_for_investment: {
    label: "Open for Investment",
    variant: "default",
  },
  active: {
    label: "Active",
    variant: "default",
  },
  completed: {
    label: "Completed",
    variant: "outline",
  },
};

interface CycleStatusBadgeProps {
  // It's okay for the prop to be null, we just have to guard against it
  status: InvestmentCycle["status"];
}

export function CycleStatusBadge({ status }: CycleStatusBadgeProps) {
  // Guard clause: if status is null, don't render anything
  if (!status) return null;

  // Now TypeScript knows 'status' here is not null
  const config = statusConfig[status];

  if (!config) return null;

  return (
    <Badge
      variant={config.variant}
      className={
        status === "open_for_investment"
          ? "bg-green-600 hover:bg-green-700"
          : status === "active"
          ? "bg-blue-600 hover:bg-blue-700"
          : ""
      }
    >
      {config.label}
    </Badge>
  );
}