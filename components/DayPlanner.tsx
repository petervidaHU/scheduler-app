"use client";

import React from "react";
import { Group, Text } from "@mantine/core";
import { DayPlan } from "@/types/ScheduleTypes";
import { Timeslots } from "@/types/databaseTypes";
import { useStore } from "@/store/store";
import { useModal } from "./ModalProvider";
import CreateLessonModal from "./modals/CreateLessonModal";
import ActionIconX from "./UI-elements/ActionIcons/X";

interface DayPlannerProps {
  day: DayPlan;
  slotTemplates: Timeslots[];
}

const DayPlanner: React.FC<DayPlannerProps> = ({ day, slotTemplates }) => {
  const { openModal, closeModal } = useModal();
  const { windowHeight, scheduleState, deleteOneLesson } = useStore();
  // console.log("slotTemplates", scheduleState.lessons);

  const minutes = (d: string) => {
    const date = new Date(d);
    return date.getHours() * 60 + date.getMinutes();
  };
  const handleOpenModal = (slot: Timeslots) => {
    openModal(
      <CreateLessonModal slot={slot} day={day.id} closeModal={closeModal} />
    );
  };

  const handleDeleteLesson = (event: any, id: string) => {
    event.stopPropagation();
    deleteOneLesson(id);


  }

  return (
    <>
      {slotTemplates.map((slot) => {
        const startMinutes = minutes(slot.PERIOD_START);
        const endMinutes = minutes(slot.PERIOD_END);
        const top = (startMinutes / windowHeight) * windowHeight;
        const height =
          ((endMinutes - startMinutes) / windowHeight) * windowHeight;
        const isFilled = scheduleState.lessons.find(
          (lesson) =>
            lesson?.timeslot?.TEMPLATE_ID === slot.TEMPLATE_ID &&
            lesson.day === day.id
        );
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
              background: `${isFilled ? "rgba(122, 13, 136, 0.5)" : "rgba(255, 208, 235, .5)"}`,
              border: "1px solid #8cbce6",
              borderRadius: "4px",
              padding: "2px 4px",
              boxSizing: "border-box",
              zIndex: 100,
            }}
          >
            {isFilled ? (
              <Group>
                <Text size="s">{isFilled.subject.label}</Text>
                <Text size="xs">{isFilled.teacher.label}</Text>
                <Text size="xs">{isFilled.classRoom?.label}</Text> 
                <ActionIconX label="delete" onClickCallback={(e) => handleDeleteLesson(e, isFilled.tempId)} />
              </Group>
            ) : (
              <Text size="xs">{slot.NAME}</Text>
            )}
          </div>
        );
      })}
    </>
  );
};

export default DayPlanner;
