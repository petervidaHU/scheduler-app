import { Alert, Anchor, Button, Paper, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { Form, Link, redirect, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/login";
import { commitUserSession, getOptionalUserSession } from "../lib/auth/session.server";
import { loginWithEmailPassword } from "../lib/services/auth/login.server";
import { isSupportedLocale } from "../lib/i18n";

function toSafeLocale(locale: string | undefined) {
  return isSupportedLocale(locale) ? locale : "en";
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const locale = toSafeLocale(params.locale);
  const user = await getOptionalUserSession(request);

  if (user) {
    throw redirect(user.tenancyId ? `/${locale}/my-tenancy` : `/${locale}/onboarding`);
  }

  return {
    locale,
    defaults: {
      email: process.env.AUTH_BOOTSTRAP_EMAIL ?? "admin@example.com",
      password: process.env.AUTH_BOOTSTRAP_PASSWORD ?? "admin1234",
    },
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  const locale = toSafeLocale(params.locale);
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return {
      ok: false,
      error: "Email and password are required.",
      values: { email },
    };
  }

  const result = await loginWithEmailPassword({ email, password });

  if (!result.ok) {
    return {
      ok: false,
      error: result.message,
      values: { email },
    };
  }

  const redirectTo = result.user.tenancyId
    ? `/${locale}/my-tenancy`
    : `/${locale}/onboarding`;

  return commitUserSession({
    request,
    user: result.user,
    redirectTo,
  });
}

export default function Login({ loaderData, actionData }: Route.ComponentProps) {
  const error = actionData && !actionData.ok ? actionData.error : null;
  const emailValue = actionData && !actionData.ok ? actionData.values.email : loaderData.defaults.email;
  const passwordValue = loaderData.defaults.password;
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const justRegistered = searchParams.get("registered") === "1";

  return (
    <Stack maw={520} mx="auto" mt="xl" p="md" gap="md">
      <Title order={2}>{t("auth.signIn")}</Title>

      {justRegistered ? (
        <Alert color="tiffany" variant="light">
          {t("auth.registrationSuccess")}
        </Alert>
      ) : null}

      <Paper withBorder radius="md" p="md">
        <Form method="post">
          <Stack gap="sm">
            <TextInput name="email" label={t("auth.email")} defaultValue={emailValue} required />
            <PasswordInput
              name="password"
              label={t("auth.password")}
              defaultValue={passwordValue}
              required
            />
            {error ? (
              <Text c="poppy" size="sm">
                {error}
              </Text>
            ) : null}
            <Button type="submit">{t("auth.signInButton")}</Button>
          </Stack>
        </Form>
      </Paper>

      <Text size="sm">
        {t("auth.noAccount")}{" "}
        <Anchor component={Link} to={`/${loaderData.locale}/signup`}>
          {t("auth.signUp")}
        </Anchor>
      </Text>

      <Anchor component={Link} to={`/${loaderData.locale}`}>
        {t("auth.backToHome")}
      </Anchor>
    </Stack>
  );
}
