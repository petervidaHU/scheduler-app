import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MantineProvider } from "@mantine/core";
import DocumentationPage from "../../app/routes/documentation";
import PricingPage from "../../app/routes/pricing";
import Logout from "../../app/routes/logout";
import PublicShell from "../../app/routes/public-shell";
import TenancyLayout from "../../app/routes/tenancy-layout";
import MyTenancyLayout from "../../app/routes/my-tenancy-layout";
import MyTenancyAdmin from "../../app/routes/my-tenancy.admin";
import MyTenancyDashboard from "../../app/routes/my-tenancy.index";
import SchedulesLayout from "../../app/routes/my-tenancy.schedules-layout";
import ViewSchedulePage from "../../app/routes/my-tenancy.schedules.view";
import TimeslotsPage from "../../app/routes/my-tenancy.timeslots";
import ProtectedDashboard from "../../app/routes/protected-dashboard";
import Login from "../../app/routes/login";
import Home from "../../app/routes/home";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en", changeLanguage: jest.fn() } }),
}));

jest.mock("../../app/lib/auth/session.server", () => ({
  getOptionalUserSession: jest.fn(),
  commitUserSession: jest.fn(),
  destroyUserSession: jest.fn(),
}));

jest.mock("../../app/lib/repositories/userAuthRepository.server", () => ({
  findActiveMembership: jest.fn(),
}));

jest.mock("../../app/lib/services/tenancy/getTenancyOverview.server", () => ({
  getTenancyOverview: jest.fn(),
}));

jest.mock("../../app/lib/services/tenancy/getTenancyAdminEntityCounts.server", () => ({
  getTenancyAdminEntityCountsForTenancy: jest.fn(),
}));

jest.mock("../../app/lib/services/tenancy/manageAdminEntities.server", () => ({
  getAdminFormOptions: jest.fn(),
  getAdminEntityTableData: jest.fn(),
  createAdminEntity: jest.fn(),
  deleteAdminEntityForTenancy: jest.fn(),
}));

jest.mock("../../app/lib/services/timeslots/manageTimeslots.server", () => ({
  getTimeslotOptions: jest.fn(),
  getTimeslotListForTenancy: jest.fn(),
  createTimeslotFromForm: jest.fn(),
}));

jest.mock("../../app/lib/services/schedules/managePlannerEntries.server", () => ({
  loadPlannerData: jest.fn(),
  addPlannerEntry: jest.fn(),
  removePlannerEntry: jest.fn(),
}));

jest.mock("../../app/components/planner/WeeklyPlannerGrid", () => ({
  WeeklyPlannerGrid: () => React.createElement("div", { "data-testid": "planner-grid" }),
}));

jest.mock("../../app/lib/services/auth/login.server", () => ({
  loginWithEmailPassword: jest.fn(),
}));

jest.mock("react-router", () => ({
  Anchor: "a",
  Form: ({ children }: { children: React.ReactNode }) => React.createElement("form", null, children),
  Link: ({ children }: { children: React.ReactNode }) => React.createElement("a", null, children),
  Outlet: ({ context }: { context?: unknown }) => React.createElement("div", null, JSON.stringify(context ?? {})),
  useLocation: jest.fn(() => ({
    pathname: "/en",
    search: "",
    hash: "",
    key: "k0",
    state: null,
    unstable_mask: undefined,
  })),
  useSearchParams: jest.fn(() => [new URLSearchParams(), jest.fn()]),
  useSubmit: jest.fn(() => jest.fn()),
  useFetcher: jest.fn(() => ({ state: "idle", data: undefined, load: jest.fn(), submit: jest.fn() })),
  useOutletContext: jest.fn(() => ({
    locale: "en",
    user: { userId: "u1", email: "admin@example.com", tenancyId: "t1", role: "ADMIN" },
  })),
}));

function renderWithMantine(element: React.ReactElement) {
  return renderToStaticMarkup(
    React.createElement(MantineProvider, null, element),
  );
}

