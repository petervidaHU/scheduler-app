import { calculateTenancyOverview } from "../../domain/tenancy/calculateTenancyOverview";
import {
  getTenancyAggregateCounts,
  type TenancyAggregateCounts,
} from "../../repositories/tenancyRepository.server";

export type TenancyOverviewResult = {
  source: "database" | "fallback";
  errorMessage: string | null;
  overview: ReturnType<typeof calculateTenancyOverview>;
};

const fallbackCounts: TenancyAggregateCounts = {
  tenancies: 0,
  users: 0,
  memberships: 0,
  activeMemberships: 0,
  teachers: 0,
  classes: 0,
  timeslots: 0,
  schedules: 0,
};

export async function getTenancyOverview(): Promise<TenancyOverviewResult> {
  try {
    const counts = await getTenancyAggregateCounts();
    return {
      source: "database",
      errorMessage: null,
      overview: calculateTenancyOverview(counts),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    return {
      source: "fallback",
      errorMessage: message,
      overview: calculateTenancyOverview(fallbackCounts),
    };
  }
}
