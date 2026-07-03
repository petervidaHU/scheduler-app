import { Outlet, useOutletContext } from "react-router";
import type { TenancyOutletContext } from "./tenancy-layout";

export type MyTenancyOutletContext = TenancyOutletContext;

// Navigation and page chrome live in the TenancyAppShell (tenancy-layout);
// this layout only forwards the outlet context to nested routes.
export default function MyTenancyLayout() {
  const outletContext = useOutletContext<TenancyOutletContext>();

  return <Outlet context={outletContext} />;
}
