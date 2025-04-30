"use client";

import React from "react";
import { Group, Text } from "@mantine/core";
import { DayPlan } from "@/types/ScheduleTypes";
import { useStore } from "@/store/store";
import { useModal } from "../ModalProvider";
import CreateLessonModal from "../modals/CreateLessonModal";
import ActionIconX from "../UI-elements/ActionIcons/X";

interface DayPlannerProps {
  day: DayPlan;
}

const DayPlanner: React.FC<DayPlannerProps> = ({ day }) => {
  const { timeSlots } = day;
  const { openModal, closeModal } = useModal();
  const {
    windowHeight,
    scheduleState: { timeslots, lessons },
    deleteOneLesson,
    tenancyBasedData: { subjects, classRooms, teachers },
  } = useStore();
  // console.log("slotTemplates", scheduleState.lessons);

  const minutes = (d: string) => {
    const date = new Date(d);
    return date.getHours() * 60 + date.getMinutes();
  };
  const handleOpenModal = (slot: string) => {
    console.log("handle open:", slot);
    openModal(
      <CreateLessonModal slotId={slot} day={day.id} closeModal={closeModal} />
    );
  };

  const handleDeleteLesson = (event: any, id: string) => {
    event.stopPropagation();
    deleteOneLesson(id);
  };

  return (
    <>
      {timeSlots.map((slot) => {
        const startMinutes = minutes(timeslots[slot.timeslotId].PERIOD_START);
        const endMinutes = minutes(timeslots[slot.timeslotId].PERIOD_END);
        const top = (startMinutes / windowHeight) * windowHeight;
        const height =
          ((endMinutes - startMinutes) / windowHeight) * windowHeight;
        const isFilled = slot["lessonId"] ? lessons[slot["lessonId"]] : null;
        // console.log('isFilled', isFilled)
        return (
          <div
            onClick={() => handleOpenModal(slot.timeslotId)}
            key={slot.timeslotId}
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
                <Text size="s">{subjects[isFilled.subject].SUBJECT_NAME}</Text>
                <Text size="xs">
                  {isFilled.teacher && teachers[isFilled.teacher].TEACHER_NAME}
                </Text>
                <Text size="xs">
                  {isFilled.classRoom &&
                    classRooms[isFilled.classRoom].CLASSROOM_NAME}
                </Text>
                <ActionIconX
                  label="delete"
                  onClickCallback={(e) =>
                    handleDeleteLesson(e, isFilled.tempId)
                  }
                />
              </Group>
            ) : (
              <Text size="xs">{timeslots[slot.timeslotId].NAME}</Text>
            )}
          </div>
        );
      })}
    </>
  );
};

export default DayPlanner;
