import { KycForm } from "@/components/user/kyc/kycForm";

export const metadata = {
  title: "Identity Verification ",
  description: "Complete your KYC to unlock full account features.",
};

export default function KycPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-10">
        <KycForm />
      </div>
    </main>
  );
}