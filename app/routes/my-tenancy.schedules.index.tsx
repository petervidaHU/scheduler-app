import { Anchor, Paper, Stack, Table, Text } from "@mantine/core";
import { Link, useOutletContext } from "react-router";
import type { SchedulesOutletContext } from "./my-tenancy.schedules-layout";
import type { Route } from "./+types/my-tenancy.schedules.index";
import { requireTenancyUser } from "../lib/services/auth/guards.server";
import { getScheduleListForTenancy } from "../lib/services/schedules/manageSchedules.server";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await requireTenancyUser({
    request,
    locale: params.locale,
  });

  try {
    const schedules = await getScheduleListForTenancy(user.tenancyId);
    return { schedules, error: null as string | null };
  } catch (error) {
    return {
      schedules: [],
      error: error instanceof Error ? error.message : "Failed to load schedules.",
    };
  }
}

export default function SchedulesIndex({ loaderData }: Route.ComponentProps) {
  const { locale } = useOutletContext<SchedulesOutletContext>();

  return (
    <Stack gap="md">
      <Paper withBorder radius="md" p="md">
        {loaderData.error ? (
          <Text size="sm" c="orange" mb="sm">
            Failed to load schedules from database: {loaderData.error}
          </Text>
        ) : (
          <Text size="sm" c="dimmed" mb="sm">
            Schedules loaded from Prisma by tenancy.
          </Text>
        )}
        <Table striped withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Frame</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Entries</Table.Th>
              <Table.Th>Updated</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {loaderData.schedules.map(
              (schedule: {
                id: string;
                name: string;
                frameName: string;
                isPublished: boolean;
                entryCount: number;
                updatedAtIso: string;
              }) => (
              <Table.Tr key={schedule.id}>
                <Table.Td>{schedule.id}</Table.Td>
                <Table.Td>{schedule.name}</Table.Td>
                <Table.Td>{schedule.frameName}</Table.Td>
                <Table.Td>{schedule.isPublished ? "PUBLISHED" : "DRAFT"}</Table.Td>
                <Table.Td>{schedule.entryCount}</Table.Td>
                <Table.Td>{new Date(schedule.updatedAtIso).toLocaleString()}</Table.Td>
                <Table.Td>
                  <Stack gap={2}>
                    <Anchor component={Link} to={`/${locale}/my-tenancy/schedules/${schedule.id}`}>
                      Edit
                    </Anchor>
                    <Anchor
                      component={Link}
                      to={`/${locale}/my-tenancy/schedules/view/${schedule.id}`}
                    >
                      View
                    </Anchor>
                  </Stack>
                </Table.Td>
              </Table.Tr>
              ),
            )}
            {loaderData.schedules.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={7}>
                  <Text size="sm" c="dimmed">
                    No schedules found for this tenancy.
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : null}
          </Table.Tbody>
        </Table>
      </Paper>
    </Stack>
  );
}
