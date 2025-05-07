"use client";

import { ScheduleValidationResult } from "@/lib/hooks/scheduleValidationTypes";
import { useSubjectValidation } from "@/lib/hooks/useValidation";
import { useStore } from "@/store/store";
import { SimpleGrid } from "@mantine/core";
import React, { useMemo } from "react";
import SyllabusCard from "./SyllabusCard";

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
        {Object.entries(syllabus.subjects).map(([key, subject]) => {
          const subjectLabel = subjects?.[subject.SUBJECT_ID].label || "??";
          const teacherLabel = subject.TEACHER_ID
            ? teachers?.[subject.TEACHER_ID].label || "??"
            : "none";
          const occurence = subjectOccurrences[subject.SUBJECT_ID] || 0;
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
