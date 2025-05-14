import { Group, Text, Tooltip, Stack } from "@mantine/core";
import React, { FC, useState } from "react";
import ActionIconX from "../UI-elements/ActionIcons/X";
import { useStore } from "@/store/store";
import { TimeslotLessonInput } from "@/types/ScheduleTypes";

interface props {
  lesson: TimeslotLessonInput;
}

const TimeslotFilledCard: FC<props> = ({ lesson }) => {
  console.log("in TimeslotFilledCard", lesson);
  const {
    tenancyBasedData: { subjects, teachers, classRooms, classes },
    deleteOneLesson,
  } = useStore();
  const [isHovered, setIsHovered] = useState(false);

  // --- Subject Name ---
  const subjectName =
    lesson?.subjectId !== undefined && subjects.data?.[lesson.subjectId]?.NAME
      ? subjects.data[lesson.subjectId].NAME
      : "Unknown Subject";

  // --- Teacher Name(s) ---
  let teacherIds: any = lesson?.teacherId;
  // If teacherIds is a stringified array, parse it
  if (typeof teacherIds === "string" && teacherIds.startsWith("[")) {
    try {
      teacherIds = JSON.parse(teacherIds);
    } catch {
      teacherIds = [];
    }
  }
  // If single value, make it array
  if (teacherIds !== undefined && !Array.isArray(teacherIds)) {
    teacherIds = [teacherIds];
  }
  const teacherName =
    teacherIds && Array.isArray(teacherIds) && teacherIds.length > 0
      ? teacherIds
          .map((id: any) => teachers.data?.[id]?.NAME || "Unknown Teacher")
          .join(", ")
      : "Unknown Teacher";

  // --- Room Name ---
  const roomName =
    lesson?.classRoomId != undefined &&
    classRooms.data?.[lesson.classRoomId]?.NAME
      ? classRooms.data[lesson.classRoomId].NAME
      : "Unknown Room";

  // --- Class Name ---
  const className =
    lesson?.classId !== undefined && classes.data?.[lesson.classId]?.NAME
      ? classes.data[lesson.classId].NAME
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
            {lesson?.classRoomId && <Text size="xs">Room: {roomName}</Text>}
            {lesson?.classId && <Text size="xs">Class: {className}</Text>}
          </Stack>
        }
        position="right"
        withArrow
        transitionProps={{ transition: "fade", duration: 200 }}
      >
        <Text
          size="sm"
          fw={600}
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
      {lesson?.id && isHovered && (
        <ActionIconX
          label="delete"
          onClickCallback={(e) => {
            e.stopPropagation();
            if (lesson?.id !== undefined) {
              deleteOneLesson(lesson.id.toString());
            }
          }}
          style={{ flexShrink: 0, opacity: 0.8 }}
        />
      )}
    </Group>
  );
};

export default TimeslotFilledCard;
