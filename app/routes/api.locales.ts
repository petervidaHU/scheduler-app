import { data } from "react-router";
import type { Route } from "./+types/api.locales";
import resources from "~/locales";

type Locale = keyof typeof resources;
type Namespace = keyof (typeof resources)[Locale];

/**
 * Resource route that serves translation JSON to the i18next client fetcher.
 * Path: /api/locales/:lng/:ns
 * Consumed by entry.client.tsx via i18next-fetch-backend loadPath.
 */
export async function loader({ params }: Route.LoaderArgs) {
  const lng = params.lng as Locale;
  const ns = params.ns as Namespace;

  const localeData = resources[lng];
  if (!localeData) {
    return data({ error: `Locale "${lng}" not found` }, { status: 404 });
  }

  const nsData = localeData[ns];
  if (!nsData) {
    return data(
      { error: `Namespace "${ns}" not found in locale "${lng}"` },
      { status: 404 },
    );
  }

  const headers = new Headers();

  if (process.env.NODE_ENV === "production") {
    // Cache locale bundles in the browser for 5 minutes, CDN for 1 hour
    headers.set("Cache-Control", "public, max-age=300, s-maxage=3600");
  }

  return data(nsData, { headers });
}
