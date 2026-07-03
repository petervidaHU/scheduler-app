import {
  action as newScheduleAction,
  loader as newScheduleLoader,
} from "../../app/routes/my-tenancy.schedules.new";
import {
  action as editScheduleAction,
  loader as editScheduleLoader,
} from "../../app/routes/my-tenancy.schedules.edit";
import { loader as schedulesListLoader } from "../../app/routes/my-tenancy.schedules.index";
import { requireTenancyUser } from "../../app/lib/services/auth/guards.server";
import {
  createSchedule,
  getFrameOptionsForTenancy,
  getScheduleForEdit,
  getScheduleListForTenancy,
  updateSchedule,
} from "../../app/lib/services/schedules/manageSchedules.server";

jest.mock("../../app/lib/services/auth/guards.server", () => ({
  requireTenancyUser: jest.fn(),
}));

jest.mock("../../app/lib/services/schedules/manageSchedules.server", () => ({
  getFrameOptionsForTenancy: jest.fn(),
  createSchedule: jest.fn(),
  getScheduleForEdit: jest.fn(),
  updateSchedule: jest.fn(),
  getScheduleListForTenancy: jest.fn(),
}));

const mockedRequireTenancyUser = requireTenancyUser as jest.MockedFunction<typeof requireTenancyUser>;
const mockedGetFrameOptionsForTenancy =
  getFrameOptionsForTenancy as jest.MockedFunction<typeof getFrameOptionsForTenancy>;
const mockedCreateSchedule = createSchedule as jest.MockedFunction<typeof createSchedule>;
const mockedGetScheduleForEdit = getScheduleForEdit as jest.MockedFunction<typeof getScheduleForEdit>;
const mockedUpdateSchedule = updateSchedule as jest.MockedFunction<typeof updateSchedule>;
const mockedGetScheduleListForTenancy =
  getScheduleListForTenancy as jest.MockedFunction<typeof getScheduleListForTenancy>;

function makePostRequest(url: string, formData: Record<string, string>) {
  const body = new URLSearchParams(formData);
  return new Request(url, {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
}

describe("schedule route loaders/actions", () => {
  beforeEach(() => {
    mockedRequireTenancyUser.mockResolvedValue({
      userId: "u1",
      email: "admin@example.com",
      tenancyId: "t1",
      tenancyName: "Test School",
      role: "ADMIN",
    });
  });

  test("schedules list loader returns data from service", async () => {
    mockedGetScheduleListForTenancy.mockResolvedValue([
      {
        id: "s1",
        name: "Semester A",
        frameName: "Frame 1",
        isPublished: false,
        entryCount: 5,
        updatedAtIso: "2026-03-30T10:00:00.000Z",
      },
    ]);

    const result = await schedulesListLoader({
      request: new Request("http://localhost/en/my-tenancy/schedules"),
      params: { locale: "en" },
      context: undefined as never,
    });

    expect(result).toEqual({
      schedules: [
        {
          id: "s1",
          name: "Semester A",
          frameName: "Frame 1",
          isPublished: false,
          entryCount: 5,
          updatedAtIso: "2026-03-30T10:00:00.000Z",
        },
      ],
      error: null,
    });
  });

  test("new schedule loader fetches frame options", async () => {
    mockedGetFrameOptionsForTenancy.mockResolvedValue([{ id: "f1", label: "Frame One" }]);

    const result = await newScheduleLoader({
      request: new Request("http://localhost/en/my-tenancy/schedules/new"),
      params: { locale: "en" },
      context: undefined as never,
    });

    expect(result.frames).toEqual([{ id: "f1", label: "Frame One" }]);
    expect(result.defaults.frameId).toBe("f1");
  });

  test("new schedule action redirects on success", async () => {
    mockedCreateSchedule.mockResolvedValue({
      ok: true,
      schedule: {
        id: "s1",
        name: "Semester A",
        frameId: "f1",
        isPublished: false,
        updatedAt: new Date(),
      },
    });

    await expect(
      newScheduleAction({
        request: makePostRequest("http://localhost/en/my-tenancy/schedules/new", {
          name: "Semester A",
          frameId: "f1",
        }),
        params: { locale: "en" },
        context: undefined as never,
      }),
    ).rejects.toMatchObject({
      status: 302,
      headers: expect.any(Headers),
    });
  });

  test("new schedule action returns field errors on failed create", async () => {
    mockedCreateSchedule.mockResolvedValue({
      ok: false,
      error: {
        fieldErrors: {
          name: "A schedule with this name already exists in this tenancy.",
        },
      },
    });

    const result = await newScheduleAction({
      request: makePostRequest("http://localhost/en/my-tenancy/schedules/new", {
        name: "Semester A",
        frameId: "f1",
      }),
      params: { locale: "en" },
      context: undefined as never,
    });

    expect(result).toMatchObject({
      ok: false,
      values: {
        name: "Semester A",
        frameId: "f1",
        isPublished: false,
      },
    });
  });

  test("edit schedule loader throws 404 when schedule is missing", async () => {
    mockedGetFrameOptionsForTenancy.mockResolvedValue([{ id: "f1", label: "Frame One" }]);
    mockedGetScheduleForEdit.mockResolvedValue(null);

    await expect(
      editScheduleLoader({
        request: new Request("http://localhost/en/my-tenancy/schedules/s1"),
        params: { locale: "en", id: "s1" },
        context: undefined as never,
      }),
    ).rejects.toMatchObject({ status: 404 });
  });

  test("edit schedule action returns errors on failed update", async () => {
    mockedUpdateSchedule.mockResolvedValue({
      ok: false,
      error: {
        fieldErrors: {},
        formError: "Schedule not found in current tenancy.",
      },
    });

    const result = await editScheduleAction({
      request: makePostRequest("http://localhost/en/my-tenancy/schedules/s1", {
        name: "Semester A",
        frameId: "f1",
      }),
      params: { locale: "en", id: "s1" },
      context: undefined as never,
    });

    expect(result).toMatchObject({
      ok: false,
      values: {
        name: "Semester A",
        frameId: "f1",
        isPublished: false,
      },
    });
  });
});
