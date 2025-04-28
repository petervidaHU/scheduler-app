"use client";

import { deleteTenancyBasedData } from "@/app/[locale]/(tenancy)/_actions/deleteSpeciality";
import { useRouter } from "@/lib/i18n/navigation";
import { useStore } from "@/store/store";
import { Entities } from "@/types/Entities";
import { FormActionType } from "@/types/FormActionType";
import { ActionIcon, Table, TableData, Tabs } from "@mantine/core";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { ReactNode, useActionState, useMemo, useTransition } from "react";
import ColorFeedback from "./UI-elements/ColorFeedback";
import { refetchTenancyBasedData } from "@/lib/UpdateTenancyBasedData";

// TODO entities as label thightly coupled? and hardcoded action url as well?
interface TabData {
  label: Entities;
  error: boolean;
  isLoading: boolean;
  data: TableData;
}

const init: FormActionType = {
  error: null,
  data: null,
  success: false,
};

  const labelMapper: Partial<Record<Entities, any>> = {
    [Entities.specialty]: "specialties",
    [Entities.subject]: "subjects",
    [Entities.teacher]: "teachers",
    [Entities.classroom]: "classRooms",
    [Entities.class]: "classes",
  };

  const loadingIndicator: Partial<Record<Entities, any>> = {
    [Entities.specialty]: { specialties: { isLoading: true } },
    [Entities.subject]: { subjects: { isLoading: true } },
    [Entities.teacher]: { teachers: { isLoading: true } },
    [Entities.classroom]: { classRoom: { isLoading: true } },
    [Entities.class]: { classes: { isLoading: true } },
  };

const TabsWithTable = () => {
  const {
    tenancyBasedData: { specialities, classRooms, classes, teachers, subjects },
    updateTenancyBasedData,
  } = useStore();
  const router = useRouter();

  const tabsData = [
    {
      label: Entities.specialty,
      error: !!specialities.error,
      isLoading: !!specialities.isLoading,
      data: {
        head: ["id", "name", "description"],
        body: (() => {
          if (specialities.data) {
            return Object.values(specialities.data).map((s) => [
              s.SPECIALTY_ID,
              s.SPECIALTY_NAME,
              s.DESCRIPTION,
            ]);
          }
          return [];
        })(),
      },
    },
    {
      label: Entities.classroom,
      error: !!classRooms.error,
      isLoading: !!classRooms.isLoading,
      data: {
        head: ["id", "name", "capacity", "speciality"],
        body: (() => {
          if (classRooms.data && specialities.data) {
            return Object.values(classRooms.data).map((c) => [
              c.CLASSROOM_ID,
              c.CLASSROOM_NAME,
              c.CAPACITY,
              specialities.data?.[c.SPECIALITY_ID]
                ? specialities.data[c.SPECIALITY_ID].SPECIALTY_NAME
                : "??",
            ]);
          }
          return [];
        })(),
      },
    },
    {
      label: Entities.class,
      error: !!classes.error,
      isLoading: !!classes.isLoading,
      data: {
        head: ["id", "name", "number of student"],
        body: (() => {
          if (classes.data) {
            return Object.values(classes.data).map((c) => [
              c.CLASS_ID,
              c.CLASS_NAME,
              c.NUMBER_OF_STUDENTS,
            ]);
          }
          return [];
        })(),
      },
    },
    {
      label: Entities.teacher,
      error: !!teachers.error,
      isLoading: !!teachers.isLoading,
      data: {
        head: ["id", "name", "email"],
        body: (() => {
          if (teachers.data) {
            return Object.values(teachers.data).map((t) => [
              t.TEACHER_ID,
              t.TEACHER_NAME,
              t.TEACHER_EMAIL,
            ]);
          }
          return [];
        })(),
      },
    },
    {
      label: Entities.subject,
      error: !!subjects.error,
      isLoading: !!subjects.isLoading,
      data: {
        head: ["id", "name", "description", "helper color", "speciality"],
        body: (() => {
          if (subjects.data && specialities.data) {
            return Object.values(subjects.data).map((s) => {
              return [
                s.SUBJECT_ID,
                s.SUBJECT_NAME,
                s.DESCRIPTION,
                s.HELPER_COLOR ? <ColorFeedback color={s.HELPER_COLOR} /> : "-",
                s.SPECIALTY_ID
                  ? specialities?.data?.[s.SPECIALTY_ID]
                    ? specialities.data[s.SPECIALTY_ID].SPECIALTY_NAME
                    : "??"
                  : "-",
              ];
            });
          }
          return [];
        })(),
      },
    },
  ];

  const handleDelete = async (id: number, label: Entities) => {
    const res = await refetchTenancyBasedData(label);
    if (res.success ) {
      console.log('res success:', res)
      updateTenancyBasedData({ [labelMapper[label]]: res.data});
    }
  };

  // TODO restrict actions for admins only
  const actionButtons = (id: string, label: Entities) => {
    if (!label || !id) return null;
    return (
      <>
        <ActionIcon
          onClick={() => {
            router.push(`/my-tenancy/admin?entity=${label}&id=${id}`);
          }}
          variant="filled"
          aria-label="Settings"
        >
          <IconPencil style={{ width: "70%", height: "70%" }} stroke={1.5} />
        </ActionIcon>
        <ActionIcon
          onClick={() => {
            console.log("delete", id, label);
            handleDelete(+id, label);
          }}
          variant="filled"
          aria-label="Settings"
        >
          <IconTrash style={{ width: "70%", height: "70%" }} stroke={1.5} />
        </ActionIcon>
      </>
    );
  };

  const getList = (tabs: TabData[]) => (
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

  const getTabPanels = useMemo(
    () => (tab: TabData) => {
      const headers = tab.data.head?.map((header) => (
        <Table.Th key={JSON.stringify(header)}>{header}</Table.Th>
      ));
      let bodyData: ReactNode;
      if (tab.error) {
        bodyData = (
          <Table.Tr>
            <Table.Td colSpan={tab.data.head?.length || 0 + 1}>
              {"there was an error loading the data"}
            </Table.Td>
          </Table.Tr>
        );
      }

      if (tab.isLoading) {
        bodyData = (
          <Table.Tr>
            <Table.Td colSpan={tab.data.head?.length || 0 + 1}>
              {"data is loading..."}
            </Table.Td>
          </Table.Tr>
        );
      }

      if (!tab.isLoading && !tab.error) {
        bodyData = tab.data.body?.map((row, rowIndex) => {
          return (
            <Table.Tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <Table.Td key={cellIndex}>{cell}</Table.Td>
              ))}
              <Table.Td>
                {actionButtons(row[0]?.toString() || "", tab.label)}
              </Table.Td>
            </Table.Tr>
          );
        });
      }

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
    },
    [tabsData]
  );
  return (
    <Tabs defaultValue={tabsData[0].label}>
      {getList(tabsData)}
      {tabsData.map((tab) => getTabPanels(tab))}
    </Tabs>
  );
};

export default TabsWithTable;
