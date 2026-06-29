import { prisma } from "../../db/prisma.server";

export type TimeslotOptions = {
  frames: Array<{ value: string; label: string }>;
  subjects: Array<{ value: string; label: string }>;
  teachers: Array<{ value: string; label: string }>;
  classrooms: Array<{ value: string; label: string }>;
  classes: Array<{ value: string; label: string }>;
};

export type TimeslotListItem = {
  id: string;
  frameId: string;
  subjectId: string | null;
  teacherId: string | null;
  classroomId: string | null;
  classId: string | null;
  dayOfWeek: number;
  startMinute: number;
  endMinute: number;
  frameName: string;
};

export type TimeslotActionResult = {
  ok: boolean;
  intent: "create" | "update" | "delete";
  mode?: "single" | "template";
  message: string;
};

function asOptionalString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asRequiredString(value: FormDataEntryValue | null, field: string) {
  const parsed = asOptionalString(value);
  if (!parsed) {
    throw new Error(`${field} is required.`);
  }
  return parsed;
}

function asRequiredInt(value: FormDataEntryValue | null, field: string) {
  const parsed = Number(asRequiredString(value, field));
  if (!Number.isInteger(parsed)) {
    throw new Error(`${field} must be an integer.`);
  }
  return parsed;
}

function validateTimeWindow(startMinute: number, endMinute: number) {
  if (startMinute < 0 || startMinute >= 24 * 60) {
    throw new Error("Start minute must be between 0 and 1439.");
  }

  if (endMinute <= 0 || endMinute > 24 * 60) {
    throw new Error("End minute must be between 1 and 1440.");
  }

  if (endMinute <= startMinute) {
    throw new Error("End time must be after start time.");
  }
}

function parseMode(value: FormDataEntryValue | null): "single" | "template" {
  const mode = asOptionalString(value);
  if (mode === "single" || mode === "template") {
    return mode;
  }
  throw new Error("Unsupported timeslot mode.");
}

function parseTimeslotUpdateInput(formData: FormData) {
  const frameId = asRequiredString(formData.get("frameId"), "Frame");
  const dayOfWeek = asRequiredInt(formData.get("dayOfWeek"), "Day of week");
  const startHour = asRequiredInt(formData.get("startHour"), "Start hour");
  const startMinutePart = asRequiredInt(formData.get("startMinutePart"), "Start minute");
  const endHour = asRequiredInt(formData.get("endHour"), "End hour");
  const endMinutePart = asRequiredInt(formData.get("endMinutePart"), "End minute");

  const startMinute = startHour * 60 + startMinutePart;
  const endMinute = endHour * 60 + endMinutePart;

  validateTimeWindow(startMinute, endMinute);

  return {
    frameId,
    dayOfWeek,
    startMinute,
    endMinute,
    subjectId: asOptionalString(formData.get("subjectId")),
    teacherId: asOptionalString(formData.get("teacherId")),
    classroomId: asOptionalString(formData.get("classroomId")),
    classId: asOptionalString(formData.get("classId")),
  };
}

