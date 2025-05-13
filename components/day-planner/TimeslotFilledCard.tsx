import { Group, Text, Tooltip, Stack } from "@mantine/core";
import React, { FC, useState } from "react";
import ActionIconX from "../UI-elements/ActionIcons/X";
import { useStore } from "@/store/store";

export type TimeslotLessonInput = string
    | {
        classId?: number;
        subjectId?: number;
        teacherId?: string;
        classRoomId?: number;
      }
interface props {
  lessonId: TimeslotLessonInput;
}

const TimeslotFilledCard: FC<props> = ({ lessonId }) => {
  const {
    tenancyBasedData: { subjects, teachers, classRooms, classes },
    scheduleState: { lessons },
    deleteOneLesson,
  } = useStore();
  const [isHovered, setIsHovered] = useState(false);

  const handleDeleteLesson = (event: any, id: string) => {
    event.stopPropagation();
    deleteOneLesson(id);
  };
  let lesson: any = null;
  if (typeof lessonId === "string") {
    lesson = lessons[lessonId];
    if (!lesson) return null;
  }

  const subjectName =
    subjects.data?.[
      lesson
        ? lesson.subject
        : typeof lessonId === "object" && lessonId.subjectId !== undefined
          ? lessonId.subjectId
          : undefined
    ]?.NAME || "Unknown Subject";
  const teacherName =
    teachers.data?.[
      lesson
        ? lesson.teacher
        : typeof lessonId === "object" && lessonId.teacherId !== undefined
          ? lessonId.teacherId
          : undefined
    ]?.NAME || "Unknown Teacher";
  const roomName =
    classRooms.data?.[
      lesson
        ? lesson.classRoom
        : typeof lessonId === "object" && lessonId.classRoomId !== undefined
          ? lessonId.classRoomId
          : undefined
    ]?.NAME || "Unknown Room";
  const className = lesson
    ? classes.data?.[lesson.class as keyof typeof classes.data]?.NAME ||
      "Unknown Class"
    : typeof lessonId === "object" && lessonId.classId !== undefined
      ? classes.data?.[lessonId.classId as keyof typeof classes.data]?.NAME ||
        "Unknown Class"
      : "Unknown Class";

  return (
    <Group
      style={{
        width: "100%",
        justifyContent: "space-between",
        alignItems: "center",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Tooltip
        label={
          <Stack gap="xs">
            {subjectName !== undefined && (
              <Text size="sm" fw={500}>
                {subjectName}
              </Text>
            )}
            {teacherName !== undefined && (
              <Text size="xs">Teacher: {teacherName}</Text>
            )}
            {lesson ||
              (typeof lessonId === "object" && lessonId.classRoomId && (
                <Text size="xs">Room: {roomName}</Text>
              ))}
            {lesson ||
              (typeof lessonId === "object" && lessonId.classId && (
                <Text size="xs">Class: {className}</Text>
              ))}
          </Stack>
        }
        position="right"
        withArrow
        transitionProps={{ transition: "fade", duration: 200 }}
      >
        <Text
          size="s"
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            flex: 1,
          }}
        >
          {subjectName}
        </Text>
      </Tooltip>
      {isHovered && (
        <ActionIconX
          label="delete"
          onClickCallback={(e) => handleDeleteLesson(e, lesson.tempId)}
          style={{ flexShrink: 0, opacity: 0.8 }}
        />
      )}
    </Group>
  );
};

export default TimeslotFilledCard;
