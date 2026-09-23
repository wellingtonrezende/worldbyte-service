import { z } from "zod";

const optionalString = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((value) => value || null);

export const createCustomerSchema = z.object({
  type: z.enum(["INDIVIDUAL", "BUSINESS"]).default("INDIVIDUAL"),

  name: z.string().trim().min(2).max(160),

  cpf: optionalString,
  cnpj: optionalString,

  phone: optionalString,
  whatsapp: optionalString,
  email: z
    .string()
    .trim()
    .email()
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((value) => value || null),

  cep: optionalString,
  address: optionalString,
  number: optionalString,
  complement: optionalString,
  neighborhood: optionalString,
  city: optionalString,
  state: optionalString,

  notes: optionalString,
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const customerIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const customerQuerySchema = z.object({
  search: z.string().trim().optional(),
});