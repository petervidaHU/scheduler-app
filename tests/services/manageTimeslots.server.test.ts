import {
  createTimeslotFromForm,
  deleteTimeslotForTenancy,
  getTimeslotListForTenancy,
  getTimeslotOptions,
  updateTimeslotFromForm,
} from "../../app/lib/services/timeslots/manageTimeslots.server";
import { prisma } from "../../app/lib/db/prisma.server";

jest.mock("../../app/lib/db/prisma.server", () => ({
  prisma: {
    $transaction: jest.fn(),
    frame: { findMany: jest.fn() },
    subject: { findMany: jest.fn() },
    teacher: { findMany: jest.fn() },
    classroom: { findMany: jest.fn() },
    class: { findMany: jest.fn() },
    timeslot: {
      findMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

describe("manageTimeslots service", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("getTimeslotOptions maps lookup lists", async () => {
    (prisma.$transaction as jest.Mock).mockResolvedValue([
      [{ id: "f1", name: "Frame A" }],
      [{ id: "s1", name: "Math" }],
      [{ id: "t1", name: "Alice" }],
      [{ id: "r1", name: "Room 101" }],
      [{ id: "c1", name: "Class 9A" }],
    ]);
    (prisma.frame.findMany as jest.Mock).mockResolvedValue([{ id: "f1", name: "Frame A" }]);
    (prisma.subject.findMany as jest.Mock).mockResolvedValue([{ id: "s1", name: "Math" }]);
    (prisma.teacher.findMany as jest.Mock).mockResolvedValue([{ id: "t1", name: "Alice" }]);
    (prisma.classroom.findMany as jest.Mock).mockResolvedValue([{ id: "r1", name: "Room 101" }]);
    (prisma.class.findMany as jest.Mock).mockResolvedValue([{ id: "c1", name: "Class 9A" }]);

    const result = await getTimeslotOptions("tenancy-1");
    expect(result.frames[0]).toEqual({ value: "f1", label: "Frame A" });
    expect(result.subjects[0]).toEqual({ value: "s1", label: "Math" });
  });

  test("getTimeslotListForTenancy maps list rows", async () => {
    (prisma.timeslot.findMany as jest.Mock).mockResolvedValue([
      {
        id: "ts1",
        frameId: "f1",
        subjectId: null,
        teacherId: null,
        classroomId: null,
        classId: null,
        dayOfWeek: 1,
        startMinute: 480,
        endMinute: 525,
        frame: { name: "Frame A" },
      },
    ]);

    const result = await getTimeslotListForTenancy("tenancy-1");
    expect(result[0]).toMatchObject({
      id: "ts1",
      frameName: "Frame A",
    });
  });

  test("createTimeslotFromForm creates single timeslot", async () => {
    const formData = new FormData();
    formData.set("mode", "single");
    formData.set("frameId", "f1");
    formData.set("dayOfWeek", "1");
    formData.set("startHour", "8");
    formData.set("startMinutePart", "0");
    formData.set("endHour", "8");
    formData.set("endMinutePart", "45");

    const result = await createTimeslotFromForm({ tenancyId: "tenancy-1", formData });

    expect(prisma.timeslot.create).toHaveBeenCalled();
    expect(result).toEqual({
      ok: true,
      intent: "create",
      mode: "single",
      message: "Timeslot created.",
    });
  });

  test("createTimeslotFromForm creates template batch", async () => {
    const formData = new FormData();
    formData.set("mode", "template");
    formData.set("frameId", "f1");
    formData.set("dayOfWeek", "2");
    formData.set("startHour", "8");
    formData.set("startMinutePart", "0");
    formData.set("slotLength", "45");
    formData.set("slotCount", "2");

    const result = await createTimeslotFromForm({ tenancyId: "tenancy-1", formData });

    expect(prisma.timeslot.createMany).toHaveBeenCalled();
    expect(result).toEqual({
      ok: true,
      intent: "create",
      mode: "template",
      message: "2 template timeslots created.",
    });
  });

  test("updateTimeslotFromForm updates scoped timeslot", async () => {
    const formData = new FormData();
    formData.set("timeslotId", "ts1");
    formData.set("frameId", "f1");
    formData.set("dayOfWeek", "3");
    formData.set("startHour", "9");
    formData.set("startMinutePart", "0");
    formData.set("endHour", "9");
    formData.set("endMinutePart", "45");

    (prisma.timeslot.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

    const result = await updateTimeslotFromForm({ tenancyId: "tenancy-1", formData });

    expect(prisma.timeslot.updateMany).toHaveBeenCalled();
    expect(result).toEqual({ ok: true, intent: "update", message: "Timeslot updated." });
  });

  test("deleteTimeslotForTenancy deletes scoped timeslot", async () => {
    (prisma.timeslot.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

    const result = await deleteTimeslotForTenancy({
      tenancyId: "tenancy-1",
      timeslotId: "ts1",
    });

    expect(prisma.timeslot.deleteMany).toHaveBeenCalledWith({
      where: { id: "ts1", tenancyId: "tenancy-1" },
    });
    expect(result).toEqual({ ok: true, intent: "delete", message: "Timeslot deleted." });
  });
});