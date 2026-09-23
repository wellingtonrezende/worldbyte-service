import type { FastifyReply, FastifyRequest } from "fastify";

type JwtPayload = {
  sub: string;
  organizationId: string;
  platformRole?: string;
  organizationRole?: string;
};

declare module "fastify" {
  interface FastifyRequest {
    auth: JwtPayload;
  }
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const payload = await request.jwtVerify<JwtPayload>();

    request.auth = payload;
  } catch {
    return reply.code(401).send({
      message: "Sessão inválida ou expirada.",
    });
  }
}
