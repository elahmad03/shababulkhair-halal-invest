// /components/admin/users/[id]/user-kyc-card.tsx
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserProfile } from "@/schemas/app";

export function UserKycCard({ profile }: { profile: UserProfile | undefined }) {
  if (!profile) return <Card><CardHeader><CardTitle>KYC Details</CardTitle></CardHeader><CardContent><p>No profile submitted.</p></CardContent></Card>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>KYC Details</CardTitle>
        <Badge variant={profile.kycStatus === 'verified' ? 'success' as any : 'secondary'} className="capitalize">{profile.kycStatus}</Badge>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p><strong className="w-32 inline-block">Address:</strong> {`${profile.streetAddress}, ${profile.city}, ${profile.state}`}</p>
        <p><strong className="w-32 inline-block">Date of Birth:</strong> {profile.dateOfBirth?.toLocaleDateString() ?? 'N/A'}</p>
        <p><strong className="w-32 inline-block">ID Type:</strong> <span className="capitalize">{profile.governmentIdType?.replace('_', ' ')}</span></p>
        <p><strong className="w-32 inline-block">ID Number:</strong> {profile.governmentIdNumber}</p>
        <hr className="my-2"/>
        <p><strong className="w-32 inline-block">Next of Kin:</strong> {profile.nextOfKinName}</p>
        <p><strong className="w-32 inline-block">Kin Phone:</strong> {profile.nextOfKinPhoneNumber}</p>
      </CardContent>
    </Card>
  );
}