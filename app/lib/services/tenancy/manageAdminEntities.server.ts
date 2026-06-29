import { prisma } from "../../db/prisma.server";

export type AdminEntityKey =
  | "specialty"
  | "subject"
  | "teacher"
  | "classroom"
  | "class"
  | "frame";

export type AdminFormOptions = {
  specialties: Array<{ value: string; label: string }>;
  teachers: Array<{ value: string; label: string }>;
  classrooms: Array<{ value: string; label: string }>;
};

export type AdminEntityActionResult = {
  ok: boolean;
  entity: AdminEntityKey;
  message: string;
};

export type AdminEntityTableRow = {
  id: string;
  cells: Array<string | number>;
};

export type AdminEntityTableData = {
  specialty: {
    headers: string[];
    rows: AdminEntityTableRow[];
  };
  subject: {
    headers: string[];
    rows: AdminEntityTableRow[];
  };
  teacher: {
    headers: string[];
    rows: AdminEntityTableRow[];
  };
  classroom: {
    headers: string[];
    rows: AdminEntityTableRow[];
  };
  class: {
    headers: string[];
    rows: AdminEntityTableRow[];
  };
  frame: {
    headers: string[];
    rows: AdminEntityTableRow[];
  };
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

function parseEntity(value: FormDataEntryValue | null): AdminEntityKey {
  const entity = asOptionalString(value);
  if (
    entity === "specialty" ||
    entity === "subject" ||
    entity === "teacher" ||
    entity === "classroom" ||
    entity === "class" ||
    entity === "frame"
  ) {
    return entity;
  }

  throw new Error("Unsupported entity.");
}

function toDate(value: FormDataEntryValue | null, field: string) {
  const text = asRequiredString(value, field);
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${field} must be a valid date.`);
  }
  return date;
}

export async function getAdminFormOptions(tenancyId: string): Promise<AdminFormOptions> {
  const [specialties, teachers, classrooms] = await prisma.$transaction([
    prisma.specialty.findMany({
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
  ]);

  return {
    specialties: specialties.map((item) => ({ value: item.id, label: item.name })),
    teachers: teachers.map((item) => ({ value: item.id, label: item.name })),
    classrooms: classrooms.map((item) => ({ value: item.id, label: item.name })),
  };
}

export async function getAdminEntityTableData(
  tenancyId: string,
): Promise<AdminEntityTableData> {
  const [specialties, subjects, teachers, classrooms, classes, frames] =
    await prisma.$transaction([
      prisma.specialty.findMany({
        where: { tenancyId },
        orderBy: { name: "asc" },
        select: { id: true, name: true, code: true },
      }),
      prisma.subject.findMany({
        where: { tenancyId },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          code: true,
          specialty: { select: { name: true } },
        },
      }),
      prisma.teacher.findMany({
        where: { tenancyId },
        orderBy: { name: "asc" },
        select: { id: true, name: true, email: true, code: true },
      }),
      prisma.classroom.findMany({
        where: { tenancyId },
        orderBy: { name: "asc" },
        select: { id: true, name: true, capacity: true },
      }),
      prisma.class.findMany({
        where: { tenancyId },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          code: true,
          specialty: { select: { name: true } },
          teacher: { select: { name: true } },
          classroom: { select: { name: true } },
        },
      }),
      prisma.frame.findMany({
        where: { tenancyId },
        orderBy: [{ startDate: "asc" }, { name: "asc" }],
        select: { id: true, name: true, startDate: true, endDate: true },
      }),
    ]);

  return {
    specialty: {
      headers: ["Id", "Name", "Code"],
      rows: specialties.map((item) => ({
        id: item.id,
        cells: [item.id, item.name, item.code ?? "-"],
      })),
    },
    subject: {
      headers: ["Id", "Name", "Code", "Specialty"],
      rows: subjects.map((item) => ({
        id: item.id,
        cells: [item.id, item.name, item.code ?? "-", item.specialty?.name ?? "-"],
      })),
    },
    teacher: {
      headers: ["Id", "Name", "Email", "Code"],
      rows: teachers.map((item) => ({
        id: item.id,
        cells: [item.id, item.name, item.email ?? "-", item.code ?? "-"],
      })),
    },
    classroom: {
      headers: ["Id", "Name", "Capacity"],
      rows: classrooms.map((item) => ({
        id: item.id,
        cells: [item.id, item.name, item.capacity ?? "-"],
      })),
    },
    class: {
      headers: ["Id", "Name", "Code", "Specialty", "Teacher", "Classroom"],
      rows: classes.map((item) => ({
        id: item.id,
        cells: [
          item.id,
          item.name,
          item.code ?? "-",
          item.specialty?.name ?? "-",
          item.teacher?.name ?? "-",
          item.classroom?.name ?? "-",
        ],
      })),
    },
    frame: {
      headers: ["Id", "Name", "Start", "End"],
      rows: frames.map((item) => ({
        id: item.id,
        cells: [
          item.id,
          item.name,
          item.startDate.toISOString().slice(0, 10),
          item.endDate.toISOString().slice(0, 10),
        ],
      })),
    },
  };
}

export async function createAdminEntity(args: {
  tenancyId: string;
  formData: FormData;
}): Promise<AdminEntityActionResult> {
  const entity = parseEntity(args.formData.get("entity"));

  switch (entity) {
    case "specialty": {
      await prisma.specialty.create({
        data: {
          tenancyId: args.tenancyId,
          name: asRequiredString(args.formData.get("name"), "Specialty name"),
          code: asOptionalString(args.formData.get("code")),
        },
      });

      return { ok: true, entity, message: "Specialty created." };
    }
    case "subject": {
      await prisma.subject.create({
        data: {
          tenancyId: args.tenancyId,
          name: asRequiredString(args.formData.get("name"), "Subject name"),
          code: asOptionalString(args.formData.get("code")),
          specialtyId: asOptionalString(args.formData.get("specialtyId")),
        },
      });

      return { ok: true, entity, message: "Subject created." };
    }
    case "teacher": {
      await prisma.teacher.create({
        data: {
          tenancyId: args.tenancyId,
          name: asRequiredString(args.formData.get("name"), "Teacher name"),
          email: asOptionalString(args.formData.get("email")),
          code: asOptionalString(args.formData.get("code")),
        },
      });

      return { ok: true, entity, message: "Teacher created." };
    }
    case "classroom": {
      const capacityRaw = asOptionalString(args.formData.get("capacity"));
      const parsedCapacity = capacityRaw ? Number(capacityRaw) : null;

      if (
        capacityRaw &&
        (parsedCapacity === null || !Number.isFinite(parsedCapacity) || parsedCapacity < 1)
      ) {
        throw new Error("Classroom capacity must be a positive number.");
      }

      await prisma.classroom.create({
        data: {
          tenancyId: args.tenancyId,
          name: asRequiredString(args.formData.get("name"), "Classroom name"),
          capacity: parsedCapacity,
        },
      });

      return { ok: true, entity, message: "Classroom created." };
    }
    case "class": {
      await prisma.class.create({
        data: {
          tenancyId: args.tenancyId,
          name: asRequiredString(args.formData.get("name"), "Class name"),
          code: asOptionalString(args.formData.get("code")),
          specialtyId: asOptionalString(args.formData.get("specialtyId")),
          teacherId: asOptionalString(args.formData.get("teacherId")),
          classroomId: asOptionalString(args.formData.get("classroomId")),
        },
      });

      return { ok: true, entity, message: "Class created." };
    }
    case "frame": {
      const startDate = toDate(args.formData.get("startDate"), "Start date");
      const endDate = toDate(args.formData.get("endDate"), "End date");

      if (endDate < startDate) {
        throw new Error("End date must be greater than or equal to start date.");
      }

      await prisma.frame.create({
        data: {
          tenancyId: args.tenancyId,
          name: asRequiredString(args.formData.get("name"), "Frame name"),
          startDate,
          endDate,
        },
      });

      return { ok: true, entity, message: "Frame created." };
    }
  }
}

export async function deleteAdminEntityForTenancy(args: {
  tenancyId: string;
  entity: AdminEntityKey;
  entityId: string;
}): Promise<AdminEntityActionResult> {
  const assertDeleted = (count: number) => {
    if (count === 0) {
      throw new Error("Entity not found for this tenancy.");
    }
  };

  switch (args.entity) {
    case "specialty":
      assertDeleted(
        (
          await prisma.specialty.deleteMany({
            where: { id: args.entityId, tenancyId: args.tenancyId },
          })
        ).count,
      );
      return { ok: true, entity: args.entity, message: "Specialty deleted." };
    case "subject":
      assertDeleted(
        (
          await prisma.subject.deleteMany({
            where: { id: args.entityId, tenancyId: args.tenancyId },
          })
        ).count,
      );
      return { ok: true, entity: args.entity, message: "Subject deleted." };
    case "teacher":
      assertDeleted(
        (
          await prisma.teacher.deleteMany({
            where: { id: args.entityId, tenancyId: args.tenancyId },
          })
        ).count,
      );
      return { ok: true, entity: args.entity, message: "Teacher deleted." };
    case "classroom":
      assertDeleted(
        (
          await prisma.classroom.deleteMany({
            where: { id: args.entityId, tenancyId: args.tenancyId },
          })
        ).count,
      );
      return { ok: true, entity: args.entity, message: "Classroom deleted." };
    case "class":
      assertDeleted(
        (
          await prisma.class.deleteMany({
            where: { id: args.entityId, tenancyId: args.tenancyId },
          })
        ).count,
      );
      return { ok: true, entity: args.entity, message: "Class deleted." };
    case "frame":
      assertDeleted(
        (
          await prisma.frame.deleteMany({
            where: { id: args.entityId, tenancyId: args.tenancyId },
          })
        ).count,
      );
      return { ok: true, entity: args.entity, message: "Frame deleted." };
  }
}