import { Outlet, useOutletContext } from "react-router";
import type { MyTenancyOutletContext } from "./my-tenancy-layout";

export type AdminOutletContext = MyTenancyOutletContext;

// Navigation and page chrome live in the TenancyAppShell; this layout only
// forwards the outlet context to the Resources list/new/edit routes.
export default function AdminLayout() {
  const context = useOutletContext<MyTenancyOutletContext>();

  return <Outlet context={context} />;
}
