import { loader as apiLocalesLoader } from "../../app/routes/api.locales";
import { loader as docsLoader } from "../../app/routes/docs";
import { meta as homeMeta, loader as homeLoader } from "../../app/routes/home";
import { loader as localeLayoutLoader } from "../../app/routes/locale-layout";
import { action as loginAction, loader as loginLoader } from "../../app/routes/login";
import { action as logoutAction, loader as logoutLoader } from "../../app/routes/logout";
import { loader as publicShellLoader } from "../../app/routes/public-shell";
import { loader as protectedDashboardLoader } from "../../app/routes/protected-dashboard";
import { loader as rootRedirectLoader } from "../../app/routes/root-redirect";
import { loader as tenancyLayoutLoader } from "../../app/routes/tenancy-layout";
import { loader as schedulesViewLoader } from "../../app/routes/my-tenancy.schedules.view";
import { getOptionalUserSession, commitUserSession, destroyUserSession } from "../../app/lib/auth/session.server";
import { getTenancyOverview } from "../../app/lib/services/tenancy/getTenancyOverview.server";
import { loginWithEmailPassword } from "../../app/lib/services/auth/login.server";
import { requireTenancyUser } from "../../app/lib/services/auth/guards.server";
import { loadPlannerData } from "../../app/lib/services/schedules/managePlannerEntries.server";

jest.mock("../../app/lib/auth/session.server", () => ({
  getOptionalUserSession: jest.fn(),
  commitUserSession: jest.fn(),
  destroyUserSession: jest.fn(),
}));

jest.mock("../../app/lib/services/tenancy/getTenancyOverview.server", () => ({
  getTenancyOverview: jest.fn(),
}));

jest.mock("../../app/lib/services/auth/login.server", () => ({
  loginWithEmailPassword: jest.fn(),
}));

jest.mock("../../app/lib/services/auth/guards.server", () => ({
  requireTenancyUser: jest.fn(),
}));

jest.mock("../../app/lib/services/schedules/managePlannerEntries.server", () => ({
  loadPlannerData: jest.fn(),
  addPlannerEntry: jest.fn(),
  removePlannerEntry: jest.fn(),
}));

const mockedGetOptionalUserSession = getOptionalUserSession as jest.MockedFunction<
  typeof getOptionalUserSession
>;
const mockedCommitUserSession = commitUserSession as jest.MockedFunction<typeof commitUserSession>;
const mockedDestroyUserSession = destroyUserSession as jest.MockedFunction<typeof destroyUserSession>;
const mockedGetTenancyOverview = getTenancyOverview as jest.MockedFunction<typeof getTenancyOverview>;
const mockedLoginWithEmailPassword = loginWithEmailPassword as jest.MockedFunction<
  typeof loginWithEmailPassword
>;
const mockedRequireTenancyUser = requireTenancyUser as jest.MockedFunction<typeof requireTenancyUser>;
const mockedLoadPlannerData = loadPlannerData as jest.MockedFunction<typeof loadPlannerData>;

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

