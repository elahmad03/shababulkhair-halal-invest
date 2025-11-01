// /components/admin/users/[id]/user-kyc-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/schemas/app";

function DocumentLinks({ profile }: { profile: UserProfile }) {
  // Mock document URLs on profile for now: profilePictureUrl, idFrontUrl, idBackUrl
  const docs = [
    { label: "Profile Picture", url: (profile as any).profilePictureUrl ?? (profile as any).profilePictureUrl },
    { label: "ID Card Front", url: (profile as any).idCardFrontUrl ?? (profile as any).idCardFrontUrl },
    { label: "ID Card Back", url: (profile as any).idCardBackUrl ?? (profile as any).idCardBackUrl },
  ];

  return (
    <div className="flex flex-col gap-2">
      {docs.map((d) => (
        <a key={d.label} href={d.url ?? "#"} target="_blank" rel="noreferrer" className="text-sm text-emerald-700 hover:underline">
          View {d.label}
        </a>
      ))}
    </div>
  );
}

export function UserKycCard({ profile }: { profile: UserProfile | undefined }) {
  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>KYC Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No profile submitted.</p>
        </CardContent>
      </Card>
    );
  }

  // profile.dateOfBirth in mocks is a string. Be tolerant: show the string as-is when present,
  // otherwise format Date objects if that's what we get.
  const dobRaw = (profile as any).dateOfBirth;
  const dobDisplay = dobRaw
    ? typeof dobRaw === "string"
      ? dobRaw
      : dobRaw instanceof Date
      ? dobRaw.toLocaleDateString()
      : String(dobRaw)
    : "N/A";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Personal Details</CardTitle>
          <Badge className="capitalize">{String(profile.kycStatus)}</Badge>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <p><strong className="inline-block w-28">Address:</strong> {`${profile.streetAddress ?? 'N/A'}, ${profile.city ?? ''} ${profile.state ?? ''}`}</p>
          <p><strong className="inline-block w-28">Date of Birth:</strong> {dobDisplay}</p>
          <p><strong className="inline-block w-28">ID Type:</strong> {profile.governmentIdType ?? 'N/A'}</p>
          <p><strong className="inline-block w-28">ID Number:</strong> {(profile as any).governmentIdNumber ?? 'N/A'}</p>
          <div className="mt-2">
            <DocumentLinks profile={profile} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next of Kin</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <p><strong className="inline-block w-28">Name:</strong> {profile.nextOfKinName ?? 'N/A'}</p>
          <p><strong className="inline-block w-28">Relationship:</strong> {profile.nextOfKinRelationship ?? 'N/A'}</p>
          <p><strong className="inline-block w-28">Phone:</strong> {profile.nextOfKinPhoneNumber ?? 'N/A'}</p>
        </CardContent>
      </Card>
    </div>
  );
}