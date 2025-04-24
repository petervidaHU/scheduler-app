"use client";

import { useStore } from "@/store/store";
import { Paper, Text, SimpleGrid, Divider, Group } from "@mantine/core";
import React, { useCallback, useMemo } from "react";
import NotificationCard, {
  NotificationContexts,
} from "../UI-elements/NotificationBadges";
import { UIFeedbackType } from "@/types/UIFeedbackTypes";
import { ScheduleValidation } from "@/lib/scheduleValidation/scheduleValidationFunction";


const SyllabusTable = () => {
  const { syllabus, days, scheduleState, classRooms, subjects, teachers } = useStore();

  const subjectOccurrences = Object.values(scheduleState.lessons).reduce(
    (acc, lesson) => {
      const subjectId = lesson.subject;
      acc[subjectId] = (acc[subjectId] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
/*
  const validationErrors: ScheduleValidation = useMemo(() => {
        scheduleState.lessons.forEach((lesson) => {
      // TODO: do something with ID string or number
      const classRoomInLesson = classRooms.find(
        (classRoom) => classRoom.CLASSROOM_ID == lesson.classRoom?.id
      );
      const subjectInLesson = syllabus.subjects.find(
        (subject) => subject.value == lesson.subject.id
      );
      if (
        classRoomInLesson &&
        classRoomInLesson.SPECIALITY_ID != subjectInLesson?.speciality?.value
      ) {
         validationErrors.push({
          key: new Date().toString(),
          message: "Speciality does not fit",
          type: "warning",
          context: "classroom",
        }); 
      }
    });
    return 'validationErrors';
  }, [[scheduleState.lessons, classRooms, syllabus.subjects]]);*/

  console.log("subjectOccurrences", syllabus.subjects);
  return (
    <>
      <h3>SyllabusTable </h3>
      <SimpleGrid cols={4}>
        {Object.entries(syllabus.subjects).map(([key, subject]) => (
          <Paper key={key} shadow="sm" withBorder p="xl">
            <Text fw={700} size="lg">
              {subjects[subject.SUBJECT_ID].label}
            </Text>
            <Divider my="md" />
            <Text fw={500} size="md">
              preferred teacher
            </Text>
            <Text fw={700} size="lg">
              {subject.TEACHER_ID ? teachers[subject.TEACHER_ID].label : "none"}
            </Text>
            <Divider my="md" />
            <Text fw={500} size="md">
              placed
            </Text>
            <Text fw={900} size="lg">
              {subjectOccurrences[subject.SUBJECT_ID] || "0"}{" "}
            </Text>
            <Text fw={500} size="lg">
              planned occurence:
            </Text>
            <Text fw={700} size="lg">
              {subject.OCCURRENCE}
            </Text>
            <Group mt="md">
              {/*validationErrors.map((e) => (
                <NotificationCard
                  key={e.key}
                  message={e.message}
                  type={e.type}
                  context={e.context}
                />
              ))*/}
            </Group>
          </Paper>
        ))}
      </SimpleGrid>
    </>
  );
};

export default SyllabusTable;
