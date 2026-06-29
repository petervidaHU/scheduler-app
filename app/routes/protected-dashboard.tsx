import { Anchor, Paper, Stack, Text, Title } from "@mantine/core";
import { Form, Link, useOutletContext } from "react-router";
import type { Route } from "./+types/protected-dashboard";
import { getTenancyOverview } from "../lib/services/tenancy/getTenancyOverview.server";
import type { TenancyOutletContext } from "./tenancy-layout";

export async function loader({}: Route.LoaderArgs) {
  const tenancyOverview = await getTenancyOverview();

  return {
    tenancyOverview,
  };
}

export default function ProtectedDashboard({ loaderData }: Route.ComponentProps) {
  const { locale, user } = useOutletContext<TenancyOutletContext>();

  return (
    <Stack maw={760} mx="auto" mt="xl" p="md" gap="md">
      <Title order={2}>Protected dashboard</Title>
      <Text c="dimmed" size="sm">
        Authenticated route guarded by Phase 3 service-layer guard.
      </Text>

      <Paper withBorder radius="md" p="md">
        <Stack gap="xs">
          <Text size="sm">userId: {user.userId}</Text>
          <Text size="sm">email: {user.email}</Text>
          <Text size="sm">tenancyId: {user.tenancyId}</Text>
          <Text size="sm">role: {user.role}</Text>
          <Text size="sm">overview source: {loaderData.tenancyOverview.source}</Text>
        </Stack>
      </Paper>

      <Stack gap="xs">
        <Anchor component={Link} to={`/${locale}`}>
          Back to home
        </Anchor>
        <Form method="post" action={`/${locale}/logout`}>
          <button type="submit">Sign out</button>
        </Form>
      </Stack>
    </Stack>
  );
}
