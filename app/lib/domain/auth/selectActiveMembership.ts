export type MembershipCandidate = {
  role: "OWNER" | "ADMIN" | "MEMBER";
  tenancyId: string;
};

const rolePriority: Record<MembershipCandidate["role"], number> = {
  OWNER: 3,
  ADMIN: 2,
  MEMBER: 1,
};

export function selectActiveMembership(
  memberships: MembershipCandidate[],
): MembershipCandidate | null {
  if (memberships.length === 0) {
    return null;
  }

  return memberships
    .slice()
    .sort((a, b) => rolePriority[b.role] - rolePriority[a.role])[0];
}
