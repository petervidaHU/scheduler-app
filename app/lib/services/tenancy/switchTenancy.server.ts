import {
  getUserMembershipsWithTenancy,
  type UserMembershipWithTenancy,
} from "../../repositories/userAuthRepository.server";

export type { UserMembershipWithTenancy };

export async function getMembershipsForSwitch(
  userId: string,
): Promise<UserMembershipWithTenancy[]> {
  return getUserMembershipsWithTenancy(userId);
}

export type SwitchTenancyResult =
  | { ok: true; tenancyId: string; role: "OWNER" | "ADMIN" | "MEMBER" }
  | { ok: false; error: string };

export function resolveSwitchTarget(args: {
  requestedTenancyId: string;
  memberships: UserMembershipWithTenancy[];
}): SwitchTenancyResult {
  const membership = args.memberships.find((m) => m.tenancyId === args.requestedTenancyId);
  if (!membership) {
    return { ok: false, error: "You do not have access to that school." };
  }
  return { ok: true, tenancyId: membership.tenancyId, role: membership.role };
}
