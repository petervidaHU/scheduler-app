"use client";

import { Table, TableData, Tabs } from "@mantine/core";

interface TabData {
  label: string;
  error?: string | null;
  data: TableData;
}

interface Props {
  tabs: TabData[];
}

const TabsWithTable: React.FC<Props> = ({ tabs }) => {
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

  const getTabPanels = (tab: TabData) => {
    return (
      <Tabs.Panel key={tab.label} value={tab.label}>
        <Table
          stickyHeader
          highlightOnHover
          striped
          withRowBorders={false}
          data={tab.data}
        />
      </Tabs.Panel>
    );
  };
  return (
    <Tabs defaultValue={tabs[0].label}>
      {getList(tabs)}
      {tabs.map((tab) => getTabPanels(tab))}
    </Tabs>
  );
};

export default TabsWithTable;
