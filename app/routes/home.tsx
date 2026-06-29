import type { Route } from "./+types/home";
import { Anchor, Button, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { Form, Link } from "react-router";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LOCALES } from "../lib/i18n";
import { getOptionalUserSession } from "../lib/auth/session.server";
import { getTenancyOverview } from "../lib/services/tenancy/getTenancyOverview.server";
import { useUiStore } from "../store/uiStore";

export async function loader({ params, request }: Route.LoaderArgs) {
  const tenancyOverview = await getTenancyOverview();
  const user = await getOptionalUserSession(request);

  return {
    locale: params.locale,
    serverRenderedAt: new Date().toISOString(),
    tenancyOverview,
    user,
  };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Scheduler App - React Router v7" },
    { name: "description", content: "Phase 1 migration bootstrap" },
  ];
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { locale, serverRenderedAt, tenancyOverview, user } = loaderData;
  const { demoClicks, incrementDemoClicks } = useUiStore();
  const { counts, ratios, health } = tenancyOverview.overview;
  const { t } = useTranslation();

  return (
    <Stack maw={760} mx="auto" mt="xl" p="md" gap="md">
      <Title order={2}>{t("home.welcome")}</Title>
      <Text c="dimmed">
        {t("home.welcomeText")}
      </Text>

      <Group gap="xs">
        <Text size="sm" fw={600}>
          Active locale: {locale}
        </Text>
        {SUPPORTED_LOCALES.map((supportedLocale) => (
          <Anchor
            key={supportedLocale}
            component={Link}
            to={`/${supportedLocale}`}
            underline={supportedLocale === locale ? "always" : "hover"}
          >
            {supportedLocale.toUpperCase()}
          </Anchor>
        ))}
      </Group>

      <Paper withBorder radius="md" p="md">
        <Stack gap="xs">
          <Text fw={600}>SSR loader marker</Text>
          <Text size="sm">serverRenderedAt: {serverRenderedAt}</Text>
        </Stack>
      </Paper>

      <Paper withBorder radius="md" p="md">
        <Stack gap="xs">
          <Text fw={600}>Integrated backend marker (service/domain/repository)</Text>
          <Text size="sm">authenticated: {user ? "yes" : "no"}</Text>
          {user ? <Text size="sm">session email: {user.email}</Text> : null}
          <Text size="sm">source: {tenancyOverview.source}</Text>
          {tenancyOverview.errorMessage ? (
            <Text size="sm" c="orange">
              db error (fallback used): {tenancyOverview.errorMessage}
            </Text>
          ) : null}
          <Text size="sm">tenancies: {counts.tenancies}</Text>
          <Text size="sm">users: {counts.users}</Text>
          <Text size="sm">classes: {counts.classes}</Text>
          <Text size="sm">timeslots: {counts.timeslots}</Text>
          <Text size="sm">activeMembershipRate: {ratios.activeMembershipRate}</Text>
          <Text size="sm">schedulesPerTenancy: {ratios.schedulesPerTenancy}</Text>
          <Text size="sm">timeslotsPerClass: {ratios.timeslotsPerClass}</Text>
          <Text size="sm">
            health: {health.status} (score {health.score})
          </Text>
          {health.notes.map((note: string) => (
            <Text key={note} size="sm" c="dimmed">
              - {note}
            </Text>
          ))}
        </Stack>
      </Paper>

      <Paper withBorder radius="md" p="md">
        <Stack gap="xs">
          <Text fw={600}>Zustand bootstrap marker</Text>
          <Text size="sm">demoClicks: {demoClicks}</Text>
          <Button onClick={incrementDemoClicks} w="fit-content">
            Increment demo clicks
          </Button>
        </Stack>
      </Paper>

      <Paper withBorder radius="md" p="md">
        <Stack gap="xs">
          <Text fw={600}>Phase 3 auth routes</Text>
          {user ? (
            <>
              <Anchor component={Link} to={`/${locale}/app`}>
                Open protected dashboard
              </Anchor>
              <Form method="post" action={`/${locale}/logout`}>
                <Button type="submit" variant="light" color="red" w="fit-content">
                  Sign out
                </Button>
              </Form>
            </>
          ) : (
            <Anchor component={Link} to={`/${locale}/login`}>
              Go to sign in
            </Anchor>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
