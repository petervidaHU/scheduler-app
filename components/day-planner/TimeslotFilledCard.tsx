import { Group, Text, Tooltip, Stack } from "@mantine/core";
import React, { FC, useState } from "react";
import ActionIconX from "../UI-elements/ActionIcons/X";
import { useStore } from "@/store/store";

interface props {
  lessonId: string;
}

const TimeslotFilledCard: FC<props> = ({ lessonId }) => {
  const {
    tenancyBasedData: { subjects, teachers, classRooms },
    scheduleState: { lessons },
    deleteOneLesson
  } = useStore();
  const [isHovered, setIsHovered] = useState(false);

  const handleDeleteLesson = (event: any, id: string) => {
    event.stopPropagation();
    deleteOneLesson(id);
  };

  const lesson = lessons[lessonId];
  if (!lesson) return null;

  const subjectName = subjects.data?.[lesson.subject]?.NAME || 'Unknown Subject';
  const teacherName = lesson.teacher && teachers.data?.[lesson.teacher]?.NAME || 'Unknown Teacher';
  const roomName = lesson.classRoom && classRooms.data?.[lesson.classRoom]?.NAME || 'Unknown Room';

  return (
    <Group 
      style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Tooltip
        label={
          <Stack gap="xs">
            <Text size="sm" fw={500}>{subjectName}</Text>
            <Text size="xs">Teacher: {teacherName}</Text>
            <Text size="xs">Room: {roomName}</Text>
          </Stack>
        }
        position="right"
        withArrow
        transitionProps={{ transition: 'fade', duration: 200 }}
      >
        <Text 
          size="s" 
          style={{ 
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            flex: 1
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
