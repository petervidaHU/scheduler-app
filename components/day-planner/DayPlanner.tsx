"use client";

import React from "react";
import { Group, Text } from "@mantine/core";
import { DayPlan } from "@/types/ScheduleTypes";
import { useStore } from "@/store/store";
import { useModal } from "../ModalProvider";
import CreateLessonModal from "../modals/CreateLessonModal";
import ActionIconX from "../UI-elements/ActionIcons/X";
import TimeslotsList from "./TimeslotsList";

interface DayPlannerProps {
  day: DayPlan;
}

const DayPlanner: React.FC<DayPlannerProps> = ({ day }) => {
  const { openModal, closeModal } = useModal();
  const {
    scheduleState: { timeslots },
  } = useStore();

 
  const handleOpenModal = (slot: string) => {
    console.log("handle open:", slot);
    openModal(
      <CreateLessonModal slotId={slot} day={day.id} closeModal={closeModal} />
    );
  };

  // TODO fix input props

  const mappedTimeslots = Object.values(timeslots).map((t) => {
    return {
      timeslot: t,
      lessonId: day.timeSlots.find((ts) => ts.timeslotId === t.ID)?.lessonId,
    };
  });

  return (<TimeslotsList timeSlots={mappedTimeslots} onClickHandler={handleOpenModal}/>  );
};

export default DayPlanner;
