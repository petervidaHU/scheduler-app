import { action, loader } from "../../app/routes/my-tenancy.admin.edit";
import { requireTenancyUser } from "../../app/lib/services/auth/guards.server";
import {
  getAdminEntityFormValues,
  getAdminFormOptions,
  updateAdminEntity,
} from "../../app/lib/services/tenancy/manageAdminEntities.server";

jest.mock("../../app/lib/services/auth/guards.server", () => ({
  requireTenancyUser: jest.fn(),
}));

jest.mock("../../app/lib/services/tenancy/manageAdminEntities.server", () => ({
  getAdminFormOptions: jest.fn(),
  getAdminEntityFormValues: jest.fn(),
  updateAdminEntity: jest.fn(),
}));

const mockedRequireTenancyUser = requireTenancyUser as jest.MockedFunction<typeof requireTenancyUser>;
const mockedGetAdminFormOptions = getAdminFormOptions as jest.MockedFunction<typeof getAdminFormOptions>;
const mockedGetAdminEntityFormValues = getAdminEntityFormValues as jest.MockedFunction<
  typeof getAdminEntityFormValues
>;
const mockedUpdateAdminEntity = updateAdminEntity as jest.MockedFunction<typeof updateAdminEntity>;

describe("my-tenancy.admin.edit route", () => {
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
        request: new Request("http://localhost/en/my-tenancy/admin/bogus/t-1/edit"),
        params: { locale: "en", entity: "bogus", id: "t-1" },
      } as never),
    ).rejects.toMatchObject({ status: 404 });
  });

  test("loader 404s when the entity id doesn't resolve", async () => {
    mockedGetAdminFormOptions.mockResolvedValue({ specialties: [], teachers: [], classrooms: [] });
    mockedGetAdminEntityFormValues.mockResolvedValue(null);

    await expect(
      loader({
        request: new Request("http://localhost/en/my-tenancy/admin/teacher/missing/edit"),
        params: { locale: "en", entity: "teacher", id: "missing" },
      } as never),
    ).rejects.toMatchObject({ status: 404 });
  });

  test("loader fetches the entity's current values for the form", async () => {
    mockedGetAdminFormOptions.mockResolvedValue({ specialties: [], teachers: [], classrooms: [] });
    mockedGetAdminEntityFormValues.mockResolvedValue({ name: "Jane Doe", email: "", code: "" });

    const result = await loader({
      request: new Request("http://localhost/en/my-tenancy/admin/teacher/t-1/edit"),
      params: { locale: "en", entity: "teacher", id: "t-1" },
    } as never);

    expect(mockedGetAdminEntityFormValues).toHaveBeenCalledWith("t1", "teacher", "t-1");
    expect(result.editingValues).toEqual({ name: "Jane Doe", email: "", code: "" });
  });

  test("action updates the entity and redirects to the list with an updated flag", async () => {
    mockedUpdateAdminEntity.mockResolvedValue({ ok: true, entity: "teacher", message: "Teacher updated." });

    const formData = new URLSearchParams({ name: "Jane" });

    await expect(
      action({
        request: new Request("http://localhost/en/my-tenancy/admin/teacher/t-1/edit", {
          method: "POST",
          body: formData,
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }),
        params: { locale: "en", entity: "teacher", id: "t-1" },
      } as never),
    ).rejects.toMatchObject({ status: 302 });

    expect(mockedUpdateAdminEntity).toHaveBeenCalledWith({
      tenancyId: "t1",
      entityId: "t-1",
      formData: expect.any(FormData),
    });
  });

  test("action returns a field error instead of redirecting on failure", async () => {
    mockedUpdateAdminEntity.mockRejectedValue(new Error("Entity not found for this tenancy."));

    const formData = new URLSearchParams({ name: "Jane" });

    const result = await action({
      request: new Request("http://localhost/en/my-tenancy/admin/teacher/t-1/edit", {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }),
      params: { locale: "en", entity: "teacher", id: "t-1" },
    } as never);

    expect(result).toEqual({ ok: false, message: "Entity not found for this tenancy." });
  });
});
