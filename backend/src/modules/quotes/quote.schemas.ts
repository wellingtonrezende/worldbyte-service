import { z } from "zod";

const optionalString = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((value) => value || null);

const quoteItemSchema = z.object({
  description: z
    .string()
    .trim()
    .min(2, "Informe a descrição do item.")
    .max(500),

  quantity: z.coerce
    .number()
    .positive("A quantidade deve ser maior que zero."),

  unitPrice: z.coerce
    .number()
    .min(0, "O valor unitário não pode ser negativo."),

  sortOrder: z.coerce
    .number()
    .int()
    .min(0)
    .optional(),
});

export const createQuoteSchema = z.object({
  customerId: z.string().uuid(),

  title: z
    .string()
    .trim()
    .min(2, "Informe o título do orçamento.")
    .max(200),

  description: optionalString,

  discount: z.coerce
    .number()
    .min(0, "O desconto não pode ser negativo.")
    .default(0),

  validUntil: z
    .string()
    .datetime()
    .optional()
    .nullable(),

  notes: optionalString,
  terms: optionalString,

  items: z
    .array(quoteItemSchema)
    .min(1, "Adicione pelo menos um item ao orçamento."),
});

export const updateQuoteSchema = z.object({
  customerId: z.string().uuid().optional(),

  title: z
    .string()
    .trim()
    .min(2)
    .max(200)
    .optional(),

  description: optionalString,

  discount: z.coerce
    .number()
    .min(0)
    .optional(),

  validUntil: z
    .string()
    .datetime()
    .optional()
    .nullable(),

  notes: optionalString,
  terms: optionalString,

  items: z
    .array(quoteItemSchema)
    .min(1)
    .optional(),
});

export const quoteIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const quoteQuerySchema = z.object({
  search: z.string().trim().optional(),

  status: z
    .enum([
      "DRAFT",
      "SENT",
      "APPROVED",
      "REJECTED",
      "EXPIRED",
      "CANCELED",
    ])
    .optional(),

  customerId: z.string().uuid().optional(),
});

export const updateQuoteStatusSchema = z.object({
  status: z.enum([
    "DRAFT",
    "SENT",
    "APPROVED",
    "REJECTED",
    "EXPIRED",
    "CANCELED",
  ]),
});