import { Anchor, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { Link, Outlet, useOutletContext } from "react-router";
import type { MyTenancyOutletContext } from "./my-tenancy-layout";

export type SchedulesOutletContext = MyTenancyOutletContext;

export default function SchedulesLayout() {
  const context = useOutletContext<MyTenancyOutletContext>();

  return (
    <Stack gap="md">
      <Paper withBorder radius="md" p="md">
        <Stack gap="xs">
          <Title order={4}>Schedules</Title>
          <Text size="sm" c="dimmed">
            Nested schedule routes: list, new, edit, and view.
          </Text>
          <Group gap="xs" wrap="wrap">
            <Anchor component={Link} to={`/${context.locale}/my-tenancy/schedules`}>
              List
            </Anchor>
            <Anchor component={Link} to={`/${context.locale}/my-tenancy/schedules/new`}>
              New
            </Anchor>
          </Group>
        </Stack>
      </Paper>

      <Outlet context={context} />
    </Stack>
  );
}
