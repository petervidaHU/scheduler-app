import { useEffect, useState } from "react";
import { ActionIcon, Group, Paper, Stack, Table, Text } from "@mantine/core";
import { IconClock, IconTrash } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { Link, useOutletContext, useSubmit } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/my-tenancy.timeslots";
import type { MyTenancyOutletContext } from "./my-tenancy-layout";
import { requireTenancyUser } from "../lib/services/auth/guards.server";
import {
  createTimeslotFromForm,
  deleteTimeslotForTenancy,
  getTimeslotListForTenancy,
  getTimeslotOptions,
  type TimeslotListItem,
  updateTimeslotFromForm,
} from "../lib/services/timeslots/manageTimeslots.server";
import TimeslotForms from "../components/forms/TimeslotForms";
import { ConfirmModal, EmptyState, PageHeader } from "~/ui";

function toHHMM(totalMinutes: number) {
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await requireTenancyUser({
    request,
    locale: params.locale,
  });

  const [options, timeslots] = await Promise.all([
    getTimeslotOptions(user.tenancyId),
    getTimeslotListForTenancy(user.tenancyId),
  ]);

  return {
    options,
    timeslots,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  const user = await requireTenancyUser({
    request,
    locale: params.locale,
  });

  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "create");

  try {
    if (intent === "delete") {
      return await deleteTimeslotForTenancy({
        tenancyId: user.tenancyId,
        timeslotId: String(formData.get("timeslotId") ?? ""),
      });
    }

    if (intent === "update") {
      return await updateTimeslotFromForm({
        tenancyId: user.tenancyId,
        formData,
      });
    }

    return await createTimeslotFromForm({
      tenancyId: user.tenancyId,
      formData,
    });
  } catch (error) {
    const modeValue = formData.get("mode");
    const mode = modeValue === "template" ? "template" : "single";

    return {
      ok: false,
      intent: intent === "delete" ? "delete" : intent === "update" ? "update" : "create",
      mode,
      message: error instanceof Error ? error.message : "Failed to create timeslot.",
    };
  }
}

export default function TimeslotsPage({ loaderData, actionData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { locale } = useOutletContext<MyTenancyOutletContext>();
  const submit = useSubmit();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!actionData) return;

    if (actionData.ok) {
      notifications.show({ color: "tiffany", message: actionData.message });
    } else {
      notifications.show({ color: "poppy", message: actionData.message });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  const confirmDelete = () => {
    if (!pendingDeleteId) return;
    submit({ intent: "delete", timeslotId: pendingDeleteId }, { method: "post" });
    setPendingDeleteId(null);
  };

  return (
    <Stack gap="lg">
      <PageHeader title={t("nav.timeslots")} />

      <Paper withBorder radius="lg" p="md">
        <TimeslotForms options={loaderData.options} timeslots={loaderData.timeslots} />
      </Paper>

      <Paper withBorder radius="lg" p="md">
        <Text size="sm" c="dimmed" mb="sm">
          {t("timeslotForm.latestTimeslots")}
        </Text>

        {loaderData.timeslots.length === 0 ? (
          <EmptyState
            icon={IconClock}
            title={t("timeslotForm.noTimeslots")}
            action={
              <Text
                component={Link}
                to={`/${locale}/my-tenancy/admin`}
                size="sm"
                fw={500}
                c="var(--mantine-primary-color-filled)"
              >
                {t("timeslotForm.goToResources")}
              </Text>
            }
          />
        ) : (
          <Table striped withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t("timeslotForm.frameLabel")}</Table.Th>
                <Table.Th>{t("planner.day")}</Table.Th>
                <Table.Th>{t("planner.startTime")}</Table.Th>
                <Table.Th>{t("planner.endTime")}</Table.Th>
                <Table.Th>{t("ui.actions")}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {loaderData.timeslots.map((item: TimeslotListItem) => (
                <Table.Tr key={item.id}>
                  <Table.Td>{item.frameName}</Table.Td>
                  <Table.Td>{item.dayOfWeek}</Table.Td>
                  <Table.Td>{toHHMM(item.startMinute)}</Table.Td>
                  <Table.Td>{toHHMM(item.endMinute)}</Table.Td>
                  <Table.Td>
                    <Group gap="xs" justify="flex-end">
                      <ActionIcon
                        variant="light"
                        color="poppy"
                        onClick={() => setPendingDeleteId(item.id)}
                        aria-label={`${t("ui.delete")} ${item.frameName} ${item.dayOfWeek}`}
                      >
                        <IconTrash size={16} aria-hidden />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>

      <ConfirmModal
        opened={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("ui.deleteConfirmTitle", { name: t("entities.timeslot") })}
        danger
      >
        {t("timeslotForm.deleteConfirmMessage")}
      </ConfirmModal>
    </Stack>
  );
}
