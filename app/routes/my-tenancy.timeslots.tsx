import { Alert, Paper, Stack, Table, Text, Title } from "@mantine/core";
import { Form } from "react-router";
import type { Route } from "./+types/my-tenancy.timeslots";
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
  return (
    <Stack gap="md">
      <Title order={3}>Timeslots</Title>
      <Alert color="blue" variant="light">
        Timeslot and template forms were migrated with Mantine useForm and React Router
        route actions.
      </Alert>
      {actionData ? (
        <Alert color={actionData.ok ? "green" : "red"} variant="light">
          {actionData.message}
        </Alert>
      ) : null}
      <Paper withBorder radius="md" p="md">
        <TimeslotForms options={loaderData.options} timeslots={loaderData.timeslots} />
      </Paper>
      <Paper withBorder radius="md" p="md">
        <Text size="sm" c="dimmed" mb="sm">
          Latest 50 timeslots for this tenancy
        </Text>
        <Table striped withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Frame</Table.Th>
              <Table.Th>Day</Table.Th>
              <Table.Th>Start</Table.Th>
              <Table.Th>End</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {loaderData.timeslots.map((item: TimeslotListItem) => (
              <Table.Tr key={item.id}>
                <Table.Td>{item.id}</Table.Td>
                <Table.Td>{item.frameName}</Table.Td>
                <Table.Td>{item.dayOfWeek}</Table.Td>
                <Table.Td>{toHHMM(item.startMinute)}</Table.Td>
                <Table.Td>{toHHMM(item.endMinute)}</Table.Td>
                <Table.Td>
                  <Form method="post">
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="timeslotId" value={item.id} />
                    <button type="submit">Delete</button>
                  </Form>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>
    </Stack>
  );
}
