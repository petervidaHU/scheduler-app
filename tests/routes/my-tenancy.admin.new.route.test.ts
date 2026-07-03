import { action, loader } from "../../app/routes/my-tenancy.admin.new";
import { requireTenancyUser } from "../../app/lib/services/auth/guards.server";
import { createAdminEntity, getAdminFormOptions } from "../../app/lib/services/tenancy/manageAdminEntities.server";

jest.mock("../../app/lib/services/auth/guards.server", () => ({
  requireTenancyUser: jest.fn(),
}));

jest.mock("../../app/lib/services/tenancy/manageAdminEntities.server", () => ({
  getAdminFormOptions: jest.fn(),
  createAdminEntity: jest.fn(),
}));

const mockedRequireTenancyUser = requireTenancyUser as jest.MockedFunction<typeof requireTenancyUser>;
const mockedGetAdminFormOptions = getAdminFormOptions as jest.MockedFunction<typeof getAdminFormOptions>;
const mockedCreateAdminEntity = createAdminEntity as jest.MockedFunction<typeof createAdminEntity>;

describe("my-tenancy.admin.new route", () => {
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

  test("loader 404s for an unknown entity", async () => {
    await expect(
      loader({
        request: new Request("http://localhost/en/my-tenancy/admin/bogus/new"),
        params: { locale: "en", entity: "bogus" },
      } as never),
    ).rejects.toMatchObject({ status: 404 });
  });

  test("loader returns the entity and form options", async () => {
    mockedGetAdminFormOptions.mockResolvedValue({
      specialties: [{ value: "sp1", label: "STEM" }],
      teachers: [],
      classrooms: [],
    });

    const result = await loader({
      request: new Request("http://localhost/en/my-tenancy/admin/teacher/new"),
      params: { locale: "en", entity: "teacher" },
    } as never);

    expect(result.entity).toBe("teacher");
    expect(result.options.specialties[0].label).toBe("STEM");
  });

  test("action creates the entity and redirects to the list with a created flag", async () => {
    mockedCreateAdminEntity.mockResolvedValue({ ok: true, entity: "teacher", message: "Teacher created." });

    const formData = new URLSearchParams({ name: "Jane" });

    await expect(
      action({
        request: new Request("http://localhost/en/my-tenancy/admin/teacher/new", {
          method: "POST",
          body: formData,
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }),
        params: { locale: "en", entity: "teacher" },
      } as never),
    ).rejects.toMatchObject({ status: 302 });

    expect(mockedCreateAdminEntity).toHaveBeenCalledTimes(1);
  });

  test("action returns a field error instead of redirecting on failure", async () => {
    mockedCreateAdminEntity.mockRejectedValue(new Error("Teacher name is required."));

    const formData = new URLSearchParams({ name: "" });

    const result = await action({
      request: new Request("http://localhost/en/my-tenancy/admin/teacher/new", {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }),
      params: { locale: "en", entity: "teacher" },
    } as never);

    expect(result).toEqual({ ok: false, message: "Teacher name is required." });
  });
});
