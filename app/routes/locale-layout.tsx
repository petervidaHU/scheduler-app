import { Outlet } from "react-router";
import type { Route } from "./+types/locale-layout";
import { isSupportedLocale } from "../lib/i18n";

export async function loader({ params }: Route.LoaderArgs) {
  if (!isSupportedLocale(params.locale)) {
    throw new Response("Not Found", { status: 404 });
  }

  return { locale: params.locale };
}

export default function LocaleLayout() {
  return <Outlet />;
}
