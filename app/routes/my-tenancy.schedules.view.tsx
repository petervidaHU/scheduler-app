import { Alert, Anchor, Badge, Group, Stack, Text, Title } from "@mantine/core";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/my-tenancy.schedules.view";
import { requireTenancyUser } from "../lib/services/auth/guards.server";
import {
  loadPlannerData,
  addPlannerEntry,
  removePlannerEntry,
} from "../lib/services/schedules/managePlannerEntries.server";
import { WeeklyPlannerGrid } from "../components/planner/WeeklyPlannerGrid";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await requireTenancyUser({ request, locale: params.locale });
  const scheduleId = params.id;

  const data = await loadPlannerData(scheduleId, user.tenancyId);

  if (!data) {
    throw new Response("Schedule not found", { status: 404 });
  }

  return {
    ...data,
    locale: params.locale,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  const user = await requireTenancyUser({ request, locale: params.locale });
  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "");

  if (intent === "remove-entry") {
    const entryId = String(formData.get("entryId") ?? "").trim();
    const result = await removePlannerEntry({ entryId, tenancyId: user.tenancyId });
    return result;
  }

  if (intent === "add-entry") {
    const result = await addPlannerEntry({
      tenancyId: user.tenancyId,
      scheduleId: params.id,
      frameId: String(formData.get("frameId") ?? ""),
      formData,
    });
    return result;
  }

  return { ok: false, errors: { form: `Unknown intent: ${intent}` } };
}

export default function ViewSchedulePage({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { schedule, options, locale } = loaderData;

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-start">
        <Stack gap={2}>
          <Title order={3}>{schedule.name}</Title>
          <Text size="sm" c="dimmed">
            {t("planner.frame")}: {schedule.frame?.name ?? schedule.frameId}
          </Text>
        </Stack>
        <Group gap="xs">
          <Badge variant="light" color={schedule.isPublished ? "green" : "gray"}>
            {schedule.isPublished ? t("planner.published") : t("planner.draft")}
          </Badge>
          <Anchor
            component={Link}
            to={`/${locale}/my-tenancy/schedules/${schedule.id}`}
            size="sm"
          >
            {t("planner.editSchedule")}
          </Anchor>
          <Anchor
            component={Link}
            to={`/${locale}/my-tenancy/schedules`}
            size="sm"
          >
            {t("planner.backToSchedules")}
          </Anchor>
        </Group>
      </Group>

      <Alert color="blue" variant="light">
        {t("planner.clickHint")}
      </Alert>

      <WeeklyPlannerGrid
        frameId={schedule.frameId}
        entries={schedule.entries}
        options={options}
      />
    </Stack>
  );
}
