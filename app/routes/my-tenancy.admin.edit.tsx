import { Paper, Stack, Text } from "@mantine/core";
import { redirect } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/my-tenancy.admin.edit";
import { requireTenancyUser } from "../lib/services/auth/guards.server";
import {
  getAdminEntityFormValues,
  getAdminFormOptions,
  updateAdminEntity,
  type AdminEntityKey,
} from "../lib/services/tenancy/manageAdminEntities.server";
import AdminEntityForms from "../components/forms/AdminEntityForms";
import { PageHeader, entityMeta, type EntityKind } from "~/ui";

const ADMIN_FORM_ENTITIES: AdminEntityKey[] = [
  "specialty",
  "subject",
  "teacher",
  "classroom",
  "class",
  "frame",
];

function isAdminEntity(value: string | undefined): value is AdminEntityKey {
  return !!value && ADMIN_FORM_ENTITIES.includes(value as AdminEntityKey);
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await requireTenancyUser({ request, locale: params.locale });

  if (!isAdminEntity(params.entity)) {
    throw new Response("Not Found", { status: 404 });
  }

  const [options, editingValues] = await Promise.all([
    getAdminFormOptions(user.tenancyId),
    getAdminEntityFormValues(user.tenancyId, params.entity, params.id),
  ]);

  if (!editingValues) {
    throw new Response("Not Found", { status: 404 });
  }

  return { entity: params.entity, entityId: params.id, options, editingValues };
}

export async function action({ request, params }: Route.ActionArgs) {
  const user = await requireTenancyUser({ request, locale: params.locale });

  if (!isAdminEntity(params.entity)) {
    throw new Response("Not Found", { status: 404 });
  }

  const formData = await request.formData();
  formData.set("entity", params.entity);

  try {
    await updateAdminEntity({ tenancyId: user.tenancyId, entityId: params.id, formData });
  } catch (error) {
    return {
      ok: false as const,
      message: error instanceof Error ? error.message : "Failed to update entity.",
    };
  }

  throw redirect(`/${params.locale}/my-tenancy/admin?updated=${params.entity}`);
}

export default function EditAdminEntityPage({ loaderData, actionData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const entityLabel = t(entityMeta[loaderData.entity as EntityKind].labelKey);

  return (
    <Stack gap="lg">
      <PageHeader title={t("resources.editEntity", { entity: entityLabel })} />
      <Paper withBorder radius="lg" p="md" maw={480}>
        <Stack gap="sm">
          {actionData && !actionData.ok && (
            <Text c="poppy" size="sm">
              {actionData.message}
            </Text>
          )}
          <AdminEntityForms
            entity={loaderData.entity}
            options={loaderData.options}
            initialValues={loaderData.editingValues}
            entityId={loaderData.entityId}
          />
        </Stack>
      </Paper>
    </Stack>
  );
}
