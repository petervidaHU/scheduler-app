"use client";

import { createLesson } from "@/app/[locale]/(tenancy)/_actions/createLesson";
import { useStore } from "@/store/store";
import { Timeslots, ClassRoom, Subject, Teacher, ID, SyllabusSubject } from "@/types/databaseTypes";
import {
  FormActionType,
  LessonInput,
  SelectOptions,
} from "@/types/FormActionType";
import { Button, Checkbox, Paper, Select, Stack, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useActionState, useTransition, useState, useEffect, useMemo } from "react";
import NotificationCard, {
  NotificationContexts,
} from "../UI-elements/NotificationBadges";
import { getAvailableClassroomsByFrameAndTimeslot } from "@/app/[locale]/(tenancy)/_actions/getAvailableClassroomsByFrameAndTimeslot";
import { getAvailableTeachersByFrameAndTimeslot } from "@/app/[locale]/(tenancy)/_actions/getAvailableTeachersByFrameAndTimeslot";
import { groupClassroomsBySpecialty } from "@/lib/resourceAvailability/groupClassroomsBySpecialty";
import { getPreferredTeacher } from "@/lib/resourceAvailability/getPreferredTeacher";

interface CreateLessonProps {
  slot: Omit<Timeslots, "TENANCY_ID">;
  day: string;
  closeModal: () => void;
  lessonId?: ID;
  formTitle?: string;
  submitBtnText?: string;
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

const CreateLessonModal: React.FC<CreateLessonProps> = ({ slot, day, closeModal, lessonId, formTitle = "Create a Lesson", submitBtnText = "Create" }) => {
  const {
    syllabus,
    tenancyBasedData: {
      teachers: { data: teachers },
      classRooms: { data: classRooms },
      subjects: { data: subjects },
    },
    createOneLesson,
    scheduleState: { days, lessons, frameId },
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
  const [availableClassRooms, setAvailableClassRooms] = useState<ClassRoom[]>([]);
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);

  // Find the lesson if we're editing
  const currentDay = days.find(d => d.id === day);
  const currentLesson = lessonId ? lessons[lessonId] : null;

  const subjectOptions = Object.entries(syllabus || {}).map(([subjectId, subject]) => ({
    value: subjectId,
    label: subjects?.[Number(subjectId)]?.NAME || '??',
  }));

  // Fetch available teachers when frameId, day, or slot changes
  useEffect(() => {
    if (!frameId || !slot?.ID || !currentDay) {
      setAvailableTeachers([]);
      return;
    }
    // dayIndex is the SLOT_ORDER of the current day (if available), else index in days array
    const dayIndex = typeof currentDay.order === 'string' ? Number(currentDay.order) : days.findIndex(d => d.id === day);
    getAvailableTeachersByFrameAndTimeslot(frameId.toString(), dayIndex, slot.ID)
      .then(setAvailableTeachers)
      .catch(() => setAvailableTeachers([]));
  }, [frameId, slot?.ID, day, days, currentDay]);

  const teacherOptions = useMemo(() => {
    if (!availableTeachers.length) return Object.values(teachers || {}).map((teacher) => ({
      value: teacher.ID.toString(),
      label: teacher.NAME,
    }));
    // If editing and current teacher(s) is not available, include them (disabled)
    const currentIds = currentLesson?.teacherId ? (Array.isArray(currentLesson.teacherId) ? currentLesson.teacherId : [currentLesson.teacherId]) : [];
    return Object.values(teachers || {}).map((teacher) => {
      const isAvailable = availableTeachers.some((a) => a.ID === teacher.ID);
      return {
        value: teacher.ID.toString(),
        label: teacher.NAME,
        disabled: !isAvailable && !currentIds.includes(teacher.ID),
      };
    });
  }, [teachers, availableTeachers, currentLesson]);

  interface FormValues {
    subject: string;
    classRoom: string;
    teacher: string;
  }

  const form = useForm<FormValues>({
    initialValues: {
      subject: currentLesson?.subjectId?.toString() || '',
      classRoom: currentLesson?.classRoomId?.toString() || '',
      teacher: currentLesson?.teacherId?.toString() || '',
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
        setWarnings((prev) => ({ ...prev, teacher: undefined }));
        return;
      }

      if (values.subject !== previous.subject) {
        // Get the syllabus subject entry and the canonical subject object
        const newSyllabusSubject = syllabus[values.subject] as SyllabusSubject;
        const canonicalSubject = subjects?.[newSyllabusSubject?.SUBJECT_ID];
        // Use utility for preferred teacher
        const preferred = getPreferredTeacher(newSyllabusSubject, teachers || {});
        if (preferred) {
          const preferredAvailable = availableTeachers.some((t) => t.ID.toString() === preferred.id);
          if (preferredAvailable) {
            setPreferredTeacher({ value: preferred.id, label: preferred.name });
            setWarnings((prev) => ({ ...prev, teacher: undefined }));
            form.setFieldValue("teacher", preferred.id);
          } else {
            setPreferredTeacher(null);
            setWarnings((prev) => ({ ...prev, teacher: `Preferred teacher: ${preferred.name} is not available in this timeslot.` }));
            form.setFieldValue("teacher", "");
          }
        } else {
          setPreferredTeacher(null);
          setWarnings((prev) => ({ ...prev, teacher: undefined }));
          form.setFieldValue("teacher", "");
        }
        // Use utility for classroom grouping
        const grouped = groupClassroomsBySpecialty(classRooms || {}, canonicalSubject);
        setGroupedClassRooms(grouped as classRoomsGroupedOptions);
        setSubjectSpecialityId(canonicalSubject?.SPECIALTY_ID?.toString() || null);
        // Revalidate classroom if one is selected
        if (values.classRoom) {
          form.validateField('classRoom');
        }
      }
    },
  });

