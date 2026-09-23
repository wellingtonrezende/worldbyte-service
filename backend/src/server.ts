import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import { ZodError } from 'zod';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { organizationRoutes } from "./modules/organizations/organization.routes.js";


const app = Fastify({ logger: true });

app.decorate('prisma', prisma);
app.decorate('config', {
  JWT_REFRESH_SECRET: env.JWT_REFRESH_SECRET
});

await app.register(cors, {
  origin: env.FRONTEND_ORIGIN,
  credentials: true
});

await app.register(helmet);
await app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute'
});

await app.register(jwt, {
  secret: env.JWT_ACCESS_SECRET
});

app.get('/health', async () => ({
  status: 'ok',
  service: 'worldbyte-service-api'
}));

await app.register(authRoutes, { prefix: '/api/auth' });

await app.register(organizationRoutes, {
  prefix: "/api/organizations",
});

app.setErrorHandler((error, _request, reply) => {
  if (error instanceof ZodError) {
    return reply.code(400).send({
      message: 'Dados inválidos.',
      issues: error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }))
    });
  }

  app.log.error(error);
  return reply.code(500).send({
    message: 'Ocorreu um erro interno. Tente novamente.'
  });
});

const start = async () => {
  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

async function shutdown() {
  await prisma.$disconnect();
  await app.close();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();
