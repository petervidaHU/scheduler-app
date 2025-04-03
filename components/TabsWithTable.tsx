"use client";

import { useRouter } from "@/lib/i18n/navigation";
import { Entities } from "@/types/Entities";
import { ActionIcon, Table, TableData, Tabs } from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import { useMemo } from "react";


// TODO entities as label thightly coupled? and hardcoded action url as well?
interface TabData {
  label: Entities;
  error?: string | null;
  data: TableData;
}

interface Props {
  tabs: TabData[];
}

const TabsWithTable: React.FC<Props> = ({ tabs }) => {
  const router = useRouter();

  // TODO restrict actions for admins only
  const actionButtons = (id: string, label: Entities) => {
    if (!label || !id) return null;
    return (
      <ActionIcon
        onClick={() => {
                   console.log("edit", id);
                   router.push(`/my-tenancy/admin?entity=${label}&id=${id}`);
        }}
        variant="filled"
        aria-label="Settings"
      >
        <IconPencil style={{ width: "70%", height: "70%" }} stroke={1.5} />
      </ActionIcon>
    );
  };

  const getList = (tabs: TabData[]) => {
    return (
      <Tabs.List>
        {tabs.map((item) => (
          <Tabs.Tab
            leftSection={item.error ? "!" : ""}
            value={item.label}
            key={item.label}
          >
            {item.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>
    );
  };

  const getTabPanels = useMemo(() => (tab: TabData) => {
    const headers = tab.data.head?.map((header) => (
      <Table.Th key={JSON.stringify(header)}>{header}</Table.Th>
    ));
    const bodyData = tab.data.body?.map((row, rowIndex) => (
      <Table.Tr key={rowIndex}>
        {row.map((cell, cellIndex) => (
          <Table.Td key={cellIndex}>{cell}</Table.Td>
        ))}
        <Table.Td>{actionButtons(row[0]?.toString() || "", tab.label)}</Table.Td>
      </Table.Tr>
    ));
    return (
      <Tabs.Panel key={tab.label} value={tab.label}>
        <Table stickyHeader highlightOnHover striped withRowBorders={false}>
          <Table.Thead>
            <Table.Tr>
              {headers}
              <Table.Th>{"actions"}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{bodyData}</Table.Tbody>
        </Table>
      </Tabs.Panel>
    );
  }, [tabs]);
  return (
    <Tabs defaultValue={tabs[0].label}>
      {getList(tabs)}
      {tabs.map((tab) => getTabPanels(tab))}
    </Tabs>
  );
};

export default TabsWithTable;
