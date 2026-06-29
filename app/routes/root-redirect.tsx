import { redirect } from "react-router";
import { DEFAULT_LOCALE } from "../lib/i18n";

export async function loader() {
  throw redirect(`/${DEFAULT_LOCALE}`);
}

export default function RootRedirect() {
  return null;
}
