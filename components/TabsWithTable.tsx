"use client";

import { ActionIcon, Table, TableData, Tabs } from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import { useMemo } from "react";

interface TabData {
  label: string;
  error?: string | null;
  data: TableData;
}

interface Props {
  tabs: TabData[];
}

const actionButtons = (id: any) => {
  return (
    <ActionIcon
      onClick={() => {
        console.log("edit", id);
      }}
      variant="filled"
      aria-label="Settings"
    >
      <IconPencil style={{ width: "70%", height: "70%" }} stroke={1.5} />
    </ActionIcon>
  );
};

const TabsWithTable: React.FC<Props> = ({ tabs }) => {
  // TODO restrict actions for admins only
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
        <Table.Td>{actionButtons(row[0])}</Table.Td>
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
