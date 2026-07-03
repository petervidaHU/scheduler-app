import { Button, Checkbox, Paper, Select, Stack, Text, TextInput } from "@mantine/core";
import { Form, redirect, useOutletContext } from "react-router";
import { useTranslation } from "react-i18next";
import type { SchedulesOutletContext } from "./my-tenancy.schedules-layout";
import type { Route } from "./+types/my-tenancy.schedules.new";
import { requireTenancyUser } from "../lib/services/auth/guards.server";
import {
  createSchedule,
  getFrameOptionsForTenancy,
} from "../lib/services/schedules/manageSchedules.server";
import { PageHeader } from "~/ui";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await requireTenancyUser({
    request,
    locale: params.locale,
  });

  const frames = await getFrameOptionsForTenancy(user.tenancyId);

  return {
    frames,
    defaults: {
      name: "",
      frameId: frames[0]?.id ?? "",
      isPublished: false,
    },
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

  const result = await createSchedule({
    tenancyId: user.tenancyId,
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

export default function NewSchedulePage({ loaderData, actionData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { locale } = useOutletContext<SchedulesOutletContext>();
  const failedAction = actionData && !actionData.ok ? actionData : null;
  const values = failedAction?.values ?? loaderData.defaults;

  return (
    <Stack gap="lg">
      <PageHeader title={t("schedule.createNewSchedule")} />
      <Paper withBorder radius="lg" p="md" maw={480}>
        <Form method="post" action={`/${locale}/my-tenancy/schedules/new`}>
          <Stack gap="sm">
            <TextInput
              name="name"
              label={t("schedule.name")}
              placeholder={t("schedule.namePlaceholder")}
              defaultValue={values.name}
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
              defaultValue={values.frameId}
              error={failedAction?.error.fieldErrors.frameId}
              required
              searchable
            />
            <Checkbox
              name="isPublished"
              label={t("schedule.published")}
              defaultChecked={values.isPublished}
            />
            {failedAction?.error.formError ? (
              <Text c="poppy" size="sm">
                {failedAction.error.formError}
              </Text>
            ) : null}
            <Button type="submit">{t("schedule.createNewSchedule")}</Button>
          </Stack>
        </Form>
      </Paper>
    </Stack>
  );
}
