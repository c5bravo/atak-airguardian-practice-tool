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

export const ProductSchema = z.object({
  dns: z.string(),
  api: z.string(),
  uri: z.string(),
});
export type Product = z.infer<typeof ProductSchema>;

export const InitSchema = z.object({
  base_uri: z.string(),
  csr_jwt: z.string(),
});
export type Init = z.infer<typeof InitSchema>;

export const MtlsSchema = z.object({
  base_uri: z.string(),
});
export type Mtls = z.infer<typeof MtlsSchema>;

export const RasenmaeherSchema = z.object({
  init: InitSchema,
  mtls: MtlsSchema,
  certcn: z.string(),
});
export type Rasenmaeher = z.infer<typeof RasenmaeherSchema>;

export const ManifestSchema = z.object({
  deployment: z.string(),
  rasenmaeher: RasenmaeherSchema,
  product: ProductSchema,
});
export type Manifest = z.infer<typeof ManifestSchema>;
