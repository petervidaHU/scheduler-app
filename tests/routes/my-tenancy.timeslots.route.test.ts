import { action, loader } from "../../app/routes/my-tenancy.timeslots";
import { requireTenancyUser } from "../../app/lib/services/auth/guards.server";
import {
  createTimeslotFromForm,
  deleteTimeslotForTenancy,
  getTimeslotListForTenancy,
  getTimeslotOptions,
  updateTimeslotFromForm,
} from "../../app/lib/services/timeslots/manageTimeslots.server";

jest.mock("../../app/lib/services/auth/guards.server", () => ({
  requireTenancyUser: jest.fn(),
}));

jest.mock("../../app/lib/services/timeslots/manageTimeslots.server", () => ({
  getTimeslotOptions: jest.fn(),
  getTimeslotListForTenancy: jest.fn(),
  createTimeslotFromForm: jest.fn(),
  updateTimeslotFromForm: jest.fn(),
  deleteTimeslotForTenancy: jest.fn(),
}));

const mockedRequireTenancyUser = requireTenancyUser as jest.MockedFunction<typeof requireTenancyUser>;
const mockedGetTimeslotOptions = getTimeslotOptions as jest.MockedFunction<typeof getTimeslotOptions>;
const mockedGetTimeslotListForTenancy =
  getTimeslotListForTenancy as jest.MockedFunction<typeof getTimeslotListForTenancy>;
const mockedCreateTimeslotFromForm =
  createTimeslotFromForm as jest.MockedFunction<typeof createTimeslotFromForm>;
const mockedUpdateTimeslotFromForm =
  updateTimeslotFromForm as jest.MockedFunction<typeof updateTimeslotFromForm>;
const mockedDeleteTimeslotForTenancy =
  deleteTimeslotForTenancy as jest.MockedFunction<typeof deleteTimeslotForTenancy>;

describe("my-tenancy.timeslots route", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockedRequireTenancyUser.mockResolvedValue({
      userId: "u1",
      email: "admin@example.com",
      tenancyId: "t1",
      role: "ADMIN",
    });
  });

  test("loader returns timeslot options and list", async () => {
    mockedGetTimeslotOptions.mockResolvedValue({
      frames: [],
      subjects: [],
      teachers: [],
      classrooms: [],
      classes: [],
    });
    mockedGetTimeslotListForTenancy.mockResolvedValue([]);

    const result = await loader({
      request: new Request("http://localhost/en/my-tenancy/timeslots"),
      params: { locale: "en" },
    } as never);

    expect(result.options.frames).toEqual([]);
    expect(result.timeslots).toEqual([]);
  });

  test("action delegates to createTimeslotFromForm", async () => {
    mockedCreateTimeslotFromForm.mockResolvedValue({
      ok: true,
      intent: "create",
      mode: "single",
      message: "Timeslot created.",
    });

    const formData = new URLSearchParams({
      mode: "single",
      frameId: "f1",
      dayOfWeek: "1",
      startHour: "8",
      startMinutePart: "0",
      endHour: "8",
      endMinutePart: "45",
      intent: "create",
    });

    const result = await action({
      request: new Request("http://localhost/en/my-tenancy/timeslots", {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }),
      params: { locale: "en" },
    } as never);

    expect(result).toEqual({
      ok: true,
      intent: "create",
      mode: "single",
      message: "Timeslot created.",
    });
  });

  test("action delegates to updateTimeslotFromForm when intent is update", async () => {
    mockedUpdateTimeslotFromForm.mockResolvedValue({
      ok: true,
      intent: "update",
      message: "Timeslot updated.",
    });

    const formData = new URLSearchParams({
      intent: "update",
      timeslotId: "ts1",
      frameId: "f1",
      dayOfWeek: "1",
      startHour: "8",
      startMinutePart: "0",
      endHour: "8",
      endMinutePart: "45",
    });

    const result = await action({
      request: new Request("http://localhost/en/my-tenancy/timeslots", {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }),
      params: { locale: "en" },
    } as never);

    expect(result).toEqual({ ok: true, intent: "update", message: "Timeslot updated." });
  });

  test("action delegates to deleteTimeslotForTenancy when intent is delete", async () => {
    mockedDeleteTimeslotForTenancy.mockResolvedValue({
      ok: true,
      intent: "delete",
      message: "Timeslot deleted.",
    });

    const formData = new URLSearchParams({
      intent: "delete",
      timeslotId: "ts1",
    });

    const result = await action({
      request: new Request("http://localhost/en/my-tenancy/timeslots", {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }),
      params: { locale: "en" },
    } as never);

    expect(result).toEqual({ ok: true, intent: "delete", message: "Timeslot deleted." });
  });
});