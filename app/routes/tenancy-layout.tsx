import { Anchor, Group, Stack, Text, Title } from "@mantine/core";
import { Form, Link, Outlet } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/tenancy-layout";
import { requireTenancyUser } from "../lib/services/auth/guards.server";
import { isSupportedLocale } from "../lib/i18n";
import type { TenancyUserSessionData } from "../lib/services/auth/guards.server";

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
  const { t } = useTranslation();

  return (
    <Stack maw={960} mx="auto" p="md" gap="md">
      <Group justify="space-between" wrap="wrap" mt="sm">
        <Stack gap={2}>
          <Title order={3}>{t("dashboard.myTenancyDashboard")}</Title>
          <Text size="sm" c="dimmed">
            {loaderData.user.email}
          </Text>
        </Stack>

        <Group gap="xs" wrap="wrap">
          <Anchor component={Link} to={`/${loaderData.locale}`}>
            Home
          </Anchor>
          <Anchor component={Link} to={`/${loaderData.locale}/my-tenancy`}>
            {t("common.mySchool")}
          </Anchor>
          <Anchor component={Link} to={`/${loaderData.locale}/switch-tenancy`}>
            {t("common.switchSchool")}
          </Anchor>
          <Form method="post" action={`/${loaderData.locale}/logout`}>
            <button type="submit">{t("common.logOut")}</button>
          </Form>
        </Group>
      </Group>

      <Outlet
        context={{
          locale: loaderData.locale,
          user: loaderData.user,
        }}
      />
    </Stack>
  );
}
