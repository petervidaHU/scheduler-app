import {
  createScheduleForTenancy,
  findScheduleByIdForTenancy,
  listFramesByTenancyId,
  listSchedulesByTenancyId,
  updateScheduleForTenancy,
} from "../../repositories/scheduleRepository.server";

function isUniqueConstraintError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeCode = (error as { code?: unknown }).code;
  return maybeCode === "P2002";
}

export type FrameOption = {
  id: string;
  label: string;
};

export type ScheduleListItem = {
  id: string;
  name: string;
  frameName: string;
  isPublished: boolean;
  entryCount: number;
  updatedAtIso: string;
};

export type ScheduleFormInput = {
  name: string;
  frameId: string;
  isPublished: boolean;
};

export type ScheduleFormError = {
  fieldErrors: {
    name?: string;
    frameId?: string;
  };
  formError?: string;
};

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

export function validateScheduleInput(input: ScheduleFormInput): ScheduleFormError | null {
  const fieldErrors: ScheduleFormError["fieldErrors"] = {};

  if (!input.name || normalizeName(input.name).length < 3) {
    fieldErrors.name = "Name must be at least 3 characters.";
  }

  if (!input.frameId) {
    fieldErrors.frameId = "Frame is required.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  return null;
}

export async function getScheduleListForTenancy(tenancyId: string): Promise<ScheduleListItem[]> {
  const records = await listSchedulesByTenancyId(tenancyId);

  return records.map((record) => ({
    id: record.id,
    name: record.name,
    frameName: record.frameName,
    isPublished: record.isPublished,
    entryCount: record.entryCount,
    updatedAtIso: record.updatedAt.toISOString(),
  }));
}

export async function getFrameOptionsForTenancy(tenancyId: string): Promise<FrameOption[]> {
  const frames = await listFramesByTenancyId(tenancyId);

  return frames.map((frame) => ({
    id: frame.id,
    label: `${frame.name} (${frame.startDate.toISOString().slice(0, 10)} to ${frame.endDate
      .toISOString()
      .slice(0, 10)})`,
  }));
}

export async function getScheduleForEdit(args: { tenancyId: string; scheduleId: string }) {
  return findScheduleByIdForTenancy(args);
}

export async function createSchedule(args: { tenancyId: string; input: ScheduleFormInput }) {
  const validationError = validateScheduleInput(args.input);
  if (validationError) {
    return { ok: false as const, error: validationError };
  }

  try {
    const schedule = await createScheduleForTenancy({
      tenancyId: args.tenancyId,
      name: normalizeName(args.input.name),
      frameId: args.input.frameId,
      isPublished: args.input.isPublished,
    });

    return { ok: true as const, schedule };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        ok: false as const,
        error: {
          fieldErrors: {
            name: "A schedule with this name already exists in this tenancy.",
          },
        },
      };
    }

    return {
      ok: false as const,
      error: {
        fieldErrors: {},
        formError: error instanceof Error ? error.message : "Failed to create schedule.",
      },
    };
  }
}

export async function updateSchedule(args: {
  tenancyId: string;
  scheduleId: string;
  input: ScheduleFormInput;
}) {
  const validationError = validateScheduleInput(args.input);
  if (validationError) {
    return { ok: false as const, error: validationError };
  }

  try {
    const updated = await updateScheduleForTenancy({
      scheduleId: args.scheduleId,
      tenancyId: args.tenancyId,
      name: normalizeName(args.input.name),
      frameId: args.input.frameId,
      isPublished: args.input.isPublished,
    });

    if (updated.count === 0) {
      return {
        ok: false as const,
        error: {
          fieldErrors: {},
          formError: "Schedule not found in current tenancy.",
        },
      };
    }

    return { ok: true as const };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        ok: false as const,
        error: {
          fieldErrors: {
            name: "A schedule with this name already exists in this tenancy.",
          },
        },
      };
    }

    return {
      ok: false as const,
      error: {
        fieldErrors: {},
        formError: error instanceof Error ? error.message : "Failed to update schedule.",
      },
    };
  }
}
