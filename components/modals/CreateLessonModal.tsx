"use client";

import { createLesson } from "@/app/[locale]/(tenancy)/_actions/createLesson";
import { useStore } from "@/store/store";
import { ID, Timeslots, ClassRoom, Subject, Teacher } from "@/types/databaseTypes";
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
import { useRouter } from "@/lib/i18n/navigation";
import { DataWithOptions, SyllabusWithOptions } from "@/types/ScheduleTypes";

interface props {
  slot: Timeslots;
  day: string;
  closeModal: () => void;
  lessonId?: string;
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

const CreateLessonModal: React.FC<props> = ({ slot, day, closeModal, lessonId }) => {
  const {
    syllabus,
    tenancyBasedData: {
      teachers: { data: teachers },
      classRooms: { data: classRooms },
      subjects: { data: subjects },
    },
    createOneLesson,
    scheduleState: { days, lessons },
  } = useStore();
  const [warnings, setWarnings] = useState<
    Partial<Record<NotificationContexts, string>>
  >({});
  const [isPending, startTransition] = useTransition();
  const [preferredTeacherCheckbox, setPreferredTeacherCheckbox] = useState(false);
  const [subjectSpecialityId, setSubjectSpecialityId] = useState<string | null>(null);
  const [preferredTeacher, setPreferredTeacher] = useState<SelectOptions | null>(null);
  const [groupedClassRooms, setGroupedClassRooms] = useState<classRoomsGroupedOptions | null>(null);
  const [sState, sAction] = useActionState(createLesson, { ...init });

  // Find the lesson if we're editing
  const currentDay = days.find(d => d.id === day);
  const currentLesson = lessonId ? lessons[lessonId] : null;

  const subjectOptions = Object.entries(syllabus || {}).map(([subjectId, subject]) => ({
    value: subjectId,
    label: subjects?.[Number(subjectId)]?.NAME || '??',
  }));

  const teacherOptions = Object.values(teachers || {}).map((teacher) => ({
    value: teacher.ID.toString(),
    label: teacher.NAME,
  }));

  interface FormValues {
    subject: string;
    classRoom: string;
    teacher: string;
  }

  const form = useForm<FormValues>({
    initialValues: {
      subject: currentLesson?.subject?.toString() || '',
      classRoom: currentLesson?.classRoom?.toString() || '',
      teacher: currentLesson?.teacher?.toString() || '',
    },
    validateInputOnChange: ["classRoom"],
    validate: {
      subject: (value) => (!value ? "subject is required" : null),
      classRoom: (value, values: FormValues) => {
        if (!value) {
          setWarnings((prev) => ({ ...prev, classRoom: "" }));
          return null;
        }
        const subjectId = values.subject;
        const classRoomId = value;
        const classRoom = (classRooms as Record<string, ClassRoom & SelectOptions>)?.[classRoomId];
        const subject = (subjects as Record<string, Subject & SelectOptions>)?.[subjectId];
        
        // If subject has no specialty, any classroom is fine
        if (!subject?.SPECIALTY_ID) {
          setWarnings((prev) => ({ ...prev, classRoom: "" }));
          return null;
        }

        const isSpecialityFit = classRoom?.SPECIALITY_ID === subject?.SPECIALTY_ID;
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
      if (!values.subject) {
        setGroupedClassRooms(null);
        setPreferredTeacher(null);
        setPreferredTeacherCheckbox(false);
        return;
      }

      if (values.subject !== previous.subject) {
        const newSubject = syllabus[values.subject];

        if (newSubject?.TEACHERS?.length > 0) {
          const teacherId = newSubject.TEACHERS[0].toString();
          const teacherName = (teachers as Record<string, Teacher & SelectOptions>)?.[teacherId]?.NAME || '??';
          
          setPreferredTeacher({
            value: teacherId,
            label: teacherName,
          });
          form.setFieldValue("teacher", teacherId);
        }

        const specialty = (subjects as Record<string, Subject & SelectOptions>)?.[newSubject.SUBJECT_ID.toString()]?.SPECIALTY_ID || null;
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

        // Revalidate classroom if one is selected
        if (values.classRoom) {
          form.validateField('classRoom');
        }
      }
    },
  });

  const handleLessonCreate = () => {
    console.log("handleLessonCreate", slot);
    const newLesson: LessonInput = {
      classId: syllabus[form.values.subject]?.CLASS_ID || 0,
      subject: Number(form.values.subject),
      classRoom: Number(form.values.classRoom),
      teacher: Number(form.values.teacher),
      timeslot: slot.ID,
      tempId: lessonId || Date.now().toString(),
    };
    console.log("newLesson", day)
    createOneLesson({
      dayId: day.toString(),
      newLesson,
      timeslotId: slot.ID,
    });
    closeModal();
  };

  const handlepreferredTeacherCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setPreferredTeacherCheckbox(isChecked);
    
    if (isChecked && preferredTeacher) {
      form.setFieldValue("teacher", preferredTeacher.value);
    } else {
      form.setFieldValue("teacher", "");
    }
  };

  return (
    <div>
      {lessonId ? 'Edit Lesson' : 'Create a Lesson'}
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
                key={key}
                message={value}
                type={"error"}
                context={key as NotificationContexts}
              />
            ) : null;
          })}
        </Stack>
        <Button type="submit">{lessonId ? 'Save Changes' : 'Create'}</Button>
      </form>
    </div>
  );
};

export default CreateLessonModal;
