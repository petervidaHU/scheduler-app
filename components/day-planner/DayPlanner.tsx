"use client";

import React from "react";
import { DayPlan, TimeslotLessonInput } from "@/types/ScheduleTypes";
import { useStore } from "@/store/store";
import { useModal } from "../modals/ModalManager";
import CreateLessonModal from "../modals/CreateLessonModal";
import TimeslotsList from "./TimeslotsList";
import { ID, Timeslots } from "@/types/databaseTypes";
import TimeslotFilledCard from "./TimeslotFilledCard";

interface DayPlannerProps {
  day: DayPlan;
  timeslots: Array<Timeslots>;
  readOnly?: boolean;
}

const DayPlanner: React.FC<DayPlannerProps> = ({ day, timeslots, readOnly = false }) => {
  const { openModal, closeModal } = useModal();
  const { scheduleState: { lessons } } = useStore();

  const handleOpenModal = (slot: number, lesson?: TimeslotLessonInput | null) => {
    if (readOnly) return;
    const timeslot = timeslots.find((t) => t.ID === slot);
    if (!timeslot) {
      console.error('Timeslot not found');
      return;
    }
    // If lesson is present and has a tempId, pass it as lessonId, else undefined
    let lessonId: ID | undefined = undefined;
    if (lesson && typeof lesson === 'object' && 'id' in lesson && typeof lesson.id === 'number') {
      lessonId = lesson.id;
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
  
  // Merge template timeslots and custom timeslots for display
  const allTimeslots = [
    ...day.timeSlots
      .filter(t => {
        // Only include if the timeslot exists in the timeslots array
        return timeslots.some(ts => ts.ID === t.timeslotId);
      })
      .map(t => ({
        timeslot: timeslots.find(ts => ts.ID === t.timeslotId) || null,
        lesson: t.lessonId ? lessons[t.lessonId] : undefined,
        isCustom: false,
      })),
    ...((day.customTimeslots || []).map((custom) => ({
      timeslot: custom,
      lesson: undefined,
      isCustom: true,
    })))
  ];

  return (
    <TimeslotsList
      timeSlots={allTimeslots}
      onClickHandler={handleOpenModal}
      readOnly={readOnly}
    />
  );
};

export default DayPlanner;