  // Fetch available classrooms when frameId, day, or slot changes
  useEffect(() => {
    if (!frameId || !slot?.ID || !currentDay) {
      setAvailableClassRooms([]);
      return;
    }
    // dayIndex is the SLOT_ORDER of the current day (if available), else index in days array
    const dayIndex = typeof currentDay.order === 'string' ? Number(currentDay.order) : days.findIndex(d => d.id === day);
    getAvailableClassroomsByFrameAndTimeslot(frameId.toString(), dayIndex, slot.ID)
      .then(setAvailableClassRooms)
      .catch(() => setAvailableClassRooms([]));
  }, [frameId, slot?.ID, day, days, currentDay]);

  // Classroom select options: only show available classrooms, but keep current selection if editing
  const classroomOptions = useMemo(() => {
    if (!availableClassRooms.length) return Object.values(classRooms || {});
    // If editing and current classRoom is not available, include it (disabled)
    const currentId = currentLesson?.classRoomId;
    return Object.values(classRooms || {}).map((room) => {
      const isAvailable = availableClassRooms.some((a) => a.ID === room.ID);
      return {
        ...room,
        disabled: !isAvailable && room.ID !== currentId,
      };
    });
  }, [classRooms, availableClassRooms, currentLesson]);

  const handleLessonCreate = () => {
    console.log("handleLessonCreate", slot);
    const newLesson: LessonInput = {
      classId: syllabus[form.values.subject]?.CLASS_ID || 0,
      subjectId: Number(form.values.subject),
      classRoomId: Number(form.values.classRoom),
      teacherId: [Number(form.values.teacher)],
      timeslotId: slot.ID,
      id: lessonId || Date.now(),
      frameId: frameId || "CUSTOM",
      dayId: day.toString(),
    };

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
  // TODO: warning bug
  console.log('bug in warnings', warnings);

  return (
    <Paper>
      <Title order={4} mb="md">{formTitle}</Title>
      <form onSubmit={form.onSubmit(handleLessonCreate)}>
        <Stack gap="md">
          <Select
            label="Subject"
            required
            searchable
            data={subjectOptions}
            {...form.getInputProps("subject")}
          />
          
          <Select
            label="Classroom"
            searchable
            clearable
            data={classroomOptions}
            {...form.getInputProps("classRoom")}
          />
          
          <div>
            <Select
              label="Teacher"
              searchable
              clearable
              disabled={preferredTeacherCheckbox}
              data={teacherOptions}
              {...form.getInputProps("teacher")}
            />
            <Checkbox
              mt="xs"
              label="Use preferred teacher"
              checked={preferredTeacherCheckbox}
              onChange={handlepreferredTeacherCheck}
            />
          </div>
          
          {Object.entries(warnings).map(([key, value]) => {
            return key && value ? (
              <NotificationCard
                key={key}
                message={value}
                type={key === 'teacher' ? "success" : "error"}
                context={key as NotificationContexts}
              />
            ) : null;
          })}
          
          <Button type="submit" mt="md">{submitBtnText}</Button>
        </Stack>
      </form>
    </Paper>
  );
};

export default CreateLessonModal;
