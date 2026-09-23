import type { PrismaClient } from '@prisma/client';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
    config: {
      JWT_REFRESH_SECRET: string;
    };
  }
}
