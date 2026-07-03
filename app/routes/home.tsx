import type { Route } from "./+types/home";
import { Button, Group, Stack, Text, Title } from "@mantine/core";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { getOptionalUserSession } from "../lib/auth/session.server";
import { isSupportedLocale } from "../lib/i18n";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getOptionalUserSession(request);
  const locale = isSupportedLocale(params.locale) ? params.locale : "en";

  return { user, locale };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Scheduler App" },
    { name: "description", content: "Plan and manage class schedules for your school." },
  ];
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { user, locale } = loaderData;
  const { t } = useTranslation();

  return (
    <Stack maw={640} mx="auto" mt={80} p="md" gap="lg" ta="center">
      <Stack gap="xs">
        <Title order={1}>{t("home.welcome")}</Title>
        <Text c="dimmed" size="lg">
          {t("home.welcomeText")}
        </Text>
      </Stack>

      <Group justify="center">
        {user ? (
          <Button
            component={Link}
            to={user.tenancyId ? `/${locale}/my-tenancy` : `/${locale}/onboarding`}
            size="md"
          >
            {t("home.goToDashboard")}
          </Button>
        ) : (
          <>
            <Button component={Link} to={`/${locale}/signup`} size="md">
              {t("auth.signUp")}
            </Button>
            <Button component={Link} to={`/${locale}/login`} variant="default" size="md">
              {t("auth.signIn")}
            </Button>
          </>
        )}
      </Group>
    </Stack>
  );
}
