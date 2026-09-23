import type { FastifyInstance } from "fastify";
import {
  loginSchema,
  refreshSchema,
  registerSchema,
} from "./auth.schemas.js";

import {
  registerUser,
  rotateRefreshToken,
  storeRefreshToken,
  validateLogin,
} from "./auth.service.js";

export async function authRoutes(app: FastifyInstance) {
  app.post("/register", async (request, reply) => {
    const input = registerSchema.parse(request.body);

    try {
      const { user, organization } =
        await registerUser(input);

      const accessToken = app.jwt.sign(
        {
          sub: user.id,
          organizationId: organization.id,
          platformRole: user.platformRole,
        },
        {
          expiresIn: "15m",
        }
      );

      const refreshToken = app.jwt.sign(
        {
          sub: user.id,
          type: "refresh",
        },
        {
          expiresIn: "30d",
          key: app.config.JWT_REFRESH_SECRET,
        }
      );

      await storeRefreshToken(
        user.id,
        refreshToken
      );

      return reply.code(201).send({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },

        organization: {
          id: organization.id,
          name:
            organization.tradeName ??
            organization.legalName,
        },

        accessToken,
        refreshToken,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "EMAIL_IN_USE"
      ) {
        return reply.code(409).send({
          message:
            "Este e-mail já está cadastrado.",
        });
      }

      throw error;
    }
  });

  app.post("/login", async (request, reply) => {
    const input = loginSchema.parse(request.body);

    const user = await validateLogin(
      input.email,
      input.password
    );

    if (!user) {
      return reply.code(401).send({
        message: "E-mail ou senha inválidos.",
      });
    }

    const membership = user.memberships[0];

    if (!membership) {
      return reply.code(403).send({
        message:
          "Usuário sem organização ativa.",
      });
    }

    const accessToken = app.jwt.sign(
      {
        sub: user.id,
        organizationId:
          membership.organizationId,
        platformRole: user.platformRole,
        organizationRole: membership.role,
      },
      {
        expiresIn: "15m",
      }
    );

    const refreshToken = app.jwt.sign(
      {
        sub: user.id,
        type: "refresh",
      },
      {
        expiresIn: "30d",
        key: app.config.JWT_REFRESH_SECRET,
      }
    );

    await storeRefreshToken(
      user.id,
      refreshToken
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },

      organization: {
        id: membership.organization.id,
        name:
          membership.organization.tradeName ??
          membership.organization.legalName,
      },

      accessToken,
      refreshToken,
    };
  });

  app.post("/refresh", async (request, reply) => {
    const { refreshToken } =
      refreshSchema.parse(request.body);

    try {
      const payload = app.jwt.verify<{
        sub: string;
        type: string;
      }>(refreshToken, {
        key: app.config.JWT_REFRESH_SECRET,
      });

      if (payload.type !== "refresh") {
        return reply.code(401).send({
          message: "Refresh token inválido.",
        });
      }

      const membership =
        await app.prisma.organizationMember.findFirst({
          where: {
            userId: payload.sub,
            active: true,
          },
        });

      if (!membership) {
        return reply.code(403).send({
          message:
            "Usuário sem organização ativa.",
        });
      }

      const user =
        await app.prisma.user.findUnique({
          where: {
            id: payload.sub,
          },
        });

      if (!user || !user.active) {
        return reply.code(401).send({
          message: "Usuário inválido.",
        });
      }

      const nextRefreshToken = app.jwt.sign(
        {
          sub: user.id,
          type: "refresh",
        },
        {
          expiresIn: "30d",
          key: app.config.JWT_REFRESH_SECRET,
        }
      );

      await rotateRefreshToken(
        user.id,
        refreshToken,
        nextRefreshToken
      );

      const accessToken = app.jwt.sign(
        {
          sub: user.id,
          organizationId:
            membership.organizationId,
          platformRole: user.platformRole,
          organizationRole: membership.role,
        },
        {
          expiresIn: "15m",
        }
      );

      return {
        accessToken,
        refreshToken: nextRefreshToken,
      };
    } catch {
      return reply.code(401).send({
        message:
          "Refresh token inválido ou expirado.",
      });
    }
  });
}