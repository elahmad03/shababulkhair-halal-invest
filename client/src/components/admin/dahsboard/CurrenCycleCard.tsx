
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

type CurrentCycleProps = {
  data: {
    id: number;
    name: string;
    progress: number;
    daysRemaining: number;
    capitalRaised: number;
    investorCount: number;
  } | null;
};

export function CurrentCycleCard({ data }: CurrentCycleProps) {
  if (!data) {
    return (
      <Card className="flex h-full items-center justify-center lg:col-span-2">
        <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No active cycle found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>{data.name}</CardTitle>
        <CardDescription>Overview of the current active investment cycle.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span>Progress</span>
            <span>{data.daysRemaining} days remaining</span>
          </div>
          <Progress value={data.progress} />
        </div>
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <p className="text-sm text-muted-foreground">Capital Raised</p>
            <p className="font-semibold">{formatCurrency(data.capitalRaised)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Investors</p>
            <p className="font-semibold">{data.investorCount}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href={`/admin/cycles/${data.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}