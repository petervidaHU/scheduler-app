import { Outlet, useOutletContext } from "react-router";
import type { MyTenancyOutletContext } from "./my-tenancy-layout";

export type SchedulesOutletContext = MyTenancyOutletContext;

// Navigation for the schedules section comes from the shell sidebar and
// breadcrumbs; nested pages own their headers and actions.
export default function SchedulesLayout() {
  const context = useOutletContext<MyTenancyOutletContext>();

  return <Outlet context={context} />;
}
