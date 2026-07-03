import { Anchor, Button, Group, Stack, Text } from "@mantine/core";
import { Form, Link, Outlet } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/public-shell";
import { getOptionalUserSession } from "../lib/auth/session.server";
import { isSupportedLocale } from "../lib/i18n";
import LocaleSwitcher from "../components/LocaleSwitcher";
import { ColorSchemeToggle } from "~/ui";

function toSafeLocale(locale: string | undefined) {
  return isSupportedLocale(locale) ? locale : "en";
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const locale = toSafeLocale(params.locale);
  const user = await getOptionalUserSession(request);

  return {
    locale,
    user,
  };
}

export default function PublicShell({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();

  return (
    <Stack maw={960} mx="auto" p="md" gap="md">
      <Group justify="space-between" wrap="wrap" pt="sm">
        <Group gap="xs" wrap="wrap">
          <Anchor component={Link} to={`/${loaderData.locale}`}>
            {t("nav.home")}
          </Anchor>
          <Anchor component={Link} to={`/${loaderData.locale}/pricing`}>
            {t("pricing.message1")}
          </Anchor>
          <Anchor component={Link} to={`/${loaderData.locale}/documentation`}>
            {t("documentation.title")}
          </Anchor>
        </Group>

        <LocaleSwitcher locale={loaderData.locale} />

        <ColorSchemeToggle />

        <Group gap="xs" wrap="wrap">
          {loaderData.user ? (
            <>
              <Text size="sm" c="dimmed">
                {loaderData.user.email}
              </Text>
              <Anchor
                component={Link}
                to={
                  loaderData.user.tenancyId
                    ? `/${loaderData.locale}/my-tenancy`
                    : `/${loaderData.locale}/onboarding`
                }
              >
                {t("home.goToDashboard")}
              </Anchor>
              <Form method="post" action={`/${loaderData.locale}/logout`}>
                <Button type="submit" variant="subtle" size="xs" color="gray">
                  {t("common.logOut")}
                </Button>
              </Form>
            </>
          ) : (
            <>
              <Anchor component={Link} to={`/${loaderData.locale}/login`}>
                {t("common.logIn")}
              </Anchor>
              <Anchor component={Link} to={`/${loaderData.locale}/signup`}>
                {t("auth.signUp")}
              </Anchor>
            </>
          )}
        </Group>
      </Group>

      <Outlet />
    </Stack>
  );
}
