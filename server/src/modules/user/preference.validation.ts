import { z } from "zod";

export const updatePreferenceSchema = z.object({
  autoReinvest: z
    .boolean()
    .refine((v) => typeof v === "boolean", {
      message: "autoReinvest must be true or false",
    }),
});

export type UpdatePreferenceInput = z.infer<typeof updatePreferenceSchema>;
