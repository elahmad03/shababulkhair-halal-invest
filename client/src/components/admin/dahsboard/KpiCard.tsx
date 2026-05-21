// /components/admin/dashboard/kpi-card.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

type KpiCardProps = {
  title: string;
  value: string | null;
  icon: ReactNode;
  isActionable?: boolean;
  isError?: boolean;
};

export function KpiCard({ title, value, icon, isActionable = false, isError = false }: KpiCardProps) {
  return (
    <Card
      className={cn(
        isActionable && "border-yellow-500/50 bg-yellow-500/5",
        isError && "border-red-500/50 bg-red-500/5"
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {isError ? <AlertCircle className="h-4 w-4 text-red-500" /> : icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold" style={{ fontFamily: 'var(--system-font)' }}>
          {value ?? "—"}
        </div>
      </CardContent>
    </Card>
  );
}