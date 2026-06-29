import {
  createSchedule,
  getFrameOptionsForTenancy,
  getScheduleListForTenancy,
  updateSchedule,
  validateScheduleInput,
} from "../../app/lib/services/schedules/manageSchedules.server";
import {
  createScheduleForTenancy,
  listFramesByTenancyId,
  listSchedulesByTenancyId,
  updateScheduleForTenancy,
} from "../../app/lib/repositories/scheduleRepository.server";

jest.mock("../../app/lib/repositories/scheduleRepository.server", () => ({
  listSchedulesByTenancyId: jest.fn(),
  listFramesByTenancyId: jest.fn(),
  createScheduleForTenancy: jest.fn(),
  updateScheduleForTenancy: jest.fn(),
  findScheduleByIdForTenancy: jest.fn(),
}));

const mockedListSchedulesByTenancyId = listSchedulesByTenancyId as jest.MockedFunction<
  typeof listSchedulesByTenancyId
>;
const mockedListFramesByTenancyId = listFramesByTenancyId as jest.MockedFunction<
  typeof listFramesByTenancyId
>;
const mockedCreateScheduleForTenancy = createScheduleForTenancy as jest.MockedFunction<
  typeof createScheduleForTenancy
>;
const mockedUpdateScheduleForTenancy = updateScheduleForTenancy as jest.MockedFunction<
  typeof updateScheduleForTenancy
>;

describe("manageSchedules service", () => {
  test("validateScheduleInput returns field errors", () => {
    const result = validateScheduleInput({
      name: "a",
      frameId: "",
      isPublished: false,
    });

    expect(result).toEqual({
      fieldErrors: {
        name: "Name must be at least 3 characters.",
        frameId: "Frame is required.",
      },
    });
  });

  test("getScheduleListForTenancy maps repository records", async () => {
    mockedListSchedulesByTenancyId.mockResolvedValue([
      {
        id: "s1",
        name: "Sem A",
        isPublished: false,
        updatedAt: new Date("2026-03-30T10:00:00.000Z"),
        frameName: "Frame 1",
        entryCount: 12,
      },
    ]);

    const result = await getScheduleListForTenancy("t1");

    expect(result).toEqual([
      {
        id: "s1",
        name: "Sem A",
        isPublished: false,
        updatedAtIso: "2026-03-30T10:00:00.000Z",
        frameName: "Frame 1",
        entryCount: 12,
      },
    ]);
    expect(mockedListSchedulesByTenancyId).toHaveBeenCalledWith("t1");
  });

  test("getFrameOptionsForTenancy maps labels", async () => {
    mockedListFramesByTenancyId.mockResolvedValue([
      {
        id: "f1",
        name: "Spring",
        startDate: new Date("2026-01-01T00:00:00.000Z"),
        endDate: new Date("2026-06-01T00:00:00.000Z"),
      },
    ]);

    const result = await getFrameOptionsForTenancy("t1");

    expect(result).toEqual([
      {
        id: "f1",
        label: "Spring (2026-01-01 to 2026-06-01)",
      },
    ]);
  });

  test("createSchedule returns validation error without repository call", async () => {
    const result = await createSchedule({
      tenancyId: "t1",
      input: {
        name: "a",
        frameId: "",
        isPublished: false,
      },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.fieldErrors.name).toBeDefined();
      expect(result.error.fieldErrors.frameId).toBeDefined();
    }
    expect(mockedCreateScheduleForTenancy).not.toHaveBeenCalled();
  });

  test("createSchedule creates record on valid input", async () => {
    mockedCreateScheduleForTenancy.mockResolvedValue({
      id: "s1",
      name: "Semester A",
      frameId: "f1",
      isPublished: true,
      updatedAt: new Date("2026-03-30T09:00:00.000Z"),
    });

    const result = await createSchedule({
      tenancyId: "t1",
      input: {
        name: "  Semester   A  ",
        frameId: "f1",
        isPublished: true,
      },
    });

    expect(result.ok).toBe(true);
    expect(mockedCreateScheduleForTenancy).toHaveBeenCalledWith({
      tenancyId: "t1",
      name: "Semester A",
      frameId: "f1",
      isPublished: true,
    });
  });

  test("updateSchedule returns not-found formError when update count is zero", async () => {
    mockedUpdateScheduleForTenancy.mockResolvedValue({ count: 0 });

    const result = await updateSchedule({
      tenancyId: "t1",
      scheduleId: "missing",
      input: {
        name: "Semester B",
        frameId: "f1",
        isPublished: false,
      },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.formError).toBe("Schedule not found in current tenancy.");
    }
  });
});
