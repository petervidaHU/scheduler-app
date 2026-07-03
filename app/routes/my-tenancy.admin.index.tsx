import { useEffect } from "react";
import { Paper, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useNavigate, useOutletContext, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import type { MyTenancyOutletContext } from "./my-tenancy-layout";
import type { Route } from "./+types/my-tenancy.admin.index";
import { requireTenancyUser } from "../lib/services/auth/guards.server";
import AdminClientComponent from "../components/admin/AdminClientComponent";
import { getTenancyAdminEntityCountsForTenancy } from "../lib/services/tenancy/getTenancyAdminEntityCounts.server";
import {
  deleteAdminEntityForTenancy,
  getAdminEntityTableData,
  type AdminEntityKey,
} from "../lib/services/tenancy/manageAdminEntities.server";
import AdminTabsWithTable from "../components/admin/AdminTabsWithTable";
import { PageHeader, entityMeta, type EntityKind } from "~/ui";

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

  const [countsResult, tableData] = await Promise.all([
    getTenancyAdminEntityCountsForTenancy(user.tenancyId),
    getAdminEntityTableData(user.tenancyId),
  ]);

  return {
    countsResult,
    tableData,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  const user = await requireTenancyUser({
    request,
    locale: params.locale,
  });

  const formData = await request.formData();
  const entityRaw = formData.get("entity");
  const entityId = String(formData.get("entityId") ?? "").trim();
  const entity: AdminEntityKey = isAdminEntity(String(entityRaw))
    ? (entityRaw as AdminEntityKey)
    : "specialty";

  if (!entityId) {
    return { ok: false as const, entity, message: "Entity id is required for delete." };
  }

  try {
    return await deleteAdminEntityForTenancy({ tenancyId: user.tenancyId, entity, entityId });
  } catch (error) {
    return {
      ok: false as const,
      entity,
      message: error instanceof Error ? error.message : "Failed to delete entity.",
    };
  }
}

export default function MyTenancyAdminIndex({ loaderData, actionData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { locale } = useOutletContext<MyTenancyOutletContext>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Create/edit pages redirect here with ?created=<entity> or ?updated=<entity>
  // so the toast fires once the user lands back on the list (UX-UI-principles §7).
  useEffect(() => {
    const createdEntity = searchParams.get("created");
    const updatedEntity = searchParams.get("updated");
    const flashEntity = createdEntity ?? updatedEntity;

    if (flashEntity && isAdminEntity(flashEntity)) {
      const entityLabel = t(entityMeta[flashEntity as EntityKind].labelKey);
      notifications.show({
        color: "tiffany",
        message: t(createdEntity ? "resources.entityCreated" : "resources.entityUpdated", {
          entity: entityLabel,
        }),
      });
      navigate(`/${locale}/my-tenancy/admin`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (!actionData) return;

    if (actionData.ok) {
      const entityLabel = t(entityMeta[actionData.entity as EntityKind].labelKey);
      notifications.show({
        color: "tiffany",
        message: t("resources.entityDeleted", { entity: entityLabel }),
      });
    } else {
      notifications.show({ color: "poppy", message: actionData.message });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  return (
    <Stack gap="lg">
      <PageHeader title={t("nav.resources")} description={t("resources.description")} />

      <AdminClientComponent locale={locale} counts={loaderData.countsResult.counts} />

      <Paper withBorder radius="lg" p="md">
        <AdminTabsWithTable locale={locale} data={loaderData.tableData} />
      </Paper>
    </Stack>
  );
}
