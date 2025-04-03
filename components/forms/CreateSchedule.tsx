"use client";

import { useForm } from "@mantine/form";
import { NumberInput, Select, Textarea, Button, Checkbox } from "@mantine/core";
import { createSchedule } from "@/app/[locale]/(tenancy)/my-tenancy/schedules/_actions/createSchedule";
import { FormActionType, SelectOptions } from "@/types/FormActionType";
import {
  useActionState,
  useTransition,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  Classes,
  ClassRoom,
  Speciality,
  Subject,
  Syllabus,
  Teacher,
} from "@/types/databaseTypes";
import { useStore } from "@/store/store";
import { nanoid } from "nanoid";
import { getSyllabusAction } from "@/app/[locale]/(tenancy)/my-tenancy/schedules/_actions/getSyllabusAction";
import { SyllabusForm } from "@/types/ScheduleTypes";

const init: FormActionType = {
  error: null,
  data: null,
  success: false,
};

interface props {
  data: {
    classRooms: ClassRoom[];
    teachers: Teacher[];
    classes: Classes[];
    subjects: Subject[];
    specialities: Speciality[];
    teacherOptions: SelectOptions[];
  };
}

const SchedulePage: React.FC<props> = ({
  data: {
    classRooms,
    teachers,
    classes,
    subjects,
    specialities,
    teacherOptions,
  },
}) => {
  const {
    addDay,
    updateSyllabus,
    updateClassRooms,
    updateTeacherOptions,
  } = useStore();
  const [isPending, startTransition] = useTransition();
  const [sState, sAction] = useActionState(createSchedule, {
    ...init,
  });

  const updateStore = useCallback(() => {
    updateTeacherOptions(teacherOptions);
    updateClassRooms(classRooms);
  }, [
    teacherOptions,
    updateTeacherOptions,
    classRooms,
    updateClassRooms,
  ]);

  useMemo(() => {
    updateStore();
  }, [updateStore]);

  const classOptions = classes.map((c) => ({
    value: c.CLASS_ID.toString(),
    label: `${c.CLASS_NAME} (${c.NUMBER_OF_STUDENTS} students)`,
  }));

  const form = useForm({
    initialValues: {
      class: "",
      description: "",
      owner: null,
    },
    validate: {
      owner: (value) => (!value ? "Owner is required" : null),
    },
    onValuesChange: async (values) => {
      if (values.class !== form.values.class && values.class !== "") {
        const newSyllabus = await getSyllabusAction(values.class);

        if (!newSyllabus) {
          return;
        }
// TODO migrate it to backend
        const syllabusMapping = (syllabus: Syllabus[]): SyllabusForm => {
          const subjectsMapped = syllabus.map((item) => {
            const subjectLabel = subjects.find(
              (subject) => subject.SUBJECT_ID === item.SUBJECT_ID
            )?.SUBJECT_NAME;
            const teacherLabel = teachers.find(
              (teacher) => teacher.TEACHER_ID === item.TEACHER_ID
            )?.TEACHER_NAME;
            const subjectSpecialityId =
              subjects
                .find((subject) => subject.SUBJECT_ID === item.SUBJECT_ID)
                ?.SPECIALTY_ID || null;
            const subjectSpeciality = subjectSpecialityId
              ? specialities.find(
                  (speciality) =>
                    speciality.SPECIALTY_ID === subjectSpecialityId
                )?.SPECIALTY_NAME
              : null;

            return {
              value: item.SUBJECT_ID.toString(),
              label: subjectLabel || "",
              preferredTeacher: teacherLabel && item.TEACHER_ID
                ? { label: teacherLabel, value: item.TEACHER_ID?.toString() }
                : null,
              occurrence: item.OCCURRENCE,
              speciality: subjectSpeciality
                ? { label: subjectSpeciality, value: subjectSpecialityId?.toString() || ''}
                : null,
            };
          });

          return { subjects: subjectsMapped };
        };

        updateSyllabus(syllabusMapping(newSyllabus));
      }
    },
  });

  const handleScheduleFormSubmit = (values: typeof form.values) => {
    startTransition(() => {
      sAction(values);
    });
  };

  const handleWeeklyCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    // TODO: implement weekly plan
    console.log("to be done");
  };

  const handleAddDay = (event: React.MouseEvent<HTMLButtonElement>) => {
    const newDay = {
      id: nanoid(),
      timeSlots: [],
    };
    addDay(newDay);
  };

  console.log(sState);

  return (
    <>
      <form onSubmit={form.onSubmit(handleScheduleFormSubmit)}>
        <Checkbox
          label="weekly schedule"
          name="weekly"
          onChange={handleWeeklyCheckboxChange}
        />
        <Button onClick={handleAddDay}>add day</Button>

        <Select
          label="Class"
          name="class"
          data={classOptions}
          {...form.getInputProps("class")}
        />
        <NumberInput
          label="Variations"
          name="variations"
          {...form.getInputProps("variations")}
        />
        <Textarea
          label="Description"
          name="description"
          {...form.getInputProps("description")}
        />
        <Button type="submit">Create Schedule</Button>
      </form>
    </>
  );
};

export default SchedulePage;
