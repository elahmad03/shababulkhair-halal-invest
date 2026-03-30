import { z } from "zod";

export const submitKycSchema = z.object({
  streetAddress: z.string().min(3),
  city: z.string().min(2),
  stateRegion: z.string().min(2),
  countryCode: z.string().min(2),
  dateOfBirth: z.coerce.date(),

  avatarUrl: z.string().url().optional(),
  governmentIdType: z.string().min(3),

  idCardFrontUrl: z.string().url(),
  idCardBackUrl: z.string().url(),

  nextOfKinName: z.string().min(2),
  nextOfKinRelationship: z.string().min(2),
  nextOfKinPhone: z.string().min(7),
});

export type KycDto = z.infer<typeof submitKycSchema>;