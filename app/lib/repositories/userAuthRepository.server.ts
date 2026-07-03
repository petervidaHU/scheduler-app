import { prisma } from "../db/prisma.server";
import type { MembershipCandidate } from "../domain/auth/selectActiveMembership";

export type AuthUserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  memberships: MembershipCandidate[];
};

export async function findUserByEmailForAuth(
  email: string,
): Promise<AuthUserRecord | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      memberships: {
        where: { isActive: true },
        select: {
          role: true,
          tenancyId: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    passwordHash: user.passwordHash,
    memberships: user.memberships,
  };
}

export async function getTotalUserCount(): Promise<number> {
  return prisma.user.count();
}

export async function findUserByEmail(email: string): Promise<{ id: string } | null> {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true },
  });
}

export async function createUser(args: {
  email: string;
  passwordHash: string;
  name: string;
}): Promise<{ id: string; email: string }> {
  return prisma.user.create({
    data: {
      email: args.email.toLowerCase(),
      passwordHash: args.passwordHash,
      name: args.name,
    },
    select: { id: true, email: true },
  });
}

export type UserMembershipWithTenancy = {
  tenancyId: string;
  tenancyName: string;
  tenancySlug: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
};

export async function getUserMembershipsWithTenancy(
  userId: string,
): Promise<UserMembershipWithTenancy[]> {
  const memberships = await prisma.tenancyMember.findMany({
    where: { userId, isActive: true },
    select: {
      role: true,
      tenancy: {
        select: { id: true, name: true, slug: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return memberships.map((m) => ({
    tenancyId: m.tenancy.id,
    tenancyName: m.tenancy.name,
    tenancySlug: m.tenancy.slug,
    role: m.role,
  }));
}

export async function findActiveMembership(args: {
  userId: string;
  tenancyId: string;
}): Promise<{ role: "OWNER" | "ADMIN" | "MEMBER" } | null> {
  const membership = await prisma.tenancyMember.findUnique({
    where: {
      userId_tenancyId: { userId: args.userId, tenancyId: args.tenancyId },
    },
    select: { role: true, isActive: true },
  });

  if (!membership || !membership.isActive) {
    return null;
  }

  return { role: membership.role };
}

export async function createBootstrapAuthData(args: {
  email: string;
  passwordHash: string;
  tenancyName: string;
  tenancySlug: string;
}) {
  return prisma.$transaction(async (tx) => {
    const tenancy = await tx.tenancy.create({
      data: {
        name: args.tenancyName,
        slug: args.tenancySlug,
      },
      select: { id: true },
    });

    const user = await tx.user.create({
      data: {
        email: args.email.toLowerCase(),
        passwordHash: args.passwordHash,
        name: "Bootstrap Admin",
        memberships: {
          create: {
            role: "OWNER",
            tenancyId: tenancy.id,
            isActive: true,
          },
        },
      },
      select: { id: true, email: true },
    });

    return {
      userId: user.id,
      email: user.email,
      tenancyId: tenancy.id,
      role: "OWNER" as const,
    };
  });
}
