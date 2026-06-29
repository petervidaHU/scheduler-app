"use client";

import { ScheduleValidationResult } from "@/lib/hooks/scheduleValidationTypes";
import { useSubjectValidation } from "@/lib/hooks/useValidation";
import { useStore } from "@/store/store";
import { SimpleGrid, Paper, Text } from "@mantine/core";
import React, { useMemo } from "react";
import SyllabusCard from "./SyllabusCard";
import { SyllabusFormProperties } from "@/types/ScheduleTypes";

const SyllabusTable = () => {
  const {
    syllabus,
    scheduleState,
    tenancyBasedData: {
      classRooms: { data: classRooms },
      subjects: { data: subjects },
      teachers: { data: teachers },
    },
  } = useStore();

  const validatorFn = useSubjectValidation(
    scheduleState.lessons,
    subjects || {},
    classRooms || {},
    {}
  );

  const subjectOccurrences = Object.values(scheduleState.lessons).reduce(
    (acc, lesson) => {
      const subjectId = lesson.subjectId;
      acc[subjectId] = (acc[subjectId] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const validationErrors = useMemo(() => {
    const allSubjectsValidationResult: Record<string, ScheduleValidationResult> = {};
    if (syllabus) {
      Object.entries(syllabus).forEach(([key, subject]) => {
        const res = validatorFn({
          ID: Number(key),
          CLASS_ID: subject.CLASS_ID,
          SUBJECT_ID: subject.SUBJECT_ID,
          TEACHERS: JSON.stringify(subject.TEACHERS || []),
          TENANCY_ID: subject.TENANCY_ID,
          OCCURRENCE: subject.OCCURRENCE,
          value: key,
          label: subjects?.[subject.SUBJECT_ID]?.NAME || key,
        });
        allSubjectsValidationResult[key] = res;
      });
    }
    return allSubjectsValidationResult;
  }, [scheduleState.lessons, classRooms, syllabus, subjects, validatorFn]);

  if (!scheduleState.class) {
    return (
      <Paper p="md" withBorder>
        <Text c="dimmed" ta="center">Please select a class to view the syllabus</Text>
      </Paper>
    );
  }

  if (!syllabus || Object.keys(syllabus).length === 0) {
    return (
      <Paper p="md" withBorder>
        <Text c="dimmed" ta="center">No syllabus data available for the selected class</Text>
      </Paper>
    );
  }

  return (
    <>
      <h3>SyllabusTable </h3>
      <SimpleGrid cols={4}>
        {Object.entries(syllabus).map(([key, subject]) => {
          const subjectLabel = subjects?.[subject.SUBJECT_ID]?.NAME || "??";
          const teacherLabel = subject.TEACHERS?.[0]
            ? teachers?.[subject.TEACHERS[0]]?.NAME || "??"
            : "none";
          const occurence = subjectOccurrences[key] || 0;
          const plannedOccurence = subject.OCCURRENCE;
          return (
            <React.Fragment key={key}>
              <SyllabusCard
                subjectLabel={subjectLabel}
                teacherLabel={teacherLabel}
                occurence={occurence}
                plannedOccurence={plannedOccurence}
                validationErrors={validationErrors[key]}
              />
            </React.Fragment>
          );
        })}
      </SimpleGrid>
    </>
  );
};

export default SyllabusTable;
