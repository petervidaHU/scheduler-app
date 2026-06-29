import {
  getScheduleWithPlannerData,
  getPlannerEntityOptions,
  createTimeslotAndEntry,
  removeScheduleEntry,
  type PlannerSchedule,
  type PlannerOptions,
} from "../../repositories/plannerRepository.server";

// ─── Loader ───────────────────────────────────────────────────────────────────

export type PlannerLoaderData = {
  schedule: PlannerSchedule;
  options: PlannerOptions;
};

export async function loadPlannerData(
  scheduleId: string,
  tenancyId: string,
): Promise<PlannerLoaderData | null> {
  const [schedule, options] = await Promise.all([
    getScheduleWithPlannerData(scheduleId, tenancyId),
    getPlannerEntityOptions(tenancyId),
  ]);

  if (!schedule) return null;

  return { schedule, options };
}

// ─── Add entry ───────────────────────────────────────────────────────────────

type AddEntryErrors = Partial<Record<"dayOfWeek" | "startMinute" | "endMinute" | "form", string>>;

export type AddEntryResult =
  | { ok: true; entryId: string }
  | { ok: false; errors: AddEntryErrors };

export async function addPlannerEntry(args: {
  tenancyId: string;
  scheduleId: string;
  frameId: string;
  formData: FormData;
}): Promise<AddEntryResult> {
  const errors: AddEntryErrors = {};

  const dayOfWeek = Number(args.formData.get("dayOfWeek") ?? "");
  if (!Number.isFinite(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
    errors.dayOfWeek = "Day of week must be 0 (Mon) to 6 (Sun).";
  }

  const startMinute = Number(args.formData.get("startMinute") ?? "");
  if (!Number.isFinite(startMinute) || startMinute < 0 || startMinute > 1439) {
    errors.startMinute = "Start time must be a valid minute (0–1439).";
  }

  const endMinute = Number(args.formData.get("endMinute") ?? "");
  if (!Number.isFinite(endMinute) || endMinute < 0 || endMinute > 1439) {
    errors.endMinute = "End time must be a valid minute (0–1439).";
  }

  if (!errors.startMinute && !errors.endMinute && endMinute <= startMinute) {
    errors.endMinute = "End time must be after start time.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const classId = String(args.formData.get("classId") ?? "").trim() || null;
  const subjectId = String(args.formData.get("subjectId") ?? "").trim() || null;
  const teacherId = String(args.formData.get("teacherId") ?? "").trim() || null;
  const classroomId = String(args.formData.get("classroomId") ?? "").trim() || null;

  try {
    const result = await createTimeslotAndEntry({
      tenancyId: args.tenancyId,
      scheduleId: args.scheduleId,
      frameId: args.frameId,
      dayOfWeek,
      startMinute,
      endMinute,
      classId,
      subjectId,
      teacherId,
      classroomId,
    });

    return { ok: true, entryId: result.entryId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { ok: false, errors: { form: `Failed to add lesson: ${message}` } };
  }
}

// ─── Remove entry ─────────────────────────────────────────────────────────────

export type RemoveEntryResult =
  | { ok: true }
  | { ok: false; error: string };

export async function removePlannerEntry(args: {
  entryId: string;
  tenancyId: string;
}): Promise<RemoveEntryResult> {
  const entryId = args.entryId.trim();
  if (!entryId) {
    return { ok: false, error: "Entry ID is required." };
  }

  try {
    await removeScheduleEntry({ entryId, tenancyId: args.tenancyId });
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { ok: false, error: `Failed to remove lesson: ${message}` };
  }
}
