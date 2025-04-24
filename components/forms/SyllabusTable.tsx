"use client";

import { ScheduleValidationResult } from "@/lib/hooks/scheduleValidationTypes";
import { useSubjectValidation } from "@/lib/hooks/useValidation";
import { useStore } from "@/store/store";
import { Paper, Text, SimpleGrid, Divider, Group } from "@mantine/core";
import React, { useMemo } from "react";
import NotificationCard from "../UI-elements/NotificationBadges";

const SyllabusTable = () => {
  const { syllabus, days, scheduleState, classRooms, subjects, teachers } =
    useStore();
  const validatorFn = useSubjectValidation(
    scheduleState.lessons,
    subjects,
    classRooms,
    {}
  );

  const subjectOccurrences = Object.values(scheduleState.lessons).reduce(
    (acc, lesson) => {
      const subjectId = lesson.subject;
      acc[subjectId] = (acc[subjectId] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const validationErrors = useMemo(() => {
    const allSubjectsValidationResult: Record<
      string,
      ScheduleValidationResult
    > = {};
    Object.entries(syllabus.subjects).forEach(([key, subject]) => {
      const res = validatorFn(subject);
      allSubjectsValidationResult[key] = res;
    });
    return allSubjectsValidationResult;
  }, [[scheduleState.lessons, classRooms, syllabus.subjects]]);

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
              {Object.values(validationErrors[key]).map((e) => (
                <>
                  {e && (
                    <NotificationCard
                      key={e.key}
                      message={`${e.message} (${e.num} times)`}
                      type={e.type}
                      context={e.context}
                    />
                  )}
                </>
              ))}
            </Group>
          </Paper>
        ))}
      </SimpleGrid>
    </>
  );
};

export default SyllabusTable;
