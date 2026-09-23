import crypto from "node:crypto";
import { prisma } from "../../lib/prisma.js";
import { hashPassword, verifyPassword } from "../../lib/password.js";
import { env } from "../../config/env.js";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  organizationName: string;
}) {
  const existing = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  });

  if (existing) {
    throw new Error("EMAIL_IN_USE");
  }

  const passwordHash = await hashPassword(input.password);

  const trialStartedAt = new Date();
  const trialEndsAt = new Date(
    trialStartedAt.getTime() + 7 * 24 * 60 * 60 * 1000
  );

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
      },
    });

    const organization = await tx.organization.create({
      data: {
        legalName: input.organizationName,
        tradeName: input.organizationName,
      },
    });

    await tx.organizationMember.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        role: "ADMIN",
      },
    });

    await tx.subscription.create({
      data: {
        organizationId: organization.id,
        status: "TRIAL",
        trialStartedAt,
        trialEndsAt,
      },
    });

    await tx.auditLog.create({
      data: {
        organizationId: organization.id,
        userId: user.id,
        action: "REGISTER",
        entityType: "Organization",
        entityId: organization.id,
      },
    });

    return {
      user,
      organization,
    };
  });
}

export async function validateLogin(
  email: string,
  password: string
) {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    include: {
      memberships: {
        where: {
          active: true,
        },
        include: {
          organization: true,
        },
      },
    },
  });

  if (!user || !user.active) {
    return null;
  }

  const validPassword = await verifyPassword(
    user.passwordHash,
    password
  );

  if (!validPassword) {
    return null;
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      lastLoginAt: new Date(),
    },
  });

  return user;
}

export async function storeRefreshToken(
  userId: string,
  refreshToken: string
) {
  const expiresAt = new Date(
    Date.now() +
      env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000
  );

  return prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt,
    },
  });
}

export async function rotateRefreshToken(
  userId: string,
  oldToken: string,
  newToken: string
) {
  const oldHash = hashToken(oldToken);

  const stored = await prisma.refreshToken.findUnique({
    where: {
      tokenHash: oldHash,
    },
  });

  if (
    !stored ||
    stored.userId !== userId ||
    stored.revokedAt ||
    stored.expiresAt <= new Date()
  ) {
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  const expiresAt = new Date(
    Date.now() +
      env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000
  );

  return prisma.$transaction([
    prisma.refreshToken.update({
      where: {
        id: stored.id,
      },
      data: {
        revokedAt: new Date(),
      },
    }),

    prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hashToken(newToken),
        expiresAt,
      },
    }),
  ]);
}