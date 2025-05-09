"use client";

import React from "react";
import { DayPlan } from "@/types/ScheduleTypes";
import { useStore } from "@/store/store";
import { useModal } from "../modals/ModalManager";
import CreateLessonModal from "../modals/CreateLessonModal";
import TimeslotsList from "./TimeslotsList";
import { Timeslots } from "@/types/databaseTypes";

interface DayPlannerProps {
  day: DayPlan;
  timeslots: Array<Timeslots>;
}

const DayPlanner: React.FC<DayPlannerProps> = ({ day, timeslots }) => {
  const { openModal, closeModal } = useModal();

  const handleOpenModal = (slot: number, lessonId?: string) => { 
    const timeslot = timeslots.find((t) => t.ID === slot);
    if (!timeslot) {
      console.error('Timeslot not found');
      return;
    }
    
    openModal(
      <CreateLessonModal 
        slot={timeslot} 
        day={day.id} 
        closeModal={closeModal} 
        lessonId={lessonId}
      />,
      {
        title: lessonId ? 'Edit Lesson' : 'Create a Lesson',
        size: "lg",
        centered: true
      }
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
