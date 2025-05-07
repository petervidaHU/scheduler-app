"use client";

import React from "react";
import { DayPlan } from "@/types/ScheduleTypes";
import { useStore } from "@/store/store";
import { useModal } from "../ModalProvider";
import CreateLessonModal from "../modals/CreateLessonModal";
import TimeslotsList from "./TimeslotsList";
import { Timeslots } from "@/types/databaseTypes";

interface DayPlannerProps {
  day: DayPlan;
  timeslots: Array<Timeslots>;
}

const DayPlanner: React.FC<DayPlannerProps> = ({ day, timeslots }) => {
  const { openModal, closeModal } = useModal();

  const handleOpenModal = (slot: string) => {
    const timeslot = timeslots.find((t) => t.ID.toString() === slot);
    openModal(
      <CreateLessonModal slotId={timeslot} day={day.id} closeModal={closeModal} />
    );
  };
  const mappedTimeslots = day.timeSlots.map((t) => {
    return {
      timeslot: timeslots.find((ts) => ts.ID === t.timeslotId) || null,
      lessonId: t.lessonId,
    };
  });

  return (
    <TimeslotsList
      timeSlots={mappedTimeslots}
      onClickHandler={handleOpenModal}
    />
  );
};

export default DayPlanner;
