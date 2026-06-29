import { redirect } from "react-router";
import type { Route } from "./+types/docs";
import { isSupportedLocale } from "../lib/i18n";

function toSafeLocale(locale: string | undefined) {
  return isSupportedLocale(locale) ? locale : "en";
}

export async function loader({ params }: Route.LoaderArgs) {
  const locale = toSafeLocale(params.locale);
  throw redirect(`/${locale}/documentation`);
}

export default function DocsRedirect() {
  return null;
}
