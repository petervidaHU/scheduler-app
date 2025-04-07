"use client";

import React from "react";
import { Text } from "@mantine/core";
import { DayPlan } from "@/types/ScheduleTypes";
import { Timeslots } from "@/types/databaseTypes";
import { useStore } from "@/store/store";
import { useModal } from "./ModalProvider";
import CreateLessonModal from "./modals/CreateLessonModal";

interface DayPlannerProps {
  day: DayPlan;
  slotTemplates: Timeslots[];
}

const DayPlanner: React.FC<DayPlannerProps> = ({ day, slotTemplates }) => {
  const { openModal } = useModal();
  const { windowHeight } = useStore();
  // console.log("slotTemplates", slotTemplates);

  const minutes = (d: string) => {
    const date = new Date(d);
    return date.getHours() * 60 + date.getMinutes();
  };
  const handleOpenModal = (slot: Timeslots) => {
    openModal(<CreateLessonModal slot={slot} day={day.id}/>);
  };

  return (
    <>
      {slotTemplates.map((slot) => {
        const startMinutes = minutes(slot.PERIOD_START);
        const endMinutes = minutes(slot.PERIOD_END);
        const top = (startMinutes / windowHeight) * windowHeight;
        const height =
          ((endMinutes - startMinutes) / windowHeight) * windowHeight;
        return (
          <div
            onClick={() => handleOpenModal(slot)}
            key={slot.TEMPLATE_ID}
            style={{
              position: "absolute",
              top: `${top}px`,
              height: `${height}px`,
              left: "5%",
              width: "90%",
              background: "rgba(255, 208, 235, .5)",
              border: "1px solid #8cbce6",
              borderRadius: "4px",
              padding: "2px 4px",
              boxSizing: "border-box",
              zIndex: 100,
            }}
          >
            <Text size="xs">{slot.NAME}</Text>
          </div>
        );
      })}
    </>
  );
};

export default DayPlanner;
