import { useStore } from "@/store/store";
import { Timeslots } from "@/types/databaseTypes";
import { DayPlan } from "@/types/ScheduleTypes";
import { ActionIcon, Button, Table } from "@mantine/core";
import React from "react";

interface props {
  day: DayPlan;
  slotTemplates: Timeslots[];
}

const DayPlanner: React.FC<props> = ({ day, slotTemplates }) => {
  const { deleteDay, updateDay } = useStore();

  const handleRowClick = (dayId: any, hour: any) => {
    console.log("hour click", dayId, hour);
  };

  const removeDay = () => {
    console.log("remove day", day.id);
    deleteDay(day.id);
  };

  const setTimeSlots = () => {
    const newDay = {
      ...day,
      timeSlots: slotTemplates,
    };
    updateDay(newDay);
    console.log("set   time slots");
  };

  return (
    <>
      <ActionIcon onClick={removeDay}>Remove Day</ActionIcon>
      <ActionIcon onClick={setTimeSlots}>use regular plan</ActionIcon>
      {Array.from(new Array(24), (_, hour) => {
        return (
          <Table.Td onClick={() => handleRowClick(day.id, hour)} key={hour}>
            {hour}:00
          </Table.Td>
        );
      })}
    </>
  );
};

export default DayPlanner;
