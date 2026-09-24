import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import jwt from "@fastify/jwt";
import { ZodError } from "zod";

import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";

import { authRoutes } from "./modules/auth/auth.routes.js";
import { organizationRoutes } from "./modules/organizations/organization.routes.js";
import { customerRoutes } from "./modules/customers/customer.routes.js";
import { quoteRoutes } from "./modules/quotes/quote.routes.js";

declare module "fastify" {
  interface FastifyInstance {
    config: {
      JWT_ACCESS_SECRET: string;
      JWT_REFRESH_SECRET: string;
    };
  }
}

const app = Fastify({
  logger: true,
});

app.decorate("config", {
  JWT_ACCESS_SECRET: env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: env.JWT_REFRESH_SECRET,
});

await app.register(jwt, {
  secret: env.JWT_ACCESS_SECRET,
});

await app.register(cors, {
  origin: env.FRONTEND_ORIGIN,
  credentials: true,
  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],
});

await app.register(helmet);

await app.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
});

app.get("/health", async () => {
  return {
    status: "ok",
    service: "worldbyte-service-api",
  };
});

await app.register(authRoutes, {
  prefix: "/api/auth",
});

await app.register(organizationRoutes, {
  prefix: "/api/organizations",
});

await app.register(customerRoutes, {
  prefix: "/api/customers",
});

await app.register(quoteRoutes, {
  prefix: "/api/quotes",
});

app.setErrorHandler(
  async (error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({
        message: "Dados inválidos.",
        issues: error.issues,
      });
    }

    request.log.error(error);

    return reply.code(500).send({
      message: "Erro interno do servidor.",
    });
  }
);

app.addHook("onClose", async () => {
  await prisma.$disconnect();
});

async function start() {
  try {
    await app.listen({
      port: env.PORT,
      host: "0.0.0.0",
    });

    console.log(
      `WorldByte Service API rodando na porta ${env.PORT}`
    );
  } catch (error) {
    app.log.error(error);

    await prisma.$disconnect();

    process.exit(1);
  }
}

start();