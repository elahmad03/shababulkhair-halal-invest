import { getUserProfileDetails } from "@/lib/data/data";
import { notFound } from "next/navigation";
import { UserProfileCard } from "@/components/admin/users/[id]/user-profile-card";
import { UserKycCard } from "@/components/admin/users/[id]/user-kyc-card";
import { UserFinancialsTabs } from "@/components/admin/users/[id]/user-financial-tabs";

interface UserDetailPageProps {
  params: { id: string };
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const userId = parseInt(params.id, 10);
  if (isNaN(userId)) {
    notFound();
  }

  const data = await getUserProfileDetails(userId);

  if (!data) {
    notFound();
  }

  const { user, profile, investments, transactions, withdrawals } = data;

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <h2 className="text-3xl font-bold tracking-tight">User Profile</h2>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-4 lg:col-span-1">
          <UserProfileCard user={user} />
          <UserKycCard profile={profile} />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2">
            <UserFinancialsTabs 
                investments={investments} 
                transactions={transactions} 
                withdrawals={withdrawals} 
            />
        </div>
      </div>
    </div>
  );
}