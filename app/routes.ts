import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  index("routes/root-redirect.tsx"),
  // Locales API: serves translation JSON for client-side i18next hydration
  route("api/locales/:lng/:ns", "routes/api.locales.ts"),
  // Planner availability: returns booked teacher/classroom IDs for a given frame/day/time
  route("api/planner-availability", "routes/api.planner-availability.ts"),
  route(":locale", "routes/locale-layout.tsx", [
    route("logout", "routes/logout.tsx"),
    layout("routes/public-shell.tsx", [
      index("routes/home.tsx"),
      route("login", "routes/login.tsx"),
      route("signup", "routes/signup.tsx"),
      route("pricing", "routes/pricing.tsx"),
      route("documentation", "routes/documentation.tsx"),
      route("docs", "routes/docs.tsx"),
    ]),
    route("onboarding", "routes/onboarding.tsx"),
    route("switch-tenancy", "routes/switch-tenancy.tsx"),
    layout("routes/tenancy-layout.tsx", [
      route("app", "routes/protected-dashboard.tsx"),
      route("my-tenancy", "routes/my-tenancy-layout.tsx", [
        index("routes/my-tenancy.index.tsx"),
        route("admin", "routes/my-tenancy.admin.tsx"),
        route("schedules", "routes/my-tenancy.schedules-layout.tsx", [
          index("routes/my-tenancy.schedules.index.tsx"),
          route("new", "routes/my-tenancy.schedules.new.tsx"),
          route(":id", "routes/my-tenancy.schedules.edit.tsx"),
          route("view/:id", "routes/my-tenancy.schedules.view.tsx"),
        ]),
        route("timeslots", "routes/my-tenancy.timeslots.tsx"),
        route("syllabus", "routes/my-tenancy.syllabus.tsx"),
      ]),
    ]),
  ]),
] satisfies RouteConfig;
