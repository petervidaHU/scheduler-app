import { Form, redirect } from "react-router";
import type { Route } from "./+types/logout";
import { Button, Stack, Text, Title } from "@mantine/core";
import { destroyUserSession } from "../lib/auth/session.server";
import { isSupportedLocale } from "../lib/i18n";

function toSafeLocale(locale: string | undefined) {
  return isSupportedLocale(locale) ? locale : "en";
}

export async function action({ request, params }: Route.ActionArgs) {
  const locale = toSafeLocale(params.locale);

  return destroyUserSession({
    request,
    redirectTo: `/${locale}/login`,
  });
}

export async function loader({ params }: Route.LoaderArgs) {
  const locale = toSafeLocale(params.locale);
  throw redirect(`/${locale}/app`);
}

export default function Logout() {
  return (
    <Stack maw={520} mx="auto" mt="xl" p="md" gap="md">
      <Title order={2}>Sign out</Title>
      <Text c="dimmed" size="sm">
        This route clears the session cookie.
      </Text>
      <Form method="post">
        <Button type="submit" color="poppy">
          Confirm sign out
        </Button>
      </Form>
    </Stack>
  );
}
