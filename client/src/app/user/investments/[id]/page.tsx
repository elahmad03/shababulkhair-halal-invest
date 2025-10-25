import { getInvestmentPageData } from "@/lib/data/data";
import { notFound } from "next/navigation";
import { InvestmentForm } from "@/components/user/invest/InvestmentForm";

interface InvestmentPageProps {
  params: { id: string };
}

export default async function InvestmentPage({ params }: InvestmentPageProps) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    notFound();
  }

  // NOTE: In a real app, you would get the logged-in user's ID from your auth session.
  // For this example, we'll hardcode a user ID. Let's use Aisha Bello (ID 7).
  const currentUserId = 3; 
  
  const data = await getInvestmentPageData(currentUserId, id);

  if (!data) {
    notFound();
  }

  const { cycle, wallet } = data;

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Invest in "{cycle.name}"</h2>
        <p className="text-muted-foreground">
          Complete your investment by specifying the number of shares you wish to purchase.
        </p>
      </div>
      <div className="pt-4">
        <InvestmentForm cycle={cycle} wallet={wallet} />
      </div>
    </div>
  );
}