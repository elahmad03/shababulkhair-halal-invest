import { z } from "zod";

export const createKycSchema = z.object({
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  stateRegion: z.string().optional(),
  countryCode: z.string().optional(),
  dateOfBirth: z.coerce.date().optional(),

  avatarUrl: z.url().optional(),
  governmentIdType: z.string().optional(),

  idCardFrontUrl: z.url(),
  idCardBackUrl: z.url(),

  nextOfKinName: z.string().min(2),
  nextOfKinRelationship: z.string().min(2),
  nextOfKinPhone: z.string().min(7),
});

export type CreateKycDto = z.infer<typeof createKycSchema>;