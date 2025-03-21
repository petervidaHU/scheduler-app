"use client";

import { Tabs } from "@mantine/core";

interface TabData {
  label: string;
  error?: string | null;
  data: {
    name: string;
    id: string | number;
  }[];
}

interface Props {
  tabs: TabData[];
}

const TabsWithTable: React.FC<Props> = ({ tabs }) => {
  const getList = (tabs: TabData[]) => {
    return (
      <ul>
        {tabs.map((item) => (
          <Tabs.Tab
            leftSection={item.error ? "!" : ""}
            value={item.label}
            key={item.label}
          >
            {item.label}
          </Tabs.Tab>
        ))}
      </ul>
    );
  };

  const getTabPanels = (tab: TabData) => {
    return (
      <Tabs.Panel key={tab.label} value={tab.label}>
        <ul>
          {tab.data.map((row) => {
            return <li key={row.id}>{row.name}</li>;
          })}
        </ul>
      </Tabs.Panel>
    );
  };

  return (
    <Tabs defaultValue={tabs[0].label}>
      <Tabs.List>{getList(tabs)}</Tabs.List>
      {tabs.map((tab) => {
        return getTabPanels(tab);
      })}
    </Tabs>
  );
};

export default TabsWithTable;
