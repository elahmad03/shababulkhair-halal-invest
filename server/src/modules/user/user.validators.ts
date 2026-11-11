import { z } from "zod";

export const updateUserStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED"]),
});

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
  kycStatus: z.string().optional(),
});

export const editUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "DECEASED"]).optional(),
  isEmailVerified: z.boolean().optional(),
  // KYC fields matching database schema
  streetAddress: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  stateRegion: z.string().optional(),
  state: z.string().optional(),
  countryCode: z.string().optional(),
  country: z.string().optional(),
  dateOfBirth: z.string().optional(),
  governmentIdType: z.string().optional(),
  idType: z.string().optional(),
  nextOfKinName: z.string().optional(),
  nextOfKinRelationship: z.string().optional(),
  nextOfKinPhone: z.string().optional(),
  kycStatus: z.enum(["NOT_SUBMITTED", "PENDING_REVIEW", "VERIFIED", "REJECTED"]).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided for edit",
});

export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type EditUserInput = z.infer<typeof editUserSchema>;
