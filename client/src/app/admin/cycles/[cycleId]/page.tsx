import { Suspense, use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import CycleDetailsContent from "@/components/admin/cycles/details/CycleDetailsContent";
import CycleDetailsLoading from "@/components/admin/cycles/details/CycleDetailsloading";

type Props = {
  params: Promise<{ cycleId: string }>;
};

export default function CycleDetailsPage({ params }: Props) {
  const { cycleId } = use(params);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <Link href="/admin/cycles">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cycles
          </Button>
        </Link>

        <h1 className="text-3xl font-bold">Cycle Details</h1>
      </div>

      <Suspense fallback={<CycleDetailsLoading />}>
        <CycleDetailsContent cycleId={cycleId} />
      </Suspense>
    </div>
  );
}