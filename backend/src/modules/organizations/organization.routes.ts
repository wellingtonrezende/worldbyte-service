import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middlewares/auth.js";

export async function organizationRoutes(app: FastifyInstance) {
  app.get(
    "/me",
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      const membership = await app.prisma.organizationMember.findFirst({
        where: {
          userId: request.auth.sub,
          organizationId: request.auth.organizationId,
          active: true,
        },
        include: {
          organization: true,
        },
      });

      if (!membership) {
        return reply.code(403).send({
          message: "Acesso à empresa não autorizado.",
        });
      }

      return {
        organization: {
          id: membership.organization.id,
          legalName: membership.organization.legalName,
          tradeName: membership.organization.tradeName,
          email: membership.organization.email,
          phone: membership.organization.phone,
          whatsapp: membership.organization.whatsapp,
          city: membership.organization.city,
          state: membership.organization.state,
          logoUrl: membership.organization.logoUrl,
          primaryColor: membership.organization.primaryColor,
          secondaryColor: membership.organization.secondaryColor,
        },
        membership: {
          role: membership.role,
        },
      };
    }
  );
}