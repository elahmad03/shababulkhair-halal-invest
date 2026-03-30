import { KycStatus } from "@prisma/client";
import { KycDto } from "./kyc.schema";

export class KycMapper {
  static toPersistence(userId: string, dto: KycDto) {
    return {
      userId,
      streetAddress: dto.streetAddress,
      city: dto.city,
      stateRegion: dto.stateRegion,
      countryCode: dto.countryCode,
      dateOfBirth: dto.dateOfBirth,

      avatarUrl: dto.avatarUrl,
      governmentIdType: dto.governmentIdType,
      idCardFrontUrl: dto.idCardFrontUrl,
      idCardBackUrl: dto.idCardBackUrl,

      nextOfKinName: dto.nextOfKinName,
      nextOfKinRelationship: dto.nextOfKinRelationship,
      nextOfKinPhone: dto.nextOfKinPhone,

      kycStatus: KycStatus.PENDING_REVIEW,
      submittedAt: new Date(),
    };
  }
}