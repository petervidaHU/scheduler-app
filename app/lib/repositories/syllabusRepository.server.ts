import { prisma } from "../db/prisma.server";

export type SyllabusItemRow = {
  id: string;
  week: number;
  topic: string;
  notes: string | null;
  subject: { id: string; name: string };
  class: { id: string; name: string } | null;
};

export type SyllabusEntityOption = { id: string; name: string };

export async function getSyllabusItems(
  tenancyId: string,
  filters: { subjectId?: string; classId?: string } = {},
): Promise<SyllabusItemRow[]> {
  return prisma.syllabusItem.findMany({
    where: {
      tenancyId,
      ...(filters.subjectId ? { subjectId: filters.subjectId } : {}),
      ...(filters.classId ? { classId: filters.classId } : {}),
    },
    orderBy: [{ week: "asc" }, { subject: { name: "asc" } }],
    select: {
      id: true,
      week: true,
      topic: true,
      notes: true,
      subject: { select: { id: true, name: true } },
      class: { select: { id: true, name: true } },
    },
  });
}

export async function getSyllabusEntityOptions(tenancyId: string): Promise<{
  subjects: SyllabusEntityOption[];
  classes: SyllabusEntityOption[];
}> {
  const [subjects, classes] = await prisma.$transaction([
    prisma.subject.findMany({
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
  return { subjects, classes };
}

export async function createSyllabusItem(args: {
  tenancyId: string;
  subjectId: string;
  classId: string | null;
  week: number;
  topic: string;
  notes: string | null;
}): Promise<{ id: string }> {
  return prisma.syllabusItem.create({
    data: {
      tenancyId: args.tenancyId,
      subjectId: args.subjectId,
      classId: args.classId || null,
      week: args.week,
      topic: args.topic,
      notes: args.notes || null,
    },
    select: { id: true },
  });
}

export async function updateSyllabusItem(args: {
  id: string;
  tenancyId: string;
  subjectId: string;
  classId: string | null;
  week: number;
  topic: string;
  notes: string | null;
}): Promise<void> {
  await prisma.syllabusItem.updateMany({
    where: { id: args.id, tenancyId: args.tenancyId },
    data: {
      subjectId: args.subjectId,
      classId: args.classId || null,
      week: args.week,
      topic: args.topic,
      notes: args.notes || null,
    },
  });
}

export async function deleteSyllabusItem(id: string, tenancyId: string): Promise<void> {
  await prisma.syllabusItem.deleteMany({ where: { id, tenancyId } });
}
