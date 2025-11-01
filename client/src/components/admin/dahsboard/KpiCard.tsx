// /components/admin/dashboard/kpi-card.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type KpiCardProps = {
  title: string;
  value: string;
  icon: ReactNode;
  isActionable?: boolean;
};

export function KpiCard({ title, value, icon, isActionable = false }: KpiCardProps) {
  return (
    <Card className={cn(isActionable && "border-yellow-500/50 bg-yellow-500/5")}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-apple-muted">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold" style={{ fontFamily: 'var(--system-font)' }}>{value}</div>
      </CardContent>
    </Card>
  );
}