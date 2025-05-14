"use client";

import React from "react";
import { DayPlan } from "@/types/ScheduleTypes";
import { useStore } from "@/store/store";
import { useModal } from "../modals/ModalManager";
import CreateLessonModal from "../modals/CreateLessonModal";
import TimeslotsList from "./TimeslotsList";
import { Timeslots } from "@/types/databaseTypes";
import TimeslotFilledCard, { TimeslotLessonInput } from "./TimeslotFilledCard";

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
    let lessonId: string | undefined = undefined;
    if (lesson && typeof lesson === 'object' && 'tempId' in lesson && typeof lesson.tempId === 'string') {
      lessonId = lesson.tempId;
    } else if (typeof lesson === 'string') {
      lessonId = lesson;
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
  
  const mappedTimeslots = day.timeSlots
    .filter(t => {
      // Find the corresponding timeslot definition
      const found = timeslots.find((ts) => ts.ID === t.timeslotId);
      if (!found) {
        console.warn(`Timeslot with ID ${t.timeslotId} not found in timeslots array`);
      }
      return found !== undefined;
    })
    .map((t) => {
      return {
        timeslot: timeslots.find((ts) => ts.ID === t.timeslotId) || null,
        lesson: t.lessonId ? lessons[t.lessonId] : undefined,
      };
    });

  return (
    <TimeslotsList
      timeSlots={mappedTimeslots}
      onClickHandler={handleOpenModal}
      readOnly={readOnly}
    />
  );
};

export default DayPlanner;
