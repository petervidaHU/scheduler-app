import { redirect } from "react-router";
import { requireUserSession } from "../../auth/session.server";
import type { UserSessionData } from "../../auth/session.server";
import { findActiveMembership } from "../../repositories/userAuthRepository.server";

export type TenancyRole = "OWNER" | "ADMIN" | "MEMBER";

export type TenancyUserSessionData = Omit<UserSessionData, "tenancyId" | "role"> & {
  tenancyId: string;
  role: TenancyRole;
};

export async function requireAuthenticatedUser(args: {
  request: Request;
  locale?: string;
}) {
  return requireUserSession(args);
}

// The cookie is only a claim: membership and role are re-checked against the
// database on every request so revocations and demotions apply immediately.
export async function requireTenancyUser(args: {
  request: Request;
  locale?: string;
}): Promise<TenancyUserSessionData> {
  const user = await requireUserSession(args);
  const localePrefix = args.locale ? `/${args.locale}` : "";

  if (!user.tenancyId) {
    throw redirect(`${localePrefix}/onboarding`);
  }

  const membership = await findActiveMembership({
    userId: user.userId,
    tenancyId: user.tenancyId,
  });

  if (!membership) {
    throw redirect(`${localePrefix}/switch-tenancy`);
  }

  return {
    userId: user.userId,
    email: user.email,
    tenancyId: user.tenancyId,
    role: membership.role,
  };
}

export async function requireTenancyRole(args: {
  request: Request;
  locale?: string;
  allowedRoles: TenancyRole[];
}): Promise<TenancyUserSessionData> {
  const user = await requireTenancyUser(args);

  if (!args.allowedRoles.includes(user.role)) {
    throw new Response("Forbidden", { status: 403 });
  }

  return user;
}

// For onboarding and switch-tenancy: user must be logged in.
// If they already have a tenancy, redirect them to the main area.
export async function requireOnboardingUser(args: {
  request: Request;
  locale?: string;
  allowWithTenancy?: boolean;
}): Promise<UserSessionData> {
  const user = await requireUserSession(args);

  if (!args.allowWithTenancy && user.tenancyId) {
    const localePrefix = args.locale ? `/${args.locale}` : "";
    throw redirect(`${localePrefix}/my-tenancy`);
  }

  return user;
}
