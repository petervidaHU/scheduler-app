"use client";

import React from "react";
import { DayPlan, TimeslotLessonInput } from "@/types/ScheduleTypes";
import { useStore } from "@/store/store";
import { useModal } from "../modals/ModalManager";
import CreateLessonModal from "../modals/CreateLessonModal";
import TimeslotsList from "./TimeslotsList";
import { ID, Timeslots } from "@/types/databaseTypes";

interface NormalizedTimeSlot {
  timeslot: import("@/types/databaseTypes").TimeslotInput | null;
  lesson?: TimeslotLessonInput | null;
  isCustom?: boolean;
}

export interface NormalizedDayPlan {
  id: string;
  order: string;
  identifier: string;
  timeSlots: NormalizedTimeSlot[];
  lessons: Array<string>;
  templateId?: string;
  scheduleId?: string;
}

interface DayPlannerProps {
  /**
   * Normalized day object. All timeslot/lesson mapping must be done before passing to this component.
   * Each timeSlots entry: { timeslot: TimeslotInput | null, lesson?: TimeslotLessonInput | null, isCustom?: boolean }
   */
  day: NormalizedDayPlan;
  readOnly?: boolean;
}

const DayPlanner: React.FC<DayPlannerProps> = ({
  day,
  readOnly = false,
}) => {
  const { openModal, closeModal } = useModal();
  const {
    scheduleState: { usingCustomTimeslots },
  } = useStore();

  const handleOpenModal = (
    slot: number,
    lesson?: TimeslotLessonInput | null
  ) => {
    if (readOnly) return;
    // Find the timeslot object in the normalized day.timeSlots array
    const slotObj = day.timeSlots.find(
      (t) => t.timeslot && t.timeslot.ID === slot
    );
    const timeslot = slotObj?.timeslot;
    if (!timeslot) {
      console.error("Timeslot not found");
      return;
    }
    let lessonId: ID | undefined = undefined;
    if (
      lesson &&
      typeof lesson === "object" &&
      "id" in lesson &&
      typeof lesson.id === "number"
    ) {
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
        title: lessonId ? "Edit Lesson" : "Create a Lesson",
        size: "lg",
        centered: true,
      }
    );
  };
console.log('timeslots coming as props:', day.timeSlots);
  return (
    <TimeslotsList
      timeSlots={day.timeSlots}
      onClickHandler={handleOpenModal}
      readOnly={readOnly}
      readOnlyCustomTimeslots={!usingCustomTimeslots}
    />
  );
};

export default DayPlanner;
