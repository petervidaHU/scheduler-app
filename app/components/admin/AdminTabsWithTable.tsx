import { ActionIcon, Group, Table, Tabs, Text } from "@mantine/core";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { Form, Link } from "react-router";
import type {
  AdminEntityKey,
  AdminEntityTableData,
} from "../../lib/services/tenancy/manageAdminEntities.server";

type Props = {
  locale: string;
  data: AdminEntityTableData;
};

type TabDefinition = {
  entity: AdminEntityKey;
  label: string;
};

const tabs: TabDefinition[] = [
  { entity: "specialty", label: "Specialties" },
  { entity: "classroom", label: "Classrooms" },
  { entity: "class", label: "Classes" },
  { entity: "teacher", label: "Teachers" },
  { entity: "subject", label: "Subjects" },
  { entity: "frame", label: "Frames" },
];

function EntityTable({
  locale,
  entity,
  headers,
  rows,
}: {
  locale: string;
  entity: AdminEntityKey;
  headers: string[];
  rows: Array<{ id: string; cells: Array<string | number> }>;
}) {
  if (rows.length === 0) {
    return (
      <Text size="sm" c="dimmed" mt="sm">
        No records found yet.
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
          <Table.Th>Actions</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows.map((row) => (
          <Table.Tr key={row.id}>
            {row.cells.map((cell, index) => (
              <Table.Td key={`${row.id}-${index}`}>{cell}</Table.Td>
            ))}
            <Table.Td>
              <Group gap="xs" justify="flex-end">
                <ActionIcon
                  variant="light"
                  color="blue"
                  component={Link}
                  to={`/${locale}/my-tenancy/admin?entity=${entity}&id=${row.id}`}
                  aria-label={`Edit ${entity} ${row.id}`}
                >
                  <IconPencil size={16} />
                </ActionIcon>
                <Form method="post">
                  <input type="hidden" name="intent" value="deleteEntity" />
                  <input type="hidden" name="entity" value={entity} />
                  <input type="hidden" name="entityId" value={row.id} />
                  <ActionIcon
                    variant="light"
                    color="red"
                    type="submit"
                    aria-label={`Delete ${entity} ${row.id}`}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Form>
              </Group>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}

export default function AdminTabsWithTable({ locale, data }: Props) {
  return (
    <Tabs defaultValue={tabs[0].entity}>
      <Tabs.List>
        {tabs.map((tab) => (
          <Tabs.Tab value={tab.entity} key={tab.entity}>
            {tab.label}
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
            />
          </Tabs.Panel>
        );
      })}
    </Tabs>
  );
}
