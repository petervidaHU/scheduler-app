"use client";

import { ScheduleValidationResult } from "@/lib/hooks/scheduleValidationTypes";
import { useSubjectValidation } from "@/lib/hooks/useValidation";
import { useStore } from "@/store/store";
import { SimpleGrid } from "@mantine/core";
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

  if (!syllabus?.subjects || Object.keys(syllabus.subjects).length === 0) {
    return null;
  }

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
      const res = validatorFn({
        ID: Number(key),
        CLASS_ID: syllabus.classId,
        SUBJECT_ID: Number(key),
        TEACHER_ID: subject.teachers[0] || null,
        TENANCY_ID: 0,
        OCCURRENCE: subject.occurrence,
        value: key,
        label: subjects?.[Number(key)]?.NAME || key,
      });
      allSubjectsValidationResult[key] = res;
    });
    return allSubjectsValidationResult;
  }, [[scheduleState.lessons, classRooms, syllabus.subjects]]);

  return (
    <>
      <h3>SyllabusTable </h3>
      <SimpleGrid cols={4}>
        {Object.entries(syllabus.subjects).map(([key, subject]) => {
          const subjectLabel = subjects?.[Number(key)]?.NAME || "??";
          const teacherLabel = subject.teachers[0]
            ? teachers?.[subject.teachers[0]]?.NAME || "??"
            : "none";
          const occurence = subjectOccurrences[key] || 0;
          const plannedOccurence = subject.occurrence;
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
