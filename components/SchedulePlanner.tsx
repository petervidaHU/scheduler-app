"use client";

import React from "react";
import DayPlanner from "./DayPlanner";
import { useStore } from "@/store/store";
import { DayPlan } from "@/types/ScheduleTypes";
import { Group, Table } from "@mantine/core";
import { Timeslots } from "@/types/databaseTypes";
interface props {
  basicTimeslots: Timeslots[];
}

const SchedulePlanner: React.FC<props> = ({ basicTimeslots }) => {
  const { days } = useStore();
  console.log("days in store", days);

  const getDayPlanner = (days: DayPlan[]) => {
    return days.map((day) => (
      <React.Fragment key={day.id}>
        <DayPlanner day={day} slotTemplates={basicTimeslots} />
      </React.Fragment>
    ));
  };
  return (
    <div>
      <Group>
        <Table title={"planner table"}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{"day.order"}</Table.Th>
              {days.map((day) => (
                <Table.Th key={day.id}>{day.id}</Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {Array.from(new Array(24), (_, hour) => {
              console.log("hour", hour);
              return (
                <Table.Tr key={hour}>
                  <Table.Td onClick={() => {}} key={hour}>
                    {hour}:00
                  </Table.Td>
                  {getDayPlanner(days)}
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Group>
    </div>
  );
};

export default SchedulePlanner;
