import type { TenancyAggregateCounts } from "../../repositories/tenancyRepository.server";

export type TenancyOverview = {
  counts: TenancyAggregateCounts;
  ratios: {
    activeMembershipRate: number;
    schedulesPerTenancy: number;
    timeslotsPerClass: number;
  };
  health: {
    score: number;
    status: "healthy" | "warning" | "empty";
    notes: string[];
  };
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateTenancyOverview(
  counts: TenancyAggregateCounts,
): TenancyOverview {
  const activeMembershipRate =
    counts.memberships === 0 ? 0 : counts.activeMemberships / counts.memberships;
  const schedulesPerTenancy =
    counts.tenancies === 0 ? 0 : counts.schedules / counts.tenancies;
  const timeslotsPerClass = counts.classes === 0 ? 0 : counts.timeslots / counts.classes;

  const notes: string[] = [];
  let score = 100;

  if (counts.tenancies === 0) {
    notes.push("No tenancy exists yet.");
    score -= 60;
  }
  if (counts.activeMemberships === 0) {
    notes.push("No active tenancy memberships found.");
    score -= 20;
  }
  if (counts.classes === 0 || counts.teachers === 0) {
    notes.push("Class and teacher master data is incomplete.");
    score -= 10;
  }
  if (counts.timeslots === 0) {
    notes.push("No timeslots configured yet.");
    score -= 10;
  }

  score = Math.max(0, score);
  const status =
    counts.tenancies === 0
      ? "empty"
      : score >= 80
        ? "healthy"
        : "warning";

  return {
    counts,
    ratios: {
      activeMembershipRate: round2(activeMembershipRate),
      schedulesPerTenancy: round2(schedulesPerTenancy),
      timeslotsPerClass: round2(timeslotsPerClass),
    },
    health: {
      score,
      status,
      notes,
    },
  };
}
