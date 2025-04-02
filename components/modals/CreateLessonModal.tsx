"use client";

import { createLesson } from "@/app/[locale]/(tenancy)/_actions/createLesson";
import { useStore } from "@/store/store";
import { Timeslots } from "@/types/databaseTypes";
import {
  FormActionType,
  LessonInput,
  SelectOptions,
} from "@/types/FormActionType";
import { Checkbox, Select } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useActionState, useTransition, useState, useMemo } from "react";

interface props {
  slot: Timeslots;
}

const init: FormActionType = {
  error: null,
  data: null,
  success: false,
};

const CreateLessonModal: React.FC<props> = ({ slot }) => {
  const { syllabus, subjectOptions, teacherOptions, classRoomOptions } =
    useStore();
  const [isPending, startTransition] = useTransition();
  const [preferredTeacherCheckbox, setPreferredTeacherCheckbox] =
    useState(false);
  const [preferredTeacher, setPreferredTeacher] =
    useState<SelectOptions | null>(null);
  const [sState, sAction] = useActionState(createLesson, { ...init });
  console.log("in modal syllabus", syllabus);
  console.log("in modal teacherOptions", teacherOptions);

  const form = useForm({
    initialValues: {
      subject: "",
      classRoom: "",
      teacher: "",
    },
    validate: {
      subject: (value) => (!value ? "subject is required" : null),
    },
    onValuesChange: (values, previous) => {
      if (values.subject && values.subject !== previous.subject) {
        const teacher = form.values.subject
          ? syllabus.subjects.find(
              (subject) => subject.value === form.values.subject
            )?.preferredTeacher
          : null;
        if (teacher) {
          form.setFieldValue("teacher", teacher?.value || "");
          setPreferredTeacher(teacher);
        }
      }
    },
  });

  const handleScheduleFormSubmit = (values: typeof form.values) => {
    startTransition(() => {
      sAction(values);
    });
  };

  const handlepreferredTeacherCheck = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPreferredTeacherCheckbox(e.target.checked);
  };
  return (
    <div>
      CreateLessonModal
      <form onSubmit={form.onSubmit(handleScheduleFormSubmit)}>
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
            data={classRoomOptions}
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
            value={preferredTeacher?.value || ""}
            data={teacherOptions}
            {...form.getInputProps("teacher")}
          />
        </div>
        <button type="submit">create</button>
      </form>
    </div>
  );
};

export default CreateLessonModal;
