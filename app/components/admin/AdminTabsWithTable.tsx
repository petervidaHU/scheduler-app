import { ActionIcon, Group, Table, Tabs, Text } from "@mantine/core";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSubmit } from "react-router";
import { ConfirmModal } from "~/ui";
import type {
  AdminEntityKey,
  AdminEntityTableData,
} from "../../lib/services/tenancy/manageAdminEntities.server";

type Props = {
  locale: string;
  data: AdminEntityTableData;
};

const tabs = [
  { entity: "specialty", labelKey: "nav.specialties" },
  { entity: "classroom", labelKey: "nav.classrooms" },
  { entity: "class", labelKey: "nav.classes" },
  { entity: "teacher", labelKey: "nav.teachers" },
  { entity: "subject", labelKey: "nav.subjects" },
  { entity: "frame", labelKey: "nav.frames" },
] as const satisfies ReadonlyArray<{ entity: AdminEntityKey; labelKey: string }>;

type PendingDelete = {
  entity: AdminEntityKey;
  entityId: string;
  name: string;
};

function EntityTable({
  locale,
  entity,
  headers,
  rows,
  onDeleteRequest,
}: {
  locale: string;
  entity: AdminEntityKey;
  headers: string[];
  rows: Array<{ id: string; cells: Array<string | number> }>;
  onDeleteRequest: (pending: PendingDelete) => void;
}) {
  const { t } = useTranslation();
  const entityLabel = t(`entities.${entity}`);

  if (rows.length === 0) {
    return (
      <Text size="sm" c="dimmed" mt="sm">
        {t("ui.noResults")}
      </Text>
    );
  }

  return (
    <Table striped highlightOnHover mt="sm">
      <Table.Thead>
        <Table.Tr>
          {headers.map((header) => (
            <Table.Th key={header}>{header}</Table.Th>
          ))}
          <Table.Th>{t("ui.actions")}</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows.map((row) => {
          // Cell 1 is the Name column across all admin entities; aria-labels
          // must name the record, never expose its id.
          const rowName = String(row.cells[1] ?? entityLabel);

          return (
            <Table.Tr key={row.id}>
              {row.cells.map((cell, index) => (
                <Table.Td key={`${row.id}-${index}`}>{cell}</Table.Td>
              ))}
              <Table.Td>
                <Group gap="xs" justify="flex-end">
                  <ActionIcon
                    variant="light"
                    component={Link}
                    to={`/${locale}/my-tenancy/admin/${entity}/${row.id}/edit`}
                    aria-label={`${t("ui.edit")} ${entityLabel}: ${rowName}`}
                  >
                    <IconPencil size={16} aria-hidden />
                  </ActionIcon>
                  <ActionIcon
                    variant="light"
                    color="poppy"
                    onClick={() =>
                      onDeleteRequest({ entity, entityId: row.id, name: rowName })
                    }
                    aria-label={`${t("ui.delete")} ${entityLabel}: ${rowName}`}
                  >
                    <IconTrash size={16} aria-hidden />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
}

export default function AdminTabsWithTable({ locale, data }: Props) {
  const { t } = useTranslation();
  const submit = useSubmit();
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  const confirmDelete = () => {
    if (!pendingDelete) return;
    submit(
      {
        intent: "deleteEntity",
        entity: pendingDelete.entity,
        entityId: pendingDelete.entityId,
      },
      { method: "post" },
    );
    setPendingDelete(null);
  };

  return (
    <>
      <Tabs defaultValue={tabs[0].entity}>
        <Tabs.List>
          {tabs.map((tab) => (
            <Tabs.Tab value={tab.entity} key={tab.entity}>
              {t(tab.labelKey)}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        {tabs.map((tab) => {
          const section = data[tab.entity];

          return (
            <Tabs.Panel value={tab.entity} key={tab.entity} pt="md">
              <EntityTable
                locale={locale}
                entity={tab.entity}
                headers={section.headers}
                rows={section.rows}
                onDeleteRequest={setPendingDelete}
              />
            </Tabs.Panel>
          );
        })}
      </Tabs>

      <ConfirmModal
        opened={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title={t("ui.deleteConfirmTitle", { name: pendingDelete?.name ?? "" })}
        danger
      >
        {t("ui.deleteConfirmMessage")}
      </ConfirmModal>
    </>
  );
}
