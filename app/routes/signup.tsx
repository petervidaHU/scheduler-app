import {
  Anchor,
  Button,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { Form, Link, redirect } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/signup";
import { getOptionalUserSession } from "../lib/auth/session.server";
import { signupWithEmailPassword } from "../lib/services/auth/signup.server";
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

  return { locale };
}

export async function action({ request, params }: Route.ActionArgs) {
  const locale = toSafeLocale(params.locale);
  const formData = await request.formData();

  const email = String(formData.get("email") ?? "").trim();
  const firstname = String(formData.get("firstname") ?? "").trim();
  const lastname = String(formData.get("lastname") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const result = await signupWithEmailPassword({ email, firstname, lastname, password });

  if (!result.ok) {
    return {
      ok: false as const,
      errors: result.errors,
      values: { email, firstname, lastname },
    };
  }

  throw redirect(`/${locale}/login?registered=1`);
}

export default function SignupPage({ loaderData, actionData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const errors = actionData && !actionData.ok ? actionData.errors : null;
  const values = actionData && !actionData.ok ? actionData.values : null;

  return (
    <Stack maw={520} mx="auto" mt="xl" p="md" gap="md">
      <Title order={2}>{t("auth.signUp")}</Title>
      <Text c="dimmed" size="sm">
        {t("auth.signUpSubtitle")}
      </Text>

      <Paper withBorder radius="md" p="md">
        <Form method="post">
          <Stack gap="sm">
            <TextInput
              name="firstname"
              label={t("auth.firstName")}
              defaultValue={values?.firstname ?? ""}
              error={errors?.firstname}
              required
            />
            <TextInput
              name="lastname"
              label={t("auth.lastName")}
              defaultValue={values?.lastname ?? ""}
              error={errors?.lastname}
              required
            />
            <TextInput
              name="email"
              label={t("auth.email")}
              type="email"
              defaultValue={values?.email ?? ""}
              error={errors?.email}
              required
            />
            <PasswordInput
              name="password"
              label={t("auth.password")}
              error={errors?.password}
              required
            />
            {errors?.form ? (
              <Text c="poppy" size="sm">
                {errors.form}
              </Text>
            ) : null}
            <Button type="submit">{t("auth.signUpButton")}</Button>
          </Stack>
        </Form>
      </Paper>

      <Text size="sm">
        {t("auth.alreadyHaveAccount")}{" "}
        <Anchor component={Link} to={`/${loaderData.locale}/login`}>
          {t("auth.signIn")}
        </Anchor>
      </Text>
    </Stack>
  );
}
