// components/admin/cycles/cycle-status-badge.tsx
import { Badge } from "@/components/ui/badge";
import { InvestmentCycle } from "@/db";

type CycleStatus = InvestmentCycle["status"];

interface CycleStatusBadgeProps {
  status: CycleStatus;
}

export function CycleStatusBadge({ status }: CycleStatusBadgeProps) {
  const statusConfig = {
    pending: {
      label: "Pending",
      className: "bg-slate-100 text-slate-700 hover:bg-slate-100",
    },
    open: {
      label: "Open for Investment",
      className: "bg-green-100 text-green-700 hover:bg-green-100",
    },
    open_for_investment: {
      label: "Open for Investment",
      className: "bg-green-100 text-green-700 hover:bg-green-100",
    },
    active: {
      label: "Active",
      className: "bg-blue-100 text-blue-700 hover:bg-blue-100",
    },
    completed: {
      label: "Completed",
      className: "bg-slate-100 text-slate-500 hover:bg-slate-100",
    },
  };

  const config = status != null ? statusConfig[status] : statusConfig.pending;

  return (
    <Badge className={config.className} variant="secondary">
      {config.label}
    </Badge>
  );
}