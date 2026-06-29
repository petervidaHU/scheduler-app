import {
  getTenancyAdminEntityCounts,
  type TenancyAdminEntityCounts,
} from "../../repositories/tenancyRepository.server";

export type TenancyAdminEntityCountsResult = {
  source: "database" | "fallback";
  errorMessage: string | null;
  counts: TenancyAdminEntityCounts;
};

const fallbackCounts: TenancyAdminEntityCounts = {
  classroom: 0,
  class: 0,
  specialty: 0,
  subject: 0,
  teacher: 0,
  frame: 0,
};

export async function getTenancyAdminEntityCountsForTenancy(
  tenancyId: string
): Promise<TenancyAdminEntityCountsResult> {
  try {
    const counts = await getTenancyAdminEntityCounts(tenancyId);
    return {
      source: "database",
      errorMessage: null,
      counts,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    return {
      source: "fallback",
      errorMessage: message,
      counts: fallbackCounts,
    };
  }
}