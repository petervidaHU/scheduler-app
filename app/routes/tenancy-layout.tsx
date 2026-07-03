import { Outlet } from "react-router";
import type { Route } from "./+types/tenancy-layout";
import { requireTenancyUser } from "../lib/services/auth/guards.server";
import { isSupportedLocale } from "../lib/i18n";
import type { TenancyUserSessionData } from "../lib/services/auth/guards.server";
import { TenancyAppShell } from "../components/shell/TenancyAppShell";

function toSafeLocale(locale: string | undefined) {
  return isSupportedLocale(locale) ? locale : "en";
}

export type TenancyOutletContext = {
  locale: string;
  user: TenancyUserSessionData;
};

export async function loader({ request, params }: Route.LoaderArgs) {
  const locale = toSafeLocale(params.locale);
  const user = await requireTenancyUser({ request, locale });

  return {
    locale,
    user,
  };
}

export default function TenancyLayout({ loaderData }: Route.ComponentProps) {
  return (
    <TenancyAppShell locale={loaderData.locale} user={loaderData.user}>
      <Outlet
        context={{
          locale: loaderData.locale,
          user: loaderData.user,
        }}
      />
    </TenancyAppShell>
  );
}