describe("core route loaders and actions", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("api.locales loader returns locale JSON", async () => {
    const result = await apiLocalesLoader({ params: { lng: "en", ns: "translation" } } as never);
    expect(result.init?.status).toBeUndefined();
  });

  test("api.locales loader returns 404 for missing locale", async () => {
    const result = await apiLocalesLoader({ params: { lng: "xx", ns: "translation" } } as never);
    expect(result.init?.status).toBe(404);
  });

  test("docs loader redirects to localized documentation page", async () => {
    await expect(docsLoader({ params: { locale: "hu" } } as never)).rejects.toMatchObject({
      status: 302,
    });
  });

  test("locale layout loader rejects unsupported locale", async () => {
    await expect(localeLayoutLoader({ params: { locale: "de" } } as never)).rejects.toMatchObject({
      status: 404,
    });
  });

  test("home meta returns title and description", () => {
    expect(homeMeta({} as never)).toEqual([
      { title: "Scheduler App - React Router v7" },
      { name: "description", content: "Phase 1 migration bootstrap" },
    ]);
  });

  test("home loader returns tenancy overview and optional user", async () => {
    mockedGetTenancyOverview.mockResolvedValue({
      source: "database",
      errorMessage: null,
      overview: {
        counts: { tenancies: 1, users: 1, memberships: 1, activeMemberships: 1, teachers: 0, classes: 0, timeslots: 0, schedules: 0 },
        ratios: { activeMembershipRate: 1, schedulesPerTenancy: 0, timeslotsPerClass: 0 },
        health: { status: "healthy", score: 100, notes: [] },
      },
    } as never);
    mockedGetOptionalUserSession.mockResolvedValue(null);

    const result = await homeLoader({
      request: new Request("http://localhost/en"),
      params: { locale: "en" },
    } as never);

    expect(result.locale).toBe("en");
    expect(result.user).toBeNull();
  });

  test("login loader redirects authenticated users", async () => {
    mockedGetOptionalUserSession.mockResolvedValue({
      userId: "u1",
      email: "a@example.com",
      tenancyId: "t1",
      role: "ADMIN",
    });

    await expect(
      loginLoader({ request: new Request("http://localhost/en/login"), params: { locale: "en" } } as never),
    ).rejects.toMatchObject({ status: 302 });
  });

  test("login action returns validation error for missing credentials", async () => {
    const result = await loginAction({
      request: makePostRequest("http://localhost/en/login", { email: "" }),
      params: { locale: "en" },
    } as never);

    expect(result).toMatchObject({ ok: false, error: "Email and password are required." });
  });

  test("login action commits session on successful auth", async () => {
    mockedLoginWithEmailPassword.mockResolvedValue({
      ok: true,
      user: { userId: "u1", email: "a@example.com", tenancyId: "t1", role: "ADMIN" },
    });
    mockedCommitUserSession.mockRejectedValue(new Response(null, { status: 302 }));

    await expect(
      loginAction({
        request: makePostRequest("http://localhost/en/login", {
          email: "a@example.com",
          password: "pw",
        }),
        params: { locale: "en" },
      } as never),
    ).rejects.toMatchObject({ status: 302 });
  });

  test("logout loader redirects to app", async () => {
    await expect(logoutLoader({ params: { locale: "en" } } as never)).rejects.toMatchObject({
      status: 302,
    });
  });

  test("logout action calls destroy session", async () => {
    mockedDestroyUserSession.mockRejectedValue(new Response(null, { status: 302 }));

    await expect(
      logoutAction({
        request: new Request("http://localhost/en/logout", { method: "POST" }),
        params: { locale: "en" },
      } as never),
    ).rejects.toMatchObject({ status: 302 });
  });

  test("public shell loader returns safe locale and user", async () => {
    mockedGetOptionalUserSession.mockResolvedValue(null);
    const result = await publicShellLoader({
      request: new Request("http://localhost/de"),
      params: { locale: "de" },
    } as never);
    expect(result.locale).toBe("en");
  });

  test("protected dashboard loader returns tenancy overview", async () => {
    mockedGetTenancyOverview.mockResolvedValue({ source: "database" } as never);
    const result = await protectedDashboardLoader({} as never);
    expect(result).toEqual({ tenancyOverview: { source: "database" } });
  });

  test("root redirect loader redirects to default locale", async () => {
    await expect(rootRedirectLoader()).rejects.toMatchObject({ status: 302 });
  });

  test("tenancy layout loader returns safe locale and tenancy user", async () => {
    mockedRequireTenancyUser.mockResolvedValue({
      userId: "u1",
      email: "a@example.com",
      tenancyId: "t1",
      role: "ADMIN",
    });

    const result = await tenancyLayoutLoader({
      request: new Request("http://localhost/de/my-tenancy"),
      params: { locale: "de" },
    } as never);

    expect(result.locale).toBe("en");
    expect(result.user.tenancyId).toBe("t1");
  });

  test("schedule view loader returns planner data for authenticated user", async () => {
    mockedRequireTenancyUser.mockResolvedValue({
      userId: "u1",
      email: "a@example.com",
      tenancyId: "t1",
      role: "ADMIN",
    });
    const fakeData = {
      schedule: { id: "s1", name: "Test Schedule", frameId: "f1", isPublished: false, entries: [], frame: null },
      options: { classes: [], subjects: [], teachers: [], classrooms: [] },
    };
    mockedLoadPlannerData.mockResolvedValue(fakeData as never);

    const result = await schedulesViewLoader({
      request: new Request("http://localhost/en/my-tenancy/schedules/view/s1"),
      params: { locale: "en", id: "s1" },
    } as never);

    expect(result).toMatchObject({ schedule: { id: "s1" }, locale: "en" });
  });
});
