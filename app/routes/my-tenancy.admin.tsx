import { Alert, Paper, Stack, Text, Title } from "@mantine/core";
import { useOutletContext, useSearchParams } from "react-router";
import type { MyTenancyOutletContext } from "./my-tenancy-layout";
import type { Route } from "./+types/my-tenancy.admin";
import { requireTenancyUser } from "../lib/services/auth/guards.server";
import AdminClientComponent from "../components/admin/AdminClientComponent";
import { getTenancyAdminEntityCountsForTenancy } from "../lib/services/tenancy/getTenancyAdminEntityCounts.server";
import {
  createAdminEntity,
  deleteAdminEntityForTenancy,
  getAdminEntityTableData,
  getAdminFormOptions,
  type AdminEntityKey,
} from "../lib/services/tenancy/manageAdminEntities.server";
import AdminEntityForms from "../components/forms/AdminEntityForms";
import AdminTabsWithTable from "../components/admin/AdminTabsWithTable";

const ADMIN_FORM_ENTITIES: AdminEntityKey[] = [
  "specialty",
  "subject",
  "teacher",
  "classroom",
  "class",
  "frame",
];

function isAdminEntity(value: string | null): value is AdminEntityKey {
  return !!value && ADMIN_FORM_ENTITIES.includes(value as AdminEntityKey);
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await requireTenancyUser({
    request,
    locale: params.locale,
  });

  const [countsResult, options, tableData] = await Promise.all([
    getTenancyAdminEntityCountsForTenancy(user.tenancyId),
    getAdminFormOptions(user.tenancyId),
    getAdminEntityTableData(user.tenancyId),
  ]);

  return {
    countsResult,
    options,
    tableData,
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
    if (intent === "deleteEntity") {
      const entityRaw = formData.get("entity");
      const entityId = String(formData.get("entityId") ?? "").trim();
      const entity: AdminEntityKey = isAdminEntity(String(entityRaw))
        ? (entityRaw as AdminEntityKey)
        : "specialty";

      if (!entityId) {
        return {
          ok: false,
          entity,
          message: "Entity id is required for delete.",
        };
      }

      return await deleteAdminEntityForTenancy({
        tenancyId: user.tenancyId,
        entity,
        entityId,
      });
    }

    return await createAdminEntity({
      tenancyId: user.tenancyId,
      formData,
    });
  } catch (error) {
    const entityRaw = formData.get("entity");
    const entity: AdminEntityKey = isAdminEntity(String(entityRaw))
      ? (entityRaw as AdminEntityKey)
      : "specialty";

    return {
      ok: false,
      entity,
      message: error instanceof Error ? error.message : "Failed to create entity.",
    };
  }
}

export default function MyTenancyAdmin({ loaderData, actionData }: Route.ComponentProps) {
  const { user, locale } = useOutletContext<MyTenancyOutletContext>();
  const [searchParams] = useSearchParams();
  const selectedEntity = searchParams.get("entity");
  const selectedAdminEntity = isAdminEntity(selectedEntity) ? selectedEntity : null;
  const actionForSelectedEntity =
    actionData && selectedAdminEntity && actionData.entity === selectedAdminEntity
      ? actionData
      : null;

  return (
    <Stack gap="md">
      <Title order={3}>Admin</Title>
      <Alert color="blue" variant="light">
        Tenant admin cards were migrated from the old component set and are now backed by
        tenancy-scoped Prisma counts.
      </Alert>
      {loaderData.countsResult.errorMessage ? (
        <Alert color="orange" variant="light">
          Count query fallback in use: {loaderData.countsResult.errorMessage}
        </Alert>
      ) : null}
      <Paper withBorder radius="md" p="md">
        <Text size="sm">Current user role: {user.role ?? "N/A"}</Text>
        <Text size="sm" c="dimmed" mt="xs">
          Data source: {loaderData.countsResult.source}
        </Text>
      </Paper>
      <AdminClientComponent locale={locale} counts={loaderData.countsResult.counts} />
      <Paper withBorder radius="md" p="md">
        <Stack gap="sm">
          <Title order={4}>Entity tables</Title>
          <Text size="sm" c="dimmed">
            Migrated tabbed table view from the old admin area with row-level edit/delete actions.
          </Text>
          <AdminTabsWithTable locale={locale} data={loaderData.tableData} />
        </Stack>
      </Paper>
      {selectedAdminEntity ? (
        <Paper withBorder radius="md" p="md">
          <Stack gap="sm">
            <Title order={4}>Create {selectedAdminEntity}</Title>
            <Text size="sm" c="dimmed">
              Migrated from the original forms folder using Mantine `useForm` hook patterns.
            </Text>
            {actionForSelectedEntity ? (
              <Alert color={actionForSelectedEntity.ok ? "green" : "red"} variant="light">
                {actionForSelectedEntity.message}
              </Alert>
            ) : null}
            <AdminEntityForms entity={selectedAdminEntity} options={loaderData.options} />
          </Stack>
        </Paper>
      ) : null}
    </Stack>
  );
}
