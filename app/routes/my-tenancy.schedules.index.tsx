import { ActionIcon, Alert, Badge, Button, Group, Paper, Stack, Table, Text } from "@mantine/core";
import { IconCalendarWeek, IconEye, IconPencil, IconPlus } from "@tabler/icons-react";
import { Link, useOutletContext } from "react-router";
import { useTranslation } from "react-i18next";
import type { SchedulesOutletContext } from "./my-tenancy.schedules-layout";
import type { Route } from "./+types/my-tenancy.schedules.index";
import { requireTenancyUser } from "../lib/services/auth/guards.server";
import {
  getScheduleListForTenancy,
  type ScheduleListItem,
} from "../lib/services/schedules/manageSchedules.server";
import { EmptyState, PageHeader } from "~/ui";

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
  const { t } = useTranslation();
  const { locale } = useOutletContext<SchedulesOutletContext>();

  return (
    <Stack gap="lg">
      <PageHeader
        title={t("schedule.schedules")}
        actions={
          <Button
            component={Link}
            to={`/${locale}/my-tenancy/schedules/new`}
            leftSection={<IconPlus size={16} aria-hidden />}
          >
            {t("schedule.createNewSchedule")}
          </Button>
        }
      />

      {loaderData.error ? (
        <Alert color="khaki" variant="light">
          {t("schedule.loadErrorMessage")}
        </Alert>
      ) : null}

      {loaderData.schedules.length === 0 ? (
        <EmptyState icon={IconCalendarWeek} title={t("schedule.noSchedulesTitle")} message={t("schedule.noSchedulesMessage")} />
      ) : (
        <Paper withBorder radius="lg" p="md">
          <Table striped withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t("schedule.name")}</Table.Th>
                <Table.Th>{t("schedule.frame")}</Table.Th>
                <Table.Th>{t("schedule.status")}</Table.Th>
                <Table.Th>{t("schedule.entries")}</Table.Th>
                <Table.Th>{t("schedule.updated")}</Table.Th>
                <Table.Th>{t("schedule.actions")}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {loaderData.schedules.map((schedule: ScheduleListItem) => (
                <Table.Tr key={schedule.id}>
                  <Table.Td>{schedule.name}</Table.Td>
                  <Table.Td>{schedule.frameName}</Table.Td>
                  <Table.Td>
                    <Badge variant="light" color={schedule.isPublished ? "tiffany" : "gray"}>
                      {schedule.isPublished ? t("planner.published") : t("schedule.draft")}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{schedule.entryCount}</Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {new Date(schedule.updatedAtIso).toLocaleDateString()}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs" justify="flex-end">
                      <ActionIcon
                        variant="light"
                        component={Link}
                        to={`/${locale}/my-tenancy/schedules/view/${schedule.id}`}
                        aria-label={`${t("schedule.view")} ${schedule.name}`}
                      >
                        <IconEye size={16} aria-hidden />
                      </ActionIcon>
                      <ActionIcon
                        variant="light"
                        component={Link}
                        to={`/${locale}/my-tenancy/schedules/${schedule.id}`}
                        aria-label={`${t("schedule.edit")} ${schedule.name}`}
                      >
                        <IconPencil size={16} aria-hidden />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      )}
    </Stack>
  );
}
