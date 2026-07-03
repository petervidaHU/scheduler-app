import { Button, Checkbox, Paper, Select, Stack, Text, TextInput } from "@mantine/core";
import { Form, redirect } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/my-tenancy.schedules.edit";
import { requireTenancyUser } from "../lib/services/auth/guards.server";
import {
  getFrameOptionsForTenancy,
  getScheduleForEdit,
  updateSchedule,
} from "../lib/services/schedules/manageSchedules.server";
import { PageHeader } from "~/ui";

export async function loader({ params, request }: Route.LoaderArgs) {
  const user = await requireTenancyUser({
    request,
    locale: params.locale,
  });

  const [schedule, frames] = await Promise.all([
    getScheduleForEdit({
      tenancyId: user.tenancyId,
      scheduleId: params.id,
    }),
    getFrameOptionsForTenancy(user.tenancyId),
  ]);

  if (!schedule) {
    throw new Response("Not Found", { status: 404 });
  }

  return {
    schedule,
    frames,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  const user = await requireTenancyUser({
    request,
    locale: params.locale,
  });

  const formData = await request.formData();
  const name = String(formData.get("name") ?? "");
  const frameId = String(formData.get("frameId") ?? "");
  const isPublished = formData.get("isPublished") === "on";

  const result = await updateSchedule({
    tenancyId: user.tenancyId,
    scheduleId: params.id,
    input: {
      name,
      frameId,
      isPublished,
    },
  });

  if (!result.ok) {
    return {
      ok: false as const,
      values: {
        name,
        frameId,
        isPublished,
      },
      error: result.error,
    };
  }

  throw redirect(`/${params.locale}/my-tenancy/schedules`);
}

export default function EditSchedulePage({ loaderData, actionData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const failedAction = actionData && !actionData.ok ? actionData : null;
  const nameValue = failedAction?.values.name ?? loaderData.schedule.name;
  const frameIdValue = failedAction?.values.frameId ?? loaderData.schedule.frameId;
  const isPublishedValue =
    failedAction?.values.isPublished ?? loaderData.schedule.isPublished;

  return (
    <Stack gap="lg">
      <PageHeader title={loaderData.schedule.name} />
      <Paper withBorder radius="lg" p="md" maw={480}>
        <Form method="post">
          <Stack gap="sm">
            <TextInput
              name="name"
              label={t("schedule.name")}
              defaultValue={nameValue}
              error={failedAction?.error.fieldErrors.name}
              required
            />
            <Select
              name="frameId"
              label={t("schedule.frame")}
              data={loaderData.frames.map((frame: { id: string; label: string }) => ({
                value: frame.id,
                label: frame.label,
              }))}
              defaultValue={frameIdValue}
              error={failedAction?.error.fieldErrors.frameId}
              searchable
              required
            />
            <Checkbox
              name="isPublished"
              label={t("schedule.published")}
              defaultChecked={isPublishedValue}
            />
            {failedAction?.error.formError ? (
              <Text c="poppy" size="sm">
                {failedAction.error.formError}
              </Text>
            ) : null}
            <Button type="submit">{t("schedule.saveChanges")}</Button>
          </Stack>
        </Form>
      </Paper>
    </Stack>
  );
}
