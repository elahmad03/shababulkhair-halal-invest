// components/admin/users/user-kyc-card.tsx
import { CalendarDays, IdCard, MapPin, Users } from "lucide-react";
import type { UserDetail } from "@/store/modules/user/userApi";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, kycTone, resolveDocumentUrl, titleCase, toneClass } from "../utils";

function Row({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 py-2 first:pt-0 last:pb-0">
      <Icon className="mt-0.5 h-3.5 w-3.5 flex-none text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm">{value || "Not provided"}</p>
      </div>
    </div>
  );
}

function DocumentThumb({ label, src }: { label: string; src?: string }) {
  if (!src) {
    return (
      <div className="flex aspect-[3/2] flex-col items-center justify-center gap-1 rounded-lg border border-dashed bg-muted/40 text-xs text-muted-foreground">
        <IdCard className="h-4 w-4" />
        {label} not on file
      </div>
    );
  }

  return (
    <a
      href={src}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-1.5"
      aria-label={`Open ${label} in full size`}
    >
      <div className="aspect-[3/2] overflow-hidden rounded-lg border bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={label} className="h-full w-full object-cover transition group-hover:opacity-90" />
      </div>
      <span className="text-xs text-muted-foreground group-hover:text-foreground">{label}</span>
    </a>
  );
}

export function UserKycCard({ user }: { user: UserDetail }) {
  const kyc = user.kyc;
  const idFrontSrc = resolveDocumentUrl(kyc?.idCardFrontUrl);
  const idBackSrc = resolveDocumentUrl(kyc?.idCardBackUrl);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm text-muted-foreground">Verification</CardTitle>
        <Badge className={toneClass(kycTone(kyc?.status))}>{titleCase(kyc?.status)}</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="divide-y">
          <Row icon={IdCard} label="Government ID" value={titleCase(kyc?.governmentIdType)} />
          <Row icon={CalendarDays} label="Date of birth" value={formatDate(kyc?.dateOfBirth)} />
          {kyc?.verificationDate && (
            <Row icon={CalendarDays} label="Verified on" value={formatDate(kyc.verificationDate)} />
          )}
          <Row
            icon={MapPin}
            label="Address"
            value={
              [kyc?.streetAddress, kyc?.city, kyc?.stateRegion, kyc?.countryCode]
                .filter(Boolean)
                .join(", ") || undefined
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-3 border-t pt-3">
          <DocumentThumb label="ID front" src={idFrontSrc} />
          <DocumentThumb label="ID back" src={idBackSrc} />
        </div>

        <div className="divide-y border-t pt-1">
          <Row icon={Users} label="Next of kin" value={kyc?.nextOfKinName} />
          <Row icon={Users} label="Relationship" value={titleCase(kyc?.nextOfKinRelationship)} />
          <Row icon={Users} label="Next of kin phone" value={kyc?.nextOfKinPhone} />
        </div>
      </CardContent>
    </Card>
  );
}