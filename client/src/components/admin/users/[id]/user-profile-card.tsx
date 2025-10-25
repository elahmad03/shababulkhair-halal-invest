// /components/admin/users/[id]/user-profile-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@/schemas/app";

export function UserProfileCard({ user }: { user: User }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.fullName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p><strong className="w-24 inline-block">Role:</strong> <span className="capitalize">{user.role}</span></p>
        <p><strong className="w-24 inline-block">Email:</strong> {user.email}</p>
        <p><strong className="w-24 inline-block">Phone:</strong> {user.phoneNumber ?? 'N/A'}</p>
      </CardContent>
    </Card>
  );
}