export async function getTimeslotOptions(tenancyId: string): Promise<TimeslotOptions> {
  const [frames, subjects, teachers, classrooms, classes] = await prisma.$transaction([
    prisma.frame.findMany({
      where: { tenancyId },
      orderBy: [{ startDate: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
    prisma.subject.findMany({
      where: { tenancyId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.teacher.findMany({
      where: { tenancyId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.classroom.findMany({
      where: { tenancyId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.class.findMany({
      where: { tenancyId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return {
    frames: frames.map((item) => ({ value: item.id, label: item.name })),
    subjects: subjects.map((item) => ({ value: item.id, label: item.name })),
    teachers: teachers.map((item) => ({ value: item.id, label: item.name })),
    classrooms: classrooms.map((item) => ({ value: item.id, label: item.name })),
    classes: classes.map((item) => ({ value: item.id, label: item.name })),
  };
}

export async function getTimeslotListForTenancy(tenancyId: string): Promise<TimeslotListItem[]> {
  const rows = await prisma.timeslot.findMany({
    where: { tenancyId },
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
      frameId: true,
      subjectId: true,
      teacherId: true,
      classroomId: true,
      classId: true,
      dayOfWeek: true,
      startMinute: true,
      endMinute: true,
      frame: {
        select: {
          name: true,
        },
      },
    },
    take: 50,
  });

  return rows.map((row) => ({
    id: row.id,
    frameId: row.frameId,
    subjectId: row.subjectId,
    teacherId: row.teacherId,
    classroomId: row.classroomId,
    classId: row.classId,
    dayOfWeek: row.dayOfWeek,
    startMinute: row.startMinute,
    endMinute: row.endMinute,
    frameName: row.frame.name,
  }));
}

export async function createTimeslotFromForm(args: {
  tenancyId: string;
  formData: FormData;
}): Promise<TimeslotActionResult> {
  const mode = parseMode(args.formData.get("mode"));

  if (mode === "single") {
    const parsed = parseTimeslotUpdateInput(args.formData);

    await prisma.timeslot.create({
      data: {
        tenancyId: args.tenancyId,
        frameId: parsed.frameId,
        dayOfWeek: parsed.dayOfWeek,
        startMinute: parsed.startMinute,
        endMinute: parsed.endMinute,
        subjectId: parsed.subjectId,
        teacherId: parsed.teacherId,
        classroomId: parsed.classroomId,
        classId: parsed.classId,
      },
    });

    return {
      ok: true,
      intent: "create",
      mode,
      message: "Timeslot created.",
    };
  }

  const frameId = asRequiredString(args.formData.get("frameId"), "Frame");
  const dayOfWeek = asRequiredInt(args.formData.get("dayOfWeek"), "Day of week");
  const startHour = asRequiredInt(args.formData.get("startHour"), "Start hour");
  const startMinutePart = asRequiredInt(args.formData.get("startMinutePart"), "Start minute");
  const slotLength = asRequiredInt(args.formData.get("slotLength"), "Slot length");
  const slotCount = asRequiredInt(args.formData.get("slotCount"), "Slot count");

  if (slotLength < 1) {
    throw new Error("Slot length must be greater than 0.");
  }

  if (slotCount < 1 || slotCount > 20) {
    throw new Error("Slot count must be between 1 and 20.");
  }

  const templateStartMinute = startHour * 60 + startMinutePart;

  const createPayload = Array.from({ length: slotCount }).map((_, idx) => {
    const startMinute = templateStartMinute + idx * slotLength;
    const endMinute = startMinute + slotLength;

    validateTimeWindow(startMinute, endMinute);

    return {
      tenancyId: args.tenancyId,
      frameId,
      dayOfWeek,
      startMinute,
      endMinute,
      subjectId: asOptionalString(args.formData.get("subjectId")),
      teacherId: asOptionalString(args.formData.get("teacherId")),
      classroomId: asOptionalString(args.formData.get("classroomId")),
      classId: asOptionalString(args.formData.get("classId")),
    };
  });

  await prisma.timeslot.createMany({
    data: createPayload,
  });

  return {
    ok: true,
    intent: "create",
    mode,
    message: `${slotCount} template timeslots created.`,
  };
}

export async function updateTimeslotFromForm(args: {
  tenancyId: string;
  formData: FormData;
}): Promise<TimeslotActionResult> {
  const timeslotId = asRequiredString(args.formData.get("timeslotId"), "Timeslot");
  const parsed = parseTimeslotUpdateInput(args.formData);

  const result = await prisma.timeslot.updateMany({
    where: {
      id: timeslotId,
      tenancyId: args.tenancyId,
    },
    data: {
      frameId: parsed.frameId,
      dayOfWeek: parsed.dayOfWeek,
      startMinute: parsed.startMinute,
      endMinute: parsed.endMinute,
      subjectId: parsed.subjectId,
      teacherId: parsed.teacherId,
      classroomId: parsed.classroomId,
      classId: parsed.classId,
    },
  });

  if (result.count === 0) {
    throw new Error("Timeslot not found for tenancy.");
  }

  return {
    ok: true,
    intent: "update",
    message: "Timeslot updated.",
  };
}

export async function deleteTimeslotForTenancy(args: {
  tenancyId: string;
  timeslotId: string;
}): Promise<TimeslotActionResult> {
  const result = await prisma.timeslot.deleteMany({
    where: {
      id: args.timeslotId,
      tenancyId: args.tenancyId,
    },
  });

  if (result.count === 0) {
    throw new Error("Timeslot not found for tenancy.");
  }

  return {
    ok: true,
    intent: "delete",
    message: "Timeslot deleted.",
  };
}