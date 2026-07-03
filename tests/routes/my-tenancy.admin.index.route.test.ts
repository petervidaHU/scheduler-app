import { action, loader } from "../../app/routes/my-tenancy.admin.index";
import { requireTenancyUser } from "../../app/lib/services/auth/guards.server";
import { getTenancyAdminEntityCountsForTenancy } from "../../app/lib/services/tenancy/getTenancyAdminEntityCounts.server";
import {
  deleteAdminEntityForTenancy,
  getAdminEntityTableData,
} from "../../app/lib/services/tenancy/manageAdminEntities.server";

jest.mock("../../app/lib/services/auth/guards.server", () => ({
  requireTenancyUser: jest.fn(),
}));

jest.mock("../../app/lib/services/tenancy/getTenancyAdminEntityCounts.server", () => ({
  getTenancyAdminEntityCountsForTenancy: jest.fn(),
}));

jest.mock("../../app/lib/services/tenancy/manageAdminEntities.server", () => ({
  getAdminEntityTableData: jest.fn(),
  deleteAdminEntityForTenancy: jest.fn(),
}));

const mockedRequireTenancyUser = requireTenancyUser as jest.MockedFunction<typeof requireTenancyUser>;
const mockedGetCounts =
  getTenancyAdminEntityCountsForTenancy as jest.MockedFunction<
    typeof getTenancyAdminEntityCountsForTenancy
  >;
const mockedGetAdminEntityTableData = getAdminEntityTableData as jest.MockedFunction<
  typeof getAdminEntityTableData
>;
const mockedDeleteAdminEntityForTenancy =
  deleteAdminEntityForTenancy as jest.MockedFunction<typeof deleteAdminEntityForTenancy>;

describe("my-tenancy.admin.index route", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockedRequireTenancyUser.mockResolvedValue({
      userId: "u1",
      email: "admin@example.com",
      tenancyId: "t1",
      tenancyName: "Test School",
      role: "ADMIN",
    });
  });

  test("loader returns counts and tabular entity data", async () => {
    mockedGetCounts.mockResolvedValue({
      source: "database",
      errorMessage: null,
      counts: { classroom: 1, class: 1, specialty: 1, subject: 1, teacher: 1, frame: 1 },
    });

    mockedGetAdminEntityTableData.mockResolvedValue({
      specialty: { headers: ["Id", "Name", "Code"], rows: [] },
      subject: { headers: ["Id", "Name", "Code", "Specialty"], rows: [] },
      teacher: { headers: ["Id", "Name", "Email", "Code"], rows: [] },
      classroom: { headers: ["Id", "Name", "Capacity"], rows: [] },
      class: { headers: ["Id", "Name", "Code", "Specialty", "Teacher", "Classroom"], rows: [] },
      frame: { headers: ["Id", "Name", "Start", "End"], rows: [] },
    });

    const result = await loader({
      request: new Request("http://localhost/en/my-tenancy/admin"),
      params: { locale: "en" },
    } as never);

    expect(result.countsResult.source).toBe("database");
    expect(result.tableData.specialty.headers).toEqual(["Id", "Name", "Code"]);
  });

  test("action deletes the entity for the given id", async () => {
    mockedDeleteAdminEntityForTenancy.mockResolvedValue({
      ok: true,
      entity: "subject",
      message: "Subject deleted.",
    });

    const formData = new URLSearchParams({ entity: "subject", entityId: "sub-1" });

    const result = await action({
      request: new Request("http://localhost/en/my-tenancy/admin", {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }),
      params: { locale: "en" },
    } as never);

    expect(result).toEqual({ ok: true, entity: "subject", message: "Subject deleted." });
    expect(mockedDeleteAdminEntityForTenancy).toHaveBeenCalledWith({
      tenancyId: "t1",
      entity: "subject",
      entityId: "sub-1",
    });
  });

  test("action returns an error when entityId is missing", async () => {
    const formData = new URLSearchParams({ entity: "subject" });

    const result = await action({
      request: new Request("http://localhost/en/my-tenancy/admin", {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }),
      params: { locale: "en" },
    } as never);

    expect(result).toEqual({
      ok: false,
      entity: "subject",
      message: "Entity id is required for delete.",
    });
    expect(mockedDeleteAdminEntityForTenancy).not.toHaveBeenCalled();
  });
});