describe("route component rendering", () => {
  test("documentation page renders translated keys", () => {
    const html = renderWithMantine(React.createElement(DocumentationPage));
    expect(html).toContain("documentation.title");
  });

  test("pricing page renders translated keys", () => {
    const html = renderWithMantine(React.createElement(PricingPage));
    expect(html).toContain("pricing.message1");
  });

  test("logout route renders confirmation copy", () => {
    const html = renderWithMantine(React.createElement(Logout));
    expect(html).toContain("Sign out");
  });

  test("public shell renders navigation text", () => {
    const html = renderWithMantine(
      React.createElement(PublicShell, {
        loaderData: { locale: "en", user: null },
      }),
    );
    expect(html).toContain("pricing.message1");
  });

  test("tenancy layout renders email", () => {
    const html = renderWithMantine(
      React.createElement(TenancyLayout, {
        loaderData: {
          locale: "en",
          user: { userId: "u1", email: "admin@example.com", tenancyId: "t1", role: "ADMIN" },
        },
      }),
    );
    expect(html).toContain("admin@example.com");
  });

  test("my tenancy layout renders tenancy nav", () => {
    const html = renderWithMantine(React.createElement(MyTenancyLayout));
    expect(html).toContain("Timeslots");
  });

  test("my tenancy admin renders placeholder", () => {
    const html = renderWithMantine(
      React.createElement(MyTenancyAdmin, {
        loaderData: {
          countsResult: {
            source: "database",
            errorMessage: null,
            counts: {
              classroom: 1,
              class: 1,
              specialty: 1,
              subject: 1,
              teacher: 1,
              frame: 1,
            },
          },
          options: {
            specialties: [],
            teachers: [],
            classrooms: [],
          },
          tableData: {
            specialty: { headers: ["Id", "Name", "Code"], rows: [] },
            subject: { headers: ["Id", "Name", "Code", "Specialty"], rows: [] },
            teacher: { headers: ["Id", "Name", "Email", "Code"], rows: [] },
            classroom: { headers: ["Id", "Name", "Capacity"], rows: [] },
            class: {
              headers: ["Id", "Name", "Code", "Specialty", "Teacher", "Classroom"],
              rows: [],
            },
            frame: { headers: ["Id", "Name", "Start", "End"], rows: [] },
          },
        },
      })
    );
    expect(html).toContain("Current user role");
  });

  test("my tenancy dashboard renders tenancy id label", () => {
    const html = renderWithMantine(React.createElement(MyTenancyDashboard));
    expect(html).toContain("dashboard.tenancyId");
  });

  test("schedules layout renders nested schedule nav", () => {
    const html = renderWithMantine(React.createElement(SchedulesLayout));
    expect(html).toContain("Schedules");
  });

  test("schedule view renders schedule name", () => {
    const html = renderWithMantine(
      React.createElement(ViewSchedulePage, {
        loaderData: {
          locale: "en",
          schedule: {
            id: "s1",
            name: "Morning Schedule",
            frameId: "f1",
            isPublished: false,
            entries: [],
            frame: { name: "2025 Frame" },
          },
          options: { classes: [], subjects: [], teachers: [], classrooms: [] },
        },
      }),
    );
    expect(html).toContain("Morning Schedule");
  });

  test("timeslots page renders placeholder", () => {
    const html = renderWithMantine(
      React.createElement(TimeslotsPage, {
        loaderData: {
          options: {
            frames: [],
            subjects: [],
            teachers: [],
            classrooms: [],
            classes: [],
          },
          timeslots: [],
        },
      })
    );
    expect(html).toContain("Timeslots");
  });

  test("protected dashboard renders loader data", () => {
    const html = renderWithMantine(
      React.createElement(ProtectedDashboard, {
        loaderData: { tenancyOverview: { source: "database" } },
      }),
    );
    expect(html).toContain("overview source");
  });

  test("login component renders action error", () => {
    const html = renderWithMantine(
      React.createElement(Login, {
        loaderData: { locale: "en", defaults: { email: "a@example.com", password: "pw" } },
        actionData: { ok: false, error: "Invalid email or password.", values: { email: "a@example.com" } },
      }),
    );
    expect(html).toContain("Invalid email or password.");
  });

  test("home component renders tenancy overview data", () => {
    const html = renderWithMantine(
      React.createElement(Home, {
        loaderData: {
          locale: "en",
          serverRenderedAt: "2026-03-30T00:00:00.000Z",
          tenancyOverview: {
            source: "database",
            errorMessage: null,
            overview: {
              counts: { tenancies: 1, users: 2, memberships: 2, activeMemberships: 2, teachers: 0, classes: 0, timeslots: 0, schedules: 0 },
              ratios: { activeMembershipRate: 1, schedulesPerTenancy: 0, timeslotsPerClass: 0 },
              health: { status: "healthy", score: 100, notes: ["ok"] },
            },
          },
          user: null,
        },
      }),
    );
    expect(html).toContain("SSR loader marker");
  });
});
