import { prisma } from "../db/prisma.server";

export type ScheduleListRecord = {
  id: string;
  name: string;
  isPublished: boolean;
  updatedAt: Date;
  frameName: string;
  entryCount: number;
};

export async function listSchedulesByTenancyId(tenancyId: string): Promise<ScheduleListRecord[]> {
  const schedules = await prisma.schedule.findMany({
    where: { tenancyId },
    include: {
      frame: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          entries: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return schedules.map((schedule) => ({
    id: schedule.id,
    name: schedule.name,
    isPublished: schedule.isPublished,
    updatedAt: schedule.updatedAt,
    frameName: schedule.frame.name,
    entryCount: schedule._count.entries,
  }));
}

export async function listFramesByTenancyId(tenancyId: string) {
  return prisma.frame.findMany({
    where: { tenancyId },
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
    },
    orderBy: [{ startDate: "asc" }, { name: "asc" }],
  });
}

export async function findScheduleByIdForTenancy(args: { scheduleId: string; tenancyId: string }) {
  const { scheduleId, tenancyId } = args;

  return prisma.schedule.findFirst({
    where: {
      id: scheduleId,
      tenancyId,
    },
    select: {
      id: true,
      name: true,
      frameId: true,
      isPublished: true,
      updatedAt: true,
    },
  });
}

export async function createScheduleForTenancy(args: {
  tenancyId: string;
  name: string;
  frameId: string;
  isPublished: boolean;
}) {
  const { tenancyId, name, frameId, isPublished } = args;

  return prisma.schedule.create({
    data: {
      tenancyId,
      name,
      frameId,
      isPublished,
    },
    select: {
      id: true,
      name: true,
      frameId: true,
      isPublished: true,
      updatedAt: true,
    },
  });
}

export async function updateScheduleForTenancy(args: {
  scheduleId: string;
  tenancyId: string;
  name: string;
  frameId: string;
  isPublished: boolean;
}) {
  const { scheduleId, tenancyId, name, frameId, isPublished } = args;

  return prisma.schedule.updateMany({
    where: {
      id: scheduleId,
      tenancyId,
    },
    data: {
      name,
      frameId,
      isPublished,
    },
  });
}
