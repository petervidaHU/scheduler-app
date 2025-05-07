"use client";

import { createLesson } from "@/app/[locale]/(tenancy)/_actions/createLesson";
import { useStore } from "@/store/store";
import { ID, Timeslots } from "@/types/databaseTypes";
import {
  FormActionType,
  LessonInput,
  SelectOptions,
} from "@/types/FormActionType";
import { Button, Checkbox, keys, Select, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useActionState, useTransition, useState } from "react";
import NotificationCard, {
  NotificationContexts,
} from "../UI-elements/NotificationBadges";

interface props {
  slot: Timeslots;
  day: ID;
  closeModal: () => void;
}

type classRoomsGroupedOptions = [
  {
    group: "preferred by speciality";
    items: any[];
  },
  {
    group: "other";
    items: any[];
  },
];
const init: FormActionType = {
  error: null,
  data: null,
  success: false,
};

const CreateLessonModal: React.FC<props> = ({ slot, day, closeModal }) => {
  const {
    syllabus,
    tenancyBasedData: {
      teachers: { data: teachers },
      classRooms: { data: classRooms },
      subjects: { data: subjects },
    },
    createOneLesson,
  } = useStore();
  const [warnings, setWarnings] = useState<
    Partial<Record<NotificationContexts, string>>
  >({});
  const [isPending, startTransition] = useTransition();
  const [preferredTeacherCheckbox, setPreferredTeacherCheckbox] =
    useState(false);
  const [subjectSpecialityId, setSubjectSpecialityId] = useState<string | null>(
    null
  );
  const [preferredTeacher, setPreferredTeacher] =
    useState<SelectOptions | null>(null);
  const [groupedClassRooms, setGroupedClassRooms] =
    useState<classRoomsGroupedOptions | null>(null);
  const [sState, sAction] = useActionState(createLesson, { ...init });

  const subjectOptions = Object.values(syllabus.subjects).map((subject) => ({
    value: subject.ID.toString(),
    label: subjects?.[subject.ID].NAME || '??',
  }));
  console.log("tttt", teachers);
  const teacherOptions = Object.values(teachers || {}).map((teacher) => ({
    value: teacher.ID.toString(),
    label: teacher.NAME,
  }));

  const form = useForm({
    initialValues: {
      subject: "",
      classRoom: "",
      teacher: "",
    },
    validateInputOnChange: ["classRoom"],
    validate: {
      subject: (value) => (!value ? "subject is required" : null),
      classRoom: (value, values) => {
        if (!value) {
          setWarnings((prev) => ({ ...prev, classRoom: "" }));
          return null;
        }
        const isSpecialityFit =
          classRooms?.[value].SPECIALITY_ID ==
          subjects?.[values.subject].SPECIALTY_ID;
        if (!isSpecialityFit && value) {
          setWarnings((prev) => ({
            ...prev,
            classRoom: "Speciality does not fit",
          }));
          return null;
        }
        setWarnings((prev) => ({ ...prev, classRoom: "" }));
        return null;
      },
    },

    onValuesChange: (values, previous) => {
      if (!values.subject) setGroupedClassRooms(null);

      if (values.subject && values.subject !== previous.subject) {
        const newSubject = syllabus.subjects[values.subject];

        if (newSubject?.TEACHER_ID) {
          form.setFieldValue("teacher", newSubject?.TEACHER_ID.toString());
          setPreferredTeacher({
            value: newSubject?.TEACHER_ID.toString(),
            label: teachers?.[newSubject?.TEACHER_ID].NAME || '??',
          });
        }

        const specialty = subjects?.[newSubject.SUBJECT_ID].SPECIALTY_ID || null;
        if (specialty) {
          const groupedBySubjectClassRooms = Object.values(
            classRooms || {}
          ).reduce<classRoomsGroupedOptions>(
            (acc, classRoomItem) => {
              if (classRoomItem.SPECIALITY_ID === specialty) {
                acc[0].items.push(classRoomItem);
              } else {
                acc[1].items.push(classRoomItem);
              }
              return acc;
            },
            [
              {
                group: "preferred by speciality",
                items: [],
              },
              {
                group: "other",
                items: [],
              },
            ]
          );
          setSubjectSpecialityId(specialty.toString());
          setGroupedClassRooms(groupedBySubjectClassRooms);
        }
      }
    },
  });

  const handleLessonCreate = () => {
    const newLesson: LessonInput = {
      classId: syllabus.classId,
      subject: Number(form.values.subject),
      classRoom: Number(form.values.classRoom),
      teacher: Number(form.values.teacher),
      timeslot: slot.ID,
      tempId: Date.now().toString(),
    };
    createOneLesson({
      dayId: day.toString(),
      newLesson,
      timeslotId: slot.ID,
    });
    closeModal();
  };

  /*   const handleScheduleFormSubmit = (values: typeof form.values) => {
    startTransition(() => {
      console.log("values", values);
      const extendedValues = {
        ...values,
        timeslot: slot.TEMPLATE_ID,
        classId: syllabus.classId,
        day: day,
      };
      sAction(extendedValues);
    });
  }; */

  const handlepreferredTeacherCheck = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPreferredTeacherCheckbox(e.target.checked);
    form.setFieldValue("teacher", preferredTeacher?.value || "");
  };

  return (
    <div>
      Create a Lesson
      <form onSubmit={form.onSubmit(handleLessonCreate)}>
        <div>
          <Select
            label="Subject"
            required
            searchable
            data={subjectOptions}
            {...form.getInputProps("subject")}
          />
        </div>
        <div>
          <Select
            label="Classroom"
            searchable
            clearable
            data={groupedClassRooms || Object.values(classRooms || {})}
            {...form.getInputProps("classRoom")}
          />
        </div>
        <div>
          <Select
            label="teacher"
            searchable
            clearable
            disabled={preferredTeacherCheckbox}
            data={teacherOptions}
            {...form.getInputProps("teacher")}
          />
          <Checkbox
            label="preferred teacher"
            checked={preferredTeacherCheckbox}
            onChange={handlepreferredTeacherCheck}
          />
        </div>
        <Stack>
          {Object.entries(warnings).map(([key, value]) => {
            return key && value ? (
              <NotificationCard
                message={value}
                type={"error"}
                context={key as NotificationContexts}
              />
            ) : null;
          })}
        </Stack>
        <Button type="submit">create</Button>
      </form>
    </div>
  );
};

export default CreateLessonModal;
