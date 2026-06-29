import { prisma } from "../db/prisma.server";

// ─── Types ───────────────────────────────────────────────────────────────────

export type PlannerEntry = {
  entryId: string;
  timeslot: {
    id: string;
    dayOfWeek: number;
    startMinute: number;
    endMinute: number;
    class: { id: string; name: string } | null;
    subject: { id: string; name: string } | null;
    teacher: { id: string; name: string } | null;
    classroom: { id: string; name: string } | null;
  };
};

export type PlannerSchedule = {
  id: string;
  name: string;
  frameId: string;
  isPublished: boolean;
  frame: { id: string; name: string } | null;
  entries: PlannerEntry[];
};

export type PlannerEntityOption = { id: string; name: string };

export type PlannerOptions = {
  classes: PlannerEntityOption[];
  subjects: PlannerEntityOption[];
  teachers: PlannerEntityOption[];
  classrooms: PlannerEntityOption[];
};

export type BookedResources = {
  bookedTeacherIds: string[];
  bookedClassroomIds: string[];
};

// ─── Queries ─────────────────────────────────────────────────────────────────

export async function getScheduleWithPlannerData(
  scheduleId: string,
  tenancyId: string,
): Promise<PlannerSchedule | null> {
  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId, tenancyId },
    select: {
      id: true,
      name: true,
      frameId: true,
      isPublished: true,
      frame: { select: { id: true, name: true } },
      entries: {
        select: {
          id: true,
          timeslot: {
            select: {
              id: true,
              dayOfWeek: true,
              startMinute: true,
              endMinute: true,
              class: { select: { id: true, name: true } },
              subject: { select: { id: true, name: true } },
              teacher: { select: { id: true, name: true } },
              classroom: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: [{ timeslot: { dayOfWeek: "asc" } }, { timeslot: { startMinute: "asc" } }],
      },
    },
  });

  if (!schedule) return null;

  return {
    id: schedule.id,
    name: schedule.name,
    frameId: schedule.frameId,
    isPublished: schedule.isPublished,
    frame: schedule.frame,
    entries: schedule.entries.map((e) => ({
      entryId: e.id,
      timeslot: e.timeslot,
    })),
  };
}

export async function getPlannerEntityOptions(tenancyId: string): Promise<PlannerOptions> {
  const [classes, subjects, teachers, classrooms] = await prisma.$transaction([
    prisma.class.findMany({
      where: { tenancyId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.subject.findMany({
      where: { tenancyId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.teacher.findMany({
      where: { tenancyId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.classroom.findMany({
      where: { tenancyId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return { classes, subjects, teachers, classrooms };
}

export async function getBookedResources(args: {
  tenancyId: string;
  frameId: string;
  dayOfWeek: number;
  startMinute: number;
  endMinute: number;
  excludeTimeslotId?: string;
}): Promise<BookedResources> {
  const conflicting = await prisma.timeslot.findMany({
    where: {
      tenancyId: args.tenancyId,
      frameId: args.frameId,
      dayOfWeek: args.dayOfWeek,
      id: args.excludeTimeslotId ? { not: args.excludeTimeslotId } : undefined,
      // Overlapping: existing.start < new.end AND existing.end > new.start
      startMinute: { lt: args.endMinute },
      endMinute: { gt: args.startMinute },
      OR: [{ teacherId: { not: null } }, { classroomId: { not: null } }],
    },
    select: { teacherId: true, classroomId: true },
  });

  const bookedTeacherIds = conflicting
    .map((t) => t.teacherId)
    .filter((id): id is string => id !== null);

  const bookedClassroomIds = conflicting
    .map((t) => t.classroomId)
    .filter((id): id is string => id !== null);

  return { bookedTeacherIds, bookedClassroomIds };
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export type CreateTimeslotEntryArgs = {
  tenancyId: string;
  scheduleId: string;
  frameId: string;
  dayOfWeek: number;
  startMinute: number;
  endMinute: number;
  classId: string | null;
  subjectId: string | null;
  teacherId: string | null;
  classroomId: string | null;
};

export async function createTimeslotAndEntry(
  args: CreateTimeslotEntryArgs,
): Promise<{ entryId: string; timeslotId: string }> {
  return prisma.$transaction(async (tx) => {
    const timeslot = await tx.timeslot.create({
      data: {
        tenancyId: args.tenancyId,
        frameId: args.frameId,
        dayOfWeek: args.dayOfWeek,
        startMinute: args.startMinute,
        endMinute: args.endMinute,
        classId: args.classId,
        subjectId: args.subjectId,
        teacherId: args.teacherId,
        classroomId: args.classroomId,
      },
      select: { id: true },
    });

    const entry = await tx.scheduleEntry.create({
      data: { scheduleId: args.scheduleId, timeslotId: timeslot.id },
      select: { id: true },
    });

    return { entryId: entry.id, timeslotId: timeslot.id };
  });
}

export async function removeScheduleEntry(args: {
  entryId: string;
  tenancyId: string;
}): Promise<void> {
  // Verify ownership via schedule → tenancy
  const entry = await prisma.scheduleEntry.findUnique({
    where: { id: args.entryId },
    select: { timeslotId: true, schedule: { select: { tenancyId: true } } },
  });

  if (!entry || entry.schedule.tenancyId !== args.tenancyId) {
    throw new Error("Entry not found or access denied.");
  }

  // Delete entry and orphaned timeslot in one transaction
  await prisma.$transaction([
    prisma.scheduleEntry.delete({ where: { id: args.entryId } }),
    prisma.timeslot.delete({ where: { id: entry.timeslotId } }),
  ]);
}
