import KYCForm from '@/components/kyc/kycForm';
import KYCStatus from '@/components/kyc/kycStatus';

export default function KYCPage() {
  return (
    <main className="py-8">
      <h1 className="text-xl font-semibold text-center mb-6">KYC Verification</h1>
      <KYCForm />
      <KYCStatus/>
    </main>
  );
}
