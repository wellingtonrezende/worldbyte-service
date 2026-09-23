import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce
    .number()
    .default(3333),

  DATABASE_URL: z
    .string()
    .min(1),

  JWT_ACCESS_SECRET: z
    .string()
    .min(16),

  JWT_REFRESH_SECRET: z
    .string()
    .min(16),

  ACCESS_TOKEN_TTL: z
    .string()
    .default("15m"),

  REFRESH_TOKEN_TTL_DAYS: z.coerce
    .number()
    .int()
    .positive()
    .default(30),

  FRONTEND_ORIGIN: z
    .string()
    .url(),
});

export const env = schema.parse(process.env);