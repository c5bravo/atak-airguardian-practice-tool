import { z } from "zod";

export const CallsignListSchema = z.object({
  callsign: z.string(),
  roles: z.array(z.string()),
  extra: z.unknown(),
  revoked: z.string().nullable(),
});
export type CallsignList = z.infer<typeof CallsignListSchema>;

export const PeopleListSchema = z.object({
  callsign_list: z.array(CallsignListSchema),
});
export type PeopleList = z.infer<typeof PeopleListSchema>;
