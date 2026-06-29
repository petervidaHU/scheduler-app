import {
  Alert,
  Anchor,
  Badge,
  Button,
  Card,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { Form, Link, redirect } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/switch-tenancy";
import {
  requireAuthenticatedUser,
} from "../lib/services/auth/guards.server";
import {
  getMembershipsForSwitch,
  resolveSwitchTarget,
} from "../lib/services/tenancy/switchTenancy.server";
import { commitUserSession, getOptionalUserSession } from "../lib/auth/session.server";
import { isSupportedLocale } from "../lib/i18n";

function toSafeLocale(locale: string | undefined) {
  return isSupportedLocale(locale) ? locale : "en";
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const locale = toSafeLocale(params.locale);
  const user = await requireAuthenticatedUser({ request, locale });
  const memberships = await getMembershipsForSwitch(user.userId);

  if (memberships.length === 0) {
    throw redirect(`/${locale}/onboarding`);
  }

  return { locale, currentTenancyId: user.tenancyId, memberships };
}

export async function action({ request, params }: Route.ActionArgs) {
  const locale = toSafeLocale(params.locale);
  const user = await requireAuthenticatedUser({ request, locale });

  const formData = await request.formData();
  const requestedTenancyId = String(formData.get("tenancyId") ?? "").trim();

  if (!requestedTenancyId) {
    return { ok: false as const, error: "No school selected." };
  }

  const memberships = await getMembershipsForSwitch(user.userId);
  const switchResult = resolveSwitchTarget({ requestedTenancyId, memberships });

  if (!switchResult.ok) {
    return { ok: false as const, error: switchResult.error };
  }

  return commitUserSession({
    request,
    user: {
      userId: user.userId,
      email: user.email,
      tenancyId: switchResult.tenancyId,
      role: switchResult.role,
    },
    redirectTo: `/${locale}/my-tenancy`,
  });
}

export default function SwitchTenancyPage({ loaderData, actionData }: Route.ComponentProps) {
  const { t } = useTranslation();

  return (
    <Stack maw={600} mx="auto" mt="xl" p="md" gap="md">
      <Title order={2}>{t("switchTenancy.title")}</Title>
      <Text c="dimmed" size="sm">
        {t("switchTenancy.subtitle")}
      </Text>

      {actionData && !actionData.ok ? (
        <Alert color="red" variant="light">
          {actionData.error}
        </Alert>
      ) : null}

      <Stack gap="sm">
        {loaderData.memberships.map((membership) => {
          const isCurrent = membership.tenancyId === loaderData.currentTenancyId;
          return (
            <Card key={membership.tenancyId} withBorder radius="md" p="md">
              <Group justify="space-between" wrap="wrap">
                <Stack gap={2}>
                  <Text fw={600}>{membership.tenancyName}</Text>
                  <Text size="xs" c="dimmed">
                    {membership.tenancySlug}
                  </Text>
                </Stack>
                <Group gap="xs">
                  <Badge
                    variant="light"
                    color={membership.role === "OWNER" ? "violet" : membership.role === "ADMIN" ? "blue" : "gray"}
                  >
                    {membership.role}
                  </Badge>
                  {isCurrent ? (
                    <Badge variant="dot" color="green">
                      {t("switchTenancy.current")}
                    </Badge>
                  ) : (
                    <Form method="post">
                      <input type="hidden" name="tenancyId" value={membership.tenancyId} />
                      <Button type="submit" size="xs" variant="light">
                        {t("switchTenancy.switchButton")}
                      </Button>
                    </Form>
                  )}
                </Group>
              </Group>
            </Card>
          );
        })}
      </Stack>

      <Text size="sm" c="dimmed">
        {t("switchTenancy.createNewPrompt")}{" "}
        <Anchor component={Link} to={`/${loaderData.locale}/onboarding`}>
          {t("switchTenancy.createNewLink")}
        </Anchor>
      </Text>
    </Stack>
  );
}
