"use client";

import { createLesson } from "@/app/[locale]/(tenancy)/_actions/createLesson";
import { useStore } from "@/store/store";
import { ID, Timeslots } from "@/types/databaseTypes";
import {
  FormActionType,
  LessonInput,
  SelectOptions,
} from "@/types/FormActionType";
import { Button, Checkbox, Select } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useActionState, useTransition, useState } from "react";

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

const getNameAndId = (obj: Array<any>, id: string) => {
  const found = obj.find((item) => item.value === id);
  return {
    label: found.label || found.name,
    id: id,
  };
  
}

const CreateLessonModal: React.FC<props> = ({ slot, day, closeModal }) => {
  const { syllabus, teacherOptions, classRooms, createOneLesson } = useStore();
  const [warnings, setWarnings] = useState<Record<string, string>>({});
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
        const isSpecialityFit =
          classRooms.find((classRoom) => classRoom.CLASSROOM_ID == value)
            ?.SPECIALITY_ID == subjectSpecialityId;
        if (!isSpecialityFit && value) {
          setWarnings((prev) => ({
            ...prev,
            classRoom: "Speciality does not fit",
          }));
        } else {
          setWarnings((prev) => ({ ...prev, classRoom: "" }));
        }
        return null;
      },
    },
    onValuesChange: (values, previous) => {
      // console.log("valuesOnChange", values.subject, previous.subject, values.subject !== previous.subject);
      if (!values.subject) setGroupedClassRooms(null);
      if (values.subject && values.subject !== previous.subject) {
        const newSubject = syllabus.subjects.find(
          (subject) => subject.value === values.subject
        );

        if (newSubject?.preferredTeacher) {
          form.setFieldValue(
            "teacher",
            newSubject?.preferredTeacher.value || ""
          );
          setPreferredTeacher(newSubject?.preferredTeacher);
        }

        if (newSubject?.speciality?.value) {
          const groupedBySubjectClassRooms =
            classRooms.reduce<classRoomsGroupedOptions>(
              (acc, classRoomItem) => {
                if (
                  classRoomItem.SPECIALITY_ID == newSubject?.speciality?.value
                ) {
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
          setSubjectSpecialityId(newSubject?.speciality?.value || null);
          setGroupedClassRooms(groupedBySubjectClassRooms);
        }
      }
    },
  });

  const handleLessonCreate = () => {
    const newLesson: LessonInput = {
      classId: syllabus.classId,
      subject: getNameAndId(syllabus.subjects, form.values.subject),
      classRoom: getNameAndId(classRooms, form.values.classRoom),
      teacher: getNameAndId(teacherOptions, form.values.teacher),
      day: day,
      timeslot: slot,
      tempId: Date.now().toString(),
    };
    // console.log("newLesson", newLesson);
    createOneLesson(newLesson);
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
      CreateLessonModal
      <form onSubmit={form.onSubmit(handleLessonCreate)}>
        <div>
          <label>subject</label>
          <Select
            searchable
            data={syllabus.subjects}
            {...form.getInputProps("subject")}
          />
        </div>
        <div>
          <label>classRoom</label>
          <Select
            searchable
            clearable
            data={groupedClassRooms || classRooms}
            {...form.getInputProps("classRoom")}
          />
        </div>
        <div>
          <label>teacher</label>
          <Checkbox
            label="preferred teacher"
            checked={preferredTeacherCheckbox}
            onChange={handlepreferredTeacherCheck}
          />
          <Select
            searchable
            clearable
            disabled={preferredTeacherCheckbox}
            data={teacherOptions}
            {...form.getInputProps("teacher")}
          />
        </div>
        <Button type="submit">create</Button>
      </form>
    </div>
  );
};

export default CreateLessonModal;
