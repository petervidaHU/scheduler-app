import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import {
  Code,
  ColorSchemeScript,
  Container,
  MantineProvider,
  mantineHtmlProps,
  ScrollArea,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import type { Route } from "./+types/root";
import "./app.css";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { getLocale, i18nextMiddleware } from "~/middleware/i18next";
import { appTheme } from "./theme";

// Register the i18next middleware so it runs on every request
export const middleware = [i18nextMiddleware];

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Manrope:wght@400;500;600;700;800&display=swap",
  },
];

export async function loader({ context }: Route.LoaderArgs) {
  const locale = getLocale(context);
  return { locale };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();

  return (
    <html lang={i18n.language} {...mantineHtmlProps}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <ColorSchemeScript />
        <Meta />
        <Links />
      </head>
      <body>
        <MantineProvider theme={appTheme} defaultColorScheme="auto">
          <Notifications position="bottom-right" autoClose={4000} />
          {children}
        </MantineProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  const { i18n } = useTranslation();
  const locale = loaderData?.locale;

  // Keep client i18n instance in sync with the server-detected locale
  useEffect(() => {
    if (locale && i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }
  }, [locale, i18n]);

  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <Container component="main" size="sm" pt={64} pb="xl">
      <Stack gap="md">
        <Title order={1}>{message}</Title>
        <Text c="dimmed">{details}</Text>
        {stack && (
          <ScrollArea type="auto">
            <Code block>{stack}</Code>
          </ScrollArea>
        )}
      </Stack>
    </Container>
  );
}
