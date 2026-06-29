import { redirect } from "react-router";
import { requireUserSession } from "../../auth/session.server";
import type { UserSessionData } from "../../auth/session.server";

export type TenancyUserSessionData = Omit<UserSessionData, "tenancyId"> & {
  tenancyId: string;
};

export async function requireAuthenticatedUser(args: {
  request: Request;
  locale?: string;
}) {
  return requireUserSession(args);
}

export async function requireTenancyUser(args: {
  request: Request;
  locale?: string;
}): Promise<TenancyUserSessionData> {
  const user = await requireUserSession(args);

  if (!user.tenancyId) {
    const localePrefix = args.locale ? `/${args.locale}` : "";
    throw redirect(`${localePrefix}/onboarding`);
  }

  return {
    ...user,
    tenancyId: user.tenancyId,
  };
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
