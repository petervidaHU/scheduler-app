import { prisma } from "../db/prisma.server";

export type TenancyAggregateCounts = {
  tenancies: number;
  users: number;
  memberships: number;
  activeMemberships: number;
  teachers: number;
  classes: number;
  timeslots: number;
  schedules: number;
};

export type TenancyAdminEntityCounts = {
  classroom: number;
  class: number;
  specialty: number;
  subject: number;
  teacher: number;
  frame: number;
};

export async function getTenancyAggregateCounts(): Promise<TenancyAggregateCounts> {
  const [
    tenancies,
    users,
    memberships,
    activeMemberships,
    teachers,
    classes,
    timeslots,
    schedules,
  ] = await prisma.$transaction([
    prisma.tenancy.count(),
    prisma.user.count(),
    prisma.tenancyMember.count(),
    prisma.tenancyMember.count({ where: { isActive: true } }),
    prisma.teacher.count(),
    prisma.class.count(),
    prisma.timeslot.count(),
    prisma.schedule.count(),
  ]);

  return {
    tenancies,
    users,
    memberships,
    activeMemberships,
    teachers,
    classes,
    timeslots,
    schedules,
  };
}

export async function getTenancyAdminEntityCounts(
  tenancyId: string
): Promise<TenancyAdminEntityCounts> {
  const [classroom, classCount, specialty, subject, teacher, frame] = await prisma.$transaction([
    prisma.classroom.count({ where: { tenancyId } }),
    prisma.class.count({ where: { tenancyId } }),
    prisma.specialty.count({ where: { tenancyId } }),
    prisma.subject.count({ where: { tenancyId } }),
    prisma.teacher.count({ where: { tenancyId } }),
    prisma.frame.count({ where: { tenancyId } }),
  ]);

  return {
    classroom,
    class: classCount,
    specialty,
    subject,
    teacher,
    frame,
  };
}
