import {
  Alert,
  Button,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { Form, redirect } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/onboarding";
import { requireOnboardingUser } from "../lib/services/auth/guards.server";
import { createTenancyForUser } from "../lib/services/tenancy/createTenancy.server";
import { commitUserSession } from "../lib/auth/session.server";
import { isSupportedLocale } from "../lib/i18n";

function toSafeLocale(locale: string | undefined) {
  return isSupportedLocale(locale) ? locale : "en";
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const locale = toSafeLocale(params.locale);
  // allowWithTenancy: true so existing users can also create an additional school
  const user = await requireOnboardingUser({ request, locale, allowWithTenancy: true });
  return { locale, email: user.email };
}

export async function action({ request, params }: Route.ActionArgs) {
  const locale = toSafeLocale(params.locale);
  const user = await requireOnboardingUser({ request, locale, allowWithTenancy: true });

  const formData = await request.formData();
  const tenancyName = String(formData.get("tenancyName") ?? "").trim();

  const result = await createTenancyForUser({
    userId: user.userId,
    tenancyName,
  });

  if (!result.ok) {
    return {
      ok: false as const,
      errors: result.errors,
      values: { tenancyName },
    };
  }

  return commitUserSession({
    request,
    user: {
      userId: user.userId,
      email: user.email,
      tenancyId: result.tenancyId,
      role: result.role,
    },
    redirectTo: `/${locale}/my-tenancy`,
  });
}

export default function OnboardingPage({ loaderData, actionData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const errors = actionData && !actionData.ok ? actionData.errors : null;
  const values = actionData && !actionData.ok ? actionData.values : null;

  return (
    <Stack maw={520} mx="auto" mt="xl" p="md" gap="md">
      <Title order={2}>{t("onboarding.title")}</Title>
      <Text c="dimmed" size="sm">
        {t("onboarding.subtitle")}
      </Text>
      <Text size="sm">
        {t("onboarding.loggedInAs")} <strong>{loaderData.email}</strong>
      </Text>

      <Paper withBorder radius="md" p="md">
        <Form method="post">
          <Stack gap="sm">
            <TextInput
              name="tenancyName"
              label={t("onboarding.schoolNameLabel")}
              placeholder={t("onboarding.schoolNamePlaceholder")}
              defaultValue={values?.tenancyName ?? ""}
              error={errors?.name}
              required
            />
            {errors?.form ? (
              <Alert color="poppy" variant="light">
                {errors.form}
              </Alert>
            ) : null}
            <Button type="submit">{t("onboarding.createButton")}</Button>
          </Stack>
        </Form>
      </Paper>
    </Stack>
  );
}